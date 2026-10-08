import {
  SERVICES, TIMES, dateRange, validSelection, validBooking, validTimeZone,
} from './booking-model.js';
import createBookingClock from '../support/booking-time.js';

class RequestError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

function getServices(url, timeZone) {
  return {
    services: SERVICES,
    ...dateRange(new Date(), timeZone),
    ...(url.searchParams.has('timeZone') ? { timeZone } : {}),
  };
}

async function getAvailableSlots(url, db, timeZone) {
  const service = url.searchParams.get('service');
  const date = url.searchParams.get('date');
  if (!validSelection(service, date, timeZone)) {
    throw new RequestError(400, 'Choose a valid service and a date within the next 30 days.');
  }
  const clock = createBookingClock(timeZone);
  const candidates = TIMES.map((slot) => clock.toUTC(date, slot));
  const { results } = await db.prepare('SELECT date, slot FROM bookings WHERE service = ?1 AND date BETWEEN ?2 AND ?3')
    .bind(service, candidates[0].date, candidates[candidates.length - 1].date).all();
  const occupied = new Set(results.map((row) => `${row.date}T${row.slot}`));
  const available = candidates.filter((slot) => !occupied.has(`${slot.date}T${slot.slot}`));
  return {
    slots: url.searchParams.has('timeZone') ? available : available.map((slot) => slot.slot),
  };
}

async function readBooking(request) {
  if (request.headers.get('content-type')?.split(';')[0].trim() !== 'application/json') {
    throw new RequestError(415, 'Send booking details as application/json.');
  }
  const reader = request.body?.getReader();
  if (!reader) throw new RequestError(400, 'Send booking details.');
  const decoder = new TextDecoder();
  let bytes = 0;
  let text = '';
  // Count incoming bytes, not characters or a claimed Content-Length.
  // Cancel bodies over 4 KiB before parsing JSON instead of buffering an unbounded request.
  try {
    // eslint-disable-next-line no-constant-condition
    while (true) {
      // eslint-disable-next-line no-await-in-loop
      const { done, value } = await reader.read();
      if (done) break;
      bytes += value.byteLength;
      if (bytes > 4096) {
        // eslint-disable-next-line no-await-in-loop
        await reader.cancel();
        throw new RequestError(413, 'Booking request is too large.');
      }
      text += decoder.decode(value, { stream: true });
    }
    text += decoder.decode();
  } finally {
    reader.releaseLock();
  }
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    throw new RequestError(400, 'Invalid JSON booking request.');
  }
  if (!validBooking(data)) {
    throw new RequestError(400, 'Invalid service, date, time, contact details, or request ID.');
  }
  return data;
}

async function createBooking(request, db) {
  const data = await readBooking(request);
  const {
    service, date, slot, name, email,
  } = data;
  const requestId = data.requestId.toLowerCase();
  // The hash checks whether retries carry the same details without storing raw contact fields.
  // Hashing is data minimization, not encryption or a guarantee of anonymization.
  const details = JSON.stringify([service, date, slot, name.trim(), email]);
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(details));
  const signature = [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
  const reference = `DEMO-${crypto.randomUUID()}`;
  // Advanced: D1 runs insert + lookup as one transaction; uniqueness decides who owns the slot.
  // DO NOTHING lets us inspect a duplicate request instead of treating every conflict as a failure.
  const [insert, lookup] = await db.batch([
    db.prepare(`INSERT INTO bookings (request_id, reference, signature, service, date, slot)
      VALUES (?1, ?2, ?3, ?4, ?5, ?6) ON CONFLICT DO NOTHING`)
      .bind(requestId, reference, signature, service, date, slot),
    db.prepare('SELECT reference, signature FROM bookings WHERE request_id = ?1').bind(requestId),
  ]);
  const previous = lookup.results[0];
  // No row for this request ID: the insert was blocked, normally by another request's slot (409).
  if (!previous) {
    throw new RequestError(409, 'This time was just booked. Change the date or service to refresh availability.');
  }
  // An existing ID is a safe retry only when its stored details hash matches; otherwise reject it.
  if (previous.signature !== signature) {
    throw new RequestError(409, 'Request ID already used for different booking details.');
  }
  // A new row returns 201; an identical retry returns 200 with the original reference.
  return { status: insert.meta.changes ? 201 : 200, reference: previous.reference };
}

function allowedOrigin(origin, env) {
  if (!origin) return true;
  const exact = (env.ALLOWED_ORIGINS || '').split(',').map((value) => value.trim());
  if (exact.includes(origin)) return true;
  if (!env.EDS_SITE) return false;
  const url = new URL(origin);
  if (url.protocol !== 'https:' || url.origin !== origin || url.port) return false;
  return ['page', 'live'].some((extension) => {
    const suffix = `--${env.EDS_SITE}.aem.${extension}`;
    return url.hostname.endsWith(suffix)
      && /^[a-z0-9-]+$/.test(url.hostname.slice(0, -suffix.length));
  });
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get('origin');
    const headers = {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
      Vary: 'Origin',
    };
    const send = (status, data) => new Response(
      status === 204 ? null : JSON.stringify(data),
      { status, headers },
    );
    try {
      if (origin && (!URL.canParse(origin) || !allowedOrigin(origin, env))) {
        throw new RequestError(403, 'Origin is not allowed.');
      }
      if (origin) headers['Access-Control-Allow-Origin'] = origin;
      headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS';
      headers['Access-Control-Allow-Headers'] = 'Content-Type';
      if (request.method === 'OPTIONS') return send(204);
      const url = new URL(request.url);
      const timeZone = url.searchParams.get('timeZone') ?? 'UTC';
      if (['/services', '/slots'].includes(url.pathname) && !validTimeZone(timeZone)) {
        throw new RequestError(400, 'Choose a valid time zone.');
      }
      if (url.pathname === '/services' && request.method === 'GET') {
        return send(200, getServices(url, timeZone));
      }
      if (url.pathname === '/slots' && request.method === 'GET') {
        return send(200, await getAvailableSlots(url, env.DB, timeZone));
      }
      if (url.pathname === '/bookings' && request.method === 'POST') {
        const result = await createBooking(request, env.DB);
        return send(result.status, { reference: result.reference });
      }
      if (['/services', '/slots', '/bookings'].includes(url.pathname)) {
        headers.Allow = url.pathname === '/bookings' ? 'POST, OPTIONS' : 'GET, OPTIONS';
        throw new RequestError(405, 'Method is not allowed for this route.');
      }
      throw new RequestError(404, 'Booking API route not found.');
    } catch (error) {
      if (error instanceof RequestError) {
        // eslint-disable-next-line no-console
        console.warn('Booking request rejected', error.status, error.message);
        return send(error.status, { error: error.message });
      }
      // eslint-disable-next-line no-console
      console.error('Booking API failed', error);
      return send(500, { error: 'Booking service is unavailable. Retry shortly or contact the instructor.' });
    }
  },

  async scheduled(event, env) {
    try {
      const today = new Date(event.scheduledTime).toISOString().slice(0, 10);
      await env.DB.prepare('DELETE FROM bookings WHERE date < ?1').bind(today).run();
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Booking cleanup failed', error);
      throw error;
    }
  },
};
