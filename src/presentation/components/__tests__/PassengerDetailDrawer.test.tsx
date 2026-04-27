import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PassengerDetailDrawer } from '../PassengerDetailDrawer';
import { Seat } from '@/domain/seat/Seat';
import { SeatNumber } from '@/domain/seat/SeatNumber';
import type { SeatStatus } from '@/domain/seat/SeatStatus';

function makeSeat(overrides: {
  seatNumber?: string;
  status?: SeatStatus;
  passengerName?: string;
  hasInfant?: boolean;
  gender?: 'M' | 'F' | 'U' | null;
} = {}): Seat {
  return Seat.create({
    seatNumber: SeatNumber.create(overrides.seatNumber ?? '12A'),
    status: overrides.status ?? 'occupied',
    cabinClass: 'Y',
    passengerName: overrides.passengerName ?? 'JANE DOE',
    hasInfant: overrides.hasInfant ?? false,
    gender: overrides.gender ?? 'F',
  });
}

const noop = () => {};
const defaultProps = {
  onClose: noop,
  onReseat: noop,
  onBlock: noop,
  onUnblock: noop,
  onUnassign: noop,
};

describe('PassengerDetailDrawer', () => {
  it('renders nothing when seat is null', () => {
    const { container } = render(<PassengerDetailDrawer seat={null} {...defaultProps} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders passenger name when seat has passengerName', () => {
    render(<PassengerDetailDrawer seat={makeSeat({ passengerName: 'JOHN SMITH' })} {...defaultProps} />);
    expect(screen.getByText('JOHN SMITH')).toBeInTheDocument();
  });

  it('renders seat number', () => {
    render(<PassengerDetailDrawer seat={makeSeat({ seatNumber: '14A' })} {...defaultProps} />);
    expect(screen.getByText('14A')).toBeInTheDocument();
  });

  it('shows "Checked-in" label when status is checked_in', () => {
    render(<PassengerDetailDrawer seat={makeSeat({ status: 'checked_in' })} {...defaultProps} />);
    expect(screen.getByText(/checked.?in/i)).toBeInTheDocument();
  });

  it('shows "Boarded" label when status is boarded', () => {
    render(<PassengerDetailDrawer seat={makeSeat({ status: 'boarded' })} {...defaultProps} />);
    expect(screen.getByText(/boarded/i)).toBeInTheDocument();
  });

  it('shows "Occupied" label when status is occupied', () => {
    render(<PassengerDetailDrawer seat={makeSeat({ status: 'occupied' })} {...defaultProps} />);
    expect(screen.getByText(/occupied/i)).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<PassengerDetailDrawer seat={makeSeat()} {...defaultProps} onClose={onClose} />);
    await user.click(screen.getByRole('button', { name: /close drawer/i }));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('calls onReseat with seat when Reseat button clicked', async () => {
    const user = userEvent.setup();
    const onReseat = vi.fn();
    const seat = makeSeat();
    render(<PassengerDetailDrawer seat={seat} {...defaultProps} onReseat={onReseat} />);
    await user.click(screen.getByRole('button', { name: /reseat/i }));
    expect(onReseat).toHaveBeenCalledWith(seat);
  });

  it('calls onBlock with seat when Block seat button clicked', async () => {
    const user = userEvent.setup();
    const onBlock = vi.fn();
    const seat = makeSeat({ status: 'occupied' });
    render(<PassengerDetailDrawer seat={seat} {...defaultProps} onBlock={onBlock} />);
    await user.click(screen.getByRole('button', { name: /block seat/i }));
    expect(onBlock).toHaveBeenCalledWith(seat);
  });

  it.each([
    ['occupied' as SeatStatus],
    ['checked_in' as SeatStatus],
    ['boarded' as SeatStatus],
  ])('Block seat button is shown for %s status', (status) => {
    render(<PassengerDetailDrawer seat={makeSeat({ status })} {...defaultProps} />);
    expect(screen.getByRole('button', { name: /block seat/i })).toBeInTheDocument();
  });

  it('Block seat button is NOT shown when status is blocked', () => {
    render(<PassengerDetailDrawer seat={makeSeat({ status: 'blocked' })} {...defaultProps} />);
    expect(screen.queryByRole('button', { name: 'Block seat' })).not.toBeInTheDocument();
  });

  it('Unblock seat button is shown only when status is blocked and calls onUnblock', async () => {
    const user = userEvent.setup();
    const onUnblock = vi.fn();
    const seat = makeSeat({ status: 'blocked' });
    render(<PassengerDetailDrawer seat={seat} {...defaultProps} onUnblock={onUnblock} />);
    const btn = screen.getByRole('button', { name: /unblock seat/i });
    expect(btn).toBeInTheDocument();
    await user.click(btn);
    expect(onUnblock).toHaveBeenCalledWith(seat);
  });

  it.each([
    ['occupied' as SeatStatus],
    ['checked_in' as SeatStatus],
    ['boarded' as SeatStatus],
  ])('Unblock seat button is NOT shown for %s status', (status) => {
    render(<PassengerDetailDrawer seat={makeSeat({ status })} {...defaultProps} />);
    expect(screen.queryByRole('button', { name: /unblock seat/i })).not.toBeInTheDocument();
  });

  it('Block button is disabled and has pending class when blockPending=true', () => {
    render(<PassengerDetailDrawer seat={makeSeat({ status: 'occupied' })} {...defaultProps} blockPending />);
    const btn = screen.getByRole('button', { name: /block seat/i });
    expect(btn).toBeDisabled();
    expect(btn).toHaveClass('drawer_action_pending');
  });

  it('Unblock button is disabled and has pending class when unblockPending=true', () => {
    render(<PassengerDetailDrawer seat={makeSeat({ status: 'blocked' })} {...defaultProps} unblockPending />);
    const btn = screen.getByRole('button', { name: /unblock seat/i });
    expect(btn).toBeDisabled();
    expect(btn).toHaveClass('drawer_action_pending');
  });

  it('Reseat button is disabled when blockPending=true', () => {
    render(<PassengerDetailDrawer seat={makeSeat({ status: 'occupied' })} {...defaultProps} blockPending />);
    expect(screen.getByRole('button', { name: /reseat/i })).toBeDisabled();
  });

  it('Reseat button is disabled when unblockPending=true', () => {
    render(<PassengerDetailDrawer seat={makeSeat({ status: 'occupied' })} {...defaultProps} unblockPending />);
    expect(screen.getByRole('button', { name: /reseat/i })).toBeDisabled();
  });
});

describe('PassengerDetailDrawer — boarding group and PNR', () => {
  it('shows boarding group when boardingGroup is set', () => {
    const seat = Seat.create({
      seatNumber: SeatNumber.create('3A'), status: 'checked_in', cabinClass: 'J',
      passengerName: 'ANA LOPEZ', boardingGroup: 1
    });
    render(<PassengerDetailDrawer seat={seat} {...defaultProps} />);
    expect(screen.getByText(/boarding group/i)).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
  });
  it('does NOT show boarding group row when boardingGroup is null', () => {
    const seat = Seat.create({
      seatNumber: SeatNumber.create('3A'), status: 'occupied', cabinClass: 'Y',
      passengerName: 'JOHN DOE'
    });
    render(<PassengerDetailDrawer seat={seat} {...defaultProps} />);
    expect(screen.queryByText(/boarding group/i)).not.toBeInTheDocument();
  });
  it('shows PNR when pnr is set', () => {
    const seat = Seat.create({
      seatNumber: SeatNumber.create('3A'), status: 'occupied', cabinClass: 'Y',
      passengerName: 'JOHN DOE', pnr: 'ABC123'
    });
    render(<PassengerDetailDrawer seat={seat} {...defaultProps} />);
    expect(screen.getByText(/pnr/i)).toBeInTheDocument();
    expect(screen.getByText('ABC123')).toBeInTheDocument();
  });
  it('does NOT show PNR row when pnr is null', () => {
    const seat = Seat.create({
      seatNumber: SeatNumber.create('3A'), status: 'occupied', cabinClass: 'Y',
      passengerName: 'JOHN DOE'
    });
    render(<PassengerDetailDrawer seat={seat} {...defaultProps} />);
    expect(screen.queryByText(/pnr/i)).not.toBeInTheDocument();
  });
});

describe('PassengerDetailDrawer — UNSEAT button', () => {
  it('shows Unseat button for occupied seat', () => {
    const seat = makeSeat({ status: 'occupied' });
    render(
      <PassengerDetailDrawer
        seat={seat} onClose={vi.fn()} onReseat={vi.fn()}
        onBlock={vi.fn()} onUnblock={vi.fn()} onUnassign={vi.fn()}
      />
    );
    expect(screen.getByRole('button', { name: /unseat/i })).toBeInTheDocument();
  });

  it('Unseat button disabled when unassignPending=true', () => {
    const seat = makeSeat({ status: 'occupied' });
    render(
      <PassengerDetailDrawer
        seat={seat} onClose={vi.fn()} onReseat={vi.fn()}
        onBlock={vi.fn()} onUnblock={vi.fn()} onUnassign={vi.fn()}
        unassignPending={true}
      />
    );
    expect(screen.getByRole('button', { name: /unseat/i })).toBeDisabled();
  });

  it('calls onUnassign with seat when Unseat clicked', async () => {
    const user = userEvent.setup();
    const onUnassign = vi.fn();
    const seat = makeSeat({ status: 'occupied' });
    render(
      <PassengerDetailDrawer
        seat={seat} onClose={vi.fn()} onReseat={vi.fn()}
        onBlock={vi.fn()} onUnblock={vi.fn()} onUnassign={onUnassign}
      />
    );
    await user.click(screen.getByRole('button', { name: /unseat/i }));
    expect(onUnassign).toHaveBeenCalledWith(seat);
  });
});
