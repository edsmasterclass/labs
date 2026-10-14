/* eslint-disable import/no-unresolved */
const { getDaAdmin } = await import('https://da.live/nx/public/utils/constants.js');
const DA_ADMIN = getDaAdmin();
const { daFetch } = await import('https://da.live/nx/utils/daFetch.js');

async function listItems(org, site, path) {
  const response = await daFetch(`${DA_ADMIN}/list/${encodeURIComponent(org)}/${encodeURIComponent(site)}${path}`);
  if (!response.ok) {
    throw new Error(`Unable to list ${path || 'site contents'} (HTTP ${response.status}).`);
  }
  const items = await response.json();
  if (!Array.isArray(items)) throw new Error('The folder listing response was invalid.');
  return items;
}

export async function listFormFolders(org, site, path = '/forms/') {
  const items = await listItems(org, site, path);
  const childFolders = items.filter((item) => !item.ext);
  const nestedFolders = await Promise.all(
    childFolders.map((folder) => listFormFolders(org, site, `${path}${folder.name}/`)),
  );
  return [
    { path, label: path.replace(/^\/|\/$/g, '') || '/' },
    ...nestedFolders.flat(),
  ];
}

export async function listForms(org, site, path) {
  const items = await listItems(org, site, path);
  return items
    .filter((item) => typeof item.ext === 'string' && item.ext.replace(/^\./, '').toLowerCase() === 'json')
    .map((item) => {
      const extension = item.ext.startsWith('.') ? item.ext : `.${item.ext}`;
      const filename = `${item.name}${extension}`;
      return { name: filename, path: `${path}${filename}` };
    })
    .sort((a, b) => a.name.localeCompare(b.name));
}
