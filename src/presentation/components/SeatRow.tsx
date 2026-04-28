import type { CabinRow } from '@/domain/seat/CabinRow';
import { matchesFilters } from '@/domain/seat/SeatFilter';
import type { SeatFilterId } from '@/domain/seat/SeatFilter';
import { SeatCell, AisleGap } from './SeatCell';

interface SeatRowProps {
  row: CabinRow;
  selectedSeat?: string;
  reseatMode?: boolean;
  activePassengerSeat?: string | null;
  activeFilters?: ReadonlySet<SeatFilterId>;
  onSeatSelect: (seatNumber: string) => void;
}

// Cloud2 layout: 6-seat rows have an aisle gap between column index 2 (C) and 3 (D)
const AISLE_AFTER_INDEX = 2;

export function SeatRow({ row, selectedSeat, reseatMode = false, activePassengerSeat, activeFilters, onSeatSelect }: SeatRowProps) {
  const filters = activeFilters ?? new Set<SeatFilterId>();
  const className = ['cabin_row', row.isExitRow ? 'exit_row' : ''].filter(Boolean).join(' ');

  return (
    <div className={className}>
      <span className="row_number row_number_left">{row.rowNumber}</span>
      {row.seats.map((seat, idx) => (
        <>
          <SeatCell
            key={seat.number.toString()}
            seatNumber={seat.number.toString()}
            status={seat.status}
            isExitRow={seat.isExitRow()}
            isSelected={seat.number.toString() === selectedSeat}

            hasInfant={seat.hasInfant}
            blockNote={seat.blockNote ?? undefined}
            gender={seat.gender}
            reseatMode={reseatMode}
            isActivePassenger={seat.number.toString() === activePassengerSeat}
            isDimmed={!matchesFilters(seat, filters)}
            ssrs={seat.ssrs}
            rushStatus={seat.rushStatus}
            onSelect={onSeatSelect}
          />
          {idx === AISLE_AFTER_INDEX && row.seats.length === 6 && (
            <AisleGap key="aisle" />
          )}
        </>
      ))}
      <span className="row_number row_number_right">{row.rowNumber}</span>
    </div>
  );
}
