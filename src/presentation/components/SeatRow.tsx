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

  const sideMarkerClass = row.isExitRow
    ? 'wing_exit_marker'
    : row.isWingZone
      ? 'wing_zone_block'
      : 'wing_exit_placeholder';

  const firstSeatNum = row.seats[0]?.number.toString() ?? '';
  const lastSeatNum  = row.seats[row.seats.length - 1]?.number.toString() ?? '';
  const hasLeftWindow  = /A$/.test(firstSeatNum);
  const hasRightWindow = /F$/.test(lastSeatNum);

  return (
    <div className={className}>
      <span className={sideMarkerClass} aria-hidden="true" />
      <span className="row_number row_number_left">{row.rowNumber}</span>
      {hasLeftWindow && (
        <img className="row_window_icon" src="/window.svg" alt="" aria-hidden="true" />
      )}
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
      {hasRightWindow && (
        <img className="row_window_icon" src="/window.svg" alt="" aria-hidden="true" />
      )}
      <span className="row_number row_number_right">{row.rowNumber}</span>
      <span className={sideMarkerClass} aria-hidden="true" />
    </div>
  );
}
