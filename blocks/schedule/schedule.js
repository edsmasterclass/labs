import { readBlockConfig, toClassName } from '../../scripts/aem.js';

function createTag(tag, className, text) {
  const el = document.createElement(tag);
  if (className) el.className = className;
  if (text) el.textContent = text;
  return el;
}

function toSameOriginUrl(href) {
  if (!href) return null;
  const url = new URL(href, window.location.href);
  return url.origin === window.location.origin ? url : null;
}

function toSafeLink(href) {
  if (!href) return null;
  try {
    const url = new URL(href, window.location.href);
    return ['http:', 'https:'].includes(url.protocol) ? url.href : null;
  } catch {
    return null;
  }
}

function normalizeRow(row) {
  return Object.fromEntries(
    Object.entries(row).map(([key, value]) => [toClassName(key), String(value ?? '').trim()]),
  );
}

async function fetchSessions(url) {
  const resp = await fetch(url);
  if (!resp.ok) throw new Error(`schedule: fetch failed (${resp.status})`);
  const json = await resp.json();
  const sheet = json[':type'] === 'multi-sheet'
    ? json['shared-default'] || json[json[':names']?.[0]]
    : json;
  if (!Array.isArray(sheet?.data)) throw new Error('schedule: no sheet data');
  return sheet.data.map(normalizeRow);
}

function buildSession(session) {
  const li = createTag('li', 'schedule-item');
  li.append(createTag('p', 'schedule-time', session.time));

  const body = createTag('div', 'schedule-body');
  if (!session.speakers && !session.track) {
    li.classList.add('schedule-break');
    body.append(createTag('p', 'schedule-title', session.session));
    li.append(body);
    return li;
  }

  const title = createTag('h3', 'schedule-title');
  const href = toSafeLink(session.link);
  if (href) {
    const a = createTag('a', '', session.session);
    a.href = href;
    title.append(a);
  } else {
    title.textContent = session.session;
  }
  body.append(title);

  if (session.speakers) {
    const names = session.speakers.split(',').map((name) => name.trim()).filter(Boolean);
    body.append(createTag('p', 'schedule-speakers', names.join(', ')));
  }
  if (session.description) {
    body.append(createTag('p', 'schedule-description', session.description));
  }
  li.append(body);

  if (session.track) li.append(createTag('p', 'schedule-track', session.track));
  return li;
}

export default async function decorate(block) {
  const config = readBlockConfig(block);
  block.replaceChildren();

  const day = (config.day || '').trim().toLowerCase();
  block.setAttribute('aria-busy', 'true');

  try {
    const source = toSameOriginUrl(config.source);
    if (!source) throw new Error('schedule: source must be on this site');
    const sessions = (await fetchSessions(source))
      .filter((row) => row.time || row.session)
      .filter((row) => !day || (row.day || '').toLowerCase() === day);

    if (!sessions.length) {
      block.append(createTag('p', 'schedule-message', 'No sessions scheduled yet.'));
      return;
    }

    const ol = createTag('ol', 'schedule-list');
    sessions.forEach((session) => ol.append(buildSession(session)));
    block.append(ol);
  } catch {
    block.append(createTag('p', 'schedule-message', 'The schedule is unavailable right now.'));
  } finally {
    block.removeAttribute('aria-busy');
  }
}
