interface UnblockSeatProps {
  seatNumber: string;
  flightId: string;
}

export class UnblockSeatCommand {
  readonly seatNumber: string;
  readonly flightId: string;

  private constructor(p: UnblockSeatProps) {
    this.seatNumber = p.seatNumber;
    this.flightId = p.flightId;
  }

  static create(p: UnblockSeatProps): UnblockSeatCommand {
    if (!p.seatNumber) throw new Error('seatNumber is required');
    if (!p.flightId) throw new Error('flightId is required');
    return new UnblockSeatCommand(p);
  }
}
