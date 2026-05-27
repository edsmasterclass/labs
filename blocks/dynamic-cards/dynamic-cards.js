/**
 * Fetches speaker data and renders cards dynamically.
 *
 * Authors provide a link to a JSON endpoint in the block content.
 * The endpoint should return an object with a data array.
 *
 * @param {Element} block The dynamic-cards block element.
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
      name.textContent = speaker.Name || 'Unnamed speaker';
      body.append(name);

      const title = document.createElement('p');
      title.className = 'dynamic-card-title';
      title.textContent = speaker.Title || '';
      body.append(title);

      const company = document.createElement('p');
      company.className = 'dynamic-card-company';
      company.textContent = speaker.Company || '';
      body.append(company);

      const bio = document.createElement('p');
      bio.className = 'dynamic-card-bio';
      bio.textContent = speaker.Bio || '';
      body.append(bio);

      li.append(imageWrapper, body);
      ul.append(li);
    });

    block.append(ul);
  } catch (error) {
    block.innerHTML = `<p class="error">Error loading speakers: ${error.message}</p>`;
    // eslint-disable-next-line no-console
    console.error('Dynamic Cards error:', error);
  }
}
