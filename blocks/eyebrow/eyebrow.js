/**
 * Decorates the eyebrow block.
 * @param {Element} block The eyebrow block element.
 */
export default function decorate(block) {
  const cells = [...block.querySelectorAll(':scope > div > div')];
  const source = cells.find((cell) => cell.textContent.trim());

  if (!source) {
    block.remove();
    return;
  }

  const label = document.createElement('p');
  label.className = 'eyebrow-label';

  while (source.firstChild) label.append(source.firstChild);

  block.replaceChildren(label);
}
