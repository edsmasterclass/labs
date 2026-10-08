import { loadCSS } from '../../../scripts/aem.js';

async function hydrateWidget(container, widgetUrl) {
  try {
    const basePath = widgetUrl.pathname.replace(/\.html$/, '');
    const root = document.createElement('div');
    root.className = basePath.split('/').pop();
    const response = await fetch(widgetUrl.pathname);
    if (!response.ok) throw new Error(`Unable to load widget markup: ${response.status}`);
    const parsed = new DOMParser().parseFromString(await response.text(), 'text/html');
    root.append(...parsed.body.childNodes);
    await loadCSS(`${basePath}.css`);
    const module = await import(`${basePath}.js`);
    if (typeof module.default !== 'function') {
      throw new Error('The widget must export a default decorator.');
    }
    await module.default(root);
    container.replaceChildren(root);
  } catch (error) {
    container.setAttribute('role', 'alert');
    container.textContent = 'Unable to load widget. Check the browser console and retry by reloading.';
    // eslint-disable-next-line no-console
    console.error('Widget loading failed', error);
  }
}

export default function buildWidgetAutoBlocks(main) {
  main.querySelectorAll('a[href*="/widgets/"]').forEach((link) => {
    const url = new URL(link.href);
    const paragraph = link.closest('p');
    if (link.closest('.widget-host') || url.origin !== window.location.origin
      || !url.pathname.startsWith('/widgets/') || !url.pathname.endsWith('.html')
      || !paragraph || paragraph.children.length !== 1
      || paragraph.firstElementChild !== link
      || paragraph.textContent.trim() !== link.textContent.trim()) return;
    const host = document.createElement('aside');
    host.className = 'widget-host';
    host.textContent = 'Loading widget...';
    paragraph.replaceWith(host);
    hydrateWidget(host, url);
  });
}
