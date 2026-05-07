/**
 * Schedule block
 * Row contract:
 *  - col 1: time
 *  - col 2: session title
 *  - col 3: speaker (single text field)
 *  - col 4: track or room
 */
export default function decorate(block) {
  const table = document.createElement('table');
  table.className = 'schedule-table';

  const caption = document.createElement('caption');
  caption.className = 'schedule-caption visually-hidden';
  caption.textContent = 'Conference agenda';
  table.append(caption);

  const thead = document.createElement('thead');
  const headRow = document.createElement('tr');
  const headers = ['Time', 'Session', 'Speaker', 'Track / Room'];
  headers.forEach((label) => {
    const th = document.createElement('th');
    th.scope = 'col';
    th.textContent = label;
    headRow.append(th);
  });
  thead.append(headRow);
  table.append(thead);

  const tbody = document.createElement('tbody');
  [...block.children].forEach((row) => {
    if (!row.children.length) return;

    const tr = document.createElement('tr');
    const cells = [...row.children];

    headers.forEach((label, i) => {
      const td = document.createElement('td');
      td.setAttribute('data-label', label);
      const source = cells[i];
      if (source) {
        td.innerHTML = source.innerHTML;
      }
      tr.append(td);
    });

    tbody.append(tr);
  });

  table.append(tbody);
  block.replaceChildren(table);
}
