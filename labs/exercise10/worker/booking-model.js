import createBookingClock from '../support/booking-time.js';

export const SERVICES = [
  { id: 'consultation', label: 'Consultation' },
  { id: 'support', label: 'Support appointment' },
];
export const TIMES = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00'];

export function validTimeZone(timeZone) {
  if (typeof timeZone !== 'string' || !timeZone || timeZone.length > 100) return false;
  try {
    new Intl.DateTimeFormat('en-US', { timeZone }).format();
    return true;
  } catch (error) {
    if (error instanceof RangeError) return false;
    throw error;
  }
}

export function dateRange(now = new Date(), timeZone = 'UTC') {
  const day = 86400000;
  const today = createBookingClock(timeZone).formatDate(now);
  // Step through local date tokens using UTC arithmetic, not variable-length local DST days.
  const midnight = new Date(`${today}T00:00:00Z`).getTime();
  return {
    minDate: new Date(midnight + day).toISOString().slice(0, 10),
    maxDate: new Date(midnight + 30 * day).toISOString().slice(0, 10),
  };
}

export function validSelection(service, date, timeZone = 'UTC') {
  if (!validTimeZone(timeZone)) return false;
  const { minDate, maxDate } = dateRange(new Date(), timeZone);
  return SERVICES.some((item) => item.id === service)
    && typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)
    && Number.isFinite(Date.parse(date))
    && new Date(date).toISOString().slice(0, 10) === date
    && date >= minDate && date <= maxDate;
}

// Browser checks improve UX, but callers can bypass them; the Worker validates independently.
export function validBooking(data) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) return false;
  const {
    service, date, slot, name, email, requestId, timeZone = 'UTC',
  } = data;
  if (!validTimeZone(timeZone)
    || typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date)
    || typeof slot !== 'string' || !/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(slot)) return false;
  const instant = new Date(`${date}T${slot}:00Z`);
  if (!Number.isFinite(instant.getTime())
    || instant.toISOString().slice(0, 10) !== date) return false;
  // The payload is a UTC instant; working hours/date bounds use the visitor's local clock.
  const clock = createBookingClock(timeZone);
  return validSelection(service, clock.formatDate(instant), timeZone)
    && TIMES.includes(clock.formatTime(instant))
    && typeof name === 'string' && name.trim().length > 0 && name.length <= 100
    && typeof email === 'string' && email.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    && typeof requestId === 'string'
    && /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(requestId);
}
