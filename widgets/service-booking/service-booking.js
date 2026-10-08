import showWidgetError from '../widget-utils.js';
import decorateCalendar, { formatCalendarDate, parseCalendarDate } from './calendar.js';
import createBookingClock from './booking-time.js';
import BOOKING_API_URL from './config.js';

// Advanced: a shared module-level FIFO prevents fixed notices from overlapping across widgets.
const confirmationQueue = [];

function queueConfirmation(notice) {
  confirmationQueue.push(notice);
  if (confirmationQueue.length === 1) notice.show();
}

function removeConfirmation(notice) {
  const index = confirmationQueue.indexOf(notice);
  if (index < 0) return;
  confirmationQueue.splice(index, 1);
  if (index === 0) confirmationQueue[0]?.show();
}

class BookingRequestError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

export default async function decorate(widget) {
  const form = widget.querySelector('form');
  const fieldset = form?.querySelector('fieldset');
  const status = widget.querySelector('.service-booking-status');
  const retry = widget.querySelector('.service-booking-retry');
  const initializeRetry = widget.querySelector('.service-booking-initialize-retry');
  const times = widget.querySelector('.service-booking-times');
  const slotCount = widget.querySelector('.service-booking-slot-count');
  const selectedDate = widget.querySelector('.service-booking-selected-date');
  const calendar = widget.querySelector('.service-booking-calendar');
  const confirmation = widget.querySelector('.service-booking-confirmation');
  const confirmationMessage = widget.querySelector('.service-booking-confirmation-message');
  const dismiss = widget.querySelector('.service-booking-dismiss');
  if (!form || !fieldset || !status || !retry || !initializeRetry || !times
    || !slotCount || !selectedDate || !calendar
    || !confirmation || !confirmationMessage || !dismiss) throw new Error('Booking markup is incomplete.');
  const service = form.elements.namedItem('service');
  const date = form.elements.namedItem('date');
  const name = form.elements.namedItem('name');
  const email = form.elements.namedItem('email');
  const submit = form.querySelector('[type="submit"]');
  // Form, request, and timer state belongs to this instance; only the queue above is shared.
  let api;
  let clock;
  let requestVersion = 0;
  let attempt;
  let confirmationTimer;
  let confirmationNotice;

  const hideConfirmation = () => {
    const notice = confirmationNotice;
    confirmationNotice = undefined;
    clearTimeout(confirmationTimer);
    const hadFocus = confirmation.contains(document.activeElement);
    confirmation.hidden = true;
    if (hadFocus) name.focus();
    confirmationMessage.textContent = '';
    removeConfirmation(notice);
  };

  const scheduleDismissal = () => {
    clearTimeout(confirmationTimer);
    if (confirmation.hidden || confirmation.matches(':hover')
      || confirmation.contains(document.activeElement)) return;
    confirmationTimer = setTimeout(hideConfirmation, 8000);
  };

  const showConfirmation = (message) => {
    const notice = {
      show: () => {
        // A queued notice gets its eight seconds only when it reaches the front.
        confirmationNotice = notice;
        confirmation.hidden = false;
        confirmationMessage.textContent = message;
        scheduleDismissal();
      },
    };
    queueConfirmation(notice);
  };

  dismiss.addEventListener('click', hideConfirmation);
  confirmation.addEventListener('mouseenter', () => clearTimeout(confirmationTimer));
  confirmation.addEventListener('mouseleave', scheduleDismissal);
  confirmation.addEventListener('focusin', () => clearTimeout(confirmationTimer));
  confirmation.addEventListener('focusout', scheduleDismissal);

  const notify = (message) => {
    status.setAttribute('role', 'status');
    status.textContent = message;
  };

  const request = async (path, options = {}) => {
    const response = await fetch(new URL(path, api), {
      ...options,
      signal: AbortSignal.timeout(10000),
      credentials: 'omit',
    });
    const data = await response.json();
    if (!response.ok) {
      throw new BookingRequestError(response.status, data.error || `Booking API returned HTTP ${response.status}.`);
    }
    return data;
  };

  const updateSubmitState = () => {
    const time = form.querySelector('[name="slot"]:checked')?.value;
    submit.disabled = fieldset.disabled || !time || !name.value.trim()
      || !email.value.trim() || !name.validity.valid || !email.validity.valid;
  };

  const loadSlots = async () => {
    // Fetches can finish out of order; only this instance's newest version may update its UI.
    requestVersion += 1;
    const version = requestVersion;
    const localDate = date.value;
    submit.disabled = true;
    retry.hidden = true;
    times.replaceChildren();
    times.setAttribute('aria-busy', 'true');
    selectedDate.textContent = formatCalendarDate(localDate);
    slotCount.textContent = 'Loading available times...';
    notify('Loading available times...');
    try {
      const query = new URLSearchParams({
        service: service.value, date: localDate, timeZone: clock.timeZone,
      });
      const data = await request(`slots?${query}`);
      if (version !== requestVersion) return false;
      if (!Array.isArray(data.slots)) throw new Error('Invalid availability response.');
      const slots = data.slots.map((slot) => {
        if (!slot || typeof slot !== 'object') throw new Error('Invalid availability response.');
        const [localSlot] = clock.localSlots(slot.date, [slot.slot], localDate);
        if (!localSlot || !/^(?:09|1[0-6]):00$/.test(clock.formatTime(localSlot.instant))) {
          throw new Error('Invalid local working-hours response.');
        }
        return localSlot;
      }).sort((a, b) => a.instant - b.instant);
      if (new Set(slots.map((slot) => slot.instant.getTime())).size !== slots.length) {
        throw new Error('Invalid availability response.');
      }
      const labelCounts = new Map();
      slots.forEach(({ label }) => labelCounts.set(label, (labelCounts.get(label) || 0) + 1));
      times.replaceChildren(...slots.map((time) => {
        const displayLabel = labelCounts.get(time.label) > 1 ? time.zonedLabel : time.label;
        const label = document.createElement('label');
        label.className = 'service-booking-time';
        const radio = document.createElement('input');
        radio.type = 'radio';
        radio.name = 'slot';
        radio.value = time.instant.toISOString();
        radio.dataset.utcDate = time.date;
        radio.dataset.utcSlot = time.slot;
        radio.required = true;
        radio.setAttribute('aria-label', displayLabel);
        const text = document.createElement('span');
        text.textContent = displayLabel;
        label.append(radio, text);
        return label;
      }));
      slotCount.textContent = slots.length
        ? `${slots.length} ${slots.length === 1 ? 'time' : 'times'} available`
        : 'No available times. Choose another date or service.';
      notify(slots.length ? 'Choose an available time to book.' : 'No appointments available. Choose another date or service.');
      return true;
    } catch (error) {
      if (version !== requestVersion) return false;
      slotCount.textContent = 'Availability could not be loaded.';
      retry.hidden = false;
      showWidgetError(status, `Unable to load availability: ${error.message}`, error);
      return false;
    } finally {
      if (version === requestVersion) times.setAttribute('aria-busy', 'false');
    }
  };

  const initialize = async () => {
    initializeRetry.hidden = true;
    notify('Loading appointment services...');
    try {
      clock = createBookingClock();
      if (!BOOKING_API_URL) {
        throw new Error('The instructor must deploy the booking Worker and set BOOKING_API_URL in widgets/service-booking/config.js.');
      }
      api = new URL(BOOKING_API_URL);
      if (api.protocol !== 'https:'
        || api.username || api.password || api.search || api.hash) {
        throw new Error('BOOKING_API_URL must be an HTTPS URL without credentials, query parameters, or a fragment.');
      }
      if (!api.pathname.endsWith('/')) api.pathname += '/';
      const query = new URLSearchParams({ timeZone: clock.timeZone });
      const data = await request(`services?${query}`);
      if (data.timeZone !== clock.timeZone) {
        throw new Error('Redeploy the booking Worker to enable local working hours.');
      }
      if (!Array.isArray(data.services) || !data.services.length
        || !data.services.every((item) => typeof item.id === 'string' && item.id
          && typeof item.label === 'string' && item.label)
        || data.minDate > data.maxDate) throw new Error('Invalid services response.');
      parseCalendarDate(data.minDate);
      parseCalendarDate(data.maxDate);
      service.replaceChildren(...data.services.map((item) => new Option(item.label, item.id)));
      date.min = data.minDate;
      date.max = data.maxDate;
      date.value = data.minDate;
      decorateCalendar(calendar, date, () => {
        attempt = undefined;
        loadSlots();
      }, { timeZone: clock.timeZone, today: clock.formatDate(new Date()) });
      fieldset.disabled = false;
      await loadSlots();
    } catch (error) {
      initializeRetry.hidden = false;
      showWidgetError(status, `Unable to load booking services: ${error.message}`, error);
    }
  };

  service.addEventListener('change', () => {
    attempt = undefined;
    loadSlots();
  });
  times.addEventListener('change', updateSubmitState);
  name.addEventListener('input', updateSubmitState);
  email.addEventListener('input', updateSubmitState);
  retry.addEventListener('click', loadSlots);
  initializeRetry.addEventListener('click', initialize);

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (fieldset.disabled || submit.disabled || !form.reportValidity()) return;
    const values = Object.fromEntries(new FormData(form));
    const selectedTime = form.querySelector('[name="slot"]:checked');
    values.date = selectedTime.dataset.utcDate;
    values.slot = selectedTime.dataset.utcSlot;
    values.timeZone = clock.timeZone;
    values.name = values.name.trim();
    values.email = values.email.trim();
    if (!values.name || !values.email) {
      showWidgetError(status, 'Enter a name and email, not just spaces.', new Error('Empty contact details.'));
      return;
    }
    // A lost response can hide a successful reservation. Reuse the ID only for identical details;
    // changed details must get a new ID so the Worker can distinguish a retry from a new request.
    const signature = JSON.stringify(values);
    if (attempt?.signature !== signature) {
      attempt = { signature, requestId: crypto.randomUUID() };
    }
    fieldset.disabled = true;
    hideConfirmation();
    retry.hidden = true;
    notify('Booking your appointment...');
    try {
      const data = await request('bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...values, requestId: attempt.requestId }),
      });
      if (typeof data.reference !== 'string' || !data.reference) {
        throw new Error('Invalid booking confirmation.');
      }
      attempt = undefined;
      showConfirmation(`Thank you ${values.name}, your appointment for ${clock.formatAppointment(values.date, values.slot)} is confirmed.`);
      await loadSlots();
    } catch (error) {
      if (error instanceof BookingRequestError && error.status === 409) {
        attempt = undefined;
        if (await loadSlots()) {
          showWidgetError(status, 'Booking could not be completed. Availability has been refreshed; choose an available time.', error);
        }
      } else {
        const retryAdvice = error instanceof BookingRequestError && error.status < 500
          ? '' : ' Retry with unchanged details to avoid a duplicate booking.';
        showWidgetError(status, `Booking could not be confirmed: ${error.message}${retryAdvice}`, error);
      }
    } finally {
      fieldset.disabled = false;
      updateSubmitState();
    }
  });
  await initialize();
}
