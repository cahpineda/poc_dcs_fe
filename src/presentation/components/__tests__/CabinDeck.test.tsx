import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CabinDeck } from '../CabinDeck';
import { SeatNumber } from '@/domain/seat/SeatNumber';
import { Seat } from '@/domain/seat/Seat';
import type { CabinRow } from '@/domain/seat/CabinRow';

const makeRowWithCabin = (rowNumber: number, cabinClass: string): CabinRow => ({
  rowNumber,
  isExitRow: false,
  isWingZone: false,
  seats: [
    Seat.create({ seatNumber: SeatNumber.create(`${rowNumber}A`), status: 'available', cabinClass }),
    Seat.create({ seatNumber: SeatNumber.create(`${rowNumber}B`), status: 'available', cabinClass }),
  ],
});

const makeRow = (rowNumber: number, isExitRow = false): CabinRow => ({
  rowNumber,
  isExitRow,
  isWingZone: false,
  seats: [
    Seat.create({ seatNumber: SeatNumber.create(`${rowNumber}A`), status: 'available', cabinClass: 'Y' }),
    Seat.create({ seatNumber: SeatNumber.create(`${rowNumber}B`), status: 'occupied', cabinClass: 'Y' }),
  ],
});

describe('CabinDeck', () => {
  it('renders all rows and their seats', () => {
    const rows = [makeRow(1), makeRow(2), makeRow(3)];
    render(<CabinDeck rows={rows} onSeatSelect={vi.fn()} />);
    expect(screen.getByText('1A')).toBeDefined();
    expect(screen.getByText('2A')).toBeDefined();
    expect(screen.getByText('3A')).toBeDefined();
  });

  it('renders empty deck without crashing', () => {
    const { container } = render(<CabinDeck rows={[]} onSeatSelect={vi.fn()} />);
    expect(container.querySelector('.seat_map_container')).toBeDefined();
  });

  it('wraps content in seat_map_container', () => {
    const { container } = render(<CabinDeck rows={[makeRow(5)]} onSeatSelect={vi.fn()} />);
    expect(container.querySelector('.seat_map_container')).not.toBeNull();
  });

  it('renders column headers derived from first row seats', () => {
    const rows = [makeRow(1), makeRow(2)];
    const { container } = render(<CabinDeck rows={rows} onSeatSelect={vi.fn()} />);
    const labels = container.querySelectorAll('.column_label');
    expect(labels).toHaveLength(2);
    expect(labels[0].textContent).toBe('A');
    expect(labels[1].textContent).toBe('B');
  });
});

describe('CabinDeck — cabin dividers', () => {
  it('inserts a label for the first cabin plus one divider at the F→J transition', () => {
    const rows = [
      makeRowWithCabin(1, 'F'),
      makeRowWithCabin(2, 'J'),  // transition F→J
      makeRowWithCabin(3, 'J'),
    ];
    const { container } = render(<CabinDeck rows={rows} onSeatSelect={vi.fn()} />);
    // F label + J label = 2 dividers
    expect(container.querySelectorAll('.cabin_divider')).toHaveLength(2);
  });
  it('inserts labels for all three cabins (F, J, Y)', () => {
    const rows = [
      makeRowWithCabin(1, 'F'),
      makeRowWithCabin(2, 'J'),
      makeRowWithCabin(3, 'J'),
      makeRowWithCabin(4, 'Y'),
    ];
    const { container } = render(<CabinDeck rows={rows} onSeatSelect={vi.fn()} />);
    expect(container.querySelectorAll('.cabin_divider')).toHaveLength(3);
  });
  it('shows correct cabin labels for F and J sections', () => {
    const rows = [makeRowWithCabin(1, 'F'), makeRowWithCabin(2, 'J')];
    const { container } = render(<CabinDeck rows={rows} onSeatSelect={vi.fn()} />);
    const dividers = container.querySelectorAll('.cabin_divider');
    expect(dividers[0].textContent).toMatch(/first/i);
    expect(dividers[1].textContent).toMatch(/business/i);
  });
  it('inserts one divider for a single cabin class (label at the top)', () => {
    const rows = [makeRowWithCabin(1, 'Y'), makeRowWithCabin(2, 'Y'), makeRowWithCabin(3, 'Y')];
    const { container } = render(<CabinDeck rows={rows} onSeatSelect={vi.fn()} />);
    expect(container.querySelectorAll('.cabin_divider')).toHaveLength(1);
    expect(container.querySelector('.cabin_divider')?.textContent).toMatch(/economy/i);
  });
});
