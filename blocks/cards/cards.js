import { createOptimizedPicture } from '../../scripts/aem.js';

export default function decorate(block) {
  /* change to ul, li */
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      if (div.children.length === 1 && div.querySelector('picture')) div.className = 'cards-card-image';
      else div.className = 'cards-card-body';
    });

    const body = li.querySelector('.cards-card-body');
    const eyebrowEm = body?.querySelector('em');

    if (body && eyebrowEm) {
      const eyebrow = document.createElement('div');
      eyebrow.className = 'cards-card-eyebrow';
      eyebrow.textContent = eyebrowEm.textContent.trim();

      const paragraph = eyebrowEm.closest('p');
      if (paragraph && paragraph.children.length === 1) {
        paragraph.remove();
      } else if (paragraph) {
        eyebrowEm.replaceWith(document.createTextNode(eyebrowEm.textContent));
      }

      body.prepend(eyebrow);
    }

    ul.append(li);
  });
  ul.querySelectorAll('picture > img').forEach((img) => img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }])));

  if (block.classList.contains('view-switcher')) {
    const toolbar = document.createElement('div');
    toolbar.className = 'cards-toolbar';

    const isList = block.classList.contains('list');
    const gridBtn = document.createElement('button');
    gridBtn.type = 'button';
    gridBtn.className = `cards-toolbar-btn${isList ? '' : ' active'}`;
    gridBtn.textContent = 'Grid';
    gridBtn.setAttribute('aria-pressed', String(!isList));

    const listBtn = document.createElement('button');
    listBtn.type = 'button';
    listBtn.className = `cards-toolbar-btn${isList ? ' active' : ''}`;
    listBtn.textContent = 'List';
    listBtn.setAttribute('aria-pressed', String(isList));

    const setView = (nextIsList) => {
      block.classList.toggle('list', nextIsList);
      gridBtn.classList.toggle('active', !nextIsList);
      listBtn.classList.toggle('active', nextIsList);
      gridBtn.setAttribute('aria-pressed', String(!nextIsList));
      listBtn.setAttribute('aria-pressed', String(nextIsList));
    };

    gridBtn.addEventListener('click', () => setView(false));
    listBtn.addEventListener('click', () => setView(true));

    toolbar.append(gridBtn, listBtn);
    block.replaceChildren(toolbar, ul);
    return;
  }

  block.replaceChildren(ul);
}
