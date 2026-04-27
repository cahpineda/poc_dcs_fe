import { render, screen } from '@testing-library/react';
import { SeatLegend } from '../SeatLegend';

describe('SeatLegend', () => {
  // Test 1 — Happy path: renders all 10 legend entries
  it('renders exactly 10 legend entries', () => {
    const { container } = render(<SeatLegend />);
    const available        = container.querySelector('.seat_available');
    const occupied         = container.querySelector('.seat_occupied');
    const checkedIn        = container.querySelector('.seat_checked_in');
    const boarded          = container.querySelector('.seat_boarded');
    const blocked          = container.querySelector('.seat_blocked');
    const exitAvailable    = container.querySelector('.seat_exit_row_available');
    const exitOccupied     = container.querySelector('.seat_exit_row_occupied');
    const infantOccupied   = container.querySelector('.seat_infant_occupied');
    const unavailable      = container.querySelector('.seat_unavailable');
    const selected         = container.querySelector('.seat_selected');

    expect(available).toBeInTheDocument();
    expect(occupied).toBeInTheDocument();
    expect(checkedIn).toBeInTheDocument();
    expect(boarded).toBeInTheDocument();
    expect(blocked).toBeInTheDocument();
    expect(exitAvailable).toBeInTheDocument();
    expect(exitOccupied).toBeInTheDocument();
    expect(infantOccupied).toBeInTheDocument();
    expect(unavailable).toBeInTheDocument();
    expect(selected).toBeInTheDocument();
  });

  // Test 2 — Null/invalid: each entry has a label text (not just empty boxes)
  it('renders a label for each legend entry', () => {
    render(<SeatLegend />);
    expect(screen.getByText('Available')).toBeInTheDocument();
    expect(screen.getByText('Occupied')).toBeInTheDocument();
    expect(screen.getByText('Checked-in')).toBeInTheDocument();
    expect(screen.getByText('Boarded')).toBeInTheDocument();
    expect(screen.getByText('Blocked')).toBeInTheDocument();
    expect(screen.getByText('Exit Row Available')).toBeInTheDocument();
    expect(screen.getByText('Exit Row Occupied')).toBeInTheDocument();
    expect(screen.getByText('Infant Occupied')).toBeInTheDocument();
    expect(screen.getByText('Unavailable')).toBeInTheDocument();
    expect(screen.getByText('Selected')).toBeInTheDocument();
  });

  // Test 3 — Error/boundary: component renders without crashing (no props required)
  it('renders without required props (no props interface)', () => {
    expect(() => render(<SeatLegend />)).not.toThrow();
  });

  // Test 4 — Renders inside a list container
  it('renders a legend container element', () => {
    const { container } = render(<SeatLegend />);
    expect(container.firstChild).toBeInTheDocument();
  });
});
