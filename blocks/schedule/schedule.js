function getCellText(cell) {
  return cell?.textContent.trim().replace(/\s+/g, ' ') || '';
}

function getSpeakerNames(cell) {
  if (!cell) return [];

  const paragraphs = [...cell.querySelectorAll('p')]
    .map((paragraph) => getCellText(paragraph))
    .filter(Boolean);

  if (paragraphs.length) return paragraphs;

  return getCellText(cell)
    .split(/\s*,\s*/)
    .filter(Boolean);
}

function createSpeakers(names) {
  const speakers = document.createElement('ul');
  speakers.className = 'schedule-speakers';
  speakers.setAttribute('aria-label', 'Speakers');
  names.forEach((name) => {
    const item = document.createElement('li');
    item.textContent = name;
    speakers.append(item);
  });
  return speakers;
}

function createSession(cells) {
  const [timeCell, titleCell, speakerCell, locationCell] = cells;
  const time = getCellText(timeCell);
  const titleText = getCellText(titleCell);
  if (!time || !titleText) return null;

  const item = document.createElement('li');
  item.className = 'schedule-item';

  const article = document.createElement('article');
  article.className = 'schedule-session';

  const timeElement = document.createElement('p');
  timeElement.className = 'schedule-time';
  timeElement.textContent = time;

  const content = document.createElement('div');
  content.className = 'schedule-content';

  const title = titleCell.querySelector('h1, h2, h3, h4, h5, h6')
    || document.createElement('h2');
  title.className = 'schedule-title';
  if (!title.textContent.trim()) title.textContent = titleText;

  const details = document.createElement('div');
  details.className = 'schedule-details';

  const speakerNames = getSpeakerNames(speakerCell);
  if (speakerNames.length) details.append(createSpeakers(speakerNames));

  const location = getCellText(locationCell);
  if (location) {
    const locationEntry = document.createElement('p');
    locationEntry.className = 'schedule-location';
    locationEntry.textContent = location;
    details.append(locationEntry);
  }

  content.append(title);
  if (details.hasChildNodes()) content.append(details);
  article.append(timeElement, content);
  item.append(article);
  return item;
}

export default function decorate(block) {
  const list = document.createElement('ol');
  list.className = 'schedule-list';

  let incompleteRows = 0;
  [...block.children].forEach((row) => {
    const cells = [...row.children];
    const session = createSession(cells);
    if (session) list.append(session);
    else incompleteRows += 1;
  });

  if (incompleteRows) {
    // eslint-disable-next-line no-console
    console.warn(`Schedule block skipped ${incompleteRows} incomplete session row(s).`);
  }

  if (!list.children.length) {
    const emptyState = document.createElement('p');
    emptyState.className = 'schedule-empty';
    emptyState.textContent = 'No sessions are currently scheduled.';
    block.replaceChildren(emptyState);
    return;
  }

  block.replaceChildren(list);
}
