/**
 * Fetches speaker data and renders cards dynamically
 *
 * Author provides (in block):
 * - Row 1: Data source URL (sheet.json endpoint)
 */
export default async function decorate(block) {
  // Extract data source URL from block content
  const dataSource = block.querySelector('a')?.href;

  if (!dataSource) {
    block.textContent = 'Error: No data source specified';
    return;
  }

  // Show loading state
  block.innerHTML = '<p class="loading">Loading speakers...</p>';

  try {
    // Fetch data from sheet JSON endpoint
    const response = await fetch(dataSource);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const json = await response.json();
    const speakers = json.data;

    // Clear loading message
    block.innerHTML = '';

    if (!speakers || speakers.length === 0) {
      block.innerHTML = '<p>No speakers found.</p>';
      return;
    }

    // Create cards container
    const ul = document.createElement('ul');
    ul.className = 'dynamic-cards-list';

    // Generate card for each speaker
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
  }
}
