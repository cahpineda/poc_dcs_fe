import type { SeatPlanResult } from '@/domain/seat';

export interface ISeatPlanQueryService {
  getSeatPlan(flightId: string): Promise<SeatPlanResult>;
  getSeatOccupancy(flightId: string): Promise<SeatPlanResult>;
}
