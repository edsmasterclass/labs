import { readBlockConfig } from '../../scripts/aem.js';

const SCRIPT_PREFIX = 'https://s3.tradingview.com/external-embedding/';

function parseConfig(block) {
  const code = block.querySelector('pre > code');
  if (!code) return {};

  try {
    return JSON.parse(code.textContent);
  } catch {
    return {};
  }
}

function buildWidget({ script, config }) {
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
  scriptEl.src = `${SCRIPT_PREFIX}${script}`;
  scriptEl.textContent = JSON.stringify(config);

  container.append(widget, copyright, scriptEl);
  return container;
}

export default function decorate(block) {
  const cfg = readBlockConfig(block);
  if (!cfg.script) {
    block.textContent = '';
    return;
  }

  const widget = buildWidget({ script: cfg.script, config: parseConfig(block) });
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
