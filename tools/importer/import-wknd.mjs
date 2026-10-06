#!/usr/bin/env node
/*
 * Imports wknd-adventures.com into local DA content as "Rockstar Adventures".
 *
 * Every page in the source sitemap (plus nav and footer) is converted to
 * Edge Delivery markup (sections, blocks, metadata), rebranded, and written to
 * content/<root>/. Images are downloaded next to the pages in media/.
 *
 * Usage (jsdom is not a project dependency, install it without saving):
 *   npm install --no-save jsdom
 *   node tools/importer/import-wknd.mjs [--source=https://wknd-adventures.com] [--root=/drafts/rockstar]
 *     [--media-url=https://content.da.live/<org>/<site>]
 *
 * --root is the site path the pages live under (links, images, nav and footer use it);
 * output goes to content/<root>. Preview with the dev server at http://localhost:3000/<root>/
 * --media-url prefixes image src with an absolute origin. Required for content pushed to DA,
 * which cannot resolve root-relative image paths. `aem content push` does not upload binaries,
 * so upload media/ separately (DA admin API: POST /source/<org>/<site>/<root>/media/<file>).
 */
/* eslint-disable no-console, import/no-extraneous-dependencies, no-use-before-define */
import { mkdir, writeFile, access } from 'node:fs/promises';
import path from 'node:path';
import { JSDOM } from 'jsdom';

const args = Object.fromEntries(process.argv.slice(2)
  .filter((a) => a.startsWith('--'))
  .map((a) => a.slice(2).split('=')));
const SOURCE = (args.source || 'https://wknd-adventures.com').replace(/\/$/, '');
const SITE_ROOT = (args.root || '/drafts/rockstar').replace(/\/$/, '');
const OUT_DIR = path.resolve(args.out || `content${SITE_ROOT}`);
// DA can only resolve images by absolute URL, e.g. https://content.da.live/<org>/<site>
const MEDIA_URL = (args['media-url'] || '').replace(/\/$/, '');
const SOURCE_HOSTS = ['wknd-adventures.com', 'www.wknd-adventures.com', 'wkndadventures.com'];

/* ---------- rebranding ---------- */

const BRAND_REPLACEMENTS = [
  [/About WKND\b(?! Adventures)/g, 'About Rockstar Adventures'],
  [/WKND\s*Adventures/g, 'Rockstar Adventures'],
  [/wknd-?adventures\.com/gi, 'rockstar-adventures.com'],
  [/\bWKND\b/g, 'Rockstar'],
  [/\bwknd\b/g, 'rockstar'],
];

const rebrand = (text) => BRAND_REPLACEMENTS
  .reduce((acc, [pattern, replacement]) => acc.replace(pattern, replacement), text || '');

/* ---------- helpers ---------- */

let doc; // output document, recreated per page
const images = new Map(); // absolute source URL -> local media path

const el = (tag, attrs = {}, ...children) => {
  const node = doc.createElement(tag);
  Object.entries(attrs).forEach(([k, v]) => node.setAttribute(k, v));
  children.flat().filter((c) => c !== null && c !== undefined && c !== '').forEach((c) => {
    node.append(typeof c === 'string' ? doc.createTextNode(c) : c);
  });
  return node;
};

/** Builds a DA block table: rows of cells, each cell a node or array of nodes. */
const block = (name, rows) => el(
  'div',
  { class: name },
  rows.map((cells) => el('div', {}, cells.map((cell) => el('div', {}, cell)))),
);

const keyValueBlock = (name, entries) => block(
  name,
  Object.entries(entries)
    .filter(([, v]) => v)
    .map(([k, v]) => [el('p', {}, k), el('p', {}, v)]),
);

const text = (node) => rebrand(node?.textContent.replace(/\s+/g, ' ').trim());

function rewriteHref(href, pageUrl) {
  if (!href) return href;
  if (href.startsWith('#')) return href;
  if (href.startsWith('mailto:')) return rebrand(href);
  const url = new URL(href, pageUrl);
  if (!SOURCE_HOSTS.includes(url.hostname)) return url.href;
  let p = url.pathname.replace(/\.html$/, '').replace(/\/index$/, '/');
  if (p === '/' || p === '') p = '/';
  return `${SITE_ROOT}${p === '/' ? '/' : p}${url.hash}`;
}

function mediaPath(src, pageUrl) {
  const url = new URL(src, pageUrl);
  if (!images.has(url.href)) {
    const name = url.pathname.replace(/^\/images\//, '').replace(/^\//, '').replace(/\//g, '-').toLowerCase();
    images.set(url.href, `${SITE_ROOT}/media/${name}`);
  }
  return `${MEDIA_URL}${images.get(url.href)}`;
}

const picture = (img, ctx) => (img
  ? el('img', { src: mediaPath(img.getAttribute('src'), ctx.url), alt: rebrand(img.getAttribute('alt') || '') })
  : null);

/** Copies inline content (text, links, emphasis) without source classes. */
function inline(node, ctx) {
  const out = [];
  node.childNodes.forEach((child) => {
    if (child.nodeType === 3) {
      out.push(rebrand(child.textContent));
      return;
    }
    if (child.nodeType !== 1) return;
    const tag = child.tagName.toLowerCase();
    if (tag === 'a') {
      out.push(el('a', { href: rewriteHref(child.getAttribute('href'), ctx.url) }, inline(child, ctx)));
    } else if (['strong', 'b', 'em', 'i', 'code', 'sup', 'sub'].includes(tag)) {
      const normalized = { b: 'strong', i: 'em' }[tag] || tag;
      out.push(el(normalized, {}, inline(child, ctx)));
    } else if (tag === 'br') {
      out.push(el('br'));
    } else if (tag === 'img') {
      out.push(picture(child, ctx));
    } else if (!['svg', 'button'].includes(tag)) {
      out.push(...inline(child, ctx));
    }
  });
  return out;
}

/** WKND button classes -> EDS button convention (strong = primary, em = secondary). */
function buttonParagraph(a, ctx) {
  const link = el('a', { href: rewriteHref(a.getAttribute('href'), ctx.url) }, text(a));
  if (a.matches('.button--ghost, .text-button')) return el('p', {}, el('em', {}, link));
  if (a.matches('.accent-button')) return el('p', {}, el('strong', {}, link));
  return el('p', {}, link);
}

const kicker = (node) => el('p', {}, el('em', {}, text(node)));

/* ---------- components ---------- */

function articleCard(card, ctx) {
  const img = card.querySelector('img');
  const title = card.querySelector('h1, h2, h3, h4, h5, h6');
  const tag = card.querySelector('.tag');
  const desc = [...card.querySelectorAll('p')].filter((p) => !p.closest('.tag'));
  const href = card.matches('a') ? card.getAttribute('href') : null;
  const body = [
    tag ? kicker(tag) : null,
    title ? el('h3', {}, href ? el('a', { href: rewriteHref(href, ctx.url) }, text(title)) : text(title)) : null,
    ...desc.map((p) => el('p', {}, inline(p, ctx))),
    ...[...card.querySelectorAll('a.button, a.button--ghost, a.text-button')].map((a) => buttonParagraph(a, ctx)),
  ];
  return img ? [picture(img, ctx), body] : [body];
}

function teamProfile(grid, ctx) {
  const img = grid.querySelector('img');
  const name = grid.querySelector('.profile-name');
  const role = grid.querySelector('.team-profile-col p:not(.profile-name)');
  const bio = [...grid.querySelectorAll('.team-profile-bio p')].map((p) => el('p', {}, inline(p, ctx)));
  return block('columns profile', [[
    [picture(img, ctx), el('h3', {}, text(name)), role ? el('p', {}, text(role)) : null],
    bio,
  ]]);
}

function gridLayout(grid, ctx) {
  const kids = [...grid.children];
  if (kids.every((k) => k.matches('.article-card, .card'))) {
    return [block('cards', kids.map((k) => articleCard(k, ctx)))];
  }
  if (kids.every((k) => k.matches('img'))) {
    return [block('columns gallery', [kids.map((k) => picture(k, ctx))])];
  }
  // mixed columns (text + image, list + pull quote, ...)
  return [block('columns', [kids.map((k) => convertChildren(k.matches('img') ? wrapIn(k) : k, ctx))])];
}

function wrapIn(node) {
  const div = node.ownerDocument.createElement('div');
  div.append(node.cloneNode(true));
  return div;
}

function tabs(container, ctx) {
  const labels = [...container.querySelectorAll('.tab-menu-link')];
  return labels.map((button) => {
    const pane = container.querySelector(`#${button.dataset.tab}`);
    const content = pane ? convertChildren(pane, ctx) : [];
    return { label: text(button), content };
  });
}

/* ---------- generic conversion ---------- */

function convertNode(node, ctx) {
  if (node.nodeType !== 1) return [];
  const tag = node.tagName.toLowerCase();
  const cls = node.classList;

  if (cls.contains('section-heading')) return convertChildren(node, ctx);
  if (cls.contains('tag')) return [kicker(node)];
  if (/^h[1-6]$/.test(tag)) return [el(tag, {}, inline(node, ctx))];
  if (cls.contains('text-button') || (tag === 'a' && node.matches('.button, .button--ghost, .accent-button'))) {
    return [buttonParagraph(node, ctx)];
  }
  if (cls.contains('button-group') || cls.contains('featured-article-footer')) {
    return [...node.querySelectorAll('a')].map((a) => buttonParagraph(a, ctx));
  }
  if (tag === 'p') return [el('p', {}, inline(node, ctx))];
  if (tag === 'ul' || tag === 'ol') {
    return [el(tag, {}, [...node.children].map((li) => el('li', {}, inline(li, ctx))))];
  }
  if (tag === 'blockquote') {
    const body = node.querySelector('.pull-quote-body');
    const cite = node.querySelector('cite');
    if (body) return [el('blockquote', {}, el('p', {}, inline(body, ctx)), cite ? el('p', {}, text(cite)) : null)];
    return [el('blockquote', {}, convertChildren(node, ctx))];
  }
  if (tag === 'figure') {
    const caption = node.querySelector('figcaption');
    return [
      el('p', {}, picture(node.querySelector('img'), ctx)),
      caption ? el('p', {}, el('em', {}, text(caption))) : null,
    ];
  }
  if (tag === 'img') return [el('p', {}, picture(node, ctx))];
  if (cls.contains('featured-article')) {
    const [media, ...rest] = [...node.children];
    return [block('columns featured', [[
      picture(media.querySelector('img'), ctx),
      rest.flatMap((r) => convertChildren(r, ctx)),
    ]])];
  }
  if (cls.contains('grid-layout')) return gridLayout(node, ctx);
  if (cls.contains('faq-list')) {
    return [block('accordion', [...node.querySelectorAll('.faq-item')].map((item) => [
      el('p', {}, text(item.querySelector('.faq-question'))),
      el('p', {}, inline(item.querySelector('.faq-answer'), ctx)),
    ]))];
  }
  if (cls.contains('editorial-index')) {
    return [block('numbered-list', [...node.querySelectorAll('.editorial-index-item')].map((item) => [
      convertChildren(item.querySelector(':scope > div'), ctx),
    ]))];
  }
  if (cls.contains('team-profile-grid')) return [teamProfile(node, ctx)];
  if (cls.contains('tab-container') || cls.contains('tab-menu')) {
    // handled by convertSection, which splits tabs into their own sections
    return [];
  }
  if (cls.contains('ticker-strip') || cls.contains('ticker-track') || tag === 'svg' || tag === 'script') return [];
  if (tag === 'div' || tag === 'section' || tag === 'span') return convertChildren(node, ctx);

  ctx.warnings.add(`unhandled <${tag} class="${node.className}">`);
  return convertChildren(node, ctx);
}

function convertChildren(node, ctx) {
  return [...node.children].flatMap((child) => convertNode(child, ctx));
}

/* ---------- sections ---------- */

const SECTION_STYLES = {
  'secondary-section': 'surface',
  'inverse-section': 'spotlight',
  'accent-section': 'accent',
};

function sectionStyles(section) {
  const styles = Object.entries(SECTION_STYLES)
    .filter(([cls]) => section.classList.contains(cls))
    .map(([, style]) => style);
  if (section.querySelector('.container.utility-text-align-center')) styles.push('centered');
  if (section.querySelector('.container--narrow, .blog-article-container')) styles.push('narrow');
  return styles;
}

function outputSection(content, meta = {}) {
  const section = el('div', {}, content);
  const entries = Object.fromEntries(Object.entries(meta).filter(([, v]) => v));
  if (Object.keys(entries).length) section.append(keyValueBlock('section-metadata', entries));
  return section;
}

function heroSection(section, ctx) {
  const img = section.querySelector('.hero-bg img');
  const content = section.querySelector('.hero-content-inner') || section.querySelector('.hero-content .container') || section.querySelector('.hero-content');
  const cell = [el('p', {}, picture(img, ctx))];
  [...content.children].forEach((child) => {
    if (child.classList.contains('article-byline')) {
      const name = text(child.querySelector('.article-byline-name'));
      const metaLine = text(child.querySelector('.article-byline-meta'));
      ctx.byline = { name, metaLine };
      cell.push(el('p', {}, `By ${name} · ${metaLine}`));
    } else {
      cell.push(...convertNode(child, ctx));
    }
  });
  ctx.heroImage = img ? mediaPath(img.getAttribute('src'), ctx.url) : null;
  const variant = section.classList.contains('hero-section--full') ? 'hero' : 'hero article';
  return outputSection([block(variant, [[cell]])]);
}

function convertSection(section, ctx) {
  if (section.classList.contains('hero-section')) return [heroSection(section, ctx)];
  if (section.classList.contains('ticker-strip')) return [];

  const style = sectionStyles(section).join(', ');
  const container = section.querySelector(':scope > .container') || section;
  const out = [];
  let buffer = [];
  const flush = () => {
    if (buffer.length) out.push(outputSection(buffer, { Style: style }));
    buffer = [];
  };

  const handleTabs = (tabContainer) => {
    flush();
    tabs(tabContainer, ctx).forEach(({ label, content }) => {
      out.push(outputSection(content, { Style: style, Tab: label }));
    });
  };

  [...container.children].forEach((child) => {
    if (child.classList.contains('tab-container')) {
      handleTabs(child);
    } else if (child.classList.contains('tab-menu')) {
      handleTabs(container);
    } else if (!child.classList.contains('tab-pane')) {
      buffer.push(...convertNode(child, ctx));
    }
  });
  flush();
  return out;
}

/* ---------- pages ---------- */

function pageMetadata(src, ctx) {
  const title = rebrand(src.querySelector('title')?.textContent.trim());
  const description = rebrand(src.querySelector('meta[name="description"]')?.getAttribute('content'));
  const meta = {
    Title: title,
    Description: description,
    Image: ctx.heroImage ? el('img', { src: ctx.heroImage, alt: '' }) : null,
    Theme: 'rockstar',
    Nav: `${SITE_ROOT}/nav`,
    Footer: `${SITE_ROOT}/footer`,
  };
  if (ctx.byline) {
    meta.Template = 'article';
    meta.Author = ctx.byline.name;
    [meta['Publication Date']] = ctx.byline.metaLine.split('·').map((s) => s.trim());
  }
  return meta;
}

const serialize = (sections) => `<body>
  <header></header>
  <main>
${sections.map((s) => s.outerHTML).join('\n')}
  </main>
  <footer></footer>
</body>
`;

async function fetchDocument(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return new JSDOM(await res.text(), { url }).window.document;
}

function convertPage(src, url) {
  const ctx = { url, warnings: new Set() };
  const sourceMain = src.querySelector('main');
  const sections = [...sourceMain.children].flatMap((section) => convertSection(section, ctx));
  const meta = keyValueBlock('metadata', pageMetadata(src, ctx));
  sections[sections.length - 1].append(meta);
  return { html: serialize(sections), warnings: ctx.warnings };
}

function convertNav(src, url) {
  const ctx = { url, warnings: new Set() };
  const brand = outputSection([el('p', {}, el('a', { href: `${SITE_ROOT}/` }, ':rockstar: Rockstar Adventures'))]);
  const items = [...src.querySelectorAll('.nav-menu-list > li')].map((li) => {
    const label = text(li.querySelector(':scope > button, :scope > a'));
    const links = [...li.querySelectorAll('.nav-megamenu a')]
      .filter((a) => !a.getAttribute('href').includes('blog/'))
      .map((a) => el('li', {}, el('a', { href: rewriteHref(a.getAttribute('href'), url) }, text(a.querySelector('[class*="title"]') || a))));
    return el('li', {}, el('p', {}, label), links.length ? el('ul', {}, links) : null);
  });
  const sections = outputSection([el('ul', {}, items)]);
  const cta = [...src.querySelectorAll('.navbar a.button')]
    .map((a) => el('p', {}, el('strong', {}, el('a', { href: rewriteHref(a.getAttribute('href'), url) }, text(a)))));
  return { html: serialize([brand, sections, outputSection(cta)]), warnings: ctx.warnings };
}

function convertFooter(src, url) {
  const ctx = { url, warnings: new Set() };
  const footer = src.querySelector('footer');
  const columns = [...footer.querySelectorAll('.footer-top > div')].map((col, i) => {
    if (i === 0) {
      return [
        el('p', {}, el('strong', {}, 'Rockstar Adventures')),
        ...[...col.querySelectorAll('p')].map((p) => el('p', {}, inline(p, ctx))),
      ];
    }
    return [
      el('h2', {}, text(col.querySelector('h1, h2, h3, h4, h5, h6'))),
      el('ul', {}, [...col.querySelectorAll('a')].map((a) => el('li', {}, el('a', { href: rewriteHref(a.getAttribute('href'), url) }, text(a))))),
    ];
  });
  const bottom = [...footer.querySelectorAll('.footer-bottom p')].map((p) => el('p', {}, inline(p, ctx)));
  return {
    html: serialize([outputSection([block('columns footer-links', [columns])]), outputSection(bottom)]),
    warnings: ctx.warnings,
  };
}

async function exists(file) {
  try {
    await access(file);
    return true;
  } catch {
    return false;
  }
}

async function downloadImages() {
  let downloaded = 0;
  await Promise.all([...images.entries()].map(async ([src, local]) => {
    const file = path.join(OUT_DIR, local.slice(SITE_ROOT.length));
    if (await exists(file)) return;
    const res = await fetch(src);
    if (!res.ok) {
      console.warn(`  ! image ${res.status} ${src}`);
      return;
    }
    await mkdir(path.dirname(file), { recursive: true });
    await writeFile(file, Buffer.from(await res.arrayBuffer()));
    downloaded += 1;
  }));
  return downloaded;
}

async function pagePaths() {
  const res = await fetch(`${SOURCE}/sitemap.xml`);
  const xml = await res.text();
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(([, loc]) => new URL(loc).pathname);
}

async function write(relPath, html) {
  const file = path.join(OUT_DIR, relPath);
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, html);
  console.log(`  ✓ ${path.relative(process.cwd(), file)}`);
}

async function main() {
  doc = new JSDOM('<!doctype html><body></body>').window.document;
  console.log(`Importing ${SOURCE} -> ${path.relative(process.cwd(), OUT_DIR)}`);

  const paths = await pagePaths();
  const homeUrl = `${SOURCE}/`;
  const home = await fetchDocument(homeUrl);
  await write('nav.html', convertNav(home, homeUrl).html);
  await write('footer.html', convertFooter(home, homeUrl).html);

  // eslint-disable-next-line no-restricted-syntax
  for (const p of paths) {
    const url = `${SOURCE}${p}`;
    // eslint-disable-next-line no-await-in-loop
    const src = p === '/' ? home : await fetchDocument(url);
    const { html, warnings } = convertPage(src, url);
    const rel = p === '/' ? 'index.html' : p;
    // eslint-disable-next-line no-await-in-loop
    await write(rel, html);
    warnings.forEach((w) => console.warn(`    ! ${w}`));
  }

  const count = await downloadImages();
  console.log(`Done: ${paths.length} pages, ${images.size} images (${count} downloaded).`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
