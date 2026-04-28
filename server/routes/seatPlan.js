'use strict';

const express = require('express');
const router = express.Router();
const { getFlightData } = require('../data/flights');

/**
 * Build the response shape expected by seatPlanMapper.ts:
 * {
 *   success: true,
 *   data: {
 *     flight_id,
 *     is_upper_deck,
 *     seat_rows: [
 *       {
 *         row_number,
 *         is_exit_row,   // true if ANY seat in the row is an exit-row seat
 *         cabin_class,   // cabin_class of the first seat in the row
 *         seats: [{ seat_number, status, cabin_class, passenger_name,
 *                   has_infant, block_note, gender, passenger_key,
 *                   boarding_group, pnr, rush_status, ssrs, seat_attributes }]
 *       }
 *     ]
 *   }
 * }
 */
function buildSeatPlanResponse(flightId) {
  const flight = getFlightData(flightId);
  if (!flight) return null;

  // Group seats by row_number preserving order
  const rowMap = new Map();
  for (const s of flight.seats) {
    if (!rowMap.has(s.row_number)) {
      rowMap.set(s.row_number, []);
    }
    rowMap.get(s.row_number).push(s);
  }

  const seat_rows = [];
  for (const [rowNumber, seats] of rowMap) {
    const isExitRow = seats.some((s) => s.is_exit_row);
    const cabinClass = seats[0].cabin_class;

    const mappedSeats = seats.map((s) => ({
      seat_number: s.seat_number,
      status: s.status,
      cabin_class: s.cabin_class,
      passenger_name: s.passenger_name,
      has_infant: s.has_infant,
      block_note: s.block_note,
      gender: s.gender,
      passenger_key: s.passenger_key,
      boarding_group: s.boarding_group,
      pnr: s.pnr,
      rush_status: s.rush_status,
      ssrs: s.ssrs,
      seat_attributes: Array.isArray(s.seat_attributes) ? s.seat_attributes : [],
    }));

    seat_rows.push({
      row_number: rowNumber,
      is_exit_row: isExitRow,
      cabin_class: cabinClass,
      seats: mappedSeats,
    });
  }

  return {
    success: true,
    data: {
      flight_id: flight.flight_id,
      is_upper_deck: flight.is_upper_deck,
      seat_rows,
    },
  };
}

// GET /ws/v1.8/get_seat_plan?flight_id=FL001
router.get('/get_seat_plan', (req, res) => {
  const { flight_id } = req.query;
  if (!flight_id) {
    return res.status(400).json({ success: false, error: 'flight_id query parameter is required' });
  }

  const response = buildSeatPlanResponse(flight_id);
  if (!response) {
    return res.status(404).json({ success: false, error: 'Flight not found' });
  }

  return res.json(response);
});

// GET /ws/v1.8/get_seat_occupancy?flight_id=FL001
// Same shape — both endpoints are consumed by the same mapper
router.get('/get_seat_occupancy', (req, res) => {
  const { flight_id } = req.query;
  if (!flight_id) {
    return res.status(400).json({ success: false, error: 'flight_id query parameter is required' });
  }

  const response = buildSeatPlanResponse(flight_id);
  if (!response) {
    return res.status(404).json({ success: false, error: 'Flight not found' });
  }

  return res.json(response);
});

module.exports = router;
