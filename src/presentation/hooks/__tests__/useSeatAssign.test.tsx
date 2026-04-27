import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { useSeatAssign } from '../useSeatAssign';
import { AssignSeatCommand } from '@/domain/seat/commands/AssignSeatCommand';

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
  vi.mocked(services.seatCommand.assignSeat).mockReset();
});

describe('useSeatAssign', () => {
  it('calls assignSeat with command on mutate', async () => {
    vi.mocked(services.seatCommand.assignSeat).mockResolvedValue(undefined);
    const { result } = renderHook(() => useSeatAssign('FL001'), { wrapper: makeWrapper() });
    const cmd = AssignSeatCommand.create({ passengerId: 'P1', seatNumber: '1A', flightId: 'FL001' });

    act(() => { result.current.mutate(cmd); });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(services.seatCommand.assignSeat).toHaveBeenCalledWith(cmd);
  });

  it('surfaces error when assignSeat rejects', async () => {
    vi.mocked(services.seatCommand.assignSeat).mockRejectedValue(new Error('Seat is already occupied'));
    const { result } = renderHook(() => useSeatAssign('FL001'), { wrapper: makeWrapper() });
    const cmd = AssignSeatCommand.create({ passengerId: 'P1', seatNumber: '1A', flightId: 'FL001' });

    act(() => { result.current.mutate(cmd); });
    await waitFor(() => expect(result.current.isError).toBe(true));

    expect((result.current.error as Error).message).toBe('Seat is already occupied');
  });

  it('invalidates seatPlan cache on success', async () => {
    vi.mocked(services.seatCommand.assignSeat).mockResolvedValue(undefined);
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
    const { result } = renderHook(() => useSeatAssign('FL001'), { wrapper });
    const cmd = AssignSeatCommand.create({ passengerId: 'P1', seatNumber: '1A', flightId: 'FL001' });

    act(() => { result.current.mutate(cmd); });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['seatPlan', 'FL001'] });
  });
});
