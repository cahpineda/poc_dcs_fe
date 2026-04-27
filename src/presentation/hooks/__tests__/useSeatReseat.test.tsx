import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { useSeatReseat } from '../useSeatReseat';
import { ReseatPassengerCommand } from '@/domain/seat/commands/ReseatPassengerCommand';

vi.mock('@/infrastructure/DependencyProvider', () => ({
  services: {
    seatCommand: {
      assignSeat: vi.fn(),
      reseatPassenger: vi.fn(),
      blockSeat: vi.fn(),
      unblockSeat: vi.fn(),
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

beforeEach(() => {
  vi.mocked(services.seatCommand.reseatPassenger).mockReset();
});

describe('useSeatReseat', () => {
  it('returns mutation object with mutate and isPending fields', () => {
    const { result } = renderHook(() => useSeatReseat('FL001'), { wrapper: makeWrapper() });
    expect(result.current).toMatchObject({
      mutate: expect.any(Function),
      isPending: expect.any(Boolean),
    });
  });

  it('calls services.seatCommand.reseatPassenger with the command on mutate', async () => {
    vi.mocked(services.seatCommand.reseatPassenger).mockResolvedValue(undefined);
    const { result } = renderHook(() => useSeatReseat('FL001'), { wrapper: makeWrapper() });
    const cmd = ReseatPassengerCommand.create({ passengerId: 'P1', fromSeat: '12A', toSeat: '14B', flightId: 'FL001' });

    act(() => { result.current.mutate(cmd); });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(services.seatCommand.reseatPassenger).toHaveBeenCalledWith(cmd);
  });

  it('invalidates seatPlan cache for the correct flightId on success', async () => {
    vi.mocked(services.seatCommand.reseatPassenger).mockResolvedValue(undefined);
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
    const { result } = renderHook(() => useSeatReseat('FL001'), { wrapper });
    const cmd = ReseatPassengerCommand.create({ passengerId: 'P1', fromSeat: '12A', toSeat: '14B', flightId: 'FL001' });

    act(() => { result.current.mutate(cmd); });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['seatPlan', 'FL001'] });
  });

  it('does not invalidate other flights\' queries', async () => {
    vi.mocked(services.seatCommand.reseatPassenger).mockResolvedValue(undefined);
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
    const { result } = renderHook(() => useSeatReseat('FL001'), { wrapper });
    const cmd = ReseatPassengerCommand.create({ passengerId: 'P1', fromSeat: '12A', toSeat: '14B', flightId: 'FL001' });

    act(() => { result.current.mutate(cmd); });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const calls = invalidateSpy.mock.calls;
    const invalidatedKeys = calls.map((c) => JSON.stringify(c[0]));
    expect(invalidatedKeys.every((k) => k.includes('FL001'))).toBe(true);
    expect(invalidatedKeys.some((k) => k.includes('FL002'))).toBe(false);
  });
});
