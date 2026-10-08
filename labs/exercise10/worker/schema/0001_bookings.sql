CREATE TABLE bookings (
  -- One row per request ID makes unchanged retries find their original reservation.
  request_id TEXT PRIMARY KEY NOT NULL,
  reference TEXT NOT NULL UNIQUE,
  signature TEXT NOT NULL,
  service TEXT NOT NULL,
  date TEXT NOT NULL,
  slot TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  -- UTC slot uniqueness prevents two requests from reserving the same service/time.
  UNIQUE (service, date, slot)
);

CREATE INDEX bookings_date ON bookings (date);
