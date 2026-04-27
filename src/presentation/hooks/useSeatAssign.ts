import { useMutation, useQueryClient } from '@tanstack/react-query';
import { services } from '@/infrastructure/DependencyProvider';
import type { AssignSeatCommand } from '@/domain/seat/commands/AssignSeatCommand';

export function useSeatAssign(flightId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (command: AssignSeatCommand) => services.seatCommand.assignSeat(command),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['seatPlan', flightId] }),
  });
}
