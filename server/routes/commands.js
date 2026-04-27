'use strict';

const express = require('express');
const router = express.Router();
const { getFlightData, getSeat, updateSeat } = require('../data/flights');

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const AVAILABLE_STATUSES = ['A', 'EA'];

function clearPassengerFields() {
  return {
    status: 'A',
    passenger_name: null,
    has_infant: false,
    block_note: null,
    gender: null,
    passenger_key: null,
    boarding_group: null,
    pnr: null,
    rush_status: false,
    ssrs: [],
  };
}

function validateFlightAndSeat(res, flight_id, seat_number) {
  if (!flight_id || !seat_number) {
    res.status(400).json({ success: false, error: 'flight_id and seat_number are required' });
    return null;
  }
  const flight = getFlightData(flight_id);
  if (!flight) {
    res.status(404).json({ success: false, error: 'Flight not found' });
    return null;
  }
  const s = getSeat(flight_id, seat_number);
  if (!s) {
    res.status(404).json({ success: false, error: `Seat ${seat_number} not found on flight ${flight_id}` });
    return null;
  }
  return s;
}

// ---------------------------------------------------------------------------
// POST /ajax/seat_plan/assign_seat
// ---------------------------------------------------------------------------
router.post('/assign_seat', (req, res) => {
  const { flight_id, seat_number, passenger_id, passenger_name } = req.body || {};

  const s = validateFlightAndSeat(res, flight_id, seat_number);
  if (!s) return;

  if (!AVAILABLE_STATUSES.includes(s.status)) {
    return res.status(409).json({ success: false, error: 'Seat is already occupied' });
  }

  updateSeat(flight_id, seat_number, {
    status: 'O',
    passenger_key: passenger_id || null,
    passenger_name: passenger_name || null,
  });

  return res.json({ success: true, data: { seat_number, new_status: 'O' } });
});

// ---------------------------------------------------------------------------
// POST /ajax/seat_plan/block_seat
// ---------------------------------------------------------------------------
router.post('/block_seat', (req, res) => {
  const { flight_id, seat_number, reason } = req.body || {};

  const s = validateFlightAndSeat(res, flight_id, seat_number);
  if (!s) return;

  updateSeat(flight_id, seat_number, {
    status: 'B',
    block_note: reason || null,
  });

  return res.json({ success: true, data: { seat_number, new_status: 'B' } });
});

// ---------------------------------------------------------------------------
// POST /ajax/seat_plan/unblock_seat
// ---------------------------------------------------------------------------
router.post('/unblock_seat', (req, res) => {
  const { flight_id, seat_number } = req.body || {};

  const s = validateFlightAndSeat(res, flight_id, seat_number);
  if (!s) return;

  updateSeat(flight_id, seat_number, {
    status: 'A',
    block_note: null,
  });

  return res.json({ success: true, data: { seat_number, new_status: 'A' } });
});

// ---------------------------------------------------------------------------
// POST /ajax/seat_plan/reseat_passenger
// ---------------------------------------------------------------------------
router.post('/reseat_passenger', (req, res) => {
  const { flight_id, from_seat, to_seat, passenger_id } = req.body || {};

  if (!flight_id || !from_seat || !to_seat) {
    return res.status(400).json({ success: false, error: 'flight_id, from_seat and to_seat are required' });
  }

  if (!getFlightData(flight_id)) {
    return res.status(404).json({ success: false, error: 'Flight not found' });
  }

  const fromS = getSeat(flight_id, from_seat);
  if (!fromS) {
    return res.status(404).json({ success: false, error: `Seat ${from_seat} not found` });
  }

  const toS = getSeat(flight_id, to_seat);
  if (!toS) {
    return res.status(404).json({ success: false, error: `Seat ${to_seat} not found` });
  }

  if (!AVAILABLE_STATUSES.includes(toS.status)) {
    return res.status(409).json({ success: false, error: `Destination seat ${to_seat} is not available` });
  }

  // Copy passenger data from source to destination
  updateSeat(flight_id, to_seat, {
    status: 'O',
    passenger_name: fromS.passenger_name,
    has_infant: fromS.has_infant,
    gender: fromS.gender,
    passenger_key: passenger_id || fromS.passenger_key,
    boarding_group: fromS.boarding_group,
    pnr: fromS.pnr,
    rush_status: fromS.rush_status,
    ssrs: [...(fromS.ssrs || [])],
    block_note: null,
  });

  // Reset the source seat
  updateSeat(flight_id, from_seat, clearPassengerFields());

  return res.json({ success: true, data: { from_seat, to_seat } });
});

// ---------------------------------------------------------------------------
// POST /dc/unseat_passenger
// ---------------------------------------------------------------------------
router.post('/unseat_passenger', (req, res) => {
  const { flight_id, seat_number } = req.body || {};

  const s = validateFlightAndSeat(res, flight_id, seat_number);
  if (!s) return;

  updateSeat(flight_id, seat_number, clearPassengerFields());

  return res.json({ success: true, data: { seat_number, new_status: 'A' } });
});

// ---------------------------------------------------------------------------
// POST /dc/swap_seats
// ---------------------------------------------------------------------------
router.post('/swap_seats', (req, res) => {
  const { flight_id, seat_a, seat_b } = req.body || {};

  if (!flight_id || !seat_a || !seat_b) {
    return res.status(400).json({ success: false, error: 'flight_id, seat_a and seat_b are required' });
  }

  if (!getFlightData(flight_id)) {
    return res.status(404).json({ success: false, error: 'Flight not found' });
  }

  const sA = getSeat(flight_id, seat_a);
  if (!sA) {
    return res.status(404).json({ success: false, error: `Seat ${seat_a} not found` });
  }

  const sB = getSeat(flight_id, seat_b);
  if (!sB) {
    return res.status(404).json({ success: false, error: `Seat ${seat_b} not found` });
  }

  // Snapshot passenger fields from both seats before swapping
  const passengerFields = [
    'status', 'passenger_name', 'has_infant', 'block_note', 'gender',
    'passenger_key', 'boarding_group', 'pnr', 'rush_status', 'ssrs',
  ];

  const snapA = {};
  const snapB = {};
  for (const field of passengerFields) {
    snapA[field] = sA[field];
    snapB[field] = sB[field];
  }

  updateSeat(flight_id, seat_a, snapB);
  updateSeat(flight_id, seat_b, snapA);

  return res.json({ success: true, data: { seat_a, seat_b } });
});

// ---------------------------------------------------------------------------
// POST /dc/reseat_group
// ---------------------------------------------------------------------------
router.post('/reseat_group', (req, res) => {
  const { flight_id, passenger_ids, target_row } = req.body || {};

  if (!flight_id || !Array.isArray(passenger_ids) || passenger_ids.length === 0) {
    return res.status(400).json({
      success: false,
      error: 'flight_id and a non-empty passenger_ids array are required',
    });
  }

  const flight = getFlightData(flight_id);
  if (!flight) {
    return res.status(404).json({ success: false, error: 'Flight not found' });
  }

  // Find the current seat for each passenger_id
  const moves = [];

  for (const passengerId of passenger_ids) {
    const currentSeat = flight.seats.find((s) => s.passenger_key === passengerId);
    if (!currentSeat) {
      return res.status(404).json({
        success: false,
        error: `Passenger ${passengerId} not found on flight ${flight_id}`,
      });
    }

    // Find an available seat in target_row (or next available row if not specified / full)
    let candidateRows = flight.seats
      .filter((s) => AVAILABLE_STATUSES.includes(s.status) && s.seat_number !== currentSeat.seat_number);

    if (target_row) {
      // Prefer target_row; fall back to any available seat if target_row is full
      const inTargetRow = candidateRows.filter((s) => s.row_number === target_row);
      candidateRows = inTargetRow.length > 0 ? inTargetRow : candidateRows;
    }

    if (candidateRows.length === 0) {
      return res.status(409).json({
        success: false,
        error: `No available seats to move passenger ${passengerId}`,
      });
    }

    // Sort by row then seat_number for deterministic assignment
    candidateRows.sort((a, b) => {
      if (a.row_number !== b.row_number) return a.row_number - b.row_number;
      return a.seat_number.localeCompare(b.seat_number);
    });

    const destination = candidateRows[0];

    // Copy passenger to destination
    updateSeat(flight_id, destination.seat_number, {
      status: 'O',
      passenger_name: currentSeat.passenger_name,
      has_infant: currentSeat.has_infant,
      gender: currentSeat.gender,
      passenger_key: currentSeat.passenger_key,
      boarding_group: currentSeat.boarding_group,
      pnr: currentSeat.pnr,
      rush_status: currentSeat.rush_status,
      ssrs: [...(currentSeat.ssrs || [])],
      block_note: null,
    });

    // Clear source seat
    updateSeat(flight_id, currentSeat.seat_number, clearPassengerFields());

    moves.push({ from: currentSeat.seat_number, to: destination.seat_number });
  }

  return res.json({ success: true, data: { moved: moves } });
});

module.exports = router;
