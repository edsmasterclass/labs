import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import { pathToFileURL } from 'node:url';
import vm from 'node:vm';

class TestElement {
  constructor(tagName = 'div') {
    this.tagName = tagName.toUpperCase();
    this.children = [];
    this.className = '';
    this.href = '';
    this._innerHTML = '';
    this._textContent = '';
    this._queryResult = null;
  }

  append(...nodes) {
    nodes.forEach((node) => {
      node.parentElement = this;
      this.children.push(node);
    });
  }

  replaceChildren(...nodes) {
    this.children = [];
    this._innerHTML = '';
    this._textContent = '';
    this.append(...nodes);
  }

  querySelector(selector) {
    if (selector === 'a') return this._queryResult;
    return null;
  }

  set innerHTML(value) {
    this._innerHTML = String(value);
    this._textContent = '';
    this.children = [];
  }

  get innerHTML() {
    return this._innerHTML;
  }

  set textContent(value) {
    this._textContent = String(value);
    this._innerHTML = '';
    this.children = [];
  }

  get textContent() {
    return this._textContent;
  }
}

function createBlock(dataSource) {
  const block = new TestElement();
  if (dataSource) block._queryResult = { href: dataSource };
  return block;
}

async function loadDecorate({ fetchImpl, consoleImpl = console } = {}) {
  const modulePath = new URL('../blocks/dynamic-cards/dynamic-cards.js', import.meta.url);
  const source = await readFile(modulePath, 'utf8');
  const context = vm.createContext({
    console: consoleImpl,
    document: {
      createElement: (tagName) => new TestElement(tagName),
    },
    fetch: fetchImpl,
  });
  const module = new vm.SourceTextModule(source, {
    context,
    identifier: pathToFileURL(modulePath.pathname).href,
  });

  await module.link(() => {
    throw new Error('Unexpected import in dynamic-cards block');
  });
  await module.evaluate();

  return module.namespace.default;
}

test('renders a speaker card for each row from the linked JSON data source', async () => {
  const dataSource = 'http://localhost:3000/drafts/etemplesmithson/speakers.json';
  const requestedUrls = [];
  const decorate = await loadDecorate({
    fetchImpl: async (url) => {
      requestedUrls.push(url);
      return {
        ok: true,
        json: async () => ({
          data: [
            {
              Name: 'Ada Lovelace',
              Title: 'Senior Developer',
              Company: 'Analytical Engines Ltd',
              Bio: 'Builds durable content-driven experiences.',
              Image: 'https://i.pravatar.cc/400?img=12',
            },
            {
              Name: 'Grace Hopper',
              Title: 'Architect',
              Company: 'Compiler Works',
              Bio: 'Turns complex systems into practical tools.',
              Image: 'https://i.pravatar.cc/400?img=31',
            },
          ],
        }),
      };
    },
  });

  const block = createBlock(dataSource);
  await decorate(block);

  assert.deepEqual(requestedUrls, [dataSource]);
  assert.equal(block.children.length, 1);

  const list = block.children[0];
  assert.equal(list.tagName, 'UL');
  assert.equal(list.className, 'dynamic-cards-list');
  assert.equal(list.children.length, 2);

  const [firstCard] = list.children;
  assert.equal(firstCard.tagName, 'LI');
  assert.equal(firstCard.className, 'dynamic-card');
  assert.match(firstCard.innerHTML, /<h3>Ada Lovelace<\/h3>/);
  assert.match(firstCard.innerHTML, /Senior Developer/);
  assert.match(firstCard.innerHTML, /Analytical Engines Ltd/);
  assert.match(firstCard.innerHTML, /Builds durable content-driven experiences\./);
  assert.match(firstCard.innerHTML, /src="https:\/\/i\.pravatar\.cc\/400\?img=12"/);
  assert.match(firstCard.innerHTML, /alt="Ada Lovelace"/);
  assert.match(firstCard.innerHTML, /loading="lazy"/);
});

test('shows an author-facing error when no data source link is authored', async () => {
  const decorate = await loadDecorate({
    fetchImpl: async () => {
      throw new Error('fetch should not run without a data source');
    },
  });
  const block = createBlock();

  await decorate(block);

  assert.equal(block.textContent, 'Error: No data source specified');
  assert.equal(block.children.length, 0);
});

test('shows an empty state when the JSON response has no data rows', async () => {
  const decorate = await loadDecorate({
    fetchImpl: async () => ({
      ok: true,
      json: async () => ({ data: [] }),
    }),
  });
  const block = createBlock('/drafts/etemplesmithson/speakers.json');

  await decorate(block);

  assert.equal(block.innerHTML, '<p>No speakers found.</p>');
  assert.equal(block.children.length, 0);
});

test('renders blank values instead of undefined when sheet fields are omitted', async () => {
  const decorate = await loadDecorate({
    fetchImpl: async () => ({
      ok: true,
      json: async () => ({
        data: [
          {
            Name: 'Speaker With Missing Fields',
          },
        ],
      }),
    }),
  });
  const block = createBlock('/drafts/etemplesmithson/speakers.json');

  await decorate(block);

  const [card] = block.children[0].children;
  assert.match(card.innerHTML, /<h3>Speaker With Missing Fields<\/h3>/);
  assert.doesNotMatch(card.innerHTML, /undefined/);
  assert.match(card.innerHTML, /src=""/);
  assert.match(card.innerHTML, /alt="Speaker With Missing Fields"/);
});

test('shows a styled error when the JSON request fails', async () => {
  const loggedErrors = [];
  const decorate = await loadDecorate({
    consoleImpl: {
      error: (...args) => loggedErrors.push(args),
    },
    fetchImpl: async () => ({
      ok: false,
      status: 404,
    }),
  });
  const block = createBlock('/drafts/etemplesmithson/missing.json');

  await decorate(block);

  assert.equal(block.innerHTML, '<p class="error">Error loading speakers: HTTP 404</p>');
  assert.equal(loggedErrors.length, 1);
  assert.equal(loggedErrors[0][0], 'Dynamic Cards error:');
}
);
