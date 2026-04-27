import type { CabinRow } from './CabinRow';
import type { Seat } from './Seat';

interface SeatPlanResultProps {
  rows: CabinRow[];
  flightId: string;
  isUpperDeck: boolean;
}

export class SeatPlanResult {
  readonly rows: CabinRow[];
  readonly flightId: string;
  readonly isUpperDeck: boolean;

  private constructor(props: SeatPlanResultProps) {
    this.rows = props.rows;
    this.flightId = props.flightId;
    this.isUpperDeck = props.isUpperDeck;
  }

  static create(props: SeatPlanResultProps): SeatPlanResult {
    if (!props.rows) throw new Error('SeatPlanResult requires rows array');
    return new SeatPlanResult(props);
  }

  get totalSeats(): number {
    return this.rows.reduce((sum, row) => sum + row.seats.length, 0);
  }

  get availableCount(): number {
    return this.rows.reduce(
      (sum, row) => sum + row.seats.filter((s) => s.isAvailable()).length,
      0
    );
  }

  getSeat(seatNumber: string): Seat | undefined {
    for (const row of this.rows) {
      const seat = row.seats.find((s) => s.number.toString() === seatNumber);
      if (seat) return seat;
    }
    return undefined;
  }
}
