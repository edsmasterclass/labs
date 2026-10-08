// These are local calendar-date tokens, not appointment instants.
// UTC arithmetic avoids browser offsets and 23/25-hour DST days shifting the date.
export function parseCalendarDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new Error('Calendar dates must use YYYY-MM-DD.');
  }
  const date = new Date(`${value}T00:00:00Z`);
  if (!Number.isFinite(date.getTime()) || date.toISOString().slice(0, 10) !== value) {
    throw new Error('Invalid calendar date.');
  }
  return date;
}

export function calendarMonth(value, offset = 0) {
  const date = parseCalendarDate(value);
  date.setUTCDate(1);
  date.setUTCMonth(date.getUTCMonth() + offset);
  return date.toISOString().slice(0, 10);
}

export function calendarDays(value) {
  const first = parseCalendarDate(calendarMonth(value));
  const last = parseCalendarDate(calendarMonth(value, 1));
  last.setUTCDate(0);
  // Complete Sunday-first weeks; null cells reserve the columns before/after this month's dates.
  const length = Math.ceil((first.getUTCDay() + last.getUTCDate()) / 7) * 7;
  return Array.from({ length }, (_, index) => {
    const day = index - first.getUTCDay() + 1;
    if (day < 1 || day > last.getUTCDate()) return null;
    const date = new Date(first);
    date.setUTCDate(day);
    return date.toISOString().slice(0, 10);
  });
}

export function formatCalendarDate(value, options = {}) {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', timeZone: 'UTC', ...options,
  }).format(parseCalendarDate(value));
}

export default function decorateCalendar(calendar, dateInput, onSelect, {
  timeZone = 'UTC',
  today = new Date().toISOString().slice(0, 10),
} = {}) {
  const days = calendar.querySelector('.service-booking-days');
  const monthLabel = calendar.querySelector('.service-booking-month');
  const previous = calendar.querySelector('.service-booking-prev');
  const next = calendar.querySelector('.service-booking-next');
  const minMonth = calendarMonth(dateInput.min);
  const maxMonth = calendarMonth(dateInput.max);
  let month = calendarMonth(dateInput.value);

  const render = (focusDate) => {
    monthLabel.textContent = formatCalendarDate(month, {
      weekday: undefined, day: undefined, year: 'numeric',
    });
    days.setAttribute('aria-label', `${monthLabel.textContent}, appointment dates (${timeZone})`);
    previous.disabled = month <= minMonth;
    next.disabled = month >= maxMonth;
    days.replaceChildren(...calendarDays(month).map((value) => {
      if (!value) {
        const blank = document.createElement('span');
        blank.setAttribute('aria-hidden', 'true');
        return blank;
      }
      const button = document.createElement('button');
      button.type = 'button';
      button.dataset.date = value;
      button.textContent = String(parseCalendarDate(value).getUTCDate());
      button.disabled = value < dateInput.min || value > dateInput.max;
      button.setAttribute('aria-label', formatCalendarDate(value, { year: 'numeric' }));
      button.setAttribute('aria-pressed', String(value === dateInput.value));
      if (value === today) button.setAttribute('aria-current', 'date');
      return button;
    }));
    if (focusDate) days.querySelector(`[data-date="${focusDate}"]`)?.focus();
  };

  previous.addEventListener('click', () => {
    month = calendarMonth(month, -1);
    render();
  });
  next.addEventListener('click', () => {
    month = calendarMonth(month, 1);
    render();
  });
  days.addEventListener('click', (event) => {
    const button = event.target.closest('button[data-date]');
    if (!button || button.disabled) return;
    dateInput.value = button.dataset.date;
    render(dateInput.value);
    onSelect();
  });
  // Arrows move focus for browsing; Enter/Space activates the button's click handler to select.
  days.addEventListener('keydown', (event) => {
    const offsets = {
      ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7,
    };
    const button = event.target.closest('button[data-date]');
    if (!button || offsets[event.key] === undefined) return;
    event.preventDefault();
    const date = parseCalendarDate(button.dataset.date);
    date.setUTCDate(date.getUTCDate() + offsets[event.key]);
    const value = date.toISOString().slice(0, 10);
    if (value < dateInput.min || value > dateInput.max) return;
    month = calendarMonth(value);
    render(value);
  });
  render();
}
