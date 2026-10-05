import { createOptimizedPicture } from '../../scripts/aem.js';

const DEFAULT_ENDPOINT = 'https://main--labs--edsmasterclass.aem.live/drafts/asahu/speakers.json';

function createTag(tagName, className, textContent) {
  const element = document.createElement(tagName);
  if (className) element.className = className;
  if (textContent !== undefined && textContent !== null) {
    element.textContent = textContent;
  }
  return element;
}

function getEndpoint(block) {
  const firstRow = block.querySelector(':scope > div');
  const link = firstRow?.querySelector('a[href]');
  if (link) return link.href;
  if (firstRow) return firstRow.textContent.trim() || DEFAULT_ENDPOINT;
  return DEFAULT_ENDPOINT;
}

function getInitials(name) {
  return (name || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('') || 'A';
}

function getBadgePalette(index) {
  const palettes = [
    ['#7c3aed', '#f97316'],
    ['#2563eb', '#06b6d4'],
    ['#0f766e', '#22c55e'],
    ['#db2777', '#f59e0b'],
    ['#4f46e5', '#a78bfa'],
    ['#dc2626', '#fb7185'],
  ];
  return palettes[index % palettes.length];
}

function buildInitialBadge(name, index) {
  const initials = getInitials(name);
  const badge = createTag('div', 'dynamic-cards-image dynamic-cards-badge');
  const [start, end] = getBadgePalette(index);
  badge.style.background = `linear-gradient(135deg, ${start} 0%, ${end} 100%)`;
  badge.setAttribute('aria-label', `Speaker initials: ${initials}`);
  badge.textContent = initials;
  return badge;
}

function shouldUseInitialBadge(imageUrl) {
  if (!imageUrl) return true;
  return /placehold\.co\/(?:400x400|\d+x\d+)/i.test(imageUrl);
}

function createCard(data, index) {
  const item = createTag('li', 'dynamic-cards-item');
  const link = createTag('a', 'dynamic-cards-link');
  link.href = data.LinkedIn || '#';
  link.target = data.LinkedIn ? '_blank' : '_self';
  link.rel = data.LinkedIn ? 'noreferrer noopener' : '';

  if (data.Image && !shouldUseInitialBadge(data.Image)) {
    const imageWrap = createTag('div', 'dynamic-cards-image');
    const picture = createOptimizedPicture(data.Image, data.Name || 'Speaker', false, [{ width: '600' }]);
    imageWrap.append(picture);
    link.append(imageWrap);
  } else {
    link.append(buildInitialBadge(data.Name, index));
  }

  const body = createTag('div', 'dynamic-cards-body');
  const name = createTag('h3', 'dynamic-cards-name', data.Name || 'Speaker');
  const title = createTag('p', 'dynamic-cards-title', data.Title || '');
  const company = createTag('p', 'dynamic-cards-company', data.Company || '');
  const bio = createTag('p', 'dynamic-cards-bio', data.Bio || '');
  const session = createTag('p', 'dynamic-cards-session', data.Session || '');

  body.append(name, title, company, bio, session);
  link.append(body);
  item.append(link);
  return item;
}

export default async function decorate(block) {
  const endpoint = getEndpoint(block);
  block.textContent = '';

  const loading = createTag('p', 'dynamic-cards-loading', 'Loading speakers...');
  block.append(loading);

  try {
    const response = await fetch(endpoint);
    if (!response.ok) {
      throw new Error(`Request failed: ${response.status}`);
    }

    const json = await response.json();
    const items = Array.isArray(json) ? json : (json?.data ?? []);

    if (!Array.isArray(items) || items.length === 0) {
      throw new Error('No data returned');
    }

    const list = createTag('ul', 'dynamic-cards-list');
    items.forEach((item, index) => list.append(createCard(item, index)));

    block.replaceChildren(list);
  } catch (error) {
    const message = createTag('p', 'dynamic-cards-error', 'Unable to load speakers right now.');
    block.replaceChildren(message);
  }
}
