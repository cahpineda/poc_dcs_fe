import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { SeatPlanTab } from '../SeatPlanTab';
import { Seat } from '@/domain/seat/Seat';
import { SeatNumber } from '@/domain/seat/SeatNumber';
import { SeatPlanResult } from '@/domain/seat/SeatPlanResult';
import { BlockSeatCommand } from '@/domain/seat/commands/BlockSeatCommand';
import { UnblockSeatCommand } from '@/domain/seat/commands/UnblockSeatCommand';
import { ReseatPassengerCommand } from '@/domain/seat/commands/ReseatPassengerCommand';

// --- Fixture ---

function makeFixturePlan() {
  return SeatPlanResult.create({
    flightId: 'FL123',
    isUpperDeck: false,
    rows: [
      {
        rowNumber: 1,
        isExitRow: false,
        seats: [
          Seat.create({ seatNumber: SeatNumber.create('1A'), status: 'available', cabinClass: 'Y' }),
          Seat.create({ seatNumber: SeatNumber.create('1B'), status: 'occupied', cabinClass: 'Y', passengerName: 'JANE DOE', gender: 'F' }),
          Seat.create({ seatNumber: SeatNumber.create('1C'), status: 'checked_in', cabinClass: 'Y', passengerName: 'BOB SMITH', gender: 'M' }),
          Seat.create({ seatNumber: SeatNumber.create('1D'), status: 'blocked', cabinClass: 'Y' }),
          Seat.create({ seatNumber: SeatNumber.create('1E'), status: 'available', cabinClass: 'Y' }),
          Seat.create({ seatNumber: SeatNumber.create('1F'), status: 'available', cabinClass: 'Y' }),
        ],
      },
    ],
  });
}

// --- Mocks ---

const mutateSpy = vi.fn();
const blockMutateSpy = vi.fn();
const unblockMutateSpy = vi.fn();

vi.mock('@/presentation/hooks/useSeatPlan', () => ({
  useSeatPlan: () => ({ data: makeFixturePlan(), isLoading: false, error: null }),
}));
vi.mock('@/presentation/hooks/useSeatAssign', () => ({
  useSeatAssign: () => ({ mutate: mutateSpy, isPending: false, isError: false, isSuccess: false }),
}));
vi.mock('@/presentation/hooks/useSeatBlock', () => ({
  useSeatBlock: () => ({ mutate: blockMutateSpy, isPending: false }),
  useSeatUnblock: () => ({ mutate: unblockMutateSpy, isPending: false }),
}));

const reseatMutateSpy = vi.fn();
vi.mock('@/presentation/hooks/useSeatReseat', () => ({
  // Auto-triggers onSuccess so reseat state clears after mutate — simulates immediate success
  useSeatReseat: () => ({
    mutate: (cmd: unknown, opts?: { onSuccess?: () => void }) => {
      reseatMutateSpy(cmd);
      opts?.onSuccess?.();
    },
    isPending: false,
  }),
}));

function makeWrapper() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('SeatPlanTab — passenger drawer', () => {
  it('clicking an occupied seat opens the drawer', async () => {
    const user = userEvent.setup();
    render(<SeatPlanTab flightId="FL123" />, { wrapper: makeWrapper() });
    await user.click(screen.getByRole('button', { name: 'JD' })); // 1B shows initials 'JD'
    expect(screen.getByRole('complementary', { name: /passenger details/i })).toBeInTheDocument();
    expect(screen.getByText('JANE DOE')).toBeInTheDocument();
  });

  it('clicking an occupied seat does NOT fire assignMutation', async () => {
    const user = userEvent.setup();
    render(<SeatPlanTab flightId="FL123" />, { wrapper: makeWrapper() });
    await user.click(screen.getByRole('button', { name: 'JD' }));
    expect(mutateSpy).not.toHaveBeenCalled();
  });

  it('clicking an available seat does NOT open the drawer', async () => {
    const user = userEvent.setup();
    render(<SeatPlanTab flightId="FL123" />, { wrapper: makeWrapper() });
    await user.click(screen.getByRole('button', { name: '1A' }));
    expect(screen.queryByRole('complementary', { name: /passenger details/i })).not.toBeInTheDocument();
    expect(mutateSpy).toHaveBeenCalledOnce();
  });

  it('clicking the close button hides the drawer', async () => {
    const user = userEvent.setup();
    render(<SeatPlanTab flightId="FL123" />, { wrapper: makeWrapper() });
    await user.click(screen.getByRole('button', { name: 'JD' }));
    expect(screen.getByRole('complementary', { name: /passenger details/i })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /close drawer/i }));
    expect(screen.queryByRole('complementary', { name: /passenger details/i })).not.toBeInTheDocument();
  });

  it('clicking checked_in seat opens drawer', async () => {
    const user = userEvent.setup();
    render(<SeatPlanTab flightId="FL123" />, { wrapper: makeWrapper() });
    await user.click(screen.getByRole('button', { name: 'BS' })); // 1C: BOB SMITH → BS
    expect(screen.getByRole('complementary', { name: /passenger details/i })).toBeInTheDocument();
    expect(screen.getByText('BOB SMITH')).toBeInTheDocument();
  });

  it('clicking blocked seat opens drawer with Unblock button', async () => {
    const user = userEvent.setup();
    render(<SeatPlanTab flightId="FL123" />, { wrapper: makeWrapper() });
    await user.click(screen.getByRole('button', { name: '1D' }));
    expect(screen.getByRole('complementary', { name: /passenger details/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /unblock seat/i })).toBeInTheDocument();
  });
});

describe('SeatPlanTab — block/unblock wiring', () => {
  it('clicking "Block seat" calls blockMutate with correct BlockSeatCommand', async () => {
    const user = userEvent.setup();
    render(<SeatPlanTab flightId="FL123" />, { wrapper: makeWrapper() });
    await user.click(screen.getByRole('button', { name: 'JD' })); // open drawer for 1B
    await user.click(screen.getByRole('button', { name: /block seat/i }));
    expect(blockMutateSpy).toHaveBeenCalledOnce();
    const cmd = blockMutateSpy.mock.calls[0][0] as BlockSeatCommand;
    expect(cmd).toBeInstanceOf(BlockSeatCommand);
    expect(cmd.seatNumber).toBe('1B');
    expect(cmd.flightId).toBe('FL123');
  });

  it('clicking "Unblock seat" calls unblockMutate with correct UnblockSeatCommand', async () => {
    const user = userEvent.setup();
    render(<SeatPlanTab flightId="FL123" />, { wrapper: makeWrapper() });
    await user.click(screen.getByRole('button', { name: '1D' })); // open drawer for blocked 1D
    await user.click(screen.getByRole('button', { name: /unblock seat/i }));
    expect(unblockMutateSpy).toHaveBeenCalledOnce();
    const cmd = unblockMutateSpy.mock.calls[0][0] as UnblockSeatCommand;
    expect(cmd).toBeInstanceOf(UnblockSeatCommand);
    expect(cmd.seatNumber).toBe('1D');
    expect(cmd.flightId).toBe('FL123');
  });
});

describe('SeatPlanTab — reseat flow', () => {
  // passengerId resolution: Seat has no passengerId; SeatPlanTab synthesizes 'PAX-' + seat.number
  it('clicking Reseat enters reseat mode and shows banner with passenger name', async () => {
    const user = userEvent.setup();
    render(<SeatPlanTab flightId="FL123" />, { wrapper: makeWrapper() });
    await user.click(screen.getByRole('button', { name: 'JD' })); // 1B JANE DOE
    await user.click(screen.getByRole('button', { name: /reseat/i }));
    expect(screen.queryByRole('complementary', { name: /passenger details/i })).not.toBeInTheDocument();
    expect(screen.getByRole('status')).toBeInTheDocument(); // reseat banner has role=status
    expect(screen.getByText(/jane doe/i)).toBeInTheDocument();
  });

  it('reseat banner shows correct passenger name for the clicked seat', async () => {
    const user = userEvent.setup();
    render(<SeatPlanTab flightId="FL123" />, { wrapper: makeWrapper() });
    await user.click(screen.getByRole('button', { name: 'BS' })); // 1C BOB SMITH
    await user.click(screen.getByRole('button', { name: /reseat/i }));
    expect(screen.getByText(/bob smith/i)).toBeInTheDocument();
  });

  it('clicking an available seat in reseat mode fires ReseatPassengerCommand with correct fields', async () => {
    const user = userEvent.setup();
    render(<SeatPlanTab flightId="FL123" />, { wrapper: makeWrapper() });
    // Enter reseat mode for 1B (JANE DOE)
    await user.click(screen.getByRole('button', { name: 'JD' }));
    await user.click(screen.getByRole('button', { name: /reseat/i }));
    // Pick available seat 1A
    await user.click(screen.getByRole('button', { name: '1A' }));
    expect(reseatMutateSpy).toHaveBeenCalledOnce();
    const cmd = reseatMutateSpy.mock.calls[0][0] as ReseatPassengerCommand;
    expect(cmd).toBeInstanceOf(ReseatPassengerCommand);
    expect(cmd.passengerId).toBe('PAX-1B');
    expect(cmd.fromSeat).toBe('1B');
    expect(cmd.toSeat).toBe('1A');
    expect(cmd.flightId).toBe('FL123');
  });

  it('reseat mode exits after successful reseat (banner disappears)', async () => {
    const user = userEvent.setup();
    render(<SeatPlanTab flightId="FL123" />, { wrapper: makeWrapper() });
    await user.click(screen.getByRole('button', { name: 'JD' }));
    await user.click(screen.getByRole('button', { name: /reseat/i }));
    await user.click(screen.getByRole('button', { name: '1A' }));
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('clicking Cancel exits reseat mode without firing mutation', async () => {
    const user = userEvent.setup();
    render(<SeatPlanTab flightId="FL123" />, { wrapper: makeWrapper() });
    await user.click(screen.getByRole('button', { name: 'JD' }));
    await user.click(screen.getByRole('button', { name: /reseat/i }));
    expect(screen.getByRole('status')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /cancel/i }));
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(reseatMutateSpy).not.toHaveBeenCalled();
  });

  it('clicking an occupied seat in reseat mode does NOT open drawer or fire mutation', async () => {
    const user = userEvent.setup();
    render(<SeatPlanTab flightId="FL123" />, { wrapper: makeWrapper() });
    await user.click(screen.getByRole('button', { name: 'JD' })); // enter drawer for 1B
    await user.click(screen.getByRole('button', { name: /reseat/i })); // enter reseat mode
    await user.click(screen.getByRole('button', { name: 'BS' })); // try to click 1C (occupied) in reseat mode
    expect(screen.queryByRole('complementary', { name: /passenger details/i })).not.toBeInTheDocument();
    expect(reseatMutateSpy).not.toHaveBeenCalled();
  });
});
