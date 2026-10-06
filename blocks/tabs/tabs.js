import { decorateBlock, loadBlock, toClassName } from '../../scripts/aem.js';

let tabsCount = 0;

/**
 * Decorates and loads blocks nested in a tab panel (e.g. cards inside a tab).
 * @param {Element} panel The tab panel
 */
async function loadNestedBlocks(panel) {
  // decorateBlock wraps mixed cell content in a <p>, which would swallow nested blocks
  panel.querySelectorAll(':scope > p:has(> div)').forEach((p) => p.replaceWith(...p.childNodes));
  const nested = [...panel.children].filter((child) => child.tagName === 'DIV' && child.classList.length);
  await Promise.all(nested.map((nestedBlock) => {
    const wrapper = document.createElement('div');
    nestedBlock.replaceWith(wrapper);
    wrapper.append(nestedBlock);
    decorateBlock(nestedBlock);
    return loadBlock(nestedBlock);
  }));
}

function selectTab(tablist, tab, focus = false) {
  tablist.querySelectorAll('[role="tab"]').forEach((t) => {
    const selected = t === tab;
    t.setAttribute('aria-selected', selected);
    t.tabIndex = selected ? 0 : -1;
    document.getElementById(t.getAttribute('aria-controls')).hidden = !selected;
  });
  if (focus) tab.focus();
}

/**
 * loads and decorates the block
 * Content model: one row per tab, first cell the tab label, second cell the panel content.
 * Consecutive sections with `Tab` section metadata are auto-blocked into this structure.
 * @param {Element} block The block element
 */
export default async function decorate(block) {
  tabsCount += 1;
  const tablist = document.createElement('div');
  tablist.className = 'tabs-list';
  tablist.setAttribute('role', 'tablist');

  const panels = [...block.children].map((row, i) => {
    const [labelCell, contentCell] = row.children;
    const id = `tabs-${tabsCount}-${toClassName(labelCell.textContent) || i}`;

    const tab = document.createElement('button');
    tab.type = 'button';
    tab.className = 'tabs-tab';
    tab.id = `${id}-tab`;
    tab.setAttribute('role', 'tab');
    tab.setAttribute('aria-controls', `${id}-panel`);
    tab.textContent = labelCell.textContent.trim();
    tab.addEventListener('click', () => selectTab(tablist, tab));
    tablist.append(tab);

    const panel = contentCell || document.createElement('div');
    panel.className = 'tabs-panel';
    panel.id = `${id}-panel`;
    panel.setAttribute('role', 'tabpanel');
    panel.setAttribute('aria-labelledby', tab.id);
    panel.tabIndex = 0;
    return panel;
  });

  tablist.addEventListener('keydown', (e) => {
    const tabs = [...tablist.querySelectorAll('[role="tab"]')];
    const index = tabs.indexOf(document.activeElement);
    if (index < 0) return;
    const keys = {
      ArrowRight: (index + 1) % tabs.length,
      ArrowLeft: (index - 1 + tabs.length) % tabs.length,
      Home: 0,
      End: tabs.length - 1,
    };
    if (e.key in keys) {
      e.preventDefault();
      selectTab(tablist, tabs[keys[e.key]], true);
    }
  });

  block.replaceChildren(tablist, ...panels);
  selectTab(tablist, tablist.firstElementChild);
  await Promise.all(panels.map(loadNestedBlocks));
}
