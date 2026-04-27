import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { useSeatGroupReseat } from '../useSeatGroupReseat';
import { ReseatGroupCommand } from '@/domain/seat/commands/ReseatGroupCommand';

vi.mock('@/infrastructure/DependencyProvider', () => ({
  services: {
    seatCommand: {
      reseatGroup: vi.fn(),
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
  vi.mocked(services.seatCommand.reseatGroup).mockReset();
});

describe('useSeatGroupReseat', () => {
  it('returns expected shape: selectedPassengerIds, togglePassenger, confirm, cancel, isPending', () => {
    const { result } = renderHook(() => useSeatGroupReseat('FL001'), { wrapper: makeWrapper() });
    expect(result.current).toMatchObject({
      selectedPassengerIds: expect.any(Set),
      togglePassenger: expect.any(Function),
      confirm: expect.any(Function),
      cancel: expect.any(Function),
      isPending: expect.any(Boolean),
    });
    expect(result.current.selectedPassengerIds.size).toBe(0);
  });

  it('togglePassenger adds a passenger id to selectedPassengerIds', () => {
    const { result } = renderHook(() => useSeatGroupReseat('FL001'), { wrapper: makeWrapper() });

    act(() => { result.current.togglePassenger('P1'); });

    expect(result.current.selectedPassengerIds.has('P1')).toBe(true);
    expect(result.current.selectedPassengerIds.size).toBe(1);
  });

  it('togglePassenger removes a passenger id that is already selected', () => {
    const { result } = renderHook(() => useSeatGroupReseat('FL001'), { wrapper: makeWrapper() });

    act(() => { result.current.togglePassenger('P1'); });
    act(() => { result.current.togglePassenger('P1'); });

    expect(result.current.selectedPassengerIds.has('P1')).toBe(false);
    expect(result.current.selectedPassengerIds.size).toBe(0);
  });

  it('confirm fires reseatGroup mutation with correct ReseatGroupCommand when passengers selected', async () => {
    vi.mocked(services.seatCommand.reseatGroup).mockResolvedValue(undefined);
    const { result } = renderHook(() => useSeatGroupReseat('FL001'), { wrapper: makeWrapper() });

    act(() => { result.current.togglePassenger('P1'); });
    act(() => { result.current.togglePassenger('P2'); });
    act(() => { result.current.confirm(); });

    await waitFor(() => expect(services.seatCommand.reseatGroup).toHaveBeenCalledOnce());
    const cmd = vi.mocked(services.seatCommand.reseatGroup).mock.calls[0][0] as ReseatGroupCommand;
    expect(cmd).toBeInstanceOf(ReseatGroupCommand);
    expect(cmd.flightId).toBe('FL001');
    expect(cmd.passengerIds).toContain('P1');
    expect(cmd.passengerIds).toContain('P2');
  });

  it('confirm does NOT fire mutation when no passengers are selected', () => {
    const { result } = renderHook(() => useSeatGroupReseat('FL001'), { wrapper: makeWrapper() });

    act(() => { result.current.confirm(); });

    expect(services.seatCommand.reseatGroup).not.toHaveBeenCalled();
  });

  it('cancel clears selectedPassengerIds without firing mutation', () => {
    const { result } = renderHook(() => useSeatGroupReseat('FL001'), { wrapper: makeWrapper() });

    act(() => { result.current.togglePassenger('P1'); });
    act(() => { result.current.togglePassenger('P2'); });
    expect(result.current.selectedPassengerIds.size).toBe(2);

    act(() => { result.current.cancel(); });

    expect(result.current.selectedPassengerIds.size).toBe(0);
    expect(services.seatCommand.reseatGroup).not.toHaveBeenCalled();
  });
});
