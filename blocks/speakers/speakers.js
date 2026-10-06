import { createOptimizedPicture } from '../../scripts/aem.js';

function isName(el) {
  if (/^H[1-6]$/.test(el.tagName)) return true;
  const strong = el.tagName === 'P' && el.children.length === 1 && el.firstElementChild;
  return !!strong && ['STRONG', 'B'].includes(strong.tagName)
    && el.textContent.trim() === strong.textContent.trim();
}

function getInitials(name) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');
}

function buildHeadshot(img, name) {
  const headshot = document.createElement('div');
  headshot.className = 'speakers-headshot';
  if (img) {
    const alt = img.alt || name;
    // only same-origin media can be resized by the optimized picture pipeline
    if (new URL(img.src, window.location.href).origin === window.location.origin) {
      headshot.append(createOptimizedPicture(img.src, alt, false, [{ width: '400' }]));
    } else {
      img.alt = alt;
      img.loading = 'lazy';
      headshot.append(img);
    }
  } else {
    headshot.classList.add('speakers-headshot-initials');
    headshot.setAttribute('aria-hidden', 'true');
    headshot.textContent = getInitials(name);
  }
  return headshot;
}

function buildBody(elements) {
  const body = document.createElement('div');
  body.className = 'speakers-body';
  const rest = [...elements];

  const nameIndex = rest.findIndex(isName);
  const [name] = rest.splice(nameIndex >= 0 ? nameIndex : 0, 1);
  if (name) {
    name.classList.add('speakers-name');
    body.append(name);
  }

  if (rest[0]?.tagName === 'P') {
    const role = rest.shift();
    role.classList.add('speakers-role');
    body.append(role);
  }

  if (rest.length) {
    const bio = document.createElement('div');
    bio.className = 'speakers-bio';
    bio.append(...rest);
    body.append(bio);
  }
  return body;
}

export default function decorate(block) {
  const ul = document.createElement('ul');

  [...block.children].forEach((row) => {
    const cells = [...row.children];
    const img = row.querySelector('img');
    const elements = cells.flatMap((cell) => [...cell.children])
      .filter((el) => !['PICTURE', 'IMG'].includes(el.tagName) && !el.querySelector('img'));
    cells.forEach((cell) => {
      if (!cell.children.length && cell.textContent.trim()) {
        const p = document.createElement('p');
        p.textContent = cell.textContent.trim();
        elements.push(p);
      }
    });
    if (!img && !elements.length) return;

    const body = buildBody(elements);
    const name = body.querySelector('.speakers-name')?.textContent.trim() || '';

    const li = document.createElement('li');
    li.className = 'speakers-card';
    li.append(buildHeadshot(img, name), body);
    ul.append(li);
  });

  block.replaceChildren(ul);
}
