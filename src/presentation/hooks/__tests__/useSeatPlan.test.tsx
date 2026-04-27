import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { useSeatPlan } from '../useSeatPlan';
import { SeatNumber } from '@/domain/seat/SeatNumber';
import { Seat } from '@/domain/seat/Seat';
import { SeatPlanResult } from '@/domain/seat/SeatPlanResult';

vi.mock('@/infrastructure/DependencyProvider', () => ({
  services: {
    seatQuery: {
      getSeatPlan: vi.fn(),
      getSeatOccupancy: vi.fn(),
    },
  },
}));

import { services } from '@/infrastructure/DependencyProvider';

const mockSeatPlan = SeatPlanResult.create({
  rows: [
    {
      rowNumber: 1,
      isExitRow: false,
      seats: [
        Seat.create({ seatNumber: SeatNumber.create('1A'), status: 'available', cabinClass: 'Y' }),
      ],
    },
  ],
  flightId: 'FL001',
  isUpperDeck: false,
});

function makeWrapper() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
}

beforeEach(() => {
  vi.mocked(services.seatQuery.getSeatPlan).mockReset();
});

describe('useSeatPlan', () => {
  it('returns seatPlan data on success', async () => {
    vi.mocked(services.seatQuery.getSeatPlan).mockResolvedValue(mockSeatPlan);
    const { result } = renderHook(() => useSeatPlan('FL001'), { wrapper: makeWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.flightId).toBe('FL001');
    expect(result.current.data?.totalSeats).toBe(1);
  });

  it('is disabled and returns no data when flightId is empty', () => {
    const { result } = renderHook(() => useSeatPlan(''), { wrapper: makeWrapper() });

    expect(result.current.fetchStatus).toBe('idle');
    expect(result.current.data).toBeUndefined();
    expect(services.seatQuery.getSeatPlan).not.toHaveBeenCalled();
  });

  it('surfaces error when seatQuery rejects', async () => {
    vi.mocked(services.seatQuery.getSeatPlan).mockRejectedValue(new Error('Network error'));
    const { result } = renderHook(() => useSeatPlan('FL001'), { wrapper: makeWrapper() });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toBeInstanceOf(Error);
    expect((result.current.error as Error).message).toBe('Network error');
  });

  it('uses flightId as part of queryKey so different flights cache separately', async () => {
    vi.mocked(services.seatQuery.getSeatPlan).mockResolvedValue(mockSeatPlan);
    const { result: r1 } = renderHook(() => useSeatPlan('FL001'), { wrapper: makeWrapper() });
    const { result: r2 } = renderHook(() => useSeatPlan('FL002'), { wrapper: makeWrapper() });

    await waitFor(() => expect(r1.current.isSuccess).toBe(true));
    await waitFor(() => expect(r2.current.isSuccess).toBe(true));

    expect(vi.mocked(services.seatQuery.getSeatPlan)).toHaveBeenCalledWith('FL001');
    expect(vi.mocked(services.seatQuery.getSeatPlan)).toHaveBeenCalledWith('FL002');
  });
});
