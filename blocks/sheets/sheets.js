import { loadFragment } from '../fragment/fragment.js';

export default function decorate(block) {
  /* take in /drafts/mhammond/mysheet.json, parse it and then create a table */

  const sheetSource = loadFragment('/drafts/mhammond/mysheet.json');

  sheetSource.then((sheet) => {
    const table = document.createElement('table');
    const thead = document.createElement('thead');
    const tbody = document.createElement('tbody');

    // Create table header
    const headerRow = document.createElement('tr');
    sheet.headers.forEach((header) => {
      const th = document.createElement('th');
      th.textContent = header;
      headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);

    // Create table body
    sheet.rows.forEach((row) => {
      const tr = document.createElement('tr');
      row.forEach((cell) => {
        const td = document.createElement('td');
        td.textContent = cell;
        tr.appendChild(td);
      });
      tbody.appendChild(tr);
    });

    table.appendChild(tbody);
    block.appendChild(table);
  });
}
