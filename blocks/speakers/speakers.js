import { createOptimizedPicture } from '../../scripts/aem.js';

function buildHeadshot(img) {
  const wrapper = document.createElement('div');
  wrapper.className = 'speakers-headshot';
  const { origin } = new URL(img.src, window.location.href);
  // createOptimizedPicture rewrites to a same-origin path, so leave cross-origin images as-is
  wrapper.append(origin === window.location.origin
    ? createOptimizedPicture(img.src, img.alt, false, [{ width: '400' }])
    : img.closest('picture') || img);
  return wrapper;
}

function buildInfo(cell) {
  const info = document.createElement('div');
  info.className = 'speakers-info';

  const elements = [...cell.children].filter((el) => el.textContent.trim());
  const nameIndex = elements.findIndex((el) => /^H[1-6]$/.test(el.tagName));
  const [name] = nameIndex >= 0 ? elements.splice(nameIndex, 1) : elements.splice(0, 1);
  if (!name) return info;

  name.classList.add('speakers-name');
  info.append(name);

  const role = elements.shift();
  if (role) {
    role.classList.add('speakers-role');
    info.append(role);
  }

  if (elements.length) {
    const bio = document.createElement('div');
    bio.className = 'speakers-bio';
    bio.append(...elements);
    info.append(bio);
  }
  return info;
}

export default function decorate(block) {
  const ul = document.createElement('ul');

  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    li.className = 'speakers-card';

    const img = row.querySelector('img');
    const textCell = [...row.children].find((cell) => !cell.querySelector('img'))
      || row.lastElementChild;

    if (img) li.append(buildHeadshot(img));
    const info = buildInfo(textCell);
    if (info.children.length) li.append(info);

    if (li.children.length) ul.append(li);
  });

  block.replaceChildren(ul);
}
