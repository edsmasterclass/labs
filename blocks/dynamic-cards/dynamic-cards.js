/**
 * @param {HTMLElement} block
 */
export default async function decorate(block) {
  const dataUrl = block.querySelector('a')?.href;
  if (!dataUrl) {
    block.innerText = 'Error: no data URL';
    return;
  }

  block.innerText = 'Loading...';

  try {
    const res = await fetch(dataUrl);
    if (!res.ok) throw new Error(`HTTP status ${res.status} ${res.statusText}`);

    const data = await res.json();
    const speakers = data.data;

    if (!speakers || speakers.length === 0) {
      block.innerText = 'No speakers found';
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

    block.innerHTML = '';
    block.appendChild(ul);
  } catch (e) {
    console.error('Error loading cards data:', e);
    block.innerText = 'Sorry, failed to load card data';
  }
}
