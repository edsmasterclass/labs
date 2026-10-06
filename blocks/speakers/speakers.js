export default function decorate(block) {
  const list = document.createElement('ul');

  [...block.children].forEach((row) => {
    const cells = [...row.children];
    if (!cells.length) return;

    const imageCell = cells.find((cell) => cell.querySelector('picture, img'))
      || (cells.length > 1 && cells[0]);
    const contentCell = cells.find((cell) => cell !== imageCell) || (!imageCell && cells[0]);
    const item = document.createElement('li');
    const card = document.createElement('article');
    card.className = 'speakers-card';

    if (imageCell) {
      const image = imageCell.querySelector('picture') || imageCell.querySelector('img');
      if (image) {
        const portrait = document.createElement('figure');
        portrait.className = 'speakers-card-image';
        portrait.append(image);
        card.append(portrait);
      }
    }

    if (contentCell) {
      contentCell.className = 'speakers-card-content';

      const name = contentCell.querySelector('h1, h2, h3, h4, h5, h6');
      name?.classList.add('speakers-card-name');

      const role = [...contentCell.querySelectorAll('p')]
        .find((paragraph) => paragraph.querySelector(':scope > strong'));
      role?.classList.add('speakers-card-role');

      [...contentCell.querySelectorAll('p')]
        .filter((paragraph) => paragraph !== role)
        .forEach((paragraph) => paragraph.classList.add('speakers-card-bio'));

      const image = card.querySelector('img');
      if (image && !image.hasAttribute('alt')) image.alt = name?.textContent.trim() || '';

      card.append(contentCell);
    }

    item.append(card);
    list.append(item);
  });

  block.replaceChildren(list);
}
