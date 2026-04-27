import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { useSeatSwap } from '../useSeatSwap';
import { Seat } from '@/domain/seat/Seat';
import { SeatNumber } from '@/domain/seat/SeatNumber';
import { SwapSeatsCommand } from '@/domain/seat/commands/SwapSeatsCommand';

vi.mock('@/infrastructure/DependencyProvider', () => ({
  services: {
    seatCommand: {
      swapSeats: vi.fn(),
    },
  },
}));

import { services } from '@/infrastructure/DependencyProvider';

function makeWrapper() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
}

function makeSeat(number: string, status: 'available' | 'occupied' = 'occupied') {
  return Seat.create({ seatNumber: SeatNumber.create(number), status, cabinClass: 'Y' });
}

beforeEach(() => {
  vi.mocked(services.seatCommand.swapSeats).mockReset();
});

describe('useSeatSwap', () => {
  it('returns expected shape: firstSeat, selectSeat, cancel, mutate status fields', () => {
    const { result } = renderHook(() => useSeatSwap('FL001'), { wrapper: makeWrapper() });
    expect(result.current).toMatchObject({
      firstSeat: null,
      selectSeat: expect.any(Function),
      cancel: expect.any(Function),
      isPending: expect.any(Boolean),
    });
  });

  it('first click sets firstSeat and does NOT fire mutation', async () => {
    const { result } = renderHook(() => useSeatSwap('FL001'), { wrapper: makeWrapper() });
    const seat = makeSeat('1B');

    act(() => { result.current.selectSeat(seat); });

    expect(result.current.firstSeat).toBe(seat);
    expect(services.seatCommand.swapSeats).not.toHaveBeenCalled();
  });

  it('second click fires swapSeats mutation with correct SwapSeatsCommand', async () => {
    vi.mocked(services.seatCommand.swapSeats).mockResolvedValue(undefined);
    const { result } = renderHook(() => useSeatSwap('FL001'), { wrapper: makeWrapper() });
    const seatA = makeSeat('1B');
    const seatB = makeSeat('2C');

    act(() => { result.current.selectSeat(seatA); });
    act(() => { result.current.selectSeat(seatB); });

    await waitFor(() => expect(services.seatCommand.swapSeats).toHaveBeenCalledOnce());
    const cmd = vi.mocked(services.seatCommand.swapSeats).mock.calls[0][0] as SwapSeatsCommand;
    expect(cmd).toBeInstanceOf(SwapSeatsCommand);
    expect(cmd.seatA).toBe('1B');
    expect(cmd.seatB).toBe('2C');
    expect(cmd.flightId).toBe('FL001');
  });

  it('cancel clears firstSeat without firing mutation', () => {
    const { result } = renderHook(() => useSeatSwap('FL001'), { wrapper: makeWrapper() });
    const seat = makeSeat('1B');

    act(() => { result.current.selectSeat(seat); });
    expect(result.current.firstSeat).toBe(seat);

    act(() => { result.current.cancel(); });
    expect(result.current.firstSeat).toBeNull();
    expect(services.seatCommand.swapSeats).not.toHaveBeenCalled();
  });

  it('firstSeat resets to null after successful swap', async () => {
    vi.mocked(services.seatCommand.swapSeats).mockResolvedValue(undefined);
    const { result } = renderHook(() => useSeatSwap('FL001'), { wrapper: makeWrapper() });
    const seatA = makeSeat('1B');
    const seatB = makeSeat('2C');

    act(() => { result.current.selectSeat(seatA); });
    act(() => { result.current.selectSeat(seatB); });

    await waitFor(() => expect(result.current.firstSeat).toBeNull());
  });
});
