import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { services } from '@/infrastructure/DependencyProvider';
import type { Seat } from '@/domain/seat/Seat';
import { SwapSeatsCommand } from '@/domain/seat/commands/SwapSeatsCommand';

export function useSeatSwap(flightId: string) {
  const queryClient = useQueryClient();
  const [firstSeat, setFirstSeat] = useState<Seat | null>(null);

  const mutation = useMutation({
    mutationFn: (command: SwapSeatsCommand) => services.seatCommand.swapSeats(command),
    onSuccess: () => {
      setFirstSeat(null);
      queryClient.invalidateQueries({ queryKey: ['seatPlan', flightId] });
    },
  });

  function selectSeat(seat: Seat) {
    if (firstSeat === null) {
      setFirstSeat(seat);
    } else {
      const cmd = SwapSeatsCommand.create({ flightId, seatA: firstSeat.number.toString(), seatB: seat.number.toString() });
      mutation.mutate(cmd);
    }
  }

  function cancel() {
    setFirstSeat(null);
  }

  return {
    firstSeat,
    selectSeat,
    cancel,
    isPending: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
  };
}
