/**
 * Fetches speaker data and renders cards dynamically
 *
 * Author provides (in block):
 * - Row 1: Data source URL (sheet.json or worker endpoint)
 */
export default async function decorate(block) {
  const dataSource = block.querySelector('a')?.href;

  if (!dataSource) {
    block.textContent = 'Error: No data source specified';
    return;
  }

  block.innerHTML = '<p class="loading">Loading speakers...</p>';

  try {
    const response = await fetch(dataSource);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const json = await response.json();
    const speakers = json.data;

    block.innerHTML = '';

    if (!speakers || speakers.length === 0) {
      block.innerHTML = '<p>No speakers found.</p>';
      return;
    }

    const ul = document.createElement('ul');
    ul.className = 'dynamic-cards-list';

    speakers.forEach((speaker) => {
      const li = document.createElement('li');
      li.className = 'dynamic-card';

      li.innerHTML = `
        <div class="dynamic-card-image">
          <img src="${speaker.Image}" alt="${speaker.Name}" loading="lazy">
        </div>
        <div class="dynamic-card-body">
          <h3>${speaker.Name}</h3>
          <p class="dynamic-card-title">${speaker.Title}</p>
          <p class="dynamic-card-company">${speaker.Company}</p>
          <p class="dynamic-card-bio">${speaker.Bio}</p>
        </div>
      `;

      ul.append(li);
    });

    block.append(ul);
  } catch (error) {
    block.innerHTML = `<p class="error">Error loading speakers: ${error.message}</p>`;
    /* eslint-disable-next-line no-console */
    console.error('Dynamic Cards error:', error);
  }
}
