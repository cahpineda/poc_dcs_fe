interface SwapSeatsCommandProps { flightId: string; seatA: string; seatB: string; }
export class SwapSeatsCommand {
  private constructor(readonly flightId: string, readonly seatA: string, readonly seatB: string) {}
  static create(props: SwapSeatsCommandProps): SwapSeatsCommand {
    if (!props.flightId) throw new Error('SwapSeatsCommand requires flightId');
    if (!props.seatA) throw new Error('SwapSeatsCommand requires seatA');
    if (!props.seatB) throw new Error('SwapSeatsCommand requires seatB');
    return new SwapSeatsCommand(props.flightId, props.seatA, props.seatB);
  }
}
