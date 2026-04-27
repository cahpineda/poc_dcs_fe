import { useMutation, useQueryClient } from '@tanstack/react-query';
import { services } from '@/infrastructure/DependencyProvider';
import type { ReseatPassengerCommand } from '@/domain/seat/commands/ReseatPassengerCommand';

export function useSeatReseat(flightId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (command: ReseatPassengerCommand) => services.seatCommand.reseatPassenger(command),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['seatPlan', flightId] }),
  });
}
