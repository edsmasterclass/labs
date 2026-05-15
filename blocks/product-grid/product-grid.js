/**
 * Product Grid block.
 *
 * Authoring: add a link to a product index JSON in the block.
 *   | product-grid                              |
 *   | /products-<branch>/index.json             |
 *
 * Fetches the index, resolves image URLs, and renders a responsive product card grid.
 */

import { createOptimizedPicture } from '../../scripts/aem.js';

function createTag(tag, attrs, content) {
  const el = document.createElement(tag);
  if (attrs) Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
  if (content !== undefined) el.append(typeof content === 'string' ? document.createTextNode(content) : content);
  return el;
}

async function fetchProductIndex(url) {
  const resp = await fetch(url);
  if (!resp.ok) throw new Error(`product-grid: index fetch failed (${resp.status})`);
  const json = await resp.json();
  return json?.data ?? [];
}

function resolveImage(image, indexUrl) {
  if (!image) return '';
  try {
    const resolved = new URL(image, new URL(indexUrl, window.location.origin));
    return resolved.origin === window.location.origin ? resolved.pathname : resolved.href;
  } catch {
    return image;
  }
}

function formatPrice(price) {
  const num = parseFloat(price);
  return Number.isFinite(num)
    ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(num)
    : price;
}

function buildCard(product, indexUrl) {
  const li = createTag('li', { class: 'product-grid-item' });
  const link = createTag('a', { href: product.url, class: 'product-grid-link' });

  if (product.image) {
    const src = resolveImage(product.image, indexUrl);
    const picture = createOptimizedPicture(src, product.title || '', false, [
      { width: '400' },
      { media: '(min-width: 900px)', width: '600' },
    ]);
    link.append(createTag('div', { class: 'product-grid-image' }, picture));
  }

  const body = createTag('div', { class: 'product-grid-body' });
  body.append(createTag('p', { class: 'product-grid-title' }, product.title || product.sku));
  if (product.price) {
    body.append(createTag('p', { class: 'product-grid-price' }, formatPrice(product.price)));
  }
  link.append(body);
  li.append(link);
  return li;
}

export default async function decorate(block) {
  const anchor = block.querySelector('a[href]');
  const text = block.textContent.trim();
  const indexUrl = anchor
    ? anchor.href
    : new URL(text, window.location.origin).href;

  if (!indexUrl) return;

  block.textContent = '';
  block.setAttribute('aria-busy', 'true');

  try {
    const products = await fetchProductIndex(indexUrl);

    if (!products.length) {
      block.append(createTag('p', { class: 'product-grid-empty' }, 'No products found.'));
      return;
    }

    const ul = createTag('ul', { class: 'product-grid-list' });
    products.forEach((product) => ul.append(buildCard(product, indexUrl)));
    block.append(ul);
  } catch {
    block.append(createTag('p', { class: 'product-grid-empty' }, 'Unable to load products right now.'));
  } finally {
    block.removeAttribute('aria-busy');
  }
}
