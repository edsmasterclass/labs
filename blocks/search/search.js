import {
  createOptimizedPicture,
  decorateIcons,
  loadCSS,
} from '../../scripts/aem.js';
import decorateCards from '../cards/cards.js';

/**
 * Search block — extended from the AEM Block Collection search block.
 * https://github.com/adobe/aem-block-collection/tree/main/blocks/search
 *
 * Adaptations for this project:
 * - Removed fetchPlaceholders dependency (strings hardcoded below)
 * - Removed minimal variant
 * - Styled to match masterclass dark theme
 * - Results rendered via Cards block (block composition pattern)
 *
 * Content model:
 *   | Search |
 *   |--------|
 *   | /query-index.json |   ← optional: URL to query-index. Defaults to /query-index.json
 */

const SEARCH_PLACEHOLDER = 'Search sessions and labs...';
const NO_RESULTS_TEXT = 'No results found.';
const MIN_SEARCH_LENGTH = 3;

const searchParams = new URLSearchParams(window.location.search);
let cssLoaded = false;

function ensureCardsCSS() {
  if (!cssLoaded) {
    const base = window.hlx?.codeBasePath || '';
    loadCSS(`${base}/blocks/cards/cards.css`);
    cssLoaded = true;
  }
}

function highlightTextElements(terms, elements) {
  elements.forEach((element) => {
    if (!element || !element.textContent) return;

    const matches = [];
    const { textContent } = element;
    terms.forEach((term) => {
      let start = 0;
      let offset = textContent.toLowerCase().indexOf(term.toLowerCase(), start);
      while (offset >= 0) {
        matches.push({ offset, term: textContent.substring(offset, offset + term.length) });
        start = offset + term.length;
        offset = textContent.toLowerCase().indexOf(term.toLowerCase(), start);
      }
    });

    if (!matches.length) return;

    matches.sort((a, b) => a.offset - b.offset);
    let currentIndex = 0;
    const fragment = matches.reduce((acc, { offset, term }) => {
      if (offset < currentIndex) return acc;
      const textBefore = textContent.substring(currentIndex, offset);
      if (textBefore) acc.appendChild(document.createTextNode(textBefore));
      const markedTerm = document.createElement('mark');
      markedTerm.textContent = term;
      acc.appendChild(markedTerm);
      currentIndex = offset + term.length;
      return acc;
    }, document.createDocumentFragment());
    const textAfter = textContent.substring(currentIndex);
    if (textAfter) fragment.appendChild(document.createTextNode(textAfter));
    element.replaceChildren(fragment);
  });
}

export async function fetchData(source) {
  const response = await fetch(source);
  if (!response.ok) {
    // eslint-disable-next-line no-console
    console.error('error loading API response', response);
    return null;
  }
  const json = await response.json();
  if (!json) {
    // eslint-disable-next-line no-console
    console.error('empty API response', source);
    return null;
  }
  const data = json.data ?? null;
  return Array.isArray(data) ? data : null;
}

/**
 * Builds the pre-decoration DOM structure that cards.decorate() expects.
 * Each result becomes one row:
 *   div (row = one card)
 *     div (image column — only if result.image exists)
 *       picture
 *     div (body column)
 *       p > strong > a[href]  — title link (highlighted)
 *       p                     — description (highlighted)
 */
function buildCardsBlock(results, searchTerms) {
  const cardsDiv = document.createElement('div');
  cardsDiv.className = 'cards';

  results.forEach((result) => {
    const row = document.createElement('div');

    if (result.image) {
      const imageDiv = document.createElement('div');
      const pic = createOptimizedPicture(result.image, result.title || '', false, [{ width: '750' }]);
      imageDiv.append(pic);
      row.append(imageDiv);
    }

    const body = document.createElement('div');

    const titleP = document.createElement('p');
    const strong = document.createElement('strong');
    const link = document.createElement('a');
    link.href = result.path;
    link.textContent = result.title || result.path;
    highlightTextElements(searchTerms, [link]);
    strong.append(link);
    titleP.append(strong);
    body.append(titleP);

    if (result.description) {
      const descP = document.createElement('p');
      descP.textContent = result.description;
      highlightTextElements(searchTerms, [descP]);
      body.append(descP);
    }

    row.append(body);
    cardsDiv.append(row);
  });

  return cardsDiv;
}

function clearSearchResults(block) {
  block.querySelector('.search-results').replaceChildren();
}

function clearSearch(block) {
  clearSearchResults(block);
  if (window.history.replaceState) {
    const url = new URL(window.location.href);
    url.search = '';
    searchParams.delete('q');
    window.history.replaceState({}, '', url.toString());
  }
}

function compareFound(hit1, hit2) {
  return hit1.minIdx - hit2.minIdx;
}

function filterData(searchTerms, data) {
  const foundInHeader = [];
  const foundInMeta = [];

  data.forEach((result) => {
    let minIdx = -1;

    searchTerms.forEach((term) => {
      const idx = (result.header || result.title || '').toLowerCase().indexOf(term);
      if (idx < 0) return;
      if (minIdx < idx) minIdx = idx;
    });

    if (minIdx >= 0) {
      foundInHeader.push({ minIdx, result });
      return;
    }

    const pathSuffix = (result.path || '').split('/').pop() || '';
    const metaContents = [
      result.title,
      result.description,
      result.instructor,
      result['speaker-name'],
      result.category,
      result.tags,
      pathSuffix,
    ].filter(Boolean).join(' ').toLowerCase();
    searchTerms.forEach((term) => {
      const idx = metaContents.indexOf(term);
      if (idx < 0) return;
      if (minIdx < idx) minIdx = idx;
    });

    if (minIdx >= 0) foundInMeta.push({ minIdx, result });
  });

  return [
    ...foundInHeader.sort(compareFound),
    ...foundInMeta.sort(compareFound),
  ].map((item) => item.result);
}

async function renderResults(block, config, filteredData, searchTerms) {
  clearSearchResults(block);
  const searchResults = block.querySelector('.search-results');

  if (filteredData.length) {
    ensureCardsCSS();
    const cardsDiv = buildCardsBlock(filteredData, searchTerms);
    decorateCards(cardsDiv);
    searchResults.append(cardsDiv);
  } else {
    const noResultsMessage = document.createElement('p');
    noResultsMessage.className = 'search-status';
    noResultsMessage.textContent = NO_RESULTS_TEXT;
    searchResults.append(noResultsMessage);
  }
}

async function handleSearch(e, block, config) {
  const searchValue = e.target.value;
  searchParams.set('q', searchValue);
  if (window.history.replaceState) {
    const url = new URL(window.location.href);
    url.search = searchParams.toString();
    window.history.replaceState({}, '', url.toString());
  }

  if (searchValue.length < MIN_SEARCH_LENGTH) {
    clearSearch(block);
    return;
  }

  const searchTerms = searchValue.toLowerCase().split(/\s+/).filter((term) => !!term);
  const data = await fetchData(config.source);
  if (data) await renderResults(block, config, filterData(searchTerms, data), searchTerms);
}

function searchResultsContainer() {
  const results = document.createElement('div');
  results.className = 'search-results';
  results.setAttribute('role', 'status');
  results.setAttribute('aria-live', 'polite');
  results.setAttribute('aria-atomic', true);
  return results;
}

function searchBox(block, config) {
  const input = document.createElement('input');
  input.setAttribute('type', 'search');
  input.className = 'search-input';
  input.placeholder = SEARCH_PLACEHOLDER;
  input.setAttribute('aria-label', SEARCH_PLACEHOLDER);

  input.addEventListener('input', (e) => handleSearch(e, block, config));
  input.addEventListener('keyup', (e) => { if (e.code === 'Escape') clearSearch(block); });

  const icon = document.createElement('span');
  icon.classList.add('icon', 'icon-search');

  const box = document.createElement('div');
  box.classList.add('search-box');
  box.append(icon, input);
  return box;
}

/**
 * loads and decorates the block
 * @param {Element} block The block element
 */
export default async function decorate(block) {
  const source = block.querySelector('a[href]')?.href || '/query-index.json';
  block.replaceChildren(
    searchBox(block, { source }),
    searchResultsContainer(),
  );

  if (searchParams.get('q')) {
    const input = block.querySelector('input');
    input.value = searchParams.get('q');
    input.dispatchEvent(new Event('input'));
  }

  decorateIcons(block);
}
