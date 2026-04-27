import { useQuery } from '@tanstack/react-query';
import { services } from '@/infrastructure/DependencyProvider';

export function useSeatPlan(flightId: string) {
  return useQuery({
    queryKey: ['seatPlan', flightId],
    queryFn: () => services.seatQuery.getSeatPlan(flightId),
    enabled: Boolean(flightId),
    staleTime: 5 * 60 * 1000,
  });
}
