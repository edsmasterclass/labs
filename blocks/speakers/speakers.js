import { createOptimizedPicture } from '../../scripts/aem.js';

export default function decorate(block) {
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    const [imageCell, contentCell] = row.children;

    const img = imageCell.querySelector('img');
    const picture = createOptimizedPicture(img.src, img.alt, false, [{ width: '300' }]);
    const imageWrapper = document.createElement('div');
    imageWrapper.className = 'speakers-headshot';
    imageWrapper.append(picture);

    const body = document.createElement('div');
    body.className = 'speakers-body';

    const name = contentCell.querySelector('h3');
    const role = contentCell.querySelector('p > em')?.closest('p');
    const bio = [...contentCell.querySelectorAll('p')].find((p) => !p.querySelector('em'));

    if (name) body.append(name);
    if (role) {
      role.className = 'speakers-role';
      body.append(role);
    }
    if (bio) {
      bio.className = 'speakers-bio';
      body.append(bio);
    }

    li.append(imageWrapper, body);
    ul.append(li);
  });

  block.replaceChildren(ul);
}
