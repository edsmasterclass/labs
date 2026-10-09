import { readBlockConfig, toClassName } from '../../scripts/aem.js';

const TRACK_COLORS = 3;
// shared across blocks so a track keeps its color on every day of the page
const trackIndexes = new Map();

function createTag(tag, className, text) {
  const el = document.createElement(tag);
  if (className) el.className = className;
  if (text) el.textContent = text;
  return el;
}

function toSameOriginPath(href) {
  const url = new URL(href, window.location.href);
  return url.origin === window.location.origin ? `${url.pathname}${url.search}` : null;
}

function normalizeRow(row) {
  return Object.fromEntries(
    Object.entries(row).map(([key, value]) => [toClassName(key), String(value ?? '').trim()]),
  );
}

async function fetchSessions(source, day) {
  const path = toSameOriginPath(source);
  if (!path) throw new Error('schedule: source must be on this site');
  const url = new URL(path, window.location.origin);
  if (day) url.searchParams.set('sheet', day);

  const resp = await fetch(`${url.pathname}${url.search}`);
  if (!resp.ok) throw new Error(`schedule: fetch failed (${resp.status})`);
  const json = await resp.json();

  // the local dev server ignores ?sheet= and returns the whole workbook
  const sheet = json[':type'] === 'multi-sheet' ? json[day || json[':names']?.[0]] : json;
  if (!Array.isArray(sheet?.data)) throw new Error(`schedule: sheet "${day}" not found`);
  return sheet.data.map(normalizeRow);
}

function groupSlots(rows) {
  return rows.reduce((slots, row) => {
    const prev = slots[slots.length - 1];
    if (prev && (!row.time || row.time === prev.time)) prev.sessions.push(row);
    else slots.push({ time: row.time, sessions: [row] });
    return slots;
  }, []);
}

function getTrackClass(track) {
  if (!trackIndexes.has(track)) trackIndexes.set(track, trackIndexes.size);
  return `schedule-track-${(trackIndexes.get(track) % TRACK_COLORS) + 1}`;
}

function buildSpeakers(speakers, speakersPath) {
  const p = createTag('p', 'schedule-speakers');
  speakers.split(',').map((name) => name.trim()).filter(Boolean).forEach((name, i) => {
    if (i) p.append(', ');
    const a = createTag('a', '', name);
    a.href = `${speakersPath}#speaker-${toClassName(name)}`;
    p.append(a);
  });
  return p;
}

function buildSession(session, speakersPath) {
  const li = createTag('li', 'schedule-session');
  if (!session.speakers && !session.track) {
    li.classList.add('schedule-break');
    li.append(createTag('p', 'schedule-title', session.title));
    return li;
  }

  if (session.track) {
    li.classList.add(getTrackClass(session.track));
    li.append(createTag('p', 'schedule-track', session.track));
  }
  li.append(createTag('h3', 'schedule-title', session.title));
  if (session.speakers) li.append(buildSpeakers(session.speakers, speakersPath));
  if (session.description) li.append(createTag('p', 'schedule-description', session.description));
  return li;
}

function buildSchedule(slots, speakersPath) {
  const ol = createTag('ol', 'schedule-slots');
  slots.forEach(({ time, sessions }) => {
    const li = createTag('li', 'schedule-slot');
    li.append(createTag('p', 'schedule-time', time));
    const ul = createTag('ul', 'schedule-sessions');
    sessions.forEach((session) => ul.append(buildSession(session, speakersPath)));
    li.append(ul);
    ol.append(li);
  });
  return ol;
}

export default async function decorate(block) {
  const config = readBlockConfig(block);
  block.replaceChildren();
  if (!config.source) return;

  const speakersPath = toSameOriginPath(config['speakers-page'] || '/speakers') || '/speakers';
  block.setAttribute('aria-busy', 'true');
  try {
    const rows = await fetchSessions(config.source, config.day);
    block.append(rows.length
      ? buildSchedule(groupSlots(rows), speakersPath)
      : createTag('p', 'schedule-message', 'No sessions scheduled yet.'));
  } catch {
    block.append(createTag('p', 'schedule-message', 'The schedule is unavailable right now.'));
  } finally {
    block.removeAttribute('aria-busy');
  }
}
