import type { ISeatPlanQueryService } from '@/application/ports/ISeatPlanQueryService';
import { Seat } from '@/domain/seat/Seat';
import { SeatNumber } from '@/domain/seat/SeatNumber';
import { SeatPlanResult } from '@/domain/seat/SeatPlanResult';

// Dev-only mock — not used in production builds
export class MockSeatPlanAdapter implements ISeatPlanQueryService {
  async getSeatPlan(flightId: string): Promise<SeatPlanResult> {
    return SeatPlanResult.create({
      flightId,
      isUpperDeck: false,
      rows: [
        {
          rowNumber: 1,
          isExitRow: false,
          seats: [
            Seat.create({ seatNumber: SeatNumber.create('1A'), status: 'available', cabinClass: 'Y' }),
            Seat.create({ seatNumber: SeatNumber.create('1B'), status: 'occupied', cabinClass: 'Y' }),
            Seat.create({ seatNumber: SeatNumber.create('1C'), status: 'available', cabinClass: 'Y' }),
            Seat.create({ seatNumber: SeatNumber.create('1D'), status: 'blocked', cabinClass: 'Y' }),
            Seat.create({ seatNumber: SeatNumber.create('1E'), status: 'available', cabinClass: 'Y' }),
            Seat.create({ seatNumber: SeatNumber.create('1F'), status: 'available', cabinClass: 'Y' }),
          ],
        },
        {
          rowNumber: 2,
          isExitRow: true,
          seats: [
            Seat.create({ seatNumber: SeatNumber.create('2A'), status: 'exit_row_available', cabinClass: 'Y' }),
            Seat.create({ seatNumber: SeatNumber.create('2B'), status: 'exit_row_available', cabinClass: 'Y' }),
            Seat.create({ seatNumber: SeatNumber.create('2C'), status: 'exit_row_occupied', cabinClass: 'Y' }),
            Seat.create({ seatNumber: SeatNumber.create('2D'), status: 'exit_row_available', cabinClass: 'Y' }),
            Seat.create({ seatNumber: SeatNumber.create('2E'), status: 'exit_row_available', cabinClass: 'Y' }),
            Seat.create({ seatNumber: SeatNumber.create('2F'), status: 'infant_occupied', cabinClass: 'Y' }),
          ],
        },
      ],
    });
  }

  async getSeatOccupancy(flightId: string): Promise<SeatPlanResult> {
    return this.getSeatPlan(flightId);
  }
}
