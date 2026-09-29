import { readBlockConfig } from '../../scripts/aem.js';

const LEGACY_SCRIPT_PREFIX = 'https://s3.tradingview.com/external-embedding/';
const MODULE_WIDGETS_HOST = 'widgets.tradingview-widget.com';

function parseConfig(block) {
  const code = block.querySelector('pre > code');
  if (!code) return {};

  try {
    return JSON.parse(code.textContent);
  } catch {
    return {};
  }
}

function isAbsoluteURL(value) {
  return /^https?:\/\//i.test(value);
}

function buildLegacyWidget({ script, config }) {
  const container = document.createElement('div');
  container.className = 'tradingview-widget-container';

  const widget = document.createElement('div');
  widget.className = 'tradingview-widget-container__widget';

  const copyright = document.createElement('div');
  copyright.className = 'tradingview-widget-copyright';
  const link = document.createElement('a');
  link.href = 'https://www.tradingview.com/';
  link.target = '_blank';
  link.rel = 'noopener nofollow';
  const text = document.createElement('span');
  text.className = 'blue-text';
  text.textContent = 'Track all markets on TradingView';
  link.append(text);
  copyright.append(link);

  const scriptEl = document.createElement('script');
  scriptEl.type = 'text/javascript';
  scriptEl.async = true;
  scriptEl.src = `${LEGACY_SCRIPT_PREFIX}${script}`;
  scriptEl.textContent = JSON.stringify(config);

  container.append(widget, copyright, scriptEl);
  return container;
}

function buildModuleWidget({ script, config }) {
  const container = document.createElement('div');
  container.className = 'tradingview-widget-container';

  const tagName = typeof config.tagName === 'string' ? config.tagName : '';
  if (!tagName.startsWith('tv-')) {
    return null;
  }

  const widgetElement = document.createElement(tagName);
  const attributes = config.attributes && typeof config.attributes === 'object'
    ? config.attributes
    : {};
  Object.entries(attributes).forEach(([name, value]) => {
    if (value !== null && value !== undefined) {
      widgetElement.setAttribute(name, String(value));
    }
  });

  const scriptEl = document.createElement('script');
  scriptEl.type = 'module';
  scriptEl.src = script;

  container.append(widgetElement, scriptEl);
  return container;
}

export default function decorate(block) {
  const cfg = readBlockConfig(block);
  if (!cfg.script) {
    block.textContent = '';
    return;
  }

  const config = parseConfig(block);
  let widget;
  if (isAbsoluteURL(cfg.script)) {
    try {
      const scriptURL = new URL(cfg.script);
      if (scriptURL.host === MODULE_WIDGETS_HOST) {
        widget = buildModuleWidget({ script: cfg.script, config });
      }
    } catch {
      widget = null;
    }
  } else {
    widget = buildLegacyWidget({ script: cfg.script, config });
  }

  if (!widget) {
    block.textContent = 'Unsupported TradingView configuration.';
    return;
  }

  const height = cfg.height || '500px';

  block.textContent = '';
  block.style.height = height;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        block.replaceChildren(widget);
        observer.unobserve(block);
      }
    });
  }, { rootMargin: '20%', threshold: 1.0 });

  observer.observe(block);
}
