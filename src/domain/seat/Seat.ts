import type { SeatNumber } from './SeatNumber';
import type { SeatStatus } from './SeatStatus';

export type SeatGender = 'M' | 'F' | 'U';

const VALID_GENDERS: ReadonlySet<SeatGender> = new Set(['M', 'F', 'U']);

interface SeatProps {
  seatNumber: SeatNumber;
  status: SeatStatus;
  cabinClass: string;
  passengerName?: string;
  hasInfant?: boolean;
  blockNote?: string;
  gender?: SeatGender | null;
}

export class Seat {
  private constructor(
    private readonly _number: SeatNumber,
    private readonly _status: SeatStatus,
    private readonly _cabin: string,
    private readonly _passengerName: string | null,
    private readonly _hasInfant: boolean,
    private readonly _blockNote: string | null,
    private readonly _gender: SeatGender | null
  ) {}

  static create(props: SeatProps): Seat {
    if (!props.seatNumber) throw new Error('Seat requires a SeatNumber');
    const trimmedName = props.passengerName?.trim();
    const passengerName = trimmedName && trimmedName.length > 0 ? trimmedName : null;
    const trimmedNote = props.blockNote?.trim();
    const blockNote = trimmedNote && trimmedNote.length > 0 ? trimmedNote : null;
    const hasInfant = Boolean(props.hasInfant);
    const gender: SeatGender | null =
      props.gender && VALID_GENDERS.has(props.gender as SeatGender)
        ? (props.gender as SeatGender)
        : null;
    return new Seat(props.seatNumber, props.status, props.cabinClass, passengerName, hasInfant, blockNote, gender);
  }

  isAvailable(): boolean {
    return this._status === 'available' || this._status === 'exit_row_available';
  }

  isExitRow(): boolean {
    return this._status.startsWith('exit_row_');
  }

  isOccupied(): boolean {
    return (
      this._status === 'occupied' ||
      this._status === 'exit_row_occupied' ||
      this._status === 'infant_occupied' ||
      this._status === 'checked_in' ||
      this._status === 'boarded'
    );
  }

  get passengerName(): string | null {
    return this._passengerName;
  }

  get passengerInitials(): string | null {
    if (!this._passengerName) return null;
    const name = this._passengerName.toUpperCase();
    const words = name.split(/\s+/);
    if (words.length === 1) {
      return `${name.charAt(0)}${name.charAt(name.length - 1)}`;
    }
    return `${words[0].charAt(0)}${words[words.length - 1].charAt(0)}`;
  }

  get hasInfant(): boolean {
    return this._hasInfant;
  }

  get blockNote(): string | null {
    return this._blockNote;
  }

  get gender(): SeatGender | null {
    return this._gender;
  }

  withStatus(status: SeatStatus): Seat {
    return new Seat(
      this._number, status, this._cabin,
      this._passengerName, this._hasInfant, this._blockNote, this._gender
    );
  }

  get number(): SeatNumber {
    return this._number;
  }

  get status(): SeatStatus {
    return this._status;
  }

  get cabin(): string {
    return this._cabin;
  }
}
