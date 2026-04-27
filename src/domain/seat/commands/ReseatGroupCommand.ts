interface ReseatGroupCommandProps { flightId: string; passengerIds: string[]; targetRow?: number; }
export class ReseatGroupCommand {
  private constructor(readonly flightId: string, readonly passengerIds: string[], readonly targetRow?: number) {}
  static create(props: ReseatGroupCommandProps): ReseatGroupCommand {
    if (!props.flightId) throw new Error('ReseatGroupCommand requires flightId');
    if (!props.passengerIds || props.passengerIds.length === 0) throw new Error('ReseatGroupCommand requires at least one passengerId');
    return new ReseatGroupCommand(props.flightId, props.passengerIds, props.targetRow);
  }
}
