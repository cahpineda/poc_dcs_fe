import { Seat } from '@/domain/seat/Seat';
import { SeatNumber } from '@/domain/seat/SeatNumber';
import { SeatPlanResult } from '@/domain/seat/SeatPlanResult';
import { SEAT_FILTER_IDS } from '@/domain/seat/SeatFilter';
import type { SeatFilterId } from '@/domain/seat/SeatFilter';
import type { CabinRow } from '@/domain/seat/CabinRow';
import type { SeatStatus } from '@/domain/seat/SeatStatus';

const SEAT_FILTER_ID_SET: ReadonlySet<string> = new Set(SEAT_FILTER_IDS);

const STATUS_MAP: Record<string, SeatStatus> = {
  A: 'available',
  O: 'occupied',
  B: 'blocked',
  EA: 'exit_row_available',
  EO: 'exit_row_occupied',
  U: 'unavailable',
  I: 'infant_occupied',
  C: 'checked_in',
  D: 'boarded',
};

function mapStatus(code: string): SeatStatus {
  return STATUS_MAP[code] ?? 'unavailable';
}

function mapAttributes(raw: unknown, seatNumber: string): SeatFilterId[] {
  if (!Array.isArray(raw)) return [];
  const result: SeatFilterId[] = [];
  for (const id of raw) {
    if (SEAT_FILTER_ID_SET.has(String(id))) {
      result.push(id as SeatFilterId);
    } else {
      console.warn(`seatPlanMapper: unknown seat_attribute "${id}" on seat ${seatNumber}`);
    }
  }
  return result;
}

export function mapSeatPlanDTO(dto: unknown): SeatPlanResult {
  if (dto === null || dto === undefined) {
    throw new Error(`Invalid seat plan response: ${dto}`);
  }

  const raw = dto as Record<string, unknown>;
  const flightId = String(raw.flight_id ?? raw.flightId ?? '');
  const isUpperDeck = Boolean(raw.is_upper_deck ?? raw.isUpperDeck ?? false);

  const rawRows = Array.isArray(raw.seat_rows) ? raw.seat_rows : [];

  const rows: CabinRow[] = rawRows.map((row: Record<string, unknown>) => {
    const rawSeats = Array.isArray(row.seats) ? row.seats : [];
    const seats = rawSeats.map((s: Record<string, unknown>) =>
      Seat.create({
        seatNumber: SeatNumber.create(String(s.seat_number)),
        status: mapStatus(String(s.status)),
        cabinClass: String(s.cabin_class ?? 'Y'),
        passengerName: typeof s.passenger_name === 'string' ? s.passenger_name : undefined,
        hasInfant: Boolean(s.has_infant),
        blockNote: typeof s.block_note === 'string' ? s.block_note : undefined,
        gender: typeof s.gender === 'string' ? (s.gender as 'M' | 'F' | 'U') : undefined,
        passengerKey: typeof s.passenger_key === 'string' ? s.passenger_key : null,
        boardingGroup: typeof s.boarding_group === 'number' ? s.boarding_group : null,
        rushStatus: Boolean(s.rush_status),
        pnr: typeof s.pnr === 'string' ? s.pnr : null,
        ssrs: Array.isArray(s.ssrs) ? (s.ssrs as string[]) : [],
        attributes: mapAttributes(s.seat_attributes, String(s.seat_number)),
      })
    );
    return {
      rowNumber: Number(row.row_number ?? 0),
      seats,
      isExitRow: Boolean(row.is_exit_row ?? false),
    };
  });

  return SeatPlanResult.create({ rows, flightId, isUpperDeck });
}
