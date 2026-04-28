import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { services } from '@/infrastructure/DependencyProvider';
import { ReseatGroupCommand } from '@/domain/seat/commands/ReseatGroupCommand';

export function useSeatGroupReseat(flightId: string) {
  const [selectedPassengerIds, setSelectedPassengerIds] = useState<Set<string>>(new Set());
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (cmd: ReseatGroupCommand) => services.seatCommand.reseatGroup(cmd),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seatPlan', flightId] });
      setSelectedPassengerIds(new Set());
    },
  });

  function togglePassenger(id: string) {
    setSelectedPassengerIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  function confirm() {
    if (selectedPassengerIds.size === 0) return;
    mutation.mutate(ReseatGroupCommand.create({ flightId, passengerIds: [...selectedPassengerIds] }));
  }

  function cancel() {
    setSelectedPassengerIds(new Set());
  }

  return {
    selectedPassengerIds,
    togglePassenger,
    confirm,
    cancel,
    isPending: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
  };
}
