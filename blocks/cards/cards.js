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
    ul.append(li);
  });
  ul.querySelectorAll('picture > img').forEach((img) => img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }])));
  block.replaceChildren(ul);

  if (block.classList.contains('view-switcher')) {
    const toolbar = document.createElement('div');
    toolbar.className = 'cards-toolbar';

    const isList = block.classList.contains('list');

    const gridBtn = document.createElement('button');
    gridBtn.textContent = 'Grid';
    gridBtn.className = `cards-toolbar-btn${isList ? '' : ' active'}`;

    const listBtn = document.createElement('button');
    listBtn.textContent = 'List';
    listBtn.className = `cards-toolbar-btn${isList ? ' active' : ''}`;

    gridBtn.addEventListener('click', () => {
      block.classList.remove('list');
      gridBtn.classList.add('active');
      listBtn.classList.remove('active');
    });

    listBtn.addEventListener('click', () => {
      block.classList.add('list');
      listBtn.classList.add('active');
      gridBtn.classList.remove('active');
    });

    toolbar.append(gridBtn, listBtn);
    block.prepend(toolbar);
  }
}
