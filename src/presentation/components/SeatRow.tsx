import type { CabinRow } from '@/domain/seat/CabinRow';
import { SeatCell } from './SeatCell';

interface SeatRowProps {
  row: CabinRow;
  selectedSeat?: string;
  reseatMode?: boolean;
  onSeatSelect: (seatNumber: string) => void;
}

export function SeatRow({ row, selectedSeat, reseatMode = false, onSeatSelect }: SeatRowProps) {
  const className = ['cabin_row', row.isExitRow ? 'exit_row' : ''].filter(Boolean).join(' ');

  return (
    <div className={className}>
      <span className="row_number">{row.rowNumber}</span>
      {row.seats.map((seat) => (
        <SeatCell
          key={seat.number.toString()}
          seatNumber={seat.number.toString()}
          status={seat.status}
          isExitRow={seat.isExitRow()}
          isSelected={seat.number.toString() === selectedSeat}
          passengerInitials={seat.passengerInitials}
          hasInfant={seat.hasInfant}
          blockNote={seat.blockNote ?? undefined}
          gender={seat.gender}
          reseatMode={reseatMode}
          ssrs={seat.ssrs}
          rushStatus={seat.rushStatus}
          onSelect={onSeatSelect}
        />
      ))}
    </div>
  );
}
