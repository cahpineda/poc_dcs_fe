import type { ReactNode } from 'react';
import type { CabinRow } from '@/domain/seat/CabinRow';
import type { SeatFilterId } from '@/domain/seat/SeatFilter';
import { SeatRow } from './SeatRow';
import { SeatColumnHeaders } from './SeatColumnHeaders';

interface CabinDeckProps {
  rows: CabinRow[];
  selectedSeat?: string;
  reseatMode?: boolean;
  activePassengerSeat?: string | null;
  activeFilters?: ReadonlySet<SeatFilterId>;
  onSeatSelect: (seatNumber: string) => void;
}

const CABIN_LABELS: Record<string, string> = {
  F: 'First Class',
  J: 'Business Class',
  Y: 'Economy',
};

function CabinDivider({ label }: { label: string }) {
  return (
    <div className="cabin_divider">
      <span>{label}</span>
    </div>
  );
}

export function CabinDeck({ rows, selectedSeat, reseatMode = false, activePassengerSeat, activeFilters, onSeatSelect }: CabinDeckProps) {
  const columns = rows[0]?.seats.map((seat) => seat.number.rawValue.slice(-1)) ?? [];

  const elements: ReactNode[] = [];
  let prevCabin: string | null = null;

  for (const row of rows) {
    const rowCabin = row.seats[0]?.cabin ?? '';
    if (prevCabin !== null && rowCabin !== prevCabin) {
      elements.push(
        <CabinDivider key={`divider-${row.rowNumber}`} label={CABIN_LABELS[rowCabin] ?? rowCabin} />
      );
    }
    elements.push(
      <SeatRow
        key={row.rowNumber}
        row={row}
        selectedSeat={selectedSeat}
        reseatMode={reseatMode}
        activePassengerSeat={activePassengerSeat}
        activeFilters={activeFilters}
        onSeatSelect={onSeatSelect}
      />
    );
    prevCabin = rowCabin;
  }

  return (
    <div className="seat_map_container">
      <SeatColumnHeaders columns={columns} />
      {elements}
    </div>
  );
}
