import { createOptimizedPicture } from '../../scripts/aem.js';

function createViewToggle(block) {
  const controls = document.createElement('div');
  controls.className = 'cards-view-toggle';

  const cardButton = document.createElement('button');
  cardButton.type = 'button';
  cardButton.className = 'cards-view-button is-active';
  cardButton.setAttribute('aria-pressed', 'true');
  cardButton.textContent = 'Card view';

  const listButton = document.createElement('button');
  listButton.type = 'button';
  listButton.className = 'cards-view-button';
  listButton.setAttribute('aria-pressed', 'false');
  listButton.textContent = 'List view';

  const setView = (isListView) => {
    block.classList.toggle('list-view', isListView);
    cardButton.classList.toggle('is-active', !isListView);
    listButton.classList.toggle('is-active', isListView);
    cardButton.setAttribute('aria-pressed', String(!isListView));
    listButton.setAttribute('aria-pressed', String(isListView));
  };

  cardButton.addEventListener('click', () => setView(false));
  listButton.addEventListener('click', () => setView(true));

  controls.setAttribute('role', 'group');
  controls.setAttribute('aria-label', 'Cards layout toggle');
  controls.append(cardButton, listButton);

  return controls;
}

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

    // Detect italic text in body and extract as eyebrow label
    const body = li.querySelector('.cards-card-body');
    const em = body?.querySelector('em');
    if (em) {
      const eyebrow = document.createElement('div');
      eyebrow.className = 'cards-card-eyebrow';
      eyebrow.textContent = em.textContent;
      const p = em.closest('p');
      if (p) p.remove();
      else em.remove();
      body.prepend(eyebrow);
    }

    ul.append(li);
  });

  ul.querySelectorAll('picture > img').forEach((img) => img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }])));
  block.replaceChildren(createViewToggle(block), ul);
}
