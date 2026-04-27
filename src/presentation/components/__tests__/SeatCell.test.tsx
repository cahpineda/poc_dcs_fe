import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SeatCell, AisleGap } from '../SeatCell';

describe('SeatCell', () => {
  // Test 1 — Happy path: available seat renders correct class and fires onSelect
  it('renders button with seat_available class and calls onSelect when clicked', async () => {
    const onSelect = vi.fn();
    render(<SeatCell seatNumber="12A" status="available" onSelect={onSelect} />);
    const btn = screen.getByRole('button');
    expect(btn).toHaveClass('seat_available');
    expect(btn).toHaveTextContent('12A');
    await userEvent.click(btn);
    expect(onSelect).toHaveBeenCalledWith('12A');
  });

  // Test 2 — Null/invalid: occupied seat does NOT fire onSelect
  it('renders occupied seat and does not call onSelect when clicked', async () => {
    const onSelect = vi.fn();
    render(<SeatCell seatNumber="12A" status="occupied" onSelect={onSelect} />);
    const btn = screen.getByRole('button');
    expect(btn).toHaveClass('seat_occupied');
    await userEvent.click(btn);
    expect(onSelect).not.toHaveBeenCalled();
  });

  // Test 3 — Error/boundary: exit_row_available seat has both seat_available and seat_exit classes
  it('renders exit row available seat with seat_exit class alongside status class', () => {
    const onSelect = vi.fn();
    render(
      <SeatCell seatNumber="14F" status="exit_row_available" isExitRow onSelect={onSelect} />
    );
    const btn = screen.getByRole('button');
    expect(btn).toHaveClass('seat_exit_row_available');
    expect(btn).toHaveClass('seat_exit');
  });

  // Test 4 — All other statuses apply correct class names
  it.each([
    ['blocked', 'seat_blocked'],
    ['exit_row_occupied', 'seat_exit_row_occupied'],
    ['unavailable', 'seat_unavailable'],
    ['infant_occupied', 'seat_infant_occupied'],
  ] as const)('renders status "%s" with class "%s"', (status, expectedClass) => {
    render(<SeatCell seatNumber="1A" status={status} onSelect={vi.fn()} />);
    expect(screen.getByRole('button')).toHaveClass(expectedClass);
  });

  // Test 5 — isSelected adds seat_selected class
  it('adds seat_selected class when isSelected=true', () => {
    render(<SeatCell seatNumber="3C" status="available" isSelected onSelect={vi.fn()} />);
    expect(screen.getByRole('button')).toHaveClass('seat_selected');
  });

  // Test 6 — price badge renders when provided
  it('renders price badge when price is provided', () => {
    render(<SeatCell seatNumber="5D" status="available" price={29} onSelect={vi.fn()} />);
    expect(screen.getByText('29')).toBeInTheDocument();
  });

  // Test 7 — base class seat_cell always present
  it('always has base seat_cell class', () => {
    render(<SeatCell seatNumber="7A" status="blocked" onSelect={vi.fn()} />);
    expect(screen.getByRole('button')).toHaveClass('seat_cell');
  });
});

describe('AisleGap', () => {
  // Test 1 — Happy path: renders with aisle_gap class
  it('renders div with aisle_gap class', () => {
    const { container } = render(<AisleGap />);
    const div = container.querySelector('.aisle_gap');
    expect(div).toBeInTheDocument();
  });

  // Test 2 — No interactive elements
  it('has no interactive elements', () => {
    render(<AisleGap />);
    expect(screen.queryByRole('button')).toBeNull();
    expect(screen.queryByRole('link')).toBeNull();
  });

  // Test 3 — aria-hidden for accessibility
  it('is aria-hidden', () => {
    const { container } = render(<AisleGap />);
    const div = container.querySelector('.aisle_gap');
    expect(div).toHaveAttribute('aria-hidden');
  });
});
