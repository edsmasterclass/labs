/*
 * Copyright 2026 Adobe Systems Incorporated
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/* eslint-disable import/no-unresolved, no-console */

const { getDaAdmin } = await import('https://da.live/nx/public/utils/constants.js');
const DA_ADMIN = getDaAdmin();

// daFetch ensures a fresh IMS token is used on every request (handles token expiry)
const { daFetch } = await import('https://da.live/nx/utils/daFetch.js');

export async function listFolders(org, site, path = '/') {
  try {
    const response = await daFetch(`${DA_ADMIN}/list/${org}/${site}${path}`);
    if (!response.ok) return [];
    const items = await response.json();
    return Array.isArray(items) ? items.filter((item) => !item.ext) : [];
  } catch {
    return [];
  }
}

async function listFolderItems(org, site, path) {
  const response = await daFetch(`${DA_ADMIN}/list/${org}/${site}${path}`);
  if (!response.ok) {
    throw new Error(`Unable to list folder contents (HTTP ${response.status}).`);
  }
  const items = await response.json();
  if (!Array.isArray(items)) {
    throw new Error('Unable to list folder contents: unexpected response.');
  }
  return items;
}

export async function listDocuments(org, site, path) {
  const items = await listFolderItems(org, site, path);
  const documents = items
    .filter((item) => typeof item.ext === 'string' && item.ext.replace(/^\./, '').toLowerCase() === 'html')
    .map((item) => {
      const { ext: extension } = item;
      const filename = `${item.name}${extension.startsWith('.') ? extension : `.${extension}`}`;
      return { name: filename, path: `${path}${filename}` };
    });
  const folders = items.filter((item) => !item.ext);
  const nestedDocuments = await Promise.all(
    folders.map((folder) => listDocuments(org, site, `${path}${folder.name}/`)),
  );
  return [...documents, ...nestedDocuments.flat()];
}

export async function fetchSiteList(org) {
  try {
    const response = await daFetch(`${DA_ADMIN}/list/${org}/`);
    if (!response.ok) return [];
    const items = await response.json();
    if (!Array.isArray(items)) return [];
    return items.filter((item) => !item.ext).map((item) => item.name);
  } catch {
    return [];
  }
}
