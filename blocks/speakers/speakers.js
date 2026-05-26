import { createOptimizedPicture } from '../../scripts/aem.js';

export default function decorate(block) {
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      if (div.children.length === 1 && div.querySelector('picture')) {
        div.className = 'speakers-headshot';
      } else {
        div.className = 'speakers-info';
        const heading = div.querySelector('h1, h2, h3, h4, h5, h6');
        if (heading) heading.classList.add('speakers-name');
        const paragraphs = [...div.querySelectorAll(':scope > p')];
        if (paragraphs.length > 0) paragraphs[0].classList.add('speakers-role');
        paragraphs.slice(1).forEach((p) => p.classList.add('speakers-bio'));
      }
    });
    ul.append(li);
  });
  ul.querySelectorAll('picture > img').forEach((img) => {
    img.closest('picture').replaceWith(
      createOptimizedPicture(img.src, img.alt, false, [{ width: '400' }]),
    );
  });
  block.replaceChildren(ul);
}
