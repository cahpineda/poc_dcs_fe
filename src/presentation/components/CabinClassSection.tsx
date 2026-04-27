import type { CabinRow } from '@/domain/seat/CabinRow';
import { SeatRow } from './SeatRow';

interface CabinClassSectionProps {
  cabinClass: string;
  rows: CabinRow[];
  selectedSeat?: string;
  onSeatSelect: (seatNumber: string) => void;
}

export function CabinClassSection({ cabinClass, rows, selectedSeat, onSeatSelect }: CabinClassSectionProps) {
  return (
    <section className="cabin_class_section">
      <div className="cabin_class_label">{cabinClass}</div>
      {rows.map((row) => (
        <SeatRow
          key={row.rowNumber}
          row={row}
          selectedSeat={selectedSeat}
          onSeatSelect={onSeatSelect}
        />
      ))}
    </section>
  );
}
