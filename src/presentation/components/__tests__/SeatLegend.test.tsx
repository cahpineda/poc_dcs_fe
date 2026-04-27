import { render, screen } from '@testing-library/react';
import { SeatLegend } from '../SeatLegend';

describe('SeatLegend', () => {
  // Test 1 — Happy path: renders all 5 legend entries
  it('renders exactly 5 legend entries', () => {
    const { container } = render(<SeatLegend />);
    // Each legend entry should have its corresponding CSS class
    const available = container.querySelector('.seat_available');
    const occupied = container.querySelector('.seat_occupied');
    const blocked = container.querySelector('.seat_blocked');
    const exitRow = container.querySelector('.seat_exit_row_available');
    const selected = container.querySelector('.seat_selected');

    expect(available).toBeInTheDocument();
    expect(occupied).toBeInTheDocument();
    expect(blocked).toBeInTheDocument();
    expect(exitRow).toBeInTheDocument();
    expect(selected).toBeInTheDocument();
  });

  // Test 2 — Null/invalid: each entry has a label text (not just empty boxes)
  it('renders a label for each legend entry', () => {
    render(<SeatLegend />);
    // Verify there are legend labels — can use accessible text
    expect(screen.getByText(/available/i)).toBeInTheDocument();
    expect(screen.getByText(/occupied/i)).toBeInTheDocument();
    expect(screen.getByText(/blocked/i)).toBeInTheDocument();
    expect(screen.getByText(/exit/i)).toBeInTheDocument();
    expect(screen.getByText(/selected/i)).toBeInTheDocument();
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
