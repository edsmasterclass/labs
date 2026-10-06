/**
 * loads and decorates the block
 * Content model: one row per item with a single cell (heading + text); numbers are generated.
 * @param {Element} block The block element
 */
export default function decorate(block) {
  const ol = document.createElement('ol');
  [...block.children].forEach((row, i) => {
    const li = document.createElement('li');
    const number = document.createElement('span');
    number.className = 'numbered-list-number';
    number.setAttribute('aria-hidden', 'true');
    number.textContent = String(i + 1).padStart(2, '0');

    const body = document.createElement('div');
    body.className = 'numbered-list-body';
    [...row.children].forEach((cell) => body.append(...cell.childNodes));

    li.append(number, body);
    ol.append(li);
  });
  block.replaceChildren(ol);
}
