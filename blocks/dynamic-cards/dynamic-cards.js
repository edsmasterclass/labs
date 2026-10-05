/**
 * Fetches speaker data and renders cards dynamically
 *
 * Author provides (in block):
 * - Row 1: Data source URL (sheet.json endpoint)
 */

export default async function decorate(block) {
  const dataSource = block.querySelector('a')?.href;

  if (!dataSource) {
    block.textContent = 'Error: No data source specified';
    return;
  }

  const loading = document.createElement('p');
  loading.className = 'loading';
  loading.textContent = 'Loading speakers...';
  block.replaceChildren(loading);

  try {
    const response = await fetch(dataSource);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const json = await response.json();
    const speakers = json.data;

    if (!speakers || speakers.length === 0) {
      const empty = document.createElement('p');
      empty.textContent = 'No speakers found.';
      block.replaceChildren(empty);
      return;
    }

    const ul = document.createElement('ul');
    ul.className = 'dynamic-cards-list';

    speakers.forEach((speaker) => {
      const li = document.createElement('li');
      li.className = 'dynamic-card';

      const imageWrapper = document.createElement('div');
      imageWrapper.className = 'dynamic-card-image';
      const img = document.createElement('img');
      img.src = speaker.Image || '';
      img.alt = speaker.Name || '';
      img.loading = 'lazy';
      imageWrapper.append(img);

      const body = document.createElement('div');
      body.className = 'dynamic-card-body';

      const name = document.createElement('h3');
      name.textContent = speaker.Name || '';

      const title = document.createElement('p');
      title.className = 'dynamic-card-title';
      title.textContent = speaker.Title || '';

      const company = document.createElement('p');
      company.className = 'dynamic-card-company';
      company.textContent = speaker.Company || '';

      const bio = document.createElement('p');
      bio.className = 'dynamic-card-bio';
      bio.textContent = speaker.Bio || '';

      body.append(name, title, company, bio);
      li.append(imageWrapper, body);

      ul.append(li);
    });

    block.replaceChildren(ul);
  } catch (error) {
    const errorMessage = document.createElement('p');
    errorMessage.className = 'error';
    errorMessage.textContent = `Error loading speakers: ${error.message}`;
    block.replaceChildren(errorMessage);
  }
}
