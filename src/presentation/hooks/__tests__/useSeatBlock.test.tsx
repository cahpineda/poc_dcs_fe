import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { useSeatBlock, useSeatUnblock } from '../useSeatBlock';
import { BlockSeatCommand } from '@/domain/seat/commands/BlockSeatCommand';
import { UnblockSeatCommand } from '@/domain/seat/commands/UnblockSeatCommand';

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
  vi.mocked(services.seatCommand.blockSeat).mockReset();
  vi.mocked(services.seatCommand.unblockSeat).mockReset();
});

describe('useSeatBlock', () => {
  it('calls blockSeat with command on mutate', async () => {
    vi.mocked(services.seatCommand.blockSeat).mockResolvedValue(undefined);
    const { result } = renderHook(() => useSeatBlock('FL001'), { wrapper: makeWrapper() });
    const cmd = BlockSeatCommand.create({ seatNumber: '3B', flightId: 'FL001', reason: 'crew' });

    act(() => { result.current.mutate(cmd); });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(services.seatCommand.blockSeat).toHaveBeenCalledWith(cmd);
  });

  it('invalidates seatPlan cache on success', async () => {
    vi.mocked(services.seatCommand.blockSeat).mockResolvedValue(undefined);
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
    const { result } = renderHook(() => useSeatBlock('FL001'), { wrapper });

    act(() => { result.current.mutate(BlockSeatCommand.create({ seatNumber: '3B', flightId: 'FL001', reason: 'crew' })); });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['seatPlan', 'FL001'] });
  });
});

describe('useSeatUnblock', () => {
  it('calls unblockSeat with command on mutate', async () => {
    vi.mocked(services.seatCommand.unblockSeat).mockResolvedValue(undefined);
    const { result } = renderHook(() => useSeatUnblock('FL001'), { wrapper: makeWrapper() });
    const cmd = UnblockSeatCommand.create({ seatNumber: '3B', flightId: 'FL001' });

    act(() => { result.current.mutate(cmd); });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(services.seatCommand.unblockSeat).toHaveBeenCalledWith(cmd);
  });
});
