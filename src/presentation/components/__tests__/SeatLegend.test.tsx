import { render, screen } from '@testing-library/react';
import { SeatLegend } from '../SeatLegend';

describe('SeatLegend', () => {
  // Test 1 — Happy path: renders status swatches and overlay indicators
  it('renders all seat status swatches and overlay indicator elements', () => {
    const { container } = render(<SeatLegend />);
    expect(container.querySelector('.seat_available')).toBeInTheDocument();
    expect(container.querySelector('.seat_occupied')).toBeInTheDocument();
    expect(container.querySelector('.seat_checked_in')).toBeInTheDocument();
    expect(container.querySelector('.seat_boarded')).toBeInTheDocument();
    expect(container.querySelector('.seat_blocked')).toBeInTheDocument();
    expect(container.querySelector('.seat_exit_row_available')).toBeInTheDocument();
    expect(container.querySelector('.seat_infant_occupied')).toBeInTheDocument();
    expect(container.querySelector('.seat_unavailable')).toBeInTheDocument();
    expect(container.querySelector('.seat_gender_male')).toBeInTheDocument();
    expect(container.querySelector('.seat_gender_female')).toBeInTheDocument();
    expect(container.querySelector('.seat_gender_unaccompanied')).toBeInTheDocument();
    expect(container.querySelector('.legend_wchr_badge')).toBeInTheDocument();
    expect(container.querySelector('.seat_exit_row_occupied')).not.toBeInTheDocument();
    expect(container.querySelector('.seat_selected')).not.toBeInTheDocument();
  });

  // Test 2 — each entry has a label text
  it('renders a label for each legend entry', () => {
    render(<SeatLegend />);
    expect(screen.getByText('Available')).toBeInTheDocument();
    expect(screen.getByText('Occupied')).toBeInTheDocument();
    expect(screen.getByText('Checked In')).toBeInTheDocument();
    expect(screen.getByText('Boarded')).toBeInTheDocument();
    expect(screen.getByText('Blocked')).toBeInTheDocument();
    expect(screen.getByText('Exit Row Avail.')).toBeInTheDocument();
    expect(screen.queryByText('Exit Row Occ.')).not.toBeInTheDocument();
    expect(screen.getByText('Infant')).toBeInTheDocument();
    expect(screen.getByText('Unavailable')).toBeInTheDocument();
    expect(screen.getByText('Male')).toBeInTheDocument();
    expect(screen.getByText('Female')).toBeInTheDocument();
    expect(screen.getByText('Unaccompanied')).toBeInTheDocument();
    expect(screen.getByText('Wheelchair (WCHR)')).toBeInTheDocument();
    expect(screen.queryByText('Selected')).not.toBeInTheDocument();
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
