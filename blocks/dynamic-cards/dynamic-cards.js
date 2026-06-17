/**
 * Extracts entries from a JSON response, handling common shapes:
 * - top-level array
 * - { data: [...] }  (AEM query index format)
 * - { entries: [...] }
 * - { items: [...] }
 * @param {unknown} json
 * @returns {object[]|null}
 */
function extractEntries(json) {
  if (Array.isArray(json)) return json;
  if (json && typeof json === 'object') {
    const arrayKey = ['data', 'entries', 'items', 'results'].find((key) => Array.isArray(json[key]));
    if (arrayKey) return json[arrayKey];
  }
  return null;
}

const IMAGE_EXTENSIONS = /\.(jpe?g|png|gif|webp|avif|svg)(\?.*)?$/i;

/**
 * @param {string} url
 * @returns {boolean}
 */
function isImageUrl(url) {
  return IMAGE_EXTENSIONS.test(url);
}

/**
 * Creates a <picture><img></picture> element for an image URL.
 * @param {string} src
 * @param {string} alt
 * @returns {HTMLPictureElement}
 */
function createPicture(src, alt) {
  const picture = document.createElement('picture');
  const img = document.createElement('img');
  img.src = src;
  img.alt = alt;
  img.loading = 'lazy';
  picture.append(img);
  return picture;
}

/**
 * Creates a single card element from a data entry object.
 * @param {object} entry
 * @returns {HTMLLIElement}
 */
function createCard(entry) {
  const li = document.createElement('li');
  li.className = 'dynamic-cards-card';

  const body = document.createElement('div');
  body.className = 'dynamic-cards-card-body';

  Object.entries(entry).forEach(([key, value]) => {
    if (value === null || value === undefined || value === '') return;

    const strValue = String(value);

    if (isImageUrl(strValue)) {
      const picture = createPicture(strValue, key);
      picture.className = 'dynamic-cards-card-image';
      li.prepend(picture);
      return;
    }

    const field = document.createElement('div');
    field.className = 'dynamic-cards-field';

    const label = document.createElement('span');
    label.className = 'dynamic-cards-field-label';
    label.textContent = key;

    const val = document.createElement('span');
    val.className = 'dynamic-cards-field-value';

    if (strValue.startsWith('http://') || strValue.startsWith('https://')) {
      const link = document.createElement('a');
      link.href = strValue;
      link.textContent = strValue;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      val.append(link);
    } else {
      val.textContent = strValue;
    }

    field.append(label, val);
    body.append(field);
  });

  li.append(body);
  return li;
}

/**
 * Renders an error message inside the block.
 * @param {Element} block
 * @param {string} message
 */
function renderError(block, message) {
  const p = document.createElement('p');
  p.className = 'dynamic-cards-error';
  p.textContent = message;
  block.replaceChildren(p);
}

/**
 * decorate the block
 * @param {Element} block the block
 */
export default async function decorate(block) {
  const anchor = block.querySelector('a[href]');
  if (!anchor) {
    renderError(block, 'No URL provided. Add a link to the block.');
    return;
  }

  const url = anchor.href;

  let json;
  try {
    const response = await fetch(url);
    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('json')) {
      renderError(block, `URL did not return JSON (content-type: ${contentType}).`);
      return;
    }
    json = await response.json();
  } catch {
    renderError(block, `Failed to fetch data from: ${url}`);
    return;
  }

  const entries = extractEntries(json);
  if (!entries || entries.length === 0) {
    renderError(block, 'No entries found in the JSON response.');
    return;
  }

  const ul = document.createElement('ul');
  ul.className = 'dynamic-cards-cards';
  entries.forEach((entry) => {
    if (entry && typeof entry === 'object') ul.append(createCard(entry));
  });

  block.replaceChildren(ul);
}
