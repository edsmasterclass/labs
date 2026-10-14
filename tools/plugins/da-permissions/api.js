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

export async function fetchOrgConfig(org) {
  try {
    const response = await daFetch(`${DA_ADMIN}/config/${org}/`);
    const unauthorized = response.status === 403 || response.status === 401;
    if (unauthorized) return { canAccess: false, config: null };
    if (!response.ok) return { canAccess: false, config: null };
    const config = await response.json();
    return { canAccess: true, config };
  } catch {
    return { canAccess: false, config: null };
  }
}

export async function updateOrgConfig(org, config) {
  try {
    const formData = new FormData();
    formData.append('config', JSON.stringify(config));
    const response = await daFetch(`${DA_ADMIN}/config/${org}/`, {
      method: 'POST',
      body: formData,
    });
    return { success: response.ok, status: response.status, error: response.ok ? null : `HTTP ${response.status}` };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

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
