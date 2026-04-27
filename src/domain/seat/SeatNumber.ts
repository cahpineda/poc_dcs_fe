const SEAT_NUMBER_REGEX = /^\d{1,3}[A-K]$/;

export class SeatNumber {
  private constructor(private readonly value: string) {}

  static create(value: string): SeatNumber {
    if (!value) {
      throw new Error('Invalid seat number: empty');
    }
    if (!SEAT_NUMBER_REGEX.test(value)) {
      throw new Error(`Invalid seat number: ${value}`);
    }
    return new SeatNumber(value);
  }

  toString(): string {
    return this.value;
  }

  get rawValue(): string {
    return this.value;
  }

  equals(other: SeatNumber): boolean {
    return this.value === other.value;
  }
}
