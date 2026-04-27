'use strict';

/**
 * In-memory flight state for the mock DCS backend.
 * State resets on each server restart (require/import).
 *
 * Status codes:
 *   A  = available
 *   O  = occupied
 *   B  = blocked
 *   EA = exit_row_available
 *   EO = exit_row_occupied
 *   U  = unavailable
 *   I  = infant_occupied
 *   C  = checked_in
 *   D  = boarded
 */

function seat(overrides) {
  return Object.assign(
    {
      seat_number: null,
      row_number: null,
      status: 'A',
      cabin_class: 'Y',
      passenger_name: null,
      has_infant: false,
      block_note: null,
      gender: null,
      passenger_key: null,
      boarding_group: null,
      pnr: null,
      rush_status: false,
      ssrs: [],
      is_exit_row: false,
    },
    overrides
  );
}

// ---------------------------------------------------------------------------
// FL001 — Wide-body, 3 cabins (F / J / Y), 6 rows, single deck
// ---------------------------------------------------------------------------
const FL001 = {
  flight_id: 'FL001',
  is_upper_deck: false,
  seats: [
    // Row 1 — First (F)
    seat({ seat_number: '1A', row_number: 1, cabin_class: 'F', status: 'A' }),
    seat({
      seat_number: '1B',
      row_number: 1,
      cabin_class: 'F',
      status: 'O',
      passenger_name: 'CARLOS RUIZ',
      gender: 'M',
      passenger_key: 'PAX-001',
    }),
    seat({ seat_number: '1C', row_number: 1, cabin_class: 'F', status: 'A' }),
    seat({
      seat_number: '1D',
      row_number: 1,
      cabin_class: 'F',
      status: 'B',
      block_note: 'VIP hold',
    }),

    // Row 2 — First (F) — all available
    seat({ seat_number: '2A', row_number: 2, cabin_class: 'F', status: 'A' }),
    seat({ seat_number: '2B', row_number: 2, cabin_class: 'F', status: 'A' }),
    seat({ seat_number: '2C', row_number: 2, cabin_class: 'F', status: 'A' }),
    seat({ seat_number: '2D', row_number: 2, cabin_class: 'F', status: 'A' }),

    // Row 3 — Business (J)
    seat({
      seat_number: '3A',
      row_number: 3,
      cabin_class: 'J',
      status: 'C',
      passenger_name: 'ANA LOPEZ',
      gender: 'F',
      passenger_key: 'PAX-002',
      boarding_group: 1,
      pnr: 'ABC123',
    }),
    seat({
      seat_number: '3B',
      row_number: 3,
      cabin_class: 'J',
      status: 'O',
      passenger_name: 'TOM JONES',
      gender: 'M',
      passenger_key: 'PAX-003',
    }),
    seat({ seat_number: '3C', row_number: 3, cabin_class: 'J', status: 'A' }),
    seat({ seat_number: '3D', row_number: 3, cabin_class: 'J', status: 'A' }),
    seat({
      seat_number: '3E',
      row_number: 3,
      cabin_class: 'J',
      status: 'EA',
      is_exit_row: true,
    }),
    seat({
      seat_number: '3F',
      row_number: 3,
      cabin_class: 'J',
      status: 'EA',
      is_exit_row: true,
    }),

    // Row 4 — Business (J)
    seat({
      seat_number: '4A',
      row_number: 4,
      cabin_class: 'J',
      status: 'D',
      passenger_name: 'SARA KIM',
      gender: 'F',
      passenger_key: 'PAX-004',
    }),
    seat({
      seat_number: '4B',
      row_number: 4,
      cabin_class: 'J',
      status: 'I',
      passenger_name: 'BABY SMITH',
      has_infant: true,
      gender: 'M',
      passenger_key: 'PAX-005',
    }),
    seat({ seat_number: '4C', row_number: 4, cabin_class: 'J', status: 'A' }),
    seat({ seat_number: '4D', row_number: 4, cabin_class: 'J', status: 'U' }),
    seat({ seat_number: '4E', row_number: 4, cabin_class: 'J', status: 'U' }),
    seat({
      seat_number: '4F',
      row_number: 4,
      cabin_class: 'J',
      status: 'EO',
      is_exit_row: true,
      passenger_name: 'PETER PAN',
      gender: 'M',
      passenger_key: 'PAX-006',
    }),

    // Row 5 — Economy (Y)
    seat({
      seat_number: '5A',
      row_number: 5,
      cabin_class: 'Y',
      status: 'O',
      passenger_name: 'MARIA GARCIA',
      gender: 'F',
      passenger_key: 'PAX-007',
      rush_status: true,
      ssrs: ['WCHR'],
    }),
    seat({ seat_number: '5B', row_number: 5, cabin_class: 'Y', status: 'A' }),
    seat({ seat_number: '5C', row_number: 5, cabin_class: 'Y', status: 'A' }),
    seat({ seat_number: '5D', row_number: 5, cabin_class: 'Y', status: 'A' }),
    seat({ seat_number: '5E', row_number: 5, cabin_class: 'Y', status: 'A' }),
    seat({ seat_number: '5F', row_number: 5, cabin_class: 'Y', status: 'A' }),

    // Row 6 — Economy (Y) — all available
    seat({ seat_number: '6A', row_number: 6, cabin_class: 'Y', status: 'A' }),
    seat({ seat_number: '6B', row_number: 6, cabin_class: 'Y', status: 'A' }),
    seat({ seat_number: '6C', row_number: 6, cabin_class: 'Y', status: 'A' }),
    seat({ seat_number: '6D', row_number: 6, cabin_class: 'Y', status: 'A' }),
    seat({ seat_number: '6E', row_number: 6, cabin_class: 'Y', status: 'A' }),
    seat({ seat_number: '6F', row_number: 6, cabin_class: 'Y', status: 'A' }),
  ],
};

// ---------------------------------------------------------------------------
// FL002 — Narrow-body, 2 cabins (J / Y), 4 rows, single deck
// ---------------------------------------------------------------------------
const FL002 = {
  flight_id: 'FL002',
  is_upper_deck: false,
  seats: [
    // Row 1 — Business (J)
    seat({
      seat_number: '1A',
      row_number: 1,
      cabin_class: 'J',
      status: 'O',
      passenger_name: 'JOHN DOE',
      gender: 'M',
      passenger_key: 'PAX-101',
    }),
    seat({ seat_number: '1B', row_number: 1, cabin_class: 'J', status: 'A' }),
    seat({ seat_number: '1C', row_number: 1, cabin_class: 'J', status: 'A' }),
    seat({
      seat_number: '1D',
      row_number: 1,
      cabin_class: 'J',
      status: 'B',
      block_note: 'Crew rest',
    }),

    // Row 2 — Economy (Y) — all available
    seat({ seat_number: '2A', row_number: 2, cabin_class: 'Y', status: 'A' }),
    seat({ seat_number: '2B', row_number: 2, cabin_class: 'Y', status: 'A' }),
    seat({ seat_number: '2C', row_number: 2, cabin_class: 'Y', status: 'A' }),
    seat({ seat_number: '2D', row_number: 2, cabin_class: 'Y', status: 'A' }),
    seat({ seat_number: '2E', row_number: 2, cabin_class: 'Y', status: 'A' }),
    seat({ seat_number: '2F', row_number: 2, cabin_class: 'Y', status: 'A' }),

    // Row 3 — Economy (Y)
    seat({ seat_number: '3A', row_number: 3, cabin_class: 'Y', status: 'A' }),
    seat({ seat_number: '3B', row_number: 3, cabin_class: 'Y', status: 'A' }),
    seat({
      seat_number: '3C',
      row_number: 3,
      cabin_class: 'Y',
      status: 'C',
      passenger_name: 'ELENA VOSS',
      gender: 'F',
      passenger_key: 'PAX-102',
    }),
    seat({
      seat_number: '3D',
      row_number: 3,
      cabin_class: 'Y',
      status: 'O',
      passenger_name: 'MIKE CHEN',
      gender: 'M',
      passenger_key: 'PAX-103',
    }),
    seat({ seat_number: '3E', row_number: 3, cabin_class: 'Y', status: 'A' }),
    seat({ seat_number: '3F', row_number: 3, cabin_class: 'Y', status: 'A' }),

    // Row 4 — Economy (Y) — all available
    seat({ seat_number: '4A', row_number: 4, cabin_class: 'Y', status: 'A' }),
    seat({ seat_number: '4B', row_number: 4, cabin_class: 'Y', status: 'A' }),
    seat({ seat_number: '4C', row_number: 4, cabin_class: 'Y', status: 'A' }),
    seat({ seat_number: '4D', row_number: 4, cabin_class: 'Y', status: 'A' }),
    seat({ seat_number: '4E', row_number: 4, cabin_class: 'Y', status: 'A' }),
    seat({ seat_number: '4F', row_number: 4, cabin_class: 'Y', status: 'A' }),
  ],
};

// ---------------------------------------------------------------------------
// Flight registry
// ---------------------------------------------------------------------------
const flights = {
  FL001,
  FL002,
};

/**
 * Returns the full flight object (including seats array) or null.
 * @param {string} flightId
 */
function getFlightData(flightId) {
  return flights[flightId] || null;
}

/**
 * Returns a single seat object by seat_number, or null.
 * @param {string} flightId
 * @param {string} seatNumber
 */
function getSeat(flightId, seatNumber) {
  const flight = getFlightData(flightId);
  if (!flight) return null;
  return flight.seats.find((s) => s.seat_number === seatNumber) || null;
}

/**
 * Mutates a seat in place by merging updates.
 * Returns the updated seat, or null if not found.
 * @param {string} flightId
 * @param {string} seatNumber
 * @param {object} updates
 */
function updateSeat(flightId, seatNumber, updates) {
  const s = getSeat(flightId, seatNumber);
  if (!s) return null;
  Object.assign(s, updates);
  return s;
}

/**
 * Returns all known flight IDs.
 * @returns {string[]}
 */
function getAllFlightIds() {
  return Object.keys(flights);
}

module.exports = { getFlightData, getSeat, updateSeat, getAllFlightIds };
