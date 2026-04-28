import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { SeatRow } from '../SeatRow';
import { SeatNumber } from '@/domain/seat/SeatNumber';
import { Seat } from '@/domain/seat/Seat';
import type { CabinRow } from '@/domain/seat/CabinRow';

const makeRow = (overrides: Partial<CabinRow> = {}): CabinRow => ({
  rowNumber: 12,
  isExitRow: false,
  isWingZone: false,
  seats: [
    Seat.create({ seatNumber: SeatNumber.create('12A'), status: 'available', cabinClass: 'Y' }),
    Seat.create({ seatNumber: SeatNumber.create('12B'), status: 'occupied', cabinClass: 'Y' }),
    Seat.create({ seatNumber: SeatNumber.create('12C'), status: 'blocked', cabinClass: 'Y' }),
  ],
  ...overrides,
});

const makeFullRow = (rowNumber: number): CabinRow => ({
  rowNumber,
  isExitRow: false,
  isWingZone: false,
  seats: ['A', 'B', 'C', 'D', 'E', 'F'].map((col) =>
    Seat.create({ seatNumber: SeatNumber.create(`${rowNumber}${col}`), status: 'available', cabinClass: 'Y' })
  ),
});

describe('SeatRow', () => {
  it('renders row number and all seat cells', () => {
    render(<SeatRow row={makeRow()} selectedSeat={undefined} onSeatSelect={vi.fn()} />);
    // Row number should appear TWICE (left and right labels — P17 screenshot alignment)
    const rowNumbers = screen.getAllByText('12');
    expect(rowNumbers).toHaveLength(2);
    expect(screen.getByText('12A')).toBeDefined();
    expect(screen.getByRole('button', { name: '12B' })).toBeDefined(); // occupied — shows silhouette, identified by aria-label
    expect(screen.getByText('12C')).toBeDefined();
  });

  it('renders row number on both left and right sides of each row', () => {
    const { container } = render(<SeatRow row={makeRow()} selectedSeat={undefined} onSeatSelect={vi.fn()} />);
    expect(container.querySelector('.row_number_left')).toBeInTheDocument();
    expect(container.querySelector('.row_number_right')).toBeInTheDocument();
    expect(container.querySelector('.row_number_left')?.textContent).toBe('12');
    expect(container.querySelector('.row_number_right')?.textContent).toBe('12');
  });

  it('renders empty row without crashing when seats array is empty', () => {
    const { container } = render(
      <SeatRow row={makeRow({ seats: [] })} selectedSeat={undefined} onSeatSelect={vi.fn()} />
    );
    expect(container.querySelector('.cabin_row')).toBeDefined();
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('applies exit_row class when cabinRow.isExitRow is true', () => {
    const { container } = render(
      <SeatRow row={makeRow({ isExitRow: true })} selectedSeat={undefined} onSeatSelect={vi.fn()} />
    );
    expect(container.querySelector('.cabin_row.exit_row')).toBeDefined();
  });

  it('renders wing_exit_marker spans on exit rows', () => {
    const { container } = render(
      <SeatRow row={makeRow({ isExitRow: true })} selectedSeat={undefined} onSeatSelect={vi.fn()} />
    );
    expect(container.querySelectorAll('.wing_exit_marker')).toHaveLength(2);
    expect(container.querySelectorAll('.wing_zone_block')).toHaveLength(0);
  });

  it('renders wing_zone_block spans on wing zone non-exit rows', () => {
    const { container } = render(
      <SeatRow row={makeRow({ isExitRow: false, isWingZone: true })} selectedSeat={undefined} onSeatSelect={vi.fn()} />
    );
    expect(container.querySelectorAll('.wing_zone_block')).toHaveLength(2);
    expect(container.querySelectorAll('.wing_exit_marker')).toHaveLength(0);
  });

  it('renders placeholder spans on regular non-wing rows', () => {
    const { container } = render(
      <SeatRow row={makeRow()} selectedSeat={undefined} onSeatSelect={vi.fn()} />
    );
    expect(container.querySelectorAll('.wing_exit_placeholder')).toHaveLength(2);
    expect(container.querySelectorAll('.wing_exit_marker')).toHaveLength(0);
    expect(container.querySelectorAll('.wing_zone_block')).toHaveLength(0);
  });

  it('renders window icons outside A and F seats in a 6-seat row', () => {
    const { container } = render(
      <SeatRow row={makeFullRow(5)} selectedSeat={undefined} onSeatSelect={vi.fn()} />
    );
    const icons = container.querySelectorAll('img.row_window_icon');
    expect(icons).toHaveLength(2);
  });

  it('does not render window icons when row only has middle columns (B/C/D)', () => {
    const midOnlyRow: CabinRow = {
      rowNumber: 12,
      isExitRow: false,
      isWingZone: false,
      seats: ['B', 'C', 'D'].map((col) =>
        Seat.create({ seatNumber: SeatNumber.create(`12${col}`), status: 'available', cabinClass: 'Y' })
      ),
    };
    const { container } = render(
      <SeatRow row={midOnlyRow} selectedSeat={undefined} onSeatSelect={vi.fn()} />
    );
    expect(container.querySelectorAll('img.row_window_icon')).toHaveLength(0);
  });

  it('passes selectedSeat to SeatCell and fires onSeatSelect on click', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<SeatRow row={makeRow()} selectedSeat="12A" onSeatSelect={onSelect} />);
    await user.click(screen.getByText('12A'));
    expect(onSelect).toHaveBeenCalledWith('12A');
  });
});
