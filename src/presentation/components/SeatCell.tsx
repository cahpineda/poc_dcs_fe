import type { SeatStatus } from '@/domain/seat/SeatStatus';

const STATUS_CLASS: Record<SeatStatus, string> = {
  available: 'seat_available',
  occupied: 'seat_occupied',
  blocked: 'seat_blocked',
  exit_row_available: 'seat_exit_row_available',
  exit_row_occupied: 'seat_exit_row_occupied',
  unavailable: 'seat_unavailable',
  infant_occupied: 'seat_infant_occupied',
};

const CLICKABLE_STATUSES = new Set<SeatStatus>(['available', 'exit_row_available']);

export interface SeatCellProps {
  seatNumber: string;
  status: SeatStatus;
  isExitRow?: boolean;
  isSelected?: boolean;
  price?: number;
  onSelect: (seatNumber: string) => void;
}

export function SeatCell({
  seatNumber,
  status,
  isExitRow = false,
  isSelected = false,
  price,
  onSelect,
}: SeatCellProps) {
  const classes = [
    'seat_cell',
    STATUS_CLASS[status],
    isExitRow ? 'seat_exit' : '',
    isSelected ? 'seat_selected' : '',
  ]
    .filter(Boolean)
    .join(' ');

  const handleClick = () => {
    if (CLICKABLE_STATUSES.has(status)) {
      onSelect(seatNumber);
    }
  };

  return (
    <button className={classes} onClick={handleClick} type="button">
      {seatNumber}
      {price !== undefined && <span className="seat_price">{price}</span>}
    </button>
  );
}

export function AisleGap() {
  return <div className="aisle_gap" aria-hidden />;
}
