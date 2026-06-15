import { createOptimizedPicture } from '../../scripts/aem.js';

// tva

// Views the switcher can toggle between. The 'list' view maps to the existing
// `.cards.list` variant; 'grid' is the default (absence of the list class).
const VIEWS = [
  {
    name: 'grid',
    label: 'Grid',
    icon: '<svg class="cards-view-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>',
  },
  {
    name: 'list',
    label: 'List',
    icon: '<svg class="cards-view-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><line x1="9" y1="6" x2="20" y2="6"/><line x1="9" y1="12" x2="20" y2="12"/><line x1="9" y1="18" x2="20" y2="18"/><circle cx="4.5" cy="6" r="1.4" fill="currentColor" stroke="none"/><circle cx="4.5" cy="12" r="1.4" fill="currentColor" stroke="none"/><circle cx="4.5" cy="18" r="1.4" fill="currentColor" stroke="none"/></svg>',
  },
];

/**
 * Builds a right-aligned toggle that switches the block between the grid
 * (default) and list views. The initial active view mirrors however the block
 * was authored: a `cards (list, view-switcher)` block starts on list, a
 * `cards (view-switcher)` block starts on grid.
 * @param {Element} block The cards block
 * @returns {Element} The toolbar element to place above the cards
 */
function buildViewSwitcher(block) {
  const initial = block.classList.contains('list') ? 'list' : 'grid';

  const toolbar = document.createElement('div');
  toolbar.className = 'cards-toolbar';

  const group = document.createElement('div');
  group.className = 'cards-view-switcher';
  group.setAttribute('role', 'group');
  group.setAttribute('aria-label', 'Card view');

  VIEWS.forEach((view) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `cards-view-option cards-view-option-${view.name}`;
    button.setAttribute('aria-pressed', view.name === initial ? 'true' : 'false');
    button.innerHTML = `${view.icon}<span class="cards-view-label">${view.label}</span>`;
    button.addEventListener('click', () => {
      block.classList.toggle('list', view.name === 'list');
      group.querySelectorAll('button').forEach((other) => {
        other.setAttribute('aria-pressed', other === button ? 'true' : 'false');
      });
    });
    group.append(button);
  });

  toolbar.append(group);
  return toolbar;
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
    // turn the first fully-italic paragraph into an eyebrow div (CSS positions it)
    const body = li.querySelector('.cards-card-body');
    const italic = [...(body?.children || [])].find((p) => p.tagName === 'P'
      && p.firstElementChild?.tagName === 'EM'
      && p.firstElementChild.textContent.trim() === p.textContent.trim());
    if (italic) {
      const eyebrow = document.createElement('div');
      eyebrow.className = 'cards-card-eyebrow';
      eyebrow.textContent = italic.textContent;
      italic.replaceWith(eyebrow);
    }
    ul.append(li);
  });
  ul.querySelectorAll('picture > img').forEach((img) => img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }])));
  block.replaceChildren(ul);
  // optional variant: a toggle above the cards to switch between grid and list
  if (block.classList.contains('view-switcher')) {
    block.prepend(buildViewSwitcher(block));
  }
}
