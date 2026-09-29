// eslint-disable-next-line import/no-unresolved
import DA_SDK from 'https://da.live/nx/utils/sdk.js';

const LEGACY_TRADINGVIEW_HOST = 's3.tradingview.com';
const LEGACY_SCRIPT_PREFIX = 'embed-widget-';
const MODULE_TRADINGVIEW_HOST = 'widgets.tradingview-widget.com';
const MODULE_SCRIPT_PREFIX = 'tv-';
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

function parseLegacyEmbed(tradingViewScript) {
  const scriptURL = new URL(tradingViewScript.src);
  const scriptFilename = scriptURL.pathname.split('/').pop();
  if (!scriptFilename || !scriptFilename.startsWith(LEGACY_SCRIPT_PREFIX)) {
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

function parseModuleEmbed(doc, tradingViewScript) {
  const scriptURL = new URL(tradingViewScript.src);
  const scriptFilename = scriptURL.pathname.split('/').pop();
  if (!scriptFilename || !scriptFilename.startsWith(MODULE_SCRIPT_PREFIX)) {
    throw new Error('Unsupported widget type in script URL.');
  }

  const tagName = scriptFilename.replace(/\.js$/i, '');
  const widgetElement = doc.querySelector(tagName);
  if (!widgetElement) {
    throw new Error(`Missing widget element <${tagName}> in embed code.`);
  }

  const attributes = widgetElement.getAttributeNames().reduce((acc, name) => {
    acc[name] = widgetElement.getAttribute(name);
    return acc;
  }, {});

  return {
    script: scriptURL.toString(),
    height: normalizeHeight({ height: attributes.height }),
    config: {
      tagName,
      attributes,
    },
  };
}

function parseTradingViewEmbedCode(rawEmbedCode) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(rawEmbedCode, 'text/html');
  const scripts = [...doc.querySelectorAll('script[src]')];
  const tradingViewScript = scripts.find(({ src }) => {
    try {
      const url = new URL(src);
      return url.host === LEGACY_TRADINGVIEW_HOST || url.host === MODULE_TRADINGVIEW_HOST;
    } catch {
      return false;
    }
  });

  if (!tradingViewScript) {
    throw new Error('No supported widget script found. Paste the full embed snippet.');
  }

  const scriptURL = new URL(tradingViewScript.src);
  if (scriptURL.host === LEGACY_TRADINGVIEW_HOST) {
    return parseLegacyEmbed(tradingViewScript);
  }

  if (scriptURL.host === MODULE_TRADINGVIEW_HOST) {
    return parseModuleEmbed(doc, tradingViewScript);
  }

  throw new Error('Unsupported script source in embed code.');
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
