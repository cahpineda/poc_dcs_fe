import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { SeatColumnHeaders } from '../SeatColumnHeaders';

describe('SeatColumnHeaders', () => {
  it('renders a label per column', () => {
    const { container } = render(<SeatColumnHeaders columns={['A', 'B', 'C']} />);
    const labels = container.querySelectorAll('.column_label');
    expect(labels).toHaveLength(3);
  });

  it('container has class seat_column_headers', () => {
    const { container } = render(<SeatColumnHeaders columns={['A', 'B', 'C']} />);
    expect(container.querySelector('.seat_column_headers')).not.toBeNull();
  });

  it('renders null when columns is empty', () => {
    const { container } = render(<SeatColumnHeaders columns={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it('preserves column order', () => {
    const { container } = render(<SeatColumnHeaders columns={['F', 'A', 'C']} />);
    const labels = container.querySelectorAll('.column_label');
    expect(labels[0].textContent).toBe('F');
    expect(labels[1].textContent).toBe('A');
    expect(labels[2].textContent).toBe('C');
  });
});
