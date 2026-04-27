import type { AxiosInstance } from 'axios';
import type { ISeatPlanQueryService } from '@/application/ports';
import type { SeatPlanResult } from '@/domain/seat';
import { mapSeatPlanDTO } from './mappers/seatPlanMapper';

function isServerError(err: unknown): boolean {
  if (typeof err !== 'object' || err === null || !('isAxiosError' in err)) return false;
  const status = (err as { response?: { status?: unknown } }).response?.status;
  return typeof status === 'number' && status >= 500;
}

export class Cloud2SeatPlanAdapter implements ISeatPlanQueryService {
  constructor(private readonly http: AxiosInstance) {}

  async getSeatPlan(flightId: string): Promise<SeatPlanResult> {
    if (!flightId) throw new Error('flightId is required');
    try {
      const { data } = await this.http.get('/ws/v1.8/get_seat_plan', {
        params: { flight_id: flightId },
      });
      return mapSeatPlanDTO(data);
    } catch (err) {
      if (isServerError(err)) throw new Error('Seat plan service unavailable');
      throw err;
    }
  }

  async getSeatOccupancy(flightId: string): Promise<SeatPlanResult> {
    if (!flightId) throw new Error('flightId is required');
    const { data } = await this.http.get('/ws/v1.8/get_seat_occupancy', {
      params: { flight_id: flightId },
    });
    return mapSeatPlanDTO(data);
  }
}
