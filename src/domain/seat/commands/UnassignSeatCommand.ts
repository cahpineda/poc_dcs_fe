interface UnassignSeatProps {
  flightId: string;
  seatNumber: string;
}

export class UnassignSeatCommand {
  readonly flightId: string;
  readonly seatNumber: string;

  private constructor(p: UnassignSeatProps) {
    this.flightId = p.flightId;
    this.seatNumber = p.seatNumber;
  }

  static create(p: UnassignSeatProps): UnassignSeatCommand {
    if (!p.flightId) throw new Error('flightId is required');
    if (!p.seatNumber) throw new Error('seatNumber is required');
    return new UnassignSeatCommand(p);
  }
}
