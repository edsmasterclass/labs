import { createOptimizedPicture } from '../../scripts/aem.js';

function hasContent(cell) {
  return cell && (cell.textContent.trim() || cell.querySelector('img, picture'));
}

function appendCell(parent, cell, className) {
  if (!hasContent(cell)) return;
  cell.className = className;
  parent.append(cell);
}

function optimizeHeadshot(container) {
  const img = container.querySelector('img');
  if (!img || img.closest('picture')) return;

  const imageUrl = new URL(img.src, window.location.href);
  if (imageUrl.origin === window.location.origin) {
    img.replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]));
  }
}

export default function decorate(block) {
  const list = document.createElement('ul');

  [...block.children].forEach((row) => {
    const [image, name, role, bio] = [...row.children];
    const card = document.createElement('li');
    const content = document.createElement('div');
    content.className = 'speakers-card-content';

    if (hasContent(image)) {
      image.className = 'speakers-card-image';
      optimizeHeadshot(image);
      card.append(image);
    }

    appendCell(content, name, 'speakers-card-name');
    appendCell(content, role, 'speakers-card-role');
    appendCell(content, bio, 'speakers-card-bio');

    if (content.children.length) card.append(content);
    if (card.children.length) list.append(card);
  });

  block.replaceChildren(list);
}
