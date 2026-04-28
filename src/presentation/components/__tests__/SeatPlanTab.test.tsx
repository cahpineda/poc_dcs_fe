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
        isWingZone: false,
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

const unassignMutateSpy = vi.fn();
vi.mock('@/presentation/hooks/useSeatUnassign', () => ({
  // Auto-triggers onSuccess so drawer closes after mutate — simulates immediate success
  useSeatUnassign: () => ({
    mutate: (cmd: unknown, opts?: { onSuccess?: () => void }) => {
      unassignMutateSpy(cmd);
      opts?.onSuccess?.();
    },
    isPending: false,
  }),
}));

const swapSelectSeatSpy = vi.fn();
let mockSwapFirstSeat: string | null = null;
vi.mock('@/presentation/hooks/useSeatSwap', () => ({
  useSeatSwap: () => ({
    firstSeat: mockSwapFirstSeat,
    selectSeat: swapSelectSeatSpy,
    cancel: vi.fn(),
    isPending: false,
  }),
}));

const groupToggleSpy = vi.fn();
const groupConfirmSpy = vi.fn();
vi.mock('@/presentation/hooks/useSeatGroupReseat', () => ({
  useSeatGroupReseat: () => ({
    selectedPassengerIds: new Set<string>(),
    togglePassenger: groupToggleSpy,
    confirm: groupConfirmSpy,
    cancel: vi.fn(),
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
  mockSwapFirstSeat = null;
});

describe('SeatPlanTab — passenger drawer', () => {
  it('clicking an occupied seat opens the drawer', async () => {
    const user = userEvent.setup();
    render(<SeatPlanTab flightId="FL123" />, { wrapper: makeWrapper() });
    await user.click(screen.getByRole('button', { name: '1B' })); // 1B shows initials 'JD'
    expect(screen.getByRole('complementary', { name: /passenger details/i })).toBeInTheDocument();
    expect(screen.getByText('JANE DOE')).toBeInTheDocument();
  });

  it('clicking an occupied seat does NOT fire assignMutation', async () => {
    const user = userEvent.setup();
    render(<SeatPlanTab flightId="FL123" />, { wrapper: makeWrapper() });
    await user.click(screen.getByRole('button', { name: '1B' }));
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
    await user.click(screen.getByRole('button', { name: '1B' }));
    expect(screen.getByRole('complementary', { name: /passenger details/i })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /close drawer/i }));
    expect(screen.queryByRole('complementary', { name: /passenger details/i })).not.toBeInTheDocument();
  });

  it('clicking checked_in seat opens drawer', async () => {
    const user = userEvent.setup();
    render(<SeatPlanTab flightId="FL123" />, { wrapper: makeWrapper() });
    await user.click(screen.getByRole('button', { name: '1C' })); // 1C: BOB SMITH → BS
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
    await user.click(screen.getByRole('button', { name: '1B' })); // open drawer for 1B
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
    await user.click(screen.getByRole('button', { name: '1B' })); // 1B JANE DOE
    await user.click(screen.getByRole('button', { name: /^reseat$/i }));
    expect(screen.queryByRole('complementary', { name: /passenger details/i })).not.toBeInTheDocument();
    expect(screen.getByRole('status')).toBeInTheDocument(); // reseat banner has role=status
    expect(screen.getByText(/jane doe/i)).toBeInTheDocument();
  });

  it('reseat banner shows correct passenger name for the clicked seat', async () => {
    const user = userEvent.setup();
    render(<SeatPlanTab flightId="FL123" />, { wrapper: makeWrapper() });
    await user.click(screen.getByRole('button', { name: '1C' })); // 1C BOB SMITH
    await user.click(screen.getByRole('button', { name: /^reseat$/i }));
    expect(screen.getByText(/bob smith/i)).toBeInTheDocument();
  });

  it('reseat banner shows NOT CHECKEDIN status pill (P17 screenshot alignment)', async () => {
    const user = userEvent.setup();
    render(<SeatPlanTab flightId="FL123" />, { wrapper: makeWrapper() });
    await user.click(screen.getByRole('button', { name: '1B' })); // 1B JANE DOE
    await user.click(screen.getByRole('button', { name: /^reseat$/i }));
    expect(screen.getByText('NOT CHECKEDIN')).toBeInTheDocument();
    const pill = screen.getByText('NOT CHECKEDIN');
    expect(pill).toHaveClass('status_pill');
    expect(pill).toHaveClass('status_pill_unchecked');
  });

  it('clicking an available seat in reseat mode fires ReseatPassengerCommand with correct fields', async () => {
    const user = userEvent.setup();
    render(<SeatPlanTab flightId="FL123" />, { wrapper: makeWrapper() });
    // Enter reseat mode for 1B (JANE DOE)
    await user.click(screen.getByRole('button', { name: '1B' }));
    await user.click(screen.getByRole('button', { name: /^reseat$/i }));
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
    await user.click(screen.getByRole('button', { name: '1B' }));
    await user.click(screen.getByRole('button', { name: /^reseat$/i }));
    await user.click(screen.getByRole('button', { name: '1A' }));
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('clicking Cancel exits reseat mode without firing mutation', async () => {
    const user = userEvent.setup();
    render(<SeatPlanTab flightId="FL123" />, { wrapper: makeWrapper() });
    await user.click(screen.getByRole('button', { name: '1B' }));
    await user.click(screen.getByRole('button', { name: /^reseat$/i }));
    expect(screen.getByRole('status')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /cancel/i }));
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(reseatMutateSpy).not.toHaveBeenCalled();
  });

  it('clicking an occupied seat in reseat mode does NOT open drawer or fire mutation', async () => {
    const user = userEvent.setup();
    render(<SeatPlanTab flightId="FL123" />, { wrapper: makeWrapper() });
    await user.click(screen.getByRole('button', { name: '1B' })); // enter drawer for 1B
    await user.click(screen.getByRole('button', { name: /^reseat$/i })); // enter reseat mode
    await user.click(screen.getByRole('button', { name: '1C' })); // try to click 1C (occupied) in reseat mode
    expect(screen.queryByRole('complementary', { name: /passenger details/i })).not.toBeInTheDocument();
    expect(reseatMutateSpy).not.toHaveBeenCalled();
  });
});

describe('SeatPlanTab — unseat wiring', () => {
  it('clicking UNSEAT in drawer calls unassignMutateSpy with correct UnassignSeatCommand and closes drawer', async () => {
    const user = userEvent.setup();
    render(<SeatPlanTab flightId="FL123" />, { wrapper: makeWrapper() });
    await user.click(screen.getByRole('button', { name: '1B' })); // open drawer for 1B (JANE DOE)
    await user.click(screen.getByRole('button', { name: /unseat/i }));
    expect(unassignMutateSpy).toHaveBeenCalledOnce();
    const cmd = unassignMutateSpy.mock.calls[0][0];
    expect(cmd.seatNumber).toBe('1B');
    expect(cmd.flightId).toBe('FL123');
    expect(screen.queryByRole('complementary', { name: /passenger details/i })).not.toBeInTheDocument();
  });
});

describe('SeatPlanTab — swap mode', () => {
  it('SWAP button appears in drawer for an occupied seat', async () => {
    const user = userEvent.setup();
    render(<SeatPlanTab flightId="FL123" />, { wrapper: makeWrapper() });
    await user.click(screen.getByRole('button', { name: '1B' })); // 1B JANE DOE
    expect(screen.getByRole('button', { name: /swap/i })).toBeInTheDocument();
  });

  it('clicking SWAP in drawer calls swapSelectSeatSpy with the seat object for 1B', async () => {
    const user = userEvent.setup();
    render(<SeatPlanTab flightId="FL123" />, { wrapper: makeWrapper() });
    await user.click(screen.getByRole('button', { name: '1B' })); // open drawer for 1B
    await user.click(screen.getByRole('button', { name: /swap/i }));
    expect(swapSelectSeatSpy).toHaveBeenCalledOnce();
    const arg = swapSelectSeatSpy.mock.calls[0][0];
    expect(arg.number.toString()).toBe('1B');
  });

  it('swap banner with role="status" is visible and shows "Swap mode" when firstSeat is set', () => {
    mockSwapFirstSeat = '1B';
    render(<SeatPlanTab flightId="FL123" />, { wrapper: makeWrapper() });
    const banner = screen.getByRole('status');
    expect(banner).toBeInTheDocument();
    expect(banner).toHaveTextContent(/swap mode/i);
  });
});

describe('SeatPlanTab — group reseat mode', () => {
  it('GROUP RESEAT button exists in the rendered output', () => {
    render(<SeatPlanTab flightId="FL123" />, { wrapper: makeWrapper() });
    expect(screen.getByRole('button', { name: /group reseat/i })).toBeInTheDocument();
  });

  it('clicking GROUP RESEAT shows a banner with role="status" containing "Group select"', async () => {
    const user = userEvent.setup();
    render(<SeatPlanTab flightId="FL123" />, { wrapper: makeWrapper() });
    await user.click(screen.getByRole('button', { name: /group reseat/i }));
    const banner = screen.getByRole('status');
    expect(banner).toBeInTheDocument();
    expect(banner).toHaveTextContent(/group select/i);
  });

  it('clicking MOVE GROUP calls groupConfirmSpy', async () => {
    const user = userEvent.setup();
    render(<SeatPlanTab flightId="FL123" />, { wrapper: makeWrapper() });
    await user.click(screen.getByRole('button', { name: /group reseat/i }));
    await user.click(screen.getByRole('button', { name: /move group/i }));
    expect(groupConfirmSpy).toHaveBeenCalledOnce();
  });
});

describe('SeatPlanTab — seat filter panel', () => {
  it('renders the SeatFilterPanel inside the left sidebar', () => {
    render(<SeatPlanTab flightId="FL123" />, { wrapper: makeWrapper() });
    expect(screen.getByRole('heading', { name: /SEAT FILTERS/i })).toBeInTheDocument();
  });

  it('with no filters active, no available seats have the dim class', () => {
    render(<SeatPlanTab flightId="FL123" />, { wrapper: makeWrapper() });
    const availSeats = ['1A', '1E', '1F'];
    for (const seatNum of availSeats) {
      const btn = screen.getByRole('button', { name: seatNum });
      expect(btn).not.toHaveClass('seat_cell_dimmed');
    }
  });

  it('after checking a filter, available seats without that attribute get dimmed', async () => {
    const user = userEvent.setup();
    render(<SeatPlanTab flightId="FL123" />, { wrapper: makeWrapper() });
    // Fixture seats have no attributes, so extra_leg_room will dim all available seats
    await user.click(screen.getByLabelText('Extra Leg Room'));
    const seat1A = screen.getByRole('button', { name: '1A' });
    expect(seat1A).toHaveClass('seat_cell_dimmed');
  });

  it('after unchecking the filter, dimmed seats return to normal', async () => {
    const user = userEvent.setup();
    render(<SeatPlanTab flightId="FL123" />, { wrapper: makeWrapper() });
    await user.click(screen.getByLabelText('Extra Leg Room'));
    // Dimmed now — uncheck it
    await user.click(screen.getByLabelText('Extra Leg Room'));
    const seat1A = screen.getByRole('button', { name: '1A' });
    expect(seat1A).not.toHaveClass('seat_cell_dimmed');
  });
});

describe('SeatPlanTab — passenger list panel', () => {
  it('renders the passenger manifest aside when seat plan loads', () => {
    render(<SeatPlanTab flightId="FL123" />, { wrapper: makeWrapper() });
    expect(screen.getByRole('complementary', { name: /passenger manifest/i })).toBeInTheDocument();
  });

  it('passenger list shows occupied passengers derived from seat plan', () => {
    render(<SeatPlanTab flightId="FL123" />, { wrapper: makeWrapper() });
    // makeFixturePlan has 2 occupied seats: 1B (JANE DOE) and 1C (BOB SMITH, checked_in)
    expect(screen.getByText('DOE,JANE')).toBeInTheDocument();
    expect(screen.getByText('SMITH,BOB')).toBeInTheDocument();
  });

  it('clicking a passenger in the list opens the drawer for their seat', async () => {
    const user = userEvent.setup();
    render(<SeatPlanTab flightId="FL123" />, { wrapper: makeWrapper() });
    // Click JANE DOE entry in the list (role=button on the li element)
    const janeEntry = screen.getByText('DOE,JANE').closest('[role="button"]') as HTMLElement;
    await user.click(janeEntry);
    expect(screen.getByRole('complementary', { name: /passenger details/i })).toBeInTheDocument();
    expect(screen.getByText('JANE DOE')).toBeInTheDocument();
  });
});
