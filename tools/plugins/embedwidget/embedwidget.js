// eslint-disable-next-line import/no-unresolved
import DA_SDK from 'https://da.live/nx/utils/sdk.js';

const TRADINGVIEW_HOST = 's3.tradingview.com';
const SCRIPT_PREFIX = 'embed-widget-';
const DEFAULT_HEIGHT = '500px';

function setStatus(statusEl, message, type = '') {
  statusEl.textContent = message;
  statusEl.className = `plugin-status ${type}`.trim();
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function normalizeHeight(config) {
  const { height } = config;
  if (typeof height === 'number' && Number.isFinite(height)) return `${height}px`;
  if (typeof height === 'string' && height.trim()) return height.trim();
  return DEFAULT_HEIGHT;
}

function parseTradingViewEmbedCode(rawEmbedCode) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(rawEmbedCode, 'text/html');
  const scripts = [...doc.querySelectorAll('script[src]')];
  const tradingViewScript = scripts.find(({ src }) => src.includes(TRADINGVIEW_HOST));

  if (!tradingViewScript) {
    throw new Error('No supported widget script found. Paste the full embed snippet.');
  }

  const scriptURL = new URL(tradingViewScript.src);
  if (scriptURL.host !== TRADINGVIEW_HOST) {
    throw new Error('Unsupported script source in embed code.');
  }

  const scriptFilename = scriptURL.pathname.split('/').pop();
  if (!scriptFilename || !scriptFilename.startsWith(SCRIPT_PREFIX)) {
    throw new Error('Unsupported widget type in script URL.');
  }

  const scriptConfigText = tradingViewScript.textContent.trim();
  if (!scriptConfigText) {
    throw new Error('Widget configuration is empty.');
  }

  let config;
  try {
    config = JSON.parse(scriptConfigText);
  } catch {
    throw new Error('Widget config must be valid JSON.');
  }

  if (typeof config !== 'object' || config === null || Array.isArray(config)) {
    throw new Error('Widget config must be a JSON object.');
  }

  return {
    script: scriptFilename,
    height: normalizeHeight(config),
    config,
  };
}

function toTradingViewBlockHTML({ script, height, config }) {
  const safeScript = escapeHtml(script);
  const safeHeight = escapeHtml(height);
  const safeConfig = escapeHtml(JSON.stringify(config, null, 2));

  return `
<table>
  <tbody>
    <tr>
      <td colspan="2"><p>tradingview</p></td>
    </tr>
    <tr>
      <td><p>script</p></td>
      <td><p>${safeScript}</p></td>
    </tr>
    <tr>
      <td><p>height</p></td>
      <td><p>${safeHeight}</p></td>
    </tr>
    <tr>
      <td><p>config</p></td>
      <td><pre><code>${safeConfig}</code></pre></td>
    </tr>
  </tbody>
</table>`.trim();
}

(async function init() {
  const { actions } = await DA_SDK;
  const inputEl = document.getElementById('embed-code-input');
  const insertButton = document.getElementById('insert-block-btn');
  const statusEl = document.getElementById('plugin-status');

  insertButton.addEventListener('click', async () => {
    const rawEmbedCode = inputEl.value.trim();
    if (!rawEmbedCode) {
      setStatus(statusEl, 'Paste an embed snippet first.', 'error');
      return;
    }

    insertButton.disabled = true;
    setStatus(statusEl, 'Parsing embed code...', '');

    try {
      const parsed = parseTradingViewEmbedCode(rawEmbedCode);
      const blockHtml = toTradingViewBlockHTML(parsed);

      await actions.sendHTML(blockHtml);
      setStatus(statusEl, 'Widget block inserted.', 'success');
      await actions.closeLibrary();
    } catch (error) {
      setStatus(statusEl, error.message || 'Unable to convert embed code.', 'error');
    } finally {
      insertButton.disabled = false;
    }
  });
}());
