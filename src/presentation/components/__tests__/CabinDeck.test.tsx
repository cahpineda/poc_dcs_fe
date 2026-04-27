import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CabinDeck } from '../CabinDeck';
import { SeatNumber } from '@/domain/seat/SeatNumber';
import { Seat } from '@/domain/seat/Seat';
import type { CabinRow } from '@/domain/seat/CabinRow';

const makeRowWithCabin = (rowNumber: number, cabinClass: string): CabinRow => ({
  rowNumber,
  isExitRow: false,
  seats: [
    Seat.create({ seatNumber: SeatNumber.create(`${rowNumber}A`), status: 'available', cabinClass }),
    Seat.create({ seatNumber: SeatNumber.create(`${rowNumber}B`), status: 'available', cabinClass }),
  ],
});

const makeRow = (rowNumber: number, isExitRow = false): CabinRow => ({
  rowNumber,
  isExitRow,
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
  it('inserts a cabin_divider between rows of different cabin classes', () => {
    const rows = [
      makeRowWithCabin(1, 'F'),
      makeRowWithCabin(2, 'J'),  // transition F→J
      makeRowWithCabin(3, 'J'),
    ];
    const { container } = render(<CabinDeck rows={rows} onSeatSelect={vi.fn()} />);
    const dividers = container.querySelectorAll('.cabin_divider');
    expect(dividers).toHaveLength(1);
  });
  it('inserts dividers at both F→J and J→Y transitions', () => {
    const rows = [
      makeRowWithCabin(1, 'F'),
      makeRowWithCabin(2, 'J'),
      makeRowWithCabin(3, 'J'),
      makeRowWithCabin(4, 'Y'),
    ];
    const { container } = render(<CabinDeck rows={rows} onSeatSelect={vi.fn()} />);
    expect(container.querySelectorAll('.cabin_divider')).toHaveLength(2);
  });
  it('shows cabin label in the divider', () => {
    const rows = [makeRowWithCabin(1, 'F'), makeRowWithCabin(2, 'J')];
    const { container } = render(<CabinDeck rows={rows} onSeatSelect={vi.fn()} />);
    const divider = container.querySelector('.cabin_divider');
    expect(divider?.textContent).toMatch(/business/i);
  });
  it('inserts no divider when all rows have the same cabin class', () => {
    const rows = [makeRowWithCabin(1, 'Y'), makeRowWithCabin(2, 'Y'), makeRowWithCabin(3, 'Y')];
    const { container } = render(<CabinDeck rows={rows} onSeatSelect={vi.fn()} />);
    expect(container.querySelectorAll('.cabin_divider')).toHaveLength(0);
  });
});
