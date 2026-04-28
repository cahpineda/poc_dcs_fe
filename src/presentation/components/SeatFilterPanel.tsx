import { SEAT_FILTER_IDS, SEAT_FILTER_LABELS } from '@/domain/seat/SeatFilter';
import type { SeatFilterId } from '@/domain/seat/SeatFilter';

interface SeatFilterPanelProps {
  activeFilters: ReadonlySet<SeatFilterId>;
  onToggle: (id: SeatFilterId, isChecked: boolean) => void;
}

export function SeatFilterPanel({ activeFilters, onToggle }: SeatFilterPanelProps) {
  return (
    <section className="seat_filter_panel" aria-labelledby="seat-filters-heading">
      <h3 id="seat-filters-heading">SEAT FILTERS</h3>
      {SEAT_FILTER_IDS.map((id) => (
        <label key={id} className="seat_filter_checkbox">
          <input
            type="checkbox"
            checked={activeFilters.has(id)}
            onChange={(e) => onToggle(id, e.target.checked)}
          />
          <span>{SEAT_FILTER_LABELS[id]}</span>
        </label>
      ))}
    </section>
  );
}
