interface AssignSeatProps {
  passengerId: string;
  seatNumber: string;
  flightId: string;
}

export class AssignSeatCommand {
  readonly passengerId: string;
  readonly seatNumber: string;
  readonly flightId: string;

  private constructor(p: AssignSeatProps) {
    this.passengerId = p.passengerId;
    this.seatNumber = p.seatNumber;
    this.flightId = p.flightId;
  }

  static create(p: AssignSeatProps): AssignSeatCommand {
    if (!p.passengerId) throw new Error('passengerId is required');
    if (!p.seatNumber) throw new Error('seatNumber is required');
    if (!p.flightId) throw new Error('flightId is required');
    return new AssignSeatCommand(p);
  }
}
