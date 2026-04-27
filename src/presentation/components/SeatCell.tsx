import type { SeatStatus } from '@/domain/seat/SeatStatus';

// SeatStatus exhaustiveness: adding to the SeatStatus union MUST add an entry here (TS enforces it)
const STATUS_CLASS: Record<SeatStatus, string> = {
  available: 'seat_available',
  occupied: 'seat_occupied',
  blocked: 'seat_blocked',
  exit_row_available: 'seat_exit_row_available',
  exit_row_occupied: 'seat_exit_row_occupied',
  unavailable: 'seat_unavailable',
  infant_occupied: 'seat_infant_occupied',
  checked_in: 'seat_checked_in',
  boarded: 'seat_boarded',
};

const NORMAL_CLICKABLE = new Set<SeatStatus>([
  'available',
  'exit_row_available',
  'occupied',
  'exit_row_occupied',
  'checked_in',
  'boarded',
  'blocked',
]);

const RESEAT_MODE_CLICKABLE = new Set<SeatStatus>([
  'available',
  'exit_row_available',
]);

const PASSENGER_STATUSES = new Set<SeatStatus>([
  'occupied',
  'exit_row_occupied',
  'infant_occupied',
  'checked_in',
  'boarded',
]);

type Gender = 'M' | 'F' | 'U';

const GENDER_CLASS: Record<Gender, string> = {
  M: 'seat_gender_male',
  F: 'seat_gender_female',
  U: 'seat_gender_unaccompanied',
};

export interface SeatCellProps {
  seatNumber: string;
  status: SeatStatus;
  isExitRow?: boolean;
  isSelected?: boolean;
  price?: number;
  passengerInitials?: string | null;
  hasInfant?: boolean;
  blockNote?: string;
  gender?: Gender | null;
  reseatMode?: boolean;
  onSelect: (seatNumber: string) => void;
}

export function SeatCell({
  seatNumber,
  status,
  isExitRow = false,
  isSelected = false,
  price,
  passengerInitials,
  hasInfant,
  blockNote,
  gender,
  reseatMode = false,
  onSelect,
}: SeatCellProps) {
  const clickableSet = reseatMode ? RESEAT_MODE_CLICKABLE : NORMAL_CLICKABLE;
  const isClickable = clickableSet.has(status);
  const dimmed = reseatMode && !isClickable && status !== 'unavailable';

  const classes = [
    'seat_cell',
    STATUS_CLASS[status],
    isExitRow ? 'seat_exit' : '',
    isSelected ? 'seat_selected' : '',
    dimmed ? 'seat_cell_dimmed' : '',
  ]
    .filter(Boolean)
    .join(' ');

  const handleClick = () => {
    if (isClickable) {
      onSelect(seatNumber);
    }
  };

  const showInitials = passengerInitials && PASSENGER_STATUSES.has(status);

  return (
    <button className={classes} onClick={handleClick} type="button">
      {gender && (
        <span
          className={`seat_gender_badge ${GENDER_CLASS[gender]}`}
          aria-hidden="true"
        />
      )}
      {showInitials ? passengerInitials : seatNumber}
      {price !== undefined && <span className="seat_price">{price}</span>}
      {hasInfant && <span className="seat_infant_indicator" aria-label="infant" />}
      {blockNote && <span className="seat_block_indicator" title={blockNote} aria-label="blocked" />}
    </button>
  );
}

export function AisleGap() {
  return <div className="aisle_gap" aria-hidden />;
}
