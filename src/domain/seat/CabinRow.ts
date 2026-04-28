import type { Seat } from './Seat';

export interface CabinRow {
  readonly rowNumber: number;
  readonly seats: ReadonlyArray<Seat>;
  readonly isExitRow: boolean;
  readonly isWingZone: boolean;
}
