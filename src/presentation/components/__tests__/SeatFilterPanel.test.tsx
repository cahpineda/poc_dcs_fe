import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SeatFilterPanel } from '../SeatFilterPanel';
import { SEAT_FILTER_IDS, SEAT_FILTER_LABELS } from '@/domain/seat/SeatFilter';
import type { SeatFilterId } from '@/domain/seat/SeatFilter';

describe('SeatFilterPanel', () => {
  it('renders a heading titled "SEAT FILTERS"', () => {
    render(<SeatFilterPanel activeFilters={new Set()} onToggle={vi.fn()} />);
    expect(screen.getByRole('heading', { name: /SEAT FILTERS/i })).toBeInTheDocument();
  });

  it('renders 11 checkboxes — one per filter id with correct labels', () => {
    render(<SeatFilterPanel activeFilters={new Set()} onToggle={vi.fn()} />);
    for (const id of SEAT_FILTER_IDS) {
      expect(screen.getByLabelText(SEAT_FILTER_LABELS[id])).toBeInTheDocument();
    }
    expect(screen.getAllByRole('checkbox')).toHaveLength(11);
  });

  it('toggling a checkbox calls onToggle with the filter id and new checked state', async () => {
    const onToggle = vi.fn();
    render(<SeatFilterPanel activeFilters={new Set()} onToggle={onToggle} />);
    await userEvent.click(screen.getByLabelText(SEAT_FILTER_LABELS.usb_power));
    expect(onToggle).toHaveBeenCalledWith('usb_power', true);
  });

  it('activeFilters prop controls the checked state of each checkbox', () => {
    const active: ReadonlySet<SeatFilterId> = new Set(['bulkhead', 'no_smoke']);
    render(<SeatFilterPanel activeFilters={active} onToggle={vi.fn()} />);
    expect(screen.getByLabelText(SEAT_FILTER_LABELS.bulkhead)).toBeChecked();
    expect(screen.getByLabelText(SEAT_FILTER_LABELS.no_smoke)).toBeChecked();
    expect(screen.getByLabelText(SEAT_FILTER_LABELS.usb_power)).not.toBeChecked();
  });

  it('unchecking a checked filter calls onToggle with false', async () => {
    const onToggle = vi.fn();
    const active: ReadonlySet<SeatFilterId> = new Set(['galley_proximity']);
    render(<SeatFilterPanel activeFilters={active} onToggle={onToggle} />);
    await userEvent.click(screen.getByLabelText(SEAT_FILTER_LABELS.galley_proximity));
    expect(onToggle).toHaveBeenCalledWith('galley_proximity', false);
  });

  it('checkboxes are accessible via label-wraps-input pattern', () => {
    const { container } = render(<SeatFilterPanel activeFilters={new Set()} onToggle={vi.fn()} />);
    const labels = container.querySelectorAll('label');
    expect(labels.length).toBe(11);
    labels.forEach((label) => {
      expect(label.querySelector('input[type="checkbox"]')).not.toBeNull();
    });
  });
});
