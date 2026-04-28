import type { Seat } from './Seat';
import type { SeatGender } from './Seat';

export class Passenger {
  private constructor(
    readonly passengerKey: string | null,
    readonly name: string,
    readonly currentSeatNumber: string,
    readonly boardingGroup: number | null,
    readonly pnr: string | null,
    readonly gender: SeatGender | null,
    readonly ssrs: string[],
    readonly hasInfant: boolean,
    readonly rushStatus: boolean,
    readonly isCheckedIn: boolean
  ) {}

  static fromSeat(seat: Seat): Passenger | null {
    if (!seat.passengerName) return null;
    const isCheckedIn = seat.status === 'checked_in' || seat.status === 'boarded';
    return new Passenger(
      seat.passengerKey,
      seat.passengerName,
      seat.number.toString(),
      seat.boardingGroup,
      seat.pnr,
      seat.gender,
      seat.ssrs,
      seat.hasInfant,
      seat.rushStatus,
      isCheckedIn
    );
  }

  get checkInLabel(): string {
    return this.isCheckedIn ? 'Checked' : 'Unchecked';
  }

  get formattedName(): string {
    const words = this.name.trim().split(/\s+/);
    if (words.length < 2) return this.name;
    const last = words[words.length - 1];
    const rest = words.slice(0, -1).join(' ');
    return `${last.toUpperCase()},${rest.toUpperCase()}`;
  }

  equals(other: Passenger): boolean {
    if (this.passengerKey && other.passengerKey) {
      return this.passengerKey === other.passengerKey;
    }
    return this.name === other.name && this.currentSeatNumber === other.currentSeatNumber;
  }
}
