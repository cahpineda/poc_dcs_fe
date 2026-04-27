interface BlockSeatProps {
  seatNumber: string;
  flightId: string;
  reason: string;
}

export class BlockSeatCommand {
  readonly seatNumber: string;
  readonly flightId: string;
  readonly reason: string;

  private constructor(p: BlockSeatProps) {
    this.seatNumber = p.seatNumber;
    this.flightId = p.flightId;
    this.reason = p.reason;
  }

  static create(p: BlockSeatProps): BlockSeatCommand {
    if (!p.seatNumber) throw new Error('seatNumber is required');
    if (!p.flightId) throw new Error('flightId is required');
    return new BlockSeatCommand(p);
  }
}
