import { createOptimizedPicture } from '../../scripts/aem.js';

/**
 * Each row: column 1 = headshot (picture), column 2 = name (h2/h3), role (p), bio (p+).
 * Falls back like cards: one cell with only picture = media; everything else = body.
 */
export default function decorate(block) {
  const list = document.createElement('ul');
  list.className = 'speakers-list';

  [...block.children].forEach((row) => {
    const item = document.createElement('li');
    item.className = 'speakers-card';

    while (row.firstElementChild) item.append(row.firstElementChild);

    [...item.children].forEach((cell) => {
      const pic = cell.querySelector(':scope picture');
      const onlyPicture = cell.children.length === 1 && pic;
      cell.className = onlyPicture ? 'speakers-card-media' : 'speakers-card-body';
    });

    const body = item.querySelector('.speakers-card-body');
    if (body) {
      const nameEl = body.querySelector('h2, h3');
      if (nameEl) {
        nameEl.classList.add('speakers-name');
        const firstP = nameEl.nextElementSibling;
        const secondP = firstP?.nextElementSibling;
        if (firstP?.tagName === 'P' && secondP?.tagName === 'P') {
          firstP.classList.add('speakers-role');
        }
      } else {
        const first = body.firstElementChild;
        const second = first?.nextElementSibling;
        const third = second?.nextElementSibling;
        if (first?.tagName === 'P') {
          first.classList.add('speakers-name');
          if (second?.tagName === 'P' && third?.tagName === 'P') {
            second.classList.add('speakers-role');
          }
        }
      }
    }

    list.append(item);
  });

  list.querySelectorAll('picture > img').forEach((img) => {
    const picture = img.closest('picture');
    const alt = img.getAttribute('alt') || '';
    picture.replaceWith(createOptimizedPicture(img.src, alt, false, [{ width: '750' }]));
  });

  block.replaceChildren(list);
}
