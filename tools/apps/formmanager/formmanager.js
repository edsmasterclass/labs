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
/* eslint-disable no-underscore-dangle, import/no-unresolved, no-console, class-methods-use-this */
import DA_SDK from 'https://da.live/nx/utils/sdk.js';
import { LitElement, html, nothing } from 'da-lit';
import {
  fetchSiteList,
  listFolders,
  listDocuments,
} from './api.js';
import { icon } from './icons.js';

const NX = 'https://da.live/nx2';
let nexter = null;
let sl = null;
let styles = null;

function encodePath(path) {
  return path.split('/').map((segment) => encodeURIComponent(segment)).join('/');
}

try {
  const [{ default: getStyle }, { loadStyle, getColorScheme }] = await Promise.all([
    import(`${NX}/public/utils/styles.js`),
    import(`${NX}/scripts/nx.js`),
  ]);
  document.documentElement.style.colorScheme = getColorScheme() === 'dark-scheme' ? 'dark' : 'light';
  await Promise.all([
    loadStyle(`${NX}/styles/styles.css`),
    loadStyle(`${NX}/public/sl/styles.css`),
  ]);
  await import(`${NX}/public/sl/components.js`);
  [nexter, sl, styles] = await Promise.all([
    getStyle(`${NX}/styles/styles.css`),
    getStyle(`${NX}/public/sl/styles.css`),
    getStyle(import.meta.url),
  ]);
} catch (e) {
  console.warn('Failed to load styles:', e);
}

// ---- Component ----

class FormManagerApp extends LitElement {
  static properties = {
    context: { attribute: false },
    token: { attribute: false },
    // 'idle' | 'loading' | 'loaded'
    _state: { state: true },
    _org: { state: true },
    _orgValue: { state: true },
    _site: { state: true },
    _message: { state: true },
    _siteList: { state: true },
    // site combobox
    _siteDropdownOpen: { state: true },
    _siteSearchQuery: { state: true },
    _siteActiveIndex: { state: true },
    // Folder picker
    _folderList: { state: true },
    _folderValue: { state: true },
    _folderDropdownOpen: { state: true },
    _folderSearchQuery: { state: true },
    _folderActiveIndex: { state: true },
    _folderListLoading: { state: true },
    _documents: { state: true },
    _documentsLoading: { state: true },
    _documentsError: { state: true },
  };

  connectedCallback() {
    super.connectedCallback();
    this.shadowRoot.adoptedStyleSheets = [nexter, sl, styles].filter(Boolean);

    this._state = 'idle';
    this._org = '';
    this._orgValue = '';
    this._site = null;
    this._message = null;
    this._siteList = [];
    this._siteDropdownOpen = false;
    this._siteSearchQuery = '';
    this._siteActiveIndex = -1;
    this._folderList = [];
    this._folderValue = '';
    this._folderDropdownOpen = false;
    this._folderSearchQuery = '';
    this._folderActiveIndex = -1;
    this._folderListLoading = false;
    this._documents = [];
    this._documentsLoading = false;
    this._documentsError = '';
    this._documentsRequestId = 0;
    this._handleDocMousedown = (e) => {
      const siteField = this.shadowRoot?.querySelector('.da-site-field');
      const folderField = this.shadowRoot?.querySelector('.da-folder-field');
      if (this._siteDropdownOpen && siteField && !e.composedPath().includes(siteField)) {
        this._siteDropdownOpen = false;
        this._siteSearchQuery = '';
      }
      if (this._folderDropdownOpen && folderField && !e.composedPath().includes(folderField)) {
        this._folderDropdownOpen = false;
        this._folderSearchQuery = '';
      }
    };
    document.addEventListener('mousedown', this._handleDocMousedown);

    const urlParams = new URLSearchParams(window.location.search);
    const org = (urlParams.get('org') || '').trim();
    const site = (urlParams.get('site') || '').trim() || null;
    if (org) {
      this._orgValue = org;
      this._state = 'loading';
      this.loadOrg(org, site);
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    document.removeEventListener('mousedown', this._handleDocMousedown);
  }

  updateUrl(org, site) {
    try {
      const url = new URL(window.location.href);
      url.searchParams.set('org', org);
      if (site) {
        url.searchParams.set('site', site);
      } else {
        url.searchParams.delete('site');
      }
      window.history.replaceState(null, '', url);
    } catch (e) {
      console.warn('[formmanager] updateUrl failed:', e);
    }
  }

  get allSites() {
    return [...new Set(this._siteList)].sort();
  }

  get filteredSites() {
    const q = this._siteSearchQuery.toLowerCase();
    return q ? this.allSites.filter((s) => s.toLowerCase().includes(q)) : this.allSites;
  }

  // ---- Org loading ----

  async handleOrgLoad() {
    this._message = null;
    const raw = (this.shadowRoot.querySelector('#org-input')?.value ?? '')
      .trim().replace(/^\/+/, '').replace(/\/+$/, '');

    if (!raw) {
      this._message = { type: 'error', text: 'Enter an organization name.' };
      return;
    }

    const siteToKeep = raw === this._org ? this._site : null;

    this._state = 'loading';
    await this.loadOrg(raw, siteToKeep);
  }

  async loadOrg(org, site = null) {
    this._documentsRequestId += 1;
    this._org = org;
    this._orgValue = org;
    this._site = site;
    this._siteList = [];
    this._message = null;
    this._folderList = [];
    this._folderValue = site ? 'forms' : '';
    this._folderDropdownOpen = false;
    this._folderSearchQuery = '';
    this._folderActiveIndex = -1;
    this._folderListLoading = Boolean(site);
    this._documents = [];
    this._documentsLoading = false;
    this._documentsError = '';

    const [siteList, folders] = await Promise.all([
      fetchSiteList(org),
      site ? listFolders(org, site, '/') : Promise.resolve([]),
    ]);

    this._siteList = siteList;
    this._folderList = folders.map((item) => item.name);
    this._folderListLoading = false;
    this.updateUrl(org, site);
    this._state = 'loaded';
    if (site) this.loadDocuments(org, site, 'forms');
  }

  // ---- Context navigation ----

  navigateToSite(site) {
    const org = this._org;
    this._site = site;
    this._folderList = [];
    this._folderValue = 'forms';
    this._folderDropdownOpen = false;
    this._folderSearchQuery = '';
    this._folderListLoading = true;
    this._message = null;
    this.updateUrl(this._org, site);
    listFolders(org, site, '/').then((folders) => {
      if (this._org === org && this._site === site) {
        this._folderList = folders.map((item) => item.name);
        this._folderListLoading = false;
      }
    });
    this.loadDocuments(org, site, 'forms');
  }

  navigateToOrg() {
    this._documentsRequestId += 1;
    this._site = null;
    this._folderList = [];
    this._folderValue = '';
    this._folderDropdownOpen = false;
    this._folderSearchQuery = '';
    this._folderListLoading = false;
    this._documents = [];
    this._documentsLoading = false;
    this._documentsError = '';
    this._message = null;
    this.updateUrl(this._org, null);
  }

  // ---- Render: toolbar ----

  handleSiteInputFocus() {
    this._siteDropdownOpen = true;
    this._siteSearchQuery = '';
    this._siteActiveIndex = -1;
  }

  handleSiteInputTyped(e) {
    this._siteSearchQuery = e.target.value;
    this._siteDropdownOpen = true;
    this._siteActiveIndex = -1;
  }

  handleSiteInputKey(e) {
    const { filteredSites } = this;
    if (e.key === 'Escape') {
      this._siteDropdownOpen = false;
      this._siteSearchQuery = '';
      this._siteActiveIndex = -1;
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      this._siteDropdownOpen = true;
      this._siteActiveIndex = Math.min(this._siteActiveIndex + 1, filteredSites.length - 1);
      this.scrollActiveSiteItem();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      this._siteActiveIndex = Math.max(this._siteActiveIndex - 1, -1);
      this.scrollActiveSiteItem();
    } else if (e.key === 'Enter' && this._siteDropdownOpen && this._siteActiveIndex >= 0) {
      e.preventDefault();
      this.handleSiteItemSelect(filteredSites[this._siteActiveIndex]);
    }
  }

  scrollActiveSiteItem() {
    requestAnimationFrame(() => {
      this.shadowRoot?.querySelector('.site-dropdown-item.is-active')
        ?.scrollIntoView({ block: 'nearest' });
    });
  }

  handleSiteInputBlur() {
    // rAF lets any @click on dropdown items fire before the dropdown closes
    requestAnimationFrame(() => {
      this._siteDropdownOpen = false;
      this._siteSearchQuery = '';
      this._siteActiveIndex = -1;
    });
  }

  handleSiteItemSelect(site) {
    this._siteDropdownOpen = false;
    this._siteSearchQuery = '';
    this._siteActiveIndex = -1;
    if (site) {
      this.navigateToSite(site);
    } else {
      this.navigateToOrg();
    }
  }

  get filteredFolders() {
    const query = this._folderSearchQuery.toLowerCase();
    return query
      ? this._folderList.filter((folder) => folder.toLowerCase().includes(query))
      : this._folderList;
  }

  handleFolderInputFocus() {
    this._folderDropdownOpen = true;
    this._folderSearchQuery = '';
    this._folderActiveIndex = -1;
  }

  handleFolderInputTyped(e) {
    this._folderSearchQuery = e.target.value;
    this._folderDropdownOpen = true;
    this._folderActiveIndex = -1;
  }

  handleFolderInputKey(e) {
    const { filteredFolders } = this;
    if (e.key === 'Escape') {
      this._folderDropdownOpen = false;
      this._folderSearchQuery = '';
      this._folderActiveIndex = -1;
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      this._folderDropdownOpen = true;
      this._folderActiveIndex = Math.min(this._folderActiveIndex + 1, filteredFolders.length - 1);
      this.scrollActiveFolderItem();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      this._folderActiveIndex = Math.max(this._folderActiveIndex - 1, -1);
      this.scrollActiveFolderItem();
    } else if (e.key === 'Enter' && this._folderDropdownOpen && this._folderActiveIndex >= 0) {
      e.preventDefault();
      this.handleFolderItemSelect(filteredFolders[this._folderActiveIndex]);
    }
  }

  scrollActiveFolderItem() {
    requestAnimationFrame(() => {
      this.shadowRoot?.querySelector('.folder-dropdown-item.is-active')
        ?.scrollIntoView({ block: 'nearest' });
    });
  }

  handleFolderInputBlur() {
    requestAnimationFrame(() => {
      this._folderDropdownOpen = false;
      this._folderSearchQuery = '';
      this._folderActiveIndex = -1;
    });
  }

  handleFolderItemSelect(folder) {
    this._folderDropdownOpen = false;
    this._folderSearchQuery = '';
    this._folderActiveIndex = -1;
    if (folder) this.loadDocuments(this._org, this._site, folder);
    else {
      this._documentsRequestId += 1;
      this._folderValue = '';
      this._documents = [];
      this._documentsLoading = false;
      this._documentsError = '';
    }
  }

  async loadDocuments(org, site, folder) {
    this._documentsRequestId += 1;
    const requestId = this._documentsRequestId;
    this._folderValue = folder;
    this._documents = [];
    this._documentsLoading = true;
    this._documentsError = '';
    try {
      const documents = await listDocuments(org, site, `/${folder}/`);
      if (requestId === this._documentsRequestId
        && this._org === org && this._site === site && this._folderValue === folder) {
        this._documents = documents;
        this._documentsLoading = false;
      }
    } catch (error) {
      if (requestId === this._documentsRequestId
        && this._org === org && this._site === site && this._folderValue === folder) {
        this._documentsError = error.message;
        this._documentsLoading = false;
      }
    }
  }

  renderToolbar() {
    const orgLoaded = this._state === 'loaded';
    const inputVal = this._siteDropdownOpen ? this._siteSearchQuery : (this._site || '');
    const folderInputVal = this._folderDropdownOpen
      ? this._folderSearchQuery : this._folderValue;
    return html`
      <div class="da-toolbar">
        <header class="da-toolbar-header">
          <h1 class="da-title">Form Manager</h1>
        </header>
        <div class="da-org-form">
          <div class="da-org-field">
            <sl-input
              type="text"
              id="org-input"
              placeholder="Organization"
              autocomplete="off"
              aria-label="Organization"
              .value=${this._orgValue}
              @keydown=${(e) => { if (e.key === 'Enter') this.handleOrgLoad(); }}
            ></sl-input>
          </div>
          ${orgLoaded ? html`
            <div class="da-site-field">
              <sl-input
                type="text"
                class="site-combobox-input"
                placeholder="All sites"
                autocomplete="off"
                aria-label="Site"
                aria-expanded=${this._siteDropdownOpen}
                aria-haspopup="listbox"
                .value=${inputVal}
                @focus=${this.handleSiteInputFocus}
                @input=${this.handleSiteInputTyped}
                @keydown=${this.handleSiteInputKey}
                @sl-blur=${this.handleSiteInputBlur}
              ></sl-input>
              ${this._site && !this._siteDropdownOpen ? html`
                <button class="site-clear-btn" aria-label="Clear site" @click=${() => this.navigateToOrg()}>${icon('S2_Icon_Close_20_N')}</button>
              ` : html`
                <span class="site-chevron ${this._siteDropdownOpen ? 'is-open' : ''}" aria-hidden="true">${icon('Smock_ChevronDown_18_N', 18, 18, '0 0 18 18')}</span>
              `}
              ${this._siteDropdownOpen ? html`
                <div class="site-dropdown" role="listbox">
                  ${this.filteredSites.map((site, i) => html`
                    <button
                      class="site-dropdown-item ${this._site === site ? 'is-selected' : ''} ${this._siteActiveIndex === i ? 'is-active' : ''}"
                      role="option"
                      @click=${() => this.handleSiteItemSelect(site)}
                    >${site}</button>
                  `)}
                  ${this.filteredSites.length === 0 ? html`
                    <p class="site-dropdown-empty">No sites match</p>
                  ` : nothing}
                </div>
              ` : nothing}
            </div>
          ` : nothing}
          ${this._site ? html`
            <div class="da-folder-field">
              <sl-input
                type="text"
                placeholder="Select folder"
                aria-label="Folder"
                aria-expanded=${this._folderDropdownOpen}
                aria-haspopup="listbox"
                .value=${folderInputVal}
                @focus=${this.handleFolderInputFocus}
                @input=${this.handleFolderInputTyped}
                @keydown=${this.handleFolderInputKey}
                @sl-blur=${this.handleFolderInputBlur}
              ></sl-input>
              ${this._folderDropdownOpen ? html`
                <div class="folder-dropdown" role="listbox" aria-label="Folders in site">
                  ${this._folderListLoading ? html`
                    <p class="site-dropdown-empty">Loading folders…</p>
                  ` : this.filteredFolders.map((folder, i) => html`
                    <button
                      class="folder-dropdown-item ${this._folderValue === folder ? 'is-selected' : ''} ${this._folderActiveIndex === i ? 'is-active' : ''}"
                      role="option"
                      aria-selected=${this._folderValue === folder}
                      @click=${() => this.handleFolderItemSelect(folder)}
                    >${folder}</button>
                  `)}
                  ${!this._folderListLoading && this.filteredFolders.length === 0 ? html`
                    <p class="site-dropdown-empty">${this._folderSearchQuery ? 'No folders match' : 'No folders in this site'}</p>
                  ` : nothing}
                </div>
              ` : nothing}
            </div>
          ` : nothing}
          <sl-button
            class="pw-fill-accent da-org-submit"
            @click=${() => this.handleOrgLoad()}
            ?disabled=${this._state === 'loading'}
          >
            ${this._state === 'loading' ? 'Loading…' : 'Load'}
          </sl-button>
        </div>
      </div>
    `;
  }

  // ---- Render: loading ----

  renderLoading() {
    return html`
      <div class="loading-container" role="status" aria-live="polite" aria-busy="true">
        <div class="spectrum-loading-indicator" aria-hidden="true"></div>
        <p class="loading-label">Loading…</p>
      </div>
    `;
  }

  // ---- Render: message ----

  renderMessage() {
    if (!this._message) return nothing;
    return html`<div class="message ${this._message.type}">${this._message.text}</div>`;
  }

  renderDocuments() {
    const documents = this._documents.map((document) => {
      const encodedPath = encodePath(document.path).replace(/\.html$/i, '');
      return {
        ...document,
        displayName: document.name.replace(/\.html$/i, ''),
        editUrl: `https://da.live/canvas#/${encodeURIComponent(this._org)}/${encodeURIComponent(this._site)}${encodedPath}`,
        previewUrl: `https://main--${this._site.toLowerCase()}--${this._org.toLowerCase()}.aem.page${encodedPath}`,
      };
    });
    return html`
      <section class="documents-panel" aria-labelledby="documents-title">
        <div class="documents-header">
          <h2 id="documents-title">Forms under ${this._site}/${this._folderValue}</h2>
        </div>
        ${this._documentsLoading ? html`
          <div class="documents-status" role="status" aria-live="polite">Loading documents…</div>
        ` : nothing}
        ${this._documentsError ? html`
          <div class="message error" role="alert">${this._documentsError}</div>
        ` : nothing}
        ${!this._documentsLoading && !this._documentsError && this._documents.length === 0 ? html`
          <p class="documents-empty">No documents in this folder.</p>
        ` : nothing}
        ${this._documents.length > 0 ? html`
          <div class="documents-table-wrap">
            <table class="documents-table">
              <caption class="documents-table-caption">Forms under ${this._site}/${this._folderValue}</caption>
              <thead>
                <tr>
                  <th scope="col">Form</th>
                  <th scope="col">Actions</th>
                </tr>
              </thead>
              <tbody>
                ${documents.map((document) => html`
                  <tr>
                    <th scope="row" class="document-name">${document.displayName}</th>
                    <td class="document-actions">
                      <a
                        class="document-action document-action-edit"
                        href=${document.editUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Edit ${document.displayName}"
                      >Edit</a>
                      <a
                        class="document-action document-action-preview"
                        href=${document.previewUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Preview ${document.displayName}"
                      >Preview</a>
                    </td>
                  </tr>
                `)}
              </tbody>
            </table>
          </div>
        ` : nothing}
      </section>
    `;
  }

  // ---- Render: top-level ----

  renderContent() {
    switch (this._state) {
      case 'loading': return this.renderLoading();
      case 'loaded':
        if (!this._site) return html`<p class="empty-note">Select a site to view its forms pages.</p>`;
        if (!this._folderValue) return html`<p class="empty-note">Select a folder to view its pages.</p>`;
        return this.renderDocuments();
      default: return nothing;
    }
  }

  render() {
    return html`
      ${this.renderToolbar()}
      ${this.renderMessage()}
      <div class="da-content">
        ${this.renderContent()}
      </div>
    `;
  }
}

customElements.define('formmanager-app', FormManagerApp);

(async function init() {
  const { context, token } = await DA_SDK;
  const cmp = document.createElement('formmanager-app');
  cmp.context = context;
  cmp.token = token;
  document.body.append(cmp);
}());
