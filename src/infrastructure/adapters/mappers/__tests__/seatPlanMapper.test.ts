import { describe, it, expect } from 'vitest';
import { mapSeatPlanDTO } from '../seatPlanMapper';

const validDTO = {
  flight_id: 'FL001',
  is_upper_deck: false,
  seat_rows: [
    {
      row_number: 12,
      is_exit_row: false,
      seats: [
        { seat_number: '12A', status: 'A', cabin_class: 'Y' },
        { seat_number: '12B', status: 'O', cabin_class: 'Y' },
        { seat_number: '12C', status: 'B', cabin_class: 'Y' },
      ],
    },
    {
      row_number: 13,
      is_exit_row: true,
      seats: [
        { seat_number: '13A', status: 'EA', cabin_class: 'Y' },
        { seat_number: '13B', status: 'EO', cabin_class: 'Y' },
      ],
    },
  ],
};

describe('seatPlanMapper', () => {
  it('maps a valid cloud_2 DTO to SeatPlanResult with correct counts', () => {
    const result = mapSeatPlanDTO(validDTO);
    expect(result.flightId).toBe('FL001');
    expect(result.totalSeats).toBe(5);
    expect(result.availableCount).toBe(2); // 12A (A) + 13A (EA)
    expect(result.rows[1].isExitRow).toBe(true);
  });

  it('throws for null DTO input', () => {
    expect(() => mapSeatPlanDTO(null)).toThrow('Invalid seat plan response: null');
  });

  it('returns empty rows when seat_rows is missing (graceful degradation)', () => {
    const result = mapSeatPlanDTO({ flight_id: 'FL002' });
    expect(result.totalSeats).toBe(0);
    expect(result.rows).toHaveLength(0);
  });

  it('maps all 7 cloud_2 status codes correctly', () => {
    const dto = {
      flight_id: 'FL003',
      seat_rows: [
        {
          row_number: 1,
          is_exit_row: false,
          seats: [
            { seat_number: '1A', status: 'A', cabin_class: 'Y' },
            { seat_number: '1B', status: 'O', cabin_class: 'Y' },
            { seat_number: '1C', status: 'B', cabin_class: 'Y' },
            { seat_number: '1D', status: 'EA', cabin_class: 'Y' },
            { seat_number: '1E', status: 'EO', cabin_class: 'Y' },
            { seat_number: '1F', status: 'U', cabin_class: 'Y' },
            { seat_number: '1G', status: 'I', cabin_class: 'Y' },
          ],
        },
      ],
    };
    const result = mapSeatPlanDTO(dto);
    const seats = result.rows[0].seats;
    expect(seats[0].status).toBe('available');
    expect(seats[1].status).toBe('occupied');
    expect(seats[2].status).toBe('blocked');
    expect(seats[3].status).toBe('exit_row_available');
    expect(seats[4].status).toBe('exit_row_occupied');
    expect(seats[5].status).toBe('unavailable');
    expect(seats[6].status).toBe('infant_occupied');
  });

  it('maps API code C to checked_in status', () => {
    const dto = {
      flight_id: 'FL004',
      seat_rows: [
        {
          row_number: 1,
          is_exit_row: false,
          seats: [{ seat_number: '1A', status: 'C', cabin_class: 'Y' }],
        },
      ],
    };
    const result = mapSeatPlanDTO(dto);
    expect(result.rows[0].seats[0].status).toBe('checked_in');
  });

  it('maps API code D to boarded status', () => {
    const dto = {
      flight_id: 'FL005',
      seat_rows: [
        {
          row_number: 1,
          is_exit_row: false,
          seats: [{ seat_number: '1A', status: 'D', cabin_class: 'Y' }],
        },
      ],
    };
    const result = mapSeatPlanDTO(dto);
    expect(result.rows[0].seats[0].status).toBe('boarded');
  });

  it('maps gender field from DTO', () => {
    const dto = {
      flight_id: 'FX1', is_upper_deck: false,
      seat_rows: [{
        row_number: 12, is_exit_row: false,
        seats: [
          { seat_number: '12A', status: 'O', cabin_class: 'Y', gender: 'M' },
          { seat_number: '12B', status: 'O', cabin_class: 'Y', gender: 'F' },
          { seat_number: '12C', status: 'O', cabin_class: 'Y' },
        ],
      }],
    };
    const result = mapSeatPlanDTO(dto);
    expect(result.rows[0].seats[0].gender).toBe('M');
    expect(result.rows[0].seats[1].gender).toBe('F');
    expect(result.rows[0].seats[2].gender).toBeNull();
  });

  it('maps has_infant and block_note from DTO', () => {
    const dto = {
      flight_id: 'FX1', is_upper_deck: false,
      seat_rows: [{
        row_number: 12, is_exit_row: false,
        seats: [
          { seat_number: '12A', status: 'O', cabin_class: 'Y', has_infant: true },
          { seat_number: '12B', status: 'B', cabin_class: 'Y', block_note: 'Crew rest' },
        ],
      }],
    };
    const result = mapSeatPlanDTO(dto);
    expect(result.rows[0].seats[0].hasInfant).toBe(true);
    expect(result.rows[0].seats[1].blockNote).toBe('Crew rest');
  });

  it('maps passenger_key, boarding_group, rush_status, pnr, ssrs from DTO', () => {
    const dto = {
      flight_id: 'FL001', is_upper_deck: false,
      seat_rows: [{
        row_number: 1, is_exit_row: false,
        seats: [{
          seat_number: '1B', status: 'O', cabin_class: 'Y',
          passenger_name: 'JOHN DOE', has_infant: false, block_note: null,
          gender: 'M', passenger_key: 'PAX-001', boarding_group: 1,
          rush_status: true, pnr: 'ABC123', ssrs: ['WCHR']
        }]
      }]
    };
    const result = mapSeatPlanDTO(dto);
    const seat = result.getSeat('1B')!;
    expect(seat.passengerKey).toBe('PAX-001');
    expect(seat.boardingGroup).toBe(1);
    expect(seat.rushStatus).toBe(true);
    expect(seat.pnr).toBe('ABC123');
    expect(seat.ssrs).toEqual(['WCHR']);
  });

  it('maps passenger_name from DTO to Seat.passengerInitials', () => {
    const dto = {
      flight_id: 'FX1',
      is_upper_deck: false,
      seat_rows: [
        {
          row_number: 12,
          is_exit_row: false,
          seats: [
            { seat_number: '12A', status: 'O', cabin_class: 'Y', passenger_name: 'JOHN DOE' },
            { seat_number: '12B', status: 'A', cabin_class: 'Y' },
          ],
        },
      ],
    };
    const result = mapSeatPlanDTO(dto);
    const row = result.rows[0];
    expect(row.seats[0].passengerInitials).toBe('JD');
    expect(row.seats[1].passengerInitials).toBeNull();
  });
});
