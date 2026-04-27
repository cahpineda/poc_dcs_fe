import type { CabinRow } from '@/domain/seat/CabinRow';
import { SeatRow } from './SeatRow';
import { SeatColumnHeaders } from './SeatColumnHeaders';

interface CabinDeckProps {
  rows: CabinRow[];
  selectedSeat?: string;
  reseatMode?: boolean;
  onSeatSelect: (seatNumber: string) => void;
}

export function CabinDeck({ rows, selectedSeat, reseatMode = false, onSeatSelect }: CabinDeckProps) {
  const columns = rows[0]?.seats.map((seat) => seat.number.rawValue.slice(-1)) ?? [];
  return (
    <div className="seat_map_container">
      <SeatColumnHeaders columns={columns} />
      {rows.map((row) => (
        <SeatRow
          key={row.rowNumber}
          row={row}
          selectedSeat={selectedSeat}
          reseatMode={reseatMode}
          onSeatSelect={onSeatSelect}
        />
      ))}
    </div>
  );
}
