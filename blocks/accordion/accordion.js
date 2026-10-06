/**
 * loads and decorates the block
 * Content model: one row per item, first cell the question/label, second cell the answer.
 * @param {Element} block The block element
 */
export default function decorate(block) {
  const items = [...block.children].map((row) => {
    const [label, body] = row.children;

    const summary = document.createElement('summary');
    summary.className = 'accordion-item-label';
    summary.append(...label.childNodes);

    const content = body || document.createElement('div');
    content.className = 'accordion-item-body';

    const details = document.createElement('details');
    details.className = 'accordion-item';
    details.append(summary, content);
    return details;
  });
  block.replaceChildren(...items);
}
