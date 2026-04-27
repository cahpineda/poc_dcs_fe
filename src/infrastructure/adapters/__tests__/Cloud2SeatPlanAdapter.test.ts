import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { AxiosInstance, AxiosError } from 'axios';
import { Cloud2SeatPlanAdapter } from '../Cloud2SeatPlanAdapter';

const mockGet = vi.fn();
const mockHttp = { get: mockGet } as unknown as AxiosInstance;

const validSeatPlanDTO = {
  flight_id: 'FL001',
  is_upper_deck: false,
  seat_rows: [
    {
      row_number: 1,
      is_exit_row: false,
      seats: [{ seat_number: '1A', status: 'A', cabin_class: 'Y' }],
    },
  ],
};

beforeEach(() => {
  mockGet.mockReset();
});

describe('Cloud2SeatPlanAdapter', () => {
  it('getSeatPlan calls correct endpoint and returns SeatPlanResult', async () => {
    mockGet.mockResolvedValue({ data: validSeatPlanDTO });
    const adapter = new Cloud2SeatPlanAdapter(mockHttp);

    const result = await adapter.getSeatPlan('FL001');

    expect(mockGet).toHaveBeenCalledWith('/ws/v1.8/get_seat_plan', {
      params: { flight_id: 'FL001' },
    });
    expect(result.flightId).toBe('FL001');
    expect(result.totalSeats).toBe(1);
  });

  it('getSeatPlan throws when flightId is empty', async () => {
    const adapter = new Cloud2SeatPlanAdapter(mockHttp);
    await expect(adapter.getSeatPlan('')).rejects.toThrow('flightId is required');
    expect(mockGet).not.toHaveBeenCalled();
  });

  it('getSeatPlan maps HTTP 500 to domain error', async () => {
    const axiosError = {
      isAxiosError: true,
      response: { status: 500 },
      message: 'Internal Server Error',
    } as unknown as AxiosError;
    mockGet.mockRejectedValue(axiosError);
    const adapter = new Cloud2SeatPlanAdapter(mockHttp);

    await expect(adapter.getSeatPlan('FL001')).rejects.toThrow(
      'Seat plan service unavailable'
    );
  });

  it('getSeatOccupancy calls correct endpoint and returns SeatPlanResult', async () => {
    mockGet.mockResolvedValue({ data: validSeatPlanDTO });
    const adapter = new Cloud2SeatPlanAdapter(mockHttp);

    const result = await adapter.getSeatOccupancy('FL001');

    expect(mockGet).toHaveBeenCalledWith('/ws/v1.8/get_seat_occupancy', {
      params: { flight_id: 'FL001' },
    });
    expect(result.flightId).toBe('FL001');
  });
});
