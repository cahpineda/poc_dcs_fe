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
 *
 * seat_attributes rules (deterministic, documented here):
 *   - Row 1 of every cabin: bulkhead
 *   - Exit-row seats: extra_leg_room (in addition to the derived exit_emergency)
 *   - USB power: rows 1-3 of every cabin
 *   - Galley proximity: last row of every cabin
 *   - No smoke: every seat (industry standard)
 *   - Infant eligible: bulkhead row + a few selected front rows
 *   - Stretcher: row 1 of F cabin in FL001 and last row of Y in FL002 (rare)
 *   - Window seat / window_no_view: derived for A/F (Seat.matchesFilter); window_no_view
 *     tagged on a few emergency-adjacent rows with obstructed views
 *   - Other: a couple of seats for filter coverage
 *   - window and exit_emergency are NOT tagged — derived by Seat.matchesFilter from geometry/status
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
      seat_attributes: [],
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
    // Row 1 — First (F) — bulkhead, usb_power, no_smoke, infant_eligible; stretcher on A/C (rare)
    seat({ seat_number: '1A', row_number: 1, cabin_class: 'F', status: 'A', seat_attributes: ['bulkhead', 'usb_power', 'no_smoke', 'infant_eligible', 'stretcher'] }),
    seat({
      seat_number: '1B',
      row_number: 1,
      cabin_class: 'F',
      status: 'O',
      passenger_name: 'CARLOS RUIZ',
      gender: 'M',
      passenger_key: 'PAX-001',
      seat_attributes: ['bulkhead', 'usb_power', 'no_smoke'],
    }),
    seat({ seat_number: '1C', row_number: 1, cabin_class: 'F', status: 'A', seat_attributes: ['bulkhead', 'usb_power', 'no_smoke', 'infant_eligible', 'stretcher'] }),
    seat({
      seat_number: '1D',
      row_number: 1,
      cabin_class: 'F',
      status: 'B',
      block_note: 'VIP hold',
      seat_attributes: ['bulkhead', 'usb_power', 'no_smoke'],
    }),

    // Row 2 — First (F) — last row of F cabin: galley_proximity; usb_power, no_smoke
    seat({ seat_number: '2A', row_number: 2, cabin_class: 'F', status: 'A', seat_attributes: ['usb_power', 'no_smoke', 'galley_proximity'] }),
    seat({ seat_number: '2B', row_number: 2, cabin_class: 'F', status: 'A', seat_attributes: ['usb_power', 'no_smoke', 'galley_proximity'] }),
    seat({ seat_number: '2C', row_number: 2, cabin_class: 'F', status: 'A', seat_attributes: ['usb_power', 'no_smoke', 'galley_proximity'] }),
    seat({ seat_number: '2D', row_number: 2, cabin_class: 'F', status: 'A', seat_attributes: ['usb_power', 'no_smoke', 'galley_proximity'] }),

    // Row 3 — Business (J) — row 1 of J cabin: bulkhead; exit rows 3E/3F: extra_leg_room
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
      seat_attributes: ['bulkhead', 'usb_power', 'no_smoke', 'infant_eligible'],
    }),
    seat({
      seat_number: '3B',
      row_number: 3,
      cabin_class: 'J',
      status: 'O',
      passenger_name: 'TOM JONES',
      gender: 'M',
      passenger_key: 'PAX-003',
      seat_attributes: ['bulkhead', 'usb_power', 'no_smoke'],
    }),
    seat({ seat_number: '3C', row_number: 3, cabin_class: 'J', status: 'A', seat_attributes: ['bulkhead', 'usb_power', 'no_smoke', 'infant_eligible'] }),
    seat({ seat_number: '3D', row_number: 3, cabin_class: 'J', status: 'A', seat_attributes: ['bulkhead', 'usb_power', 'no_smoke', 'infant_eligible'] }),
    seat({
      seat_number: '3E',
      row_number: 3,
      cabin_class: 'J',
      status: 'EA',
      is_exit_row: true,
      seat_attributes: ['extra_leg_room', 'no_smoke', 'window_no_view'],
    }),
    seat({
      seat_number: '3F',
      row_number: 3,
      cabin_class: 'J',
      status: 'EA',
      is_exit_row: true,
      seat_attributes: ['extra_leg_room', 'no_smoke'],
    }),

    // Row 4 — Business (J) — last row of J cabin: galley_proximity; 4F is exit row
    seat({
      seat_number: '4A',
      row_number: 4,
      cabin_class: 'J',
      status: 'D',
      passenger_name: 'SARA KIM',
      gender: 'F',
      passenger_key: 'PAX-004',
      seat_attributes: ['no_smoke', 'galley_proximity', 'other'],
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
      seat_attributes: ['no_smoke', 'galley_proximity'],
    }),
    seat({ seat_number: '4C', row_number: 4, cabin_class: 'J', status: 'A', seat_attributes: ['no_smoke', 'galley_proximity', 'other'] }),
    seat({ seat_number: '4D', row_number: 4, cabin_class: 'J', status: 'U', seat_attributes: ['no_smoke', 'galley_proximity'] }),
    seat({ seat_number: '4E', row_number: 4, cabin_class: 'J', status: 'U', seat_attributes: ['no_smoke', 'galley_proximity'] }),
    seat({
      seat_number: '4F',
      row_number: 4,
      cabin_class: 'J',
      status: 'EO',
      is_exit_row: true,
      passenger_name: 'PETER PAN',
      gender: 'M',
      passenger_key: 'PAX-006',
      seat_attributes: ['extra_leg_room', 'no_smoke'],
    }),

    // Row 5 — Economy (Y) — row 1 of Y cabin: bulkhead; usb_power; infant_eligible on several
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
      seat_attributes: ['bulkhead', 'no_smoke', 'infant_eligible'],
    }),
    seat({ seat_number: '5B', row_number: 5, cabin_class: 'Y', status: 'A', seat_attributes: ['bulkhead', 'usb_power', 'no_smoke', 'infant_eligible'] }),
    seat({ seat_number: '5C', row_number: 5, cabin_class: 'Y', status: 'A', seat_attributes: ['bulkhead', 'usb_power', 'no_smoke'] }),
    seat({ seat_number: '5D', row_number: 5, cabin_class: 'Y', status: 'A', seat_attributes: ['bulkhead', 'usb_power', 'no_smoke'] }),
    seat({ seat_number: '5E', row_number: 5, cabin_class: 'Y', status: 'A', seat_attributes: ['bulkhead', 'usb_power', 'no_smoke', 'infant_eligible'] }),
    seat({ seat_number: '5F', row_number: 5, cabin_class: 'Y', status: 'A', seat_attributes: ['bulkhead', 'no_smoke', 'infant_eligible'] }),

    // Row 6 — Economy (Y) — last row of Y cabin: galley_proximity; window_no_view on C/D
    seat({ seat_number: '6A', row_number: 6, cabin_class: 'Y', status: 'A', seat_attributes: ['no_smoke', 'galley_proximity'] }),
    seat({ seat_number: '6B', row_number: 6, cabin_class: 'Y', status: 'A', seat_attributes: ['no_smoke', 'galley_proximity'] }),
    seat({ seat_number: '6C', row_number: 6, cabin_class: 'Y', status: 'A', seat_attributes: ['no_smoke', 'galley_proximity', 'window_no_view'] }),
    seat({ seat_number: '6D', row_number: 6, cabin_class: 'Y', status: 'A', seat_attributes: ['no_smoke', 'galley_proximity', 'window_no_view'] }),
    seat({ seat_number: '6E', row_number: 6, cabin_class: 'Y', status: 'A', seat_attributes: ['no_smoke', 'galley_proximity'] }),
    seat({ seat_number: '6F', row_number: 6, cabin_class: 'Y', status: 'A', seat_attributes: ['no_smoke', 'galley_proximity'] }),
  ],
};

// ---------------------------------------------------------------------------
// FL002 — Narrow-body, 2 cabins (J / Y), 4 rows, single deck
// ---------------------------------------------------------------------------
const FL002 = {
  flight_id: 'FL002',
  is_upper_deck: false,
  seats: [
    // Row 1 — Business (J) — bulkhead, usb_power, no_smoke
    seat({
      seat_number: '1A',
      row_number: 1,
      cabin_class: 'J',
      status: 'O',
      passenger_name: 'JOHN DOE',
      gender: 'M',
      passenger_key: 'PAX-101',
      seat_attributes: ['bulkhead', 'usb_power', 'no_smoke'],
    }),
    seat({ seat_number: '1B', row_number: 1, cabin_class: 'J', status: 'A', seat_attributes: ['bulkhead', 'usb_power', 'no_smoke', 'infant_eligible'] }),
    seat({ seat_number: '1C', row_number: 1, cabin_class: 'J', status: 'A', seat_attributes: ['bulkhead', 'usb_power', 'no_smoke', 'infant_eligible'] }),
    seat({
      seat_number: '1D',
      row_number: 1,
      cabin_class: 'J',
      status: 'B',
      block_note: 'Crew rest',
      seat_attributes: ['bulkhead', 'usb_power', 'no_smoke'],
    }),

    // Row 2 — Economy (Y) — bulkhead of Y cabin; usb_power; extra_leg_room on A/F (wide legroom front row)
    seat({ seat_number: '2A', row_number: 2, cabin_class: 'Y', status: 'A', seat_attributes: ['bulkhead', 'usb_power', 'no_smoke', 'extra_leg_room'] }),
    seat({ seat_number: '2B', row_number: 2, cabin_class: 'Y', status: 'A', seat_attributes: ['bulkhead', 'usb_power', 'no_smoke'] }),
    seat({ seat_number: '2C', row_number: 2, cabin_class: 'Y', status: 'A', seat_attributes: ['bulkhead', 'usb_power', 'no_smoke', 'infant_eligible'] }),
    seat({ seat_number: '2D', row_number: 2, cabin_class: 'Y', status: 'A', seat_attributes: ['bulkhead', 'usb_power', 'no_smoke'] }),
    seat({ seat_number: '2E', row_number: 2, cabin_class: 'Y', status: 'A', seat_attributes: ['bulkhead', 'usb_power', 'no_smoke', 'infant_eligible'] }),
    seat({ seat_number: '2F', row_number: 2, cabin_class: 'Y', status: 'A', seat_attributes: ['bulkhead', 'usb_power', 'no_smoke', 'extra_leg_room'] }),

    // Row 3 — Economy (Y) — no_smoke; window_no_view on E/F (obstructed)
    seat({ seat_number: '3A', row_number: 3, cabin_class: 'Y', status: 'A', seat_attributes: ['no_smoke'] }),
    seat({ seat_number: '3B', row_number: 3, cabin_class: 'Y', status: 'A', seat_attributes: ['no_smoke', 'other'] }),
    seat({
      seat_number: '3C',
      row_number: 3,
      cabin_class: 'Y',
      status: 'C',
      passenger_name: 'ELENA VOSS',
      gender: 'F',
      passenger_key: 'PAX-102',
      seat_attributes: ['no_smoke'],
    }),
    seat({
      seat_number: '3D',
      row_number: 3,
      cabin_class: 'Y',
      status: 'O',
      passenger_name: 'MIKE CHEN',
      gender: 'M',
      passenger_key: 'PAX-103',
      seat_attributes: ['no_smoke'],
    }),
    seat({ seat_number: '3E', row_number: 3, cabin_class: 'Y', status: 'A', seat_attributes: ['no_smoke', 'window_no_view'] }),
    seat({ seat_number: '3F', row_number: 3, cabin_class: 'Y', status: 'A', seat_attributes: ['no_smoke', 'window_no_view'] }),

    // Row 4 — Economy (Y) — last row: galley_proximity; stretcher on A/F (rare)
    seat({ seat_number: '4A', row_number: 4, cabin_class: 'Y', status: 'A', seat_attributes: ['no_smoke', 'galley_proximity', 'stretcher'] }),
    seat({ seat_number: '4B', row_number: 4, cabin_class: 'Y', status: 'A', seat_attributes: ['no_smoke', 'galley_proximity'] }),
    seat({ seat_number: '4C', row_number: 4, cabin_class: 'Y', status: 'A', seat_attributes: ['no_smoke', 'galley_proximity'] }),
    seat({ seat_number: '4D', row_number: 4, cabin_class: 'Y', status: 'A', seat_attributes: ['no_smoke', 'galley_proximity'] }),
    seat({ seat_number: '4E', row_number: 4, cabin_class: 'Y', status: 'A', seat_attributes: ['no_smoke', 'galley_proximity'] }),
    seat({ seat_number: '4F', row_number: 4, cabin_class: 'Y', status: 'A', seat_attributes: ['no_smoke', 'galley_proximity', 'stretcher'] }),
  ],
};

// ---------------------------------------------------------------------------
// FL003 — A320-style, 3 cabins (F / J / Y), 28 rows, single deck
// First: rows 1-4 (24 seats), Business: rows 5-10 (36 seats), Economy: rows 11-28 (108 seats)
// Exit rows: 11 (all 6) and 22 (all 6) = 12 exit seats
// ---------------------------------------------------------------------------
const FL003 = {
  flight_id: 'FL003',
  is_upper_deck: false,
  seats: [
    // ── FIRST (F) ──────────────────────────────────────────────────────────
    // Row 1 — bulkhead, usb_power, no_smoke, infant_eligible; stretcher on A/D
    seat({ seat_number: '1A', row_number: 1, cabin_class: 'F', status: 'C', passenger_name: 'FOLEY/DEBORAH', gender: 'F', passenger_key: 'PAX-301', pnr: 'XK7291', seat_attributes: ['bulkhead', 'usb_power', 'no_smoke', 'infant_eligible', 'stretcher'] }),
    seat({ seat_number: '1B', row_number: 1, cabin_class: 'F', status: 'A', seat_attributes: ['bulkhead', 'usb_power', 'no_smoke'] }),
    seat({ seat_number: '1C', row_number: 1, cabin_class: 'F', status: 'A', seat_attributes: ['bulkhead', 'usb_power', 'no_smoke', 'infant_eligible'] }),
    seat({ seat_number: '1D', row_number: 1, cabin_class: 'F', status: 'O', passenger_name: 'MANNING/RICHARD', gender: 'M', passenger_key: 'PAX-302', pnr: 'XK7292', seat_attributes: ['bulkhead', 'usb_power', 'no_smoke', 'stretcher'] }),
    seat({ seat_number: '1E', row_number: 1, cabin_class: 'F', status: 'A', seat_attributes: ['bulkhead', 'usb_power', 'no_smoke'] }),
    seat({ seat_number: '1F', row_number: 1, cabin_class: 'F', status: 'A', seat_attributes: ['bulkhead', 'usb_power', 'no_smoke', 'infant_eligible'] }),

    // Row 2 — usb_power, no_smoke
    seat({ seat_number: '2A', row_number: 2, cabin_class: 'F', status: 'D', passenger_name: 'PARK/LISA', gender: 'F', passenger_key: 'PAX-303', pnr: 'XK7293', seat_attributes: ['usb_power', 'no_smoke'] }),
    seat({ seat_number: '2B', row_number: 2, cabin_class: 'F', status: 'O', passenger_name: 'WRIGHT/JAMES', gender: 'M', passenger_key: 'PAX-304', seat_attributes: ['usb_power', 'no_smoke'] }),
    seat({ seat_number: '2C', row_number: 2, cabin_class: 'F', status: 'A', seat_attributes: ['usb_power', 'no_smoke'] }),
    seat({ seat_number: '2D', row_number: 2, cabin_class: 'F', status: 'A', seat_attributes: ['usb_power', 'no_smoke'] }),
    seat({ seat_number: '2E', row_number: 2, cabin_class: 'F', status: 'A', seat_attributes: ['usb_power', 'no_smoke'] }),
    seat({ seat_number: '2F', row_number: 2, cabin_class: 'F', status: 'A', seat_attributes: ['usb_power', 'no_smoke'] }),

    // Row 3 — usb_power, no_smoke
    seat({ seat_number: '3A', row_number: 3, cabin_class: 'F', status: 'O', passenger_name: 'HUNT/PATRICIA', gender: 'F', passenger_key: 'PAX-305', seat_attributes: ['usb_power', 'no_smoke'] }),
    seat({ seat_number: '3B', row_number: 3, cabin_class: 'F', status: 'A', seat_attributes: ['usb_power', 'no_smoke'] }),
    seat({ seat_number: '3C', row_number: 3, cabin_class: 'F', status: 'A', seat_attributes: ['usb_power', 'no_smoke'] }),
    seat({ seat_number: '3D', row_number: 3, cabin_class: 'F', status: 'A', seat_attributes: ['usb_power', 'no_smoke'] }),
    seat({ seat_number: '3E', row_number: 3, cabin_class: 'F', status: 'A', seat_attributes: ['usb_power', 'no_smoke'] }),
    seat({ seat_number: '3F', row_number: 3, cabin_class: 'F', status: 'A', seat_attributes: ['usb_power', 'no_smoke'] }),

    // Row 4 — last row of F: galley_proximity, no_smoke
    seat({ seat_number: '4A', row_number: 4, cabin_class: 'F', status: 'A', seat_attributes: ['no_smoke', 'galley_proximity'] }),
    seat({ seat_number: '4B', row_number: 4, cabin_class: 'F', status: 'A', seat_attributes: ['no_smoke', 'galley_proximity'] }),
    seat({ seat_number: '4C', row_number: 4, cabin_class: 'F', status: 'A', seat_attributes: ['no_smoke', 'galley_proximity'] }),
    seat({ seat_number: '4D', row_number: 4, cabin_class: 'F', status: 'A', seat_attributes: ['no_smoke', 'galley_proximity'] }),
    seat({ seat_number: '4E', row_number: 4, cabin_class: 'F', status: 'A', seat_attributes: ['no_smoke', 'galley_proximity'] }),
    seat({ seat_number: '4F', row_number: 4, cabin_class: 'F', status: 'A', seat_attributes: ['no_smoke', 'galley_proximity'] }),

    // ── BUSINESS (J) ───────────────────────────────────────────────────────
    // Row 5 — bulkhead of J cabin; usb_power, no_smoke, infant_eligible
    seat({ seat_number: '5A', row_number: 5, cabin_class: 'J', status: 'O', passenger_name: 'CHEN/MICHAEL', gender: 'M', passenger_key: 'PAX-306', pnr: 'YM4401', seat_attributes: ['bulkhead', 'usb_power', 'no_smoke', 'infant_eligible'] }),
    seat({ seat_number: '5B', row_number: 5, cabin_class: 'J', status: 'A', seat_attributes: ['bulkhead', 'usb_power', 'no_smoke'] }),
    seat({ seat_number: '5C', row_number: 5, cabin_class: 'J', status: 'C', passenger_name: 'VOSS/ELENA', gender: 'F', passenger_key: 'PAX-307', pnr: 'YM4402', seat_attributes: ['bulkhead', 'usb_power', 'no_smoke', 'infant_eligible'] }),
    seat({ seat_number: '5D', row_number: 5, cabin_class: 'J', status: 'A', seat_attributes: ['bulkhead', 'usb_power', 'no_smoke', 'infant_eligible'] }),
    seat({ seat_number: '5E', row_number: 5, cabin_class: 'J', status: 'A', seat_attributes: ['bulkhead', 'usb_power', 'no_smoke'] }),
    seat({ seat_number: '5F', row_number: 5, cabin_class: 'J', status: 'A', seat_attributes: ['bulkhead', 'usb_power', 'no_smoke', 'infant_eligible'] }),

    // Row 6 — usb_power, no_smoke
    seat({ seat_number: '6A', row_number: 6, cabin_class: 'J', status: 'O', passenger_name: 'TAYLOR/ANNE', gender: 'F', passenger_key: 'PAX-308', seat_attributes: ['usb_power', 'no_smoke'] }),
    seat({ seat_number: '6B', row_number: 6, cabin_class: 'J', status: 'D', passenger_name: 'GARCIA/MARIO', gender: 'M', passenger_key: 'PAX-309', pnr: 'YM4403', seat_attributes: ['usb_power', 'no_smoke'] }),
    seat({ seat_number: '6C', row_number: 6, cabin_class: 'J', status: 'O', passenger_name: 'REED/THOMAS', gender: 'M', passenger_key: 'PAX-310', seat_attributes: ['usb_power', 'no_smoke'] }),
    seat({ seat_number: '6D', row_number: 6, cabin_class: 'J', status: 'A', seat_attributes: ['usb_power', 'no_smoke'] }),
    seat({ seat_number: '6E', row_number: 6, cabin_class: 'J', status: 'A', seat_attributes: ['usb_power', 'no_smoke'] }),
    seat({ seat_number: '6F', row_number: 6, cabin_class: 'J', status: 'A', seat_attributes: ['usb_power', 'no_smoke'] }),

    // Row 7 — usb_power, no_smoke
    seat({ seat_number: '7A', row_number: 7, cabin_class: 'J', status: 'D', passenger_name: 'KIM/SARA', gender: 'F', passenger_key: 'PAX-311', pnr: 'YM4404', seat_attributes: ['usb_power', 'no_smoke'] }),
    seat({ seat_number: '7B', row_number: 7, cabin_class: 'J', status: 'O', passenger_name: 'BELL/HENRY', gender: 'M', passenger_key: 'PAX-312', seat_attributes: ['usb_power', 'no_smoke'] }),
    seat({ seat_number: '7C', row_number: 7, cabin_class: 'J', status: 'A', seat_attributes: ['usb_power', 'no_smoke'] }),
    seat({ seat_number: '7D', row_number: 7, cabin_class: 'J', status: 'A', seat_attributes: ['usb_power', 'no_smoke'] }),
    seat({ seat_number: '7E', row_number: 7, cabin_class: 'J', status: 'A', seat_attributes: ['usb_power', 'no_smoke'] }),
    seat({ seat_number: '7F', row_number: 7, cabin_class: 'J', status: 'A', seat_attributes: ['usb_power', 'no_smoke'] }),

    // Row 8 — no_smoke
    seat({ seat_number: '8A', row_number: 8, cabin_class: 'J', status: 'O', passenger_name: 'WARD/CLAIRE', gender: 'F', passenger_key: 'PAX-313', seat_attributes: ['no_smoke'] }),
    seat({ seat_number: '8B', row_number: 8, cabin_class: 'J', status: 'A', seat_attributes: ['no_smoke'] }),
    seat({ seat_number: '8C', row_number: 8, cabin_class: 'J', status: 'O', passenger_name: 'RUIZ/CARLOS', gender: 'M', passenger_key: 'PAX-314', pnr: 'YM4405', seat_attributes: ['no_smoke'] }),
    seat({ seat_number: '8D', row_number: 8, cabin_class: 'J', status: 'A', seat_attributes: ['no_smoke'] }),
    seat({ seat_number: '8E', row_number: 8, cabin_class: 'J', status: 'A', seat_attributes: ['no_smoke'] }),
    seat({ seat_number: '8F', row_number: 8, cabin_class: 'J', status: 'A', seat_attributes: ['no_smoke'] }),

    // Row 9 — no_smoke
    seat({ seat_number: '9A', row_number: 9, cabin_class: 'J', status: 'O', passenger_name: 'COLE/DAVID', gender: 'M', passenger_key: 'PAX-315', seat_attributes: ['no_smoke'] }),
    seat({ seat_number: '9B', row_number: 9, cabin_class: 'J', status: 'A', seat_attributes: ['no_smoke'] }),
    seat({ seat_number: '9C', row_number: 9, cabin_class: 'J', status: 'A', seat_attributes: ['no_smoke'] }),
    seat({ seat_number: '9D', row_number: 9, cabin_class: 'J', status: 'A', seat_attributes: ['no_smoke'] }),
    seat({ seat_number: '9E', row_number: 9, cabin_class: 'J', status: 'A', seat_attributes: ['no_smoke'] }),
    seat({ seat_number: '9F', row_number: 9, cabin_class: 'J', status: 'A', seat_attributes: ['no_smoke'] }),

    // Row 10 — last row of J: galley_proximity, no_smoke
    seat({ seat_number: '10A', row_number: 10, cabin_class: 'J', status: 'O', passenger_name: 'HAYES/SUSAN', gender: 'F', passenger_key: 'PAX-316', seat_attributes: ['no_smoke', 'galley_proximity'] }),
    seat({ seat_number: '10B', row_number: 10, cabin_class: 'J', status: 'A', seat_attributes: ['no_smoke', 'galley_proximity'] }),
    seat({ seat_number: '10C', row_number: 10, cabin_class: 'J', status: 'A', seat_attributes: ['no_smoke', 'galley_proximity'] }),
    seat({ seat_number: '10D', row_number: 10, cabin_class: 'J', status: 'A', seat_attributes: ['no_smoke', 'galley_proximity'] }),
    seat({ seat_number: '10E', row_number: 10, cabin_class: 'J', status: 'A', seat_attributes: ['no_smoke', 'galley_proximity'] }),
    seat({ seat_number: '10F', row_number: 10, cabin_class: 'J', status: 'A', seat_attributes: ['no_smoke', 'galley_proximity'] }),

    // ── ECONOMY (Y) ────────────────────────────────────────────────────────
    // Row 11 — bulkhead of Y + EXIT ROW: extra_leg_room, infant_eligible, usb_power, no_smoke
    seat({ seat_number: '11A', row_number: 11, cabin_class: 'Y', status: 'O', is_exit_row: true, passenger_name: 'JONES/TOM', gender: 'M', passenger_key: 'PAX-317', pnr: 'ZP9901', seat_attributes: ['bulkhead', 'extra_leg_room', 'usb_power', 'no_smoke', 'infant_eligible'] }),
    seat({ seat_number: '11B', row_number: 11, cabin_class: 'Y', status: 'O', is_exit_row: true, passenger_name: 'MORGAN/KATE', gender: 'F', passenger_key: 'PAX-318', seat_attributes: ['bulkhead', 'extra_leg_room', 'usb_power', 'no_smoke'] }),
    seat({ seat_number: '11C', row_number: 11, cabin_class: 'Y', status: 'EA', is_exit_row: true, seat_attributes: ['bulkhead', 'extra_leg_room', 'usb_power', 'no_smoke', 'infant_eligible'] }),
    seat({ seat_number: '11D', row_number: 11, cabin_class: 'Y', status: 'EA', is_exit_row: true, seat_attributes: ['bulkhead', 'extra_leg_room', 'usb_power', 'no_smoke', 'infant_eligible'] }),
    seat({ seat_number: '11E', row_number: 11, cabin_class: 'Y', status: 'O', is_exit_row: true, passenger_name: 'PRICE/ALAN', gender: 'M', passenger_key: 'PAX-319', seat_attributes: ['bulkhead', 'extra_leg_room', 'usb_power', 'no_smoke'] }),
    seat({ seat_number: '11F', row_number: 11, cabin_class: 'Y', status: 'EA', is_exit_row: true, seat_attributes: ['bulkhead', 'extra_leg_room', 'usb_power', 'no_smoke', 'infant_eligible'] }),

    // Row 12 — window_no_view on A/F (post-exit obstructed), usb_power, no_smoke
    seat({ seat_number: '12A', row_number: 12, cabin_class: 'Y', status: 'O', passenger_name: 'LONG/RACHEL', gender: 'F', passenger_key: 'PAX-320', seat_attributes: ['usb_power', 'no_smoke', 'window_no_view'] }),
    seat({ seat_number: '12B', row_number: 12, cabin_class: 'Y', status: 'O', passenger_name: 'ROSS/KEVIN', gender: 'M', passenger_key: 'PAX-321', seat_attributes: ['usb_power', 'no_smoke'] }),
    seat({ seat_number: '12C', row_number: 12, cabin_class: 'Y', status: 'A', seat_attributes: ['usb_power', 'no_smoke'] }),
    seat({ seat_number: '12D', row_number: 12, cabin_class: 'Y', status: 'O', passenger_name: 'FORD/NANCY', gender: 'F', passenger_key: 'PAX-322', seat_attributes: ['usb_power', 'no_smoke'] }),
    seat({ seat_number: '12E', row_number: 12, cabin_class: 'Y', status: 'A', seat_attributes: ['usb_power', 'no_smoke'] }),
    seat({ seat_number: '12F', row_number: 12, cabin_class: 'Y', status: 'A', seat_attributes: ['usb_power', 'no_smoke', 'window_no_view'] }),

    // Row 13 — window_no_view on A/F, no_smoke
    seat({ seat_number: '13A', row_number: 13, cabin_class: 'Y', status: 'O', passenger_name: 'SHAW/PETER', gender: 'M', passenger_key: 'PAX-323', seat_attributes: ['no_smoke', 'window_no_view'] }),
    seat({ seat_number: '13B', row_number: 13, cabin_class: 'Y', status: 'A', seat_attributes: ['no_smoke'] }),
    seat({ seat_number: '13C', row_number: 13, cabin_class: 'Y', status: 'O', passenger_name: 'LANE/JULIA', gender: 'F', passenger_key: 'PAX-324', seat_attributes: ['no_smoke'] }),
    seat({ seat_number: '13D', row_number: 13, cabin_class: 'Y', status: 'A', seat_attributes: ['no_smoke'] }),
    seat({ seat_number: '13E', row_number: 13, cabin_class: 'Y', status: 'A', seat_attributes: ['no_smoke'] }),
    seat({ seat_number: '13F', row_number: 13, cabin_class: 'Y', status: 'O', passenger_name: 'COOK/DANIEL', gender: 'M', passenger_key: 'PAX-325', seat_attributes: ['no_smoke', 'window_no_view'] }),

    // Row 14 — no_smoke
    seat({ seat_number: '14A', row_number: 14, cabin_class: 'Y', status: 'C', passenger_name: 'SMITH/BOB', gender: 'M', passenger_key: 'PAX-326', pnr: 'ZP9902', ssrs: ['WCHR'], seat_attributes: ['no_smoke'] }),
    seat({ seat_number: '14B', row_number: 14, cabin_class: 'Y', status: 'O', passenger_name: 'WEST/AMY', gender: 'F', passenger_key: 'PAX-327', seat_attributes: ['no_smoke'] }),
    seat({ seat_number: '14C', row_number: 14, cabin_class: 'Y', status: 'A', seat_attributes: ['no_smoke'] }),
    seat({ seat_number: '14D', row_number: 14, cabin_class: 'Y', status: 'O', passenger_name: 'NOVA/LEO', gender: 'M', passenger_key: 'PAX-328', seat_attributes: ['no_smoke'] }),
    seat({ seat_number: '14E', row_number: 14, cabin_class: 'Y', status: 'A', seat_attributes: ['no_smoke'] }),
    seat({ seat_number: '14F', row_number: 14, cabin_class: 'Y', status: 'A', seat_attributes: ['no_smoke'] }),

    // Row 15 — no_smoke
    seat({ seat_number: '15A', row_number: 15, cabin_class: 'Y', status: 'O', passenger_name: 'DALE/FIONA', gender: 'F', passenger_key: 'PAX-329', seat_attributes: ['no_smoke'] }),
    seat({ seat_number: '15B', row_number: 15, cabin_class: 'Y', status: 'A', seat_attributes: ['no_smoke'] }),
    seat({ seat_number: '15C', row_number: 15, cabin_class: 'Y', status: 'O', passenger_name: 'HART/BEN', gender: 'M', passenger_key: 'PAX-330', seat_attributes: ['no_smoke'] }),
    seat({ seat_number: '15D', row_number: 15, cabin_class: 'Y', status: 'A', seat_attributes: ['no_smoke'] }),
    seat({ seat_number: '15E', row_number: 15, cabin_class: 'Y', status: 'B', block_note: 'Crew rest', seat_attributes: ['no_smoke'] }),
    seat({ seat_number: '15F', row_number: 15, cabin_class: 'Y', status: 'A', seat_attributes: ['no_smoke'] }),

    // Row 16 — no_smoke
    seat({ seat_number: '16A', row_number: 16, cabin_class: 'Y', status: 'O', passenger_name: 'LAMB/GRACE', gender: 'F', passenger_key: 'PAX-331', seat_attributes: ['no_smoke'] }),
    seat({ seat_number: '16B', row_number: 16, cabin_class: 'Y', status: 'O', passenger_name: 'DUKE/SAM', gender: 'M', passenger_key: 'PAX-332', seat_attributes: ['no_smoke'] }),
    seat({ seat_number: '16C', row_number: 16, cabin_class: 'Y', status: 'A', seat_attributes: ['no_smoke'] }),
    seat({ seat_number: '16D', row_number: 16, cabin_class: 'Y', status: 'A', seat_attributes: ['no_smoke'] }),
    seat({ seat_number: '16E', row_number: 16, cabin_class: 'Y', status: 'O', passenger_name: 'ARCH/NINA', gender: 'F', passenger_key: 'PAX-333', seat_attributes: ['no_smoke'] }),
    seat({ seat_number: '16F', row_number: 16, cabin_class: 'Y', status: 'A', seat_attributes: ['no_smoke'] }),

    // Row 17 — no_smoke; rush_status on 17F
    seat({ seat_number: '17A', row_number: 17, cabin_class: 'Y', status: 'A', seat_attributes: ['no_smoke'] }),
    seat({ seat_number: '17B', row_number: 17, cabin_class: 'Y', status: 'O', passenger_name: 'GALE/MARK', gender: 'M', passenger_key: 'PAX-334', seat_attributes: ['no_smoke'] }),
    seat({ seat_number: '17C', row_number: 17, cabin_class: 'Y', status: 'O', passenger_name: 'FINN/HELEN', gender: 'F', passenger_key: 'PAX-335', seat_attributes: ['no_smoke'] }),
    seat({ seat_number: '17D', row_number: 17, cabin_class: 'Y', status: 'A', seat_attributes: ['no_smoke'] }),
    seat({ seat_number: '17E', row_number: 17, cabin_class: 'Y', status: 'A', seat_attributes: ['no_smoke'] }),
    seat({ seat_number: '17F', row_number: 17, cabin_class: 'Y', status: 'O', passenger_name: 'DOE/JANE', gender: 'F', passenger_key: 'PAX-336', pnr: 'ZP9903', rush_status: true, seat_attributes: ['no_smoke'] }),

    // Row 18 — no_smoke
    seat({ seat_number: '18A', row_number: 18, cabin_class: 'Y', status: 'O', passenger_name: 'COLE/TIM', gender: 'M', passenger_key: 'PAX-337', seat_attributes: ['no_smoke'] }),
    seat({ seat_number: '18B', row_number: 18, cabin_class: 'Y', status: 'A', seat_attributes: ['no_smoke'] }),
    seat({ seat_number: '18C', row_number: 18, cabin_class: 'Y', status: 'O', passenger_name: 'GRAY/LUCY', gender: 'F', passenger_key: 'PAX-338', seat_attributes: ['no_smoke'] }),
    seat({ seat_number: '18D', row_number: 18, cabin_class: 'Y', status: 'A', seat_attributes: ['no_smoke'] }),
    seat({ seat_number: '18E', row_number: 18, cabin_class: 'Y', status: 'A', seat_attributes: ['no_smoke'] }),
    seat({ seat_number: '18F', row_number: 18, cabin_class: 'Y', status: 'O', passenger_name: 'HOPE/DEAN', gender: 'M', passenger_key: 'PAX-339', seat_attributes: ['no_smoke'] }),

    // Row 19 — no_smoke; other on 19B/19E for filter coverage
    seat({ seat_number: '19A', row_number: 19, cabin_class: 'Y', status: 'A', seat_attributes: ['no_smoke'] }),
    seat({ seat_number: '19B', row_number: 19, cabin_class: 'Y', status: 'A', seat_attributes: ['no_smoke', 'other'] }),
    seat({ seat_number: '19C', row_number: 19, cabin_class: 'Y', status: 'O', passenger_name: 'PAGE/EMMA', gender: 'F', passenger_key: 'PAX-340', seat_attributes: ['no_smoke'] }),
    seat({ seat_number: '19D', row_number: 19, cabin_class: 'Y', status: 'O', passenger_name: 'MACK/IVAN', gender: 'M', passenger_key: 'PAX-341', seat_attributes: ['no_smoke'] }),
    seat({ seat_number: '19E', row_number: 19, cabin_class: 'Y', status: 'A', seat_attributes: ['no_smoke', 'other'] }),
    seat({ seat_number: '19F', row_number: 19, cabin_class: 'Y', status: 'A', seat_attributes: ['no_smoke'] }),

    // Row 20 — no_smoke
    seat({ seat_number: '20A', row_number: 20, cabin_class: 'Y', status: 'O', passenger_name: 'FORD/LIAM', gender: 'M', passenger_key: 'PAX-342', seat_attributes: ['no_smoke'] }),
    seat({ seat_number: '20B', row_number: 20, cabin_class: 'Y', status: 'A', seat_attributes: ['no_smoke'] }),
    seat({ seat_number: '20C', row_number: 20, cabin_class: 'Y', status: 'O', passenger_name: 'VALE/IRIS', gender: 'F', passenger_key: 'PAX-343', seat_attributes: ['no_smoke'] }),
    seat({ seat_number: '20D', row_number: 20, cabin_class: 'Y', status: 'A', seat_attributes: ['no_smoke'] }),
    seat({ seat_number: '20E', row_number: 20, cabin_class: 'Y', status: 'B', block_note: 'Equipment', seat_attributes: ['no_smoke'] }),
    seat({ seat_number: '20F', row_number: 20, cabin_class: 'Y', status: 'O', passenger_name: 'LAKE/ROSE', gender: 'F', passenger_key: 'PAX-344', seat_attributes: ['no_smoke'] }),

    // Row 21 — no_smoke
    seat({ seat_number: '21A', row_number: 21, cabin_class: 'Y', status: 'O', passenger_name: 'HORN/CARL', gender: 'M', passenger_key: 'PAX-345', seat_attributes: ['no_smoke'] }),
    seat({ seat_number: '21B', row_number: 21, cabin_class: 'Y', status: 'A', seat_attributes: ['no_smoke'] }),
    seat({ seat_number: '21C', row_number: 21, cabin_class: 'Y', status: 'A', seat_attributes: ['no_smoke'] }),
    seat({ seat_number: '21D', row_number: 21, cabin_class: 'Y', status: 'O', passenger_name: 'KNOX/BETH', gender: 'F', passenger_key: 'PAX-346', seat_attributes: ['no_smoke'] }),
    seat({ seat_number: '21E', row_number: 21, cabin_class: 'Y', status: 'A', seat_attributes: ['no_smoke'] }),
    seat({ seat_number: '21F', row_number: 21, cabin_class: 'Y', status: 'O', passenger_name: 'MAYS/PAUL', gender: 'M', passenger_key: 'PAX-347', seat_attributes: ['no_smoke'] }),

    // Row 22 — EXIT ROW: extra_leg_room, no_smoke
    seat({ seat_number: '22A', row_number: 22, cabin_class: 'Y', status: 'EA', is_exit_row: true, seat_attributes: ['extra_leg_room', 'no_smoke'] }),
    seat({ seat_number: '22B', row_number: 22, cabin_class: 'Y', status: 'EA', is_exit_row: true, seat_attributes: ['extra_leg_room', 'no_smoke'] }),
    seat({ seat_number: '22C', row_number: 22, cabin_class: 'Y', status: 'O', is_exit_row: true, passenger_name: 'BRAY/DIANE', gender: 'F', passenger_key: 'PAX-348', seat_attributes: ['extra_leg_room', 'no_smoke'] }),
    seat({ seat_number: '22D', row_number: 22, cabin_class: 'Y', status: 'EA', is_exit_row: true, seat_attributes: ['extra_leg_room', 'no_smoke'] }),
    seat({ seat_number: '22E', row_number: 22, cabin_class: 'Y', status: 'O', is_exit_row: true, passenger_name: 'CRUZ/OMAR', gender: 'M', passenger_key: 'PAX-349', seat_attributes: ['extra_leg_room', 'no_smoke'] }),
    seat({ seat_number: '22F', row_number: 22, cabin_class: 'Y', status: 'EA', is_exit_row: true, seat_attributes: ['extra_leg_room', 'no_smoke'] }),

    // Row 23 — no_smoke
    seat({ seat_number: '23A', row_number: 23, cabin_class: 'Y', status: 'O', passenger_name: 'DEAN/FLORA', gender: 'F', passenger_key: 'PAX-350', seat_attributes: ['no_smoke'] }),
    seat({ seat_number: '23B', row_number: 23, cabin_class: 'Y', status: 'A', seat_attributes: ['no_smoke'] }),
    seat({ seat_number: '23C', row_number: 23, cabin_class: 'Y', status: 'O', passenger_name: 'WADE/ERIC', gender: 'M', passenger_key: 'PAX-351', seat_attributes: ['no_smoke'] }),
    seat({ seat_number: '23D', row_number: 23, cabin_class: 'Y', status: 'A', seat_attributes: ['no_smoke'] }),
    seat({ seat_number: '23E', row_number: 23, cabin_class: 'Y', status: 'A', seat_attributes: ['no_smoke'] }),
    seat({ seat_number: '23F', row_number: 23, cabin_class: 'Y', status: 'O', passenger_name: 'RYAN/CORA', gender: 'F', passenger_key: 'PAX-352', seat_attributes: ['no_smoke'] }),

    // Row 24 — no_smoke
    seat({ seat_number: '24A', row_number: 24, cabin_class: 'Y', status: 'A', seat_attributes: ['no_smoke'] }),
    seat({ seat_number: '24B', row_number: 24, cabin_class: 'Y', status: 'O', passenger_name: 'NOEL/ADAM', gender: 'M', passenger_key: 'PAX-353', seat_attributes: ['no_smoke'] }),
    seat({ seat_number: '24C', row_number: 24, cabin_class: 'Y', status: 'O', passenger_name: 'FAYE/DIANA', gender: 'F', passenger_key: 'PAX-354', seat_attributes: ['no_smoke'] }),
    seat({ seat_number: '24D', row_number: 24, cabin_class: 'Y', status: 'A', seat_attributes: ['no_smoke'] }),
    seat({ seat_number: '24E', row_number: 24, cabin_class: 'Y', status: 'A', seat_attributes: ['no_smoke'] }),
    seat({ seat_number: '24F', row_number: 24, cabin_class: 'Y', status: 'O', passenger_name: 'BLANE/HUGO', gender: 'M', passenger_key: 'PAX-355', seat_attributes: ['no_smoke'] }),

    // Row 25 — no_smoke
    seat({ seat_number: '25A', row_number: 25, cabin_class: 'Y', status: 'O', passenger_name: 'STAN/GINA', gender: 'F', passenger_key: 'PAX-356', seat_attributes: ['no_smoke'] }),
    seat({ seat_number: '25B', row_number: 25, cabin_class: 'Y', status: 'A', seat_attributes: ['no_smoke'] }),
    seat({ seat_number: '25C', row_number: 25, cabin_class: 'Y', status: 'A', seat_attributes: ['no_smoke'] }),
    seat({ seat_number: '25D', row_number: 25, cabin_class: 'Y', status: 'O', passenger_name: 'TRAN/JACK', gender: 'M', passenger_key: 'PAX-357', seat_attributes: ['no_smoke'] }),
    seat({ seat_number: '25E', row_number: 25, cabin_class: 'Y', status: 'A', seat_attributes: ['no_smoke'] }),
    seat({ seat_number: '25F', row_number: 25, cabin_class: 'Y', status: 'O', passenger_name: 'VEGA/LUNA', gender: 'F', passenger_key: 'PAX-358', seat_attributes: ['no_smoke'] }),

    // Row 26 — no_smoke
    seat({ seat_number: '26A', row_number: 26, cabin_class: 'Y', status: 'A', seat_attributes: ['no_smoke'] }),
    seat({ seat_number: '26B', row_number: 26, cabin_class: 'Y', status: 'O', passenger_name: 'YUEN/FELIX', gender: 'M', passenger_key: 'PAX-359', seat_attributes: ['no_smoke'] }),
    seat({ seat_number: '26C', row_number: 26, cabin_class: 'Y', status: 'A', seat_attributes: ['no_smoke'] }),
    seat({ seat_number: '26D', row_number: 26, cabin_class: 'Y', status: 'O', passenger_name: 'ZARA/MILA', gender: 'F', passenger_key: 'PAX-360', seat_attributes: ['no_smoke'] }),
    seat({ seat_number: '26E', row_number: 26, cabin_class: 'Y', status: 'B', block_note: 'Maintenance', seat_attributes: ['no_smoke'] }),
    seat({ seat_number: '26F', row_number: 26, cabin_class: 'Y', status: 'A', seat_attributes: ['no_smoke'] }),

    // Row 27 — no_smoke
    seat({ seat_number: '27A', row_number: 27, cabin_class: 'Y', status: 'O', passenger_name: 'ALBA/REED', gender: 'M', passenger_key: 'PAX-361', seat_attributes: ['no_smoke'] }),
    seat({ seat_number: '27B', row_number: 27, cabin_class: 'Y', status: 'A', seat_attributes: ['no_smoke'] }),
    seat({ seat_number: '27C', row_number: 27, cabin_class: 'Y', status: 'O', passenger_name: 'BECK/IRIS', gender: 'F', passenger_key: 'PAX-362', seat_attributes: ['no_smoke'] }),
    seat({ seat_number: '27D', row_number: 27, cabin_class: 'Y', status: 'A', seat_attributes: ['no_smoke'] }),
    seat({ seat_number: '27E', row_number: 27, cabin_class: 'Y', status: 'A', seat_attributes: ['no_smoke'] }),
    seat({ seat_number: '27F', row_number: 27, cabin_class: 'Y', status: 'O', passenger_name: 'CANE/OTTO', gender: 'M', passenger_key: 'PAX-363', seat_attributes: ['no_smoke'] }),

    // Row 28 — last row of Y: galley_proximity, no_smoke
    seat({ seat_number: '28A', row_number: 28, cabin_class: 'Y', status: 'A', seat_attributes: ['no_smoke', 'galley_proximity'] }),
    seat({ seat_number: '28B', row_number: 28, cabin_class: 'Y', status: 'A', seat_attributes: ['no_smoke', 'galley_proximity'] }),
    seat({ seat_number: '28C', row_number: 28, cabin_class: 'Y', status: 'A', seat_attributes: ['no_smoke', 'galley_proximity'] }),
    seat({ seat_number: '28D', row_number: 28, cabin_class: 'Y', status: 'A', seat_attributes: ['no_smoke', 'galley_proximity'] }),
    seat({ seat_number: '28E', row_number: 28, cabin_class: 'Y', status: 'A', seat_attributes: ['no_smoke', 'galley_proximity'] }),
    seat({ seat_number: '28F', row_number: 28, cabin_class: 'Y', status: 'A', seat_attributes: ['no_smoke', 'galley_proximity'] }),
  ],
};

// ---------------------------------------------------------------------------
// Flight registry
// ---------------------------------------------------------------------------
const flights = {
  FL001,
  FL002,
  FL003,
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
