import { parseCalendarDate } from './calendar.js';

export default function createBookingClock(
  timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone,
) {
  const dateFormatter = new Intl.DateTimeFormat('en-US', {
    timeZone, year: 'numeric', month: '2-digit', day: '2-digit',
  });
  const timeFormatter = new Intl.DateTimeFormat('en-US', {
    timeZone, hour: 'numeric', minute: '2-digit',
  });
  const zonedTimeFormatter = new Intl.DateTimeFormat('en-US', {
    timeZone, hour: 'numeric', minute: '2-digit', timeZoneName: 'short',
  });
  const appointmentFormatter = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
  const clockFormatter = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  });

  const formatDate = (instant) => {
    const parts = Object.fromEntries(dateFormatter.formatToParts(instant)
      .map(({ type, value }) => [type, value]));
    return `${parts.year}-${parts.month}-${parts.day}`;
  };

  const parseSlot = (date, slot) => {
    parseCalendarDate(date);
    if (typeof slot !== 'string' || !/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(slot)) {
      throw new Error('Invalid appointment time.');
    }
    return new Date(`${date}T${slot}:00Z`);
  };

  const clockParts = (instant) => Object.fromEntries(clockFormatter.formatToParts(instant)
    .map(({ type, value }) => [type, value]));

  const formatTime = (instant) => {
    const parts = clockParts(instant);
    return `${parts.hour}:${parts.minute}`;
  };

  // Advanced: start with the wall-clock fields as a UTC guess, not the final appointment.
  // Format that guess in the requested zone and correct it by the requested-minus-displayed
  // clock difference. Re-check because the offset depends on the date, including DST.
  // A skipped local time never matches and throws; a repeated time may match one instant.
  // Return UTC date/time tokens: Asia/Kolkata 2026-10-09 09:00 becomes
  // { date: '2026-10-09', slot: '03:30' }, not a display label.
  const toUTC = (localDate, localTime) => {
    const target = parseSlot(localDate, localTime).getTime();
    let instant = new Date(target);
    for (let index = 0; index < 4; index += 1) {
      const parts = clockParts(instant);
      const displayed = parseSlot(`${parts.year}-${parts.month}-${parts.day}`, `${parts.hour}:${parts.minute}`).getTime();
      if (displayed === target) {
        const iso = instant.toISOString();
        return { date: iso.slice(0, 10), slot: iso.slice(11, 16) };
      }
      instant = new Date(instant.getTime() + target - displayed);
    }
    throw new Error('The selected local time does not exist in this time zone.');
  };

  const localSlots = (date, slots, localDate) => {
    parseCalendarDate(localDate);
    if (!Array.isArray(slots) || new Set(slots).size !== slots.length) {
      throw new Error('Invalid availability response.');
    }
    return slots.map((slot) => {
      const instant = parseSlot(date, slot);
      return {
        date,
        slot,
        instant,
        label: timeFormatter.format(instant),
        zonedLabel: zonedTimeFormatter.format(instant),
      };
    }).filter(({ instant }) => formatDate(instant) === localDate);
  };

  return {
    timeZone,
    formatDate,
    formatTime,
    toUTC,
    localSlots,
    formatAppointment: (date, slot) => appointmentFormatter.format(parseSlot(date, slot)),
  };
}
