interface ReseatPassengerProps {
  passengerId: string;
  fromSeat: string;
  toSeat: string;
  flightId: string;
}

export class ReseatPassengerCommand {
  readonly passengerId: string;
  readonly fromSeat: string;
  readonly toSeat: string;
  readonly flightId: string;

  private constructor(p: ReseatPassengerProps) {
    this.passengerId = p.passengerId;
    this.fromSeat = p.fromSeat;
    this.toSeat = p.toSeat;
    this.flightId = p.flightId;
  }

  static create(p: ReseatPassengerProps): ReseatPassengerCommand {
    if (!p.passengerId) throw new Error('passengerId is required');
    if (!p.fromSeat) throw new Error('fromSeat is required');
    if (!p.toSeat) throw new Error('toSeat is required');
    if (!p.flightId) throw new Error('flightId is required');
    if (p.fromSeat === p.toSeat) throw new Error('fromSeat and toSeat must differ');
    return new ReseatPassengerCommand(p);
  }
}
