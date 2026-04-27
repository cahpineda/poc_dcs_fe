import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { useSeatUnassign } from '../useSeatUnassign';
import { UnassignSeatCommand } from '@/domain/seat/commands/UnassignSeatCommand';

const unassignSeatSpy = vi.fn().mockResolvedValue(undefined);

vi.mock('@/infrastructure/DependencyProvider', () => ({
  services: { seatCommand: { unassignSeat: (...args: unknown[]) => unassignSeatSpy(...args) } },
}));

function wrapper({ children }: { children: ReactNode }) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
}

describe('useSeatUnassign', () => {
  beforeEach(() => { unassignSeatSpy.mockClear(); });

  it('returns mutate and isPending', () => {
    const { result } = renderHook(() => useSeatUnassign('FL001'), { wrapper });
    expect(typeof result.current.mutate).toBe('function');
    expect(result.current.isPending).toBe(false);
  });

  it('calls services.seatCommand.unassignSeat with command', async () => {
    const { result } = renderHook(() => useSeatUnassign('FL001'), { wrapper });
    const cmd = UnassignSeatCommand.create({ flightId: 'FL001', seatNumber: '1B' });
    await act(async () => { result.current.mutate(cmd); });
    expect(unassignSeatSpy).toHaveBeenCalledWith(cmd);
  });

  it('invalidates seatPlan cache for the flight on success', async () => {
    const qc = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
    const invalidateSpy = vi.spyOn(qc, 'invalidateQueries');
    const { result } = renderHook(() => useSeatUnassign('FL001'), {
      wrapper: ({ children }) => <QueryClientProvider client={qc}>{children}</QueryClientProvider>,
    });
    const cmd = UnassignSeatCommand.create({ flightId: 'FL001', seatNumber: '1B' });
    await act(async () => { result.current.mutate(cmd); });
    await new Promise(r => setTimeout(r, 0));
    expect(invalidateSpy).toHaveBeenCalledWith(expect.objectContaining({ queryKey: ['seatPlan', 'FL001'] }));
  });

  it('does not invalidate other flight cache', async () => {
    const qc = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
    const invalidateSpy = vi.spyOn(qc, 'invalidateQueries');
    const { result } = renderHook(() => useSeatUnassign('FL002'), {
      wrapper: ({ children }) => <QueryClientProvider client={qc}>{children}</QueryClientProvider>,
    });
    const cmd = UnassignSeatCommand.create({ flightId: 'FL002', seatNumber: '1B' });
    await act(async () => { result.current.mutate(cmd); });
    await new Promise(r => setTimeout(r, 0));
    const calls = invalidateSpy.mock.calls;
    calls.forEach(([opts]) => {
      expect((opts as { queryKey: unknown[] }).queryKey).not.toContain('FL001');
    });
  });
});
