import { createOptimizedPicture, toClassName } from '../../scripts/aem.js';

function isNameElement(el) {
  if (/^H[1-6]$/.test(el.tagName)) return true;
  // authors may bold the name instead of using a heading
  return el.tagName === 'P' && el.children.length === 1
    && ['STRONG', 'B'].includes(el.firstElementChild.tagName)
    && el.textContent.trim() === el.firstElementChild.textContent.trim();
}

function getInitials(name) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0].toUpperCase())
    .join('');
}

function decorateBody(cell) {
  const body = document.createElement('div');
  body.className = 'speakers-body';
  const elements = [...cell.children];
  if (!elements.length && cell.textContent.trim()) {
    const p = document.createElement('p');
    p.textContent = cell.textContent.trim();
    elements.push(p);
  }

  const [first, ...rest] = elements;
  if (first && isNameElement(first)) {
    first.classList.add('speakers-name');
    body.append(first);
    if (rest[0]?.tagName === 'P') {
      const role = rest.shift();
      role.classList.add('speakers-role');
      body.append(role);
    }
  } else if (first) {
    rest.unshift(first);
  }

  if (rest.length) {
    const bio = document.createElement('div');
    bio.className = 'speakers-bio';
    bio.append(...rest);
    body.append(bio);
  }
  return body;
}

function decorateHeadshot(picture, name) {
  const headshot = document.createElement('div');
  headshot.className = 'speakers-headshot';
  if (picture) {
    const img = picture.querySelector('img');
    headshot.append(createOptimizedPicture(img.src, img.alt || name, false, [{ width: '400' }]));
  } else {
    headshot.classList.add('speakers-headshot-placeholder');
    headshot.setAttribute('aria-hidden', 'true');
    headshot.textContent = getInitials(name);
  }
  return headshot;
}

export default function decorate(block) {
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const cells = [...row.children];
    const imageCell = cells.find((cell) => cell.querySelector('picture'));
    const bodyCell = cells.find((cell) => cell !== imageCell && cell.textContent.trim());
    if (!imageCell && !bodyCell) return;

    const body = bodyCell ? decorateBody(bodyCell) : document.createElement('div');
    const name = body.querySelector('.speakers-name')?.textContent.trim() || '';

    const li = document.createElement('li');
    li.className = 'speakers-card';
    // link target for the schedule block
    if (name) li.id = `speaker-${toClassName(name)}`;
    li.append(decorateHeadshot(imageCell?.querySelector('picture'), name), body);
    ul.append(li);
  });
  block.replaceChildren(ul);
}
