/*
 * Schedule block: a conference agenda.
 * Content model, one row per session (trailing cells optional):
 * | Time | Session | Speakers | Track / room |
 * - Session cell: first line is the title (optionally a link), an italic-only line
 *   is the session type, any other lines are the description.
 * - Speakers cell: one speaker per line, optionally linked.
 * - A row whose session cell is only bold text, or that has no speakers and no track,
 *   is rendered as a break.
 * - Consecutive rows with the same time are grouped into one slot (parallel tracks).
 */

const TRACK_COLORS = 5;

/**
 * Splits a cell into "lines": its paragraphs, or the cell itself when the
 * single paragraph was unwrapped by the pipeline.
 * @param {Element} cell
 * @returns {Element[]}
 */
function lines(cell) {
  if (!cell || !cell.textContent.trim()) return [];
  const paragraphs = [...cell.children].filter((el) => el.tagName === 'P');
  if (paragraphs.length) return paragraphs.filter((p) => p.textContent.trim());
  const p = document.createElement('p');
  p.append(...cell.childNodes);
  return [p];
}

/** True when the element's only meaningful content is a single <tag> element. */
function onlyChild(el, tag) {
  const nodes = [...el.childNodes]
    .filter((n) => n.nodeType === Node.ELEMENT_NODE || n.textContent.trim());
  return nodes.length === 1 && nodes[0].tagName === tag;
}

/** Converts "9:15a" / "1:00 PM" to "09:15" / "13:00", or null. */
function toDatetime(text) {
  const match = text.trim().match(/^(\d{1,2})(?::(\d{2}))?\s*([ap])\.?m?\.?$/i);
  if (!match) return null;
  let hours = Number(match[1]) % 12;
  if (match[3].toLowerCase() === 'p') hours += 12;
  return `${String(hours).padStart(2, '0')}:${match[2] || '00'}`;
}

/** Renders "9:00a - 9:15a" as two <time> elements when parseable, else plain text. */
function buildTime(text) {
  const wrapper = document.createElement('p');
  wrapper.className = 'schedule-time';
  const parts = text.split(/\s*[-–—]\s*/);
  const datetimes = parts.map(toDatetime);
  if (parts.length <= 2 && datetimes.every(Boolean)) {
    parts.forEach((part, i) => {
      if (i) wrapper.append(' – ');
      const time = document.createElement('time');
      time.dateTime = datetimes[i];
      time.textContent = part;
      wrapper.append(time);
    });
  } else {
    wrapper.textContent = text;
  }
  return wrapper;
}

function trackIndex(track) {
  let hash = 0;
  [...track.toLowerCase()].forEach((char) => { hash = (hash * 31 + char.charCodeAt(0)) % 997; });
  return (hash % TRACK_COLORS) + 1;
}

function srLabel(text) {
  const span = document.createElement('span');
  span.className = 'schedule-sr-only';
  span.textContent = text;
  return span;
}

function buildSession({ sessionLines, speakerLines, track }) {
  const article = document.createElement('article');
  article.className = 'schedule-session';

  const typeLine = sessionLines.find((line) => onlyChild(line, 'EM'));
  const [titleLine, ...descLines] = sessionLines.filter((line) => line !== typeLine);

  if (titleLine) {
    const title = document.createElement('h3');
    title.className = 'schedule-title';
    title.append(...titleLine.childNodes);
    article.append(title);
  }

  const meta = document.createElement('div');
  meta.className = 'schedule-meta';
  if (typeLine) {
    const type = document.createElement('span');
    type.className = 'schedule-type';
    type.textContent = typeLine.textContent.trim();
    meta.append(type);
  }
  if (track) {
    const trackEl = document.createElement('span');
    trackEl.className = `schedule-track schedule-track-${trackIndex(track)}`;
    trackEl.append(srLabel('Track: '), track);
    meta.append(trackEl);
  }
  if (meta.children.length) article.append(meta);

  descLines.forEach((line) => {
    line.className = 'schedule-description';
    article.append(line);
  });

  if (speakerLines.length) {
    const speakers = document.createElement('ul');
    speakers.className = 'schedule-speakers';
    speakers.setAttribute('aria-label', speakerLines.length > 1 ? 'Speakers' : 'Speaker');
    speakerLines.forEach((line) => {
      const li = document.createElement('li');
      li.append(...line.childNodes);
      speakers.append(li);
    });
    article.append(speakers);
  }
  return article;
}

function parseRow(row) {
  const [timeCell, sessionCell, speakerCell, trackCell] = row.children;
  const sessionLines = lines(sessionCell);
  const speakerLines = lines(speakerCell);
  const track = trackCell?.textContent.trim() || '';
  const boldOnly = sessionLines.length === 1 && onlyChild(sessionLines[0], 'STRONG');
  const plainLabel = sessionLines.length === 1 && !onlyChild(sessionLines[0], 'EM');
  return {
    time: timeCell?.textContent.trim() || '',
    sessionLines,
    speakerLines,
    track,
    isBreak: boldOnly || (plainLabel && !speakerLines.length && !track),
  };
}

/**
 * loads and decorates the block
 * @param {Element} block The block element
 */
export default function decorate(block) {
  // undo global button decoration on session and speaker links
  block.querySelectorAll('a.button').forEach((a) => a.classList.remove('button', 'primary', 'secondary'));
  block.querySelectorAll('.button-container').forEach((el) => el.classList.remove('button-container'));

  const items = [...block.children].map(parseRow)
    .filter((item) => item.time || item.sessionLines.length);

  const list = document.createElement('ol');
  list.className = 'schedule-list';
  let previous = null;

  items.forEach((item) => {
    if (item.isBreak) {
      const li = document.createElement('li');
      li.className = 'schedule-slot schedule-break';
      const label = document.createElement('p');
      label.className = 'schedule-break-label';
      label.textContent = item.sessionLines[0]?.textContent.trim() || '';
      li.append(buildTime(item.time), label);
      list.append(li);
      previous = null;
      return;
    }

    if (previous && previous.time && previous.time === item.time) {
      previous.sessions.append(buildSession(item));
      previous.li.classList.add('schedule-parallel');
      return;
    }

    const li = document.createElement('li');
    li.className = 'schedule-slot';
    const sessions = document.createElement('div');
    sessions.className = 'schedule-sessions';
    sessions.append(buildSession(item));
    li.append(buildTime(item.time), sessions);
    list.append(li);
    previous = { time: item.time, li, sessions };
  });

  block.replaceChildren(list);
}
