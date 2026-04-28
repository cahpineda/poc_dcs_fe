import type { SeatStatus } from '@/domain/seat/SeatStatus';

const SILHOUETTE: Record<string, string> = {
  M: '/silhouettes/sil_male.png',
  F: '/silhouettes/sil_female.png',
  U: '/silhouettes/sil_male.png',
};
const SILHOUETTE_INFANT = '/silhouettes/sil_infant.png';

const FILTER_DIMMABLE = new Set<SeatStatus>(['available', 'exit_row_available']);

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
  hasInfant?: boolean;
  blockNote?: string;
  gender?: Gender | null;
  reseatMode?: boolean;
  isActivePassenger?: boolean;
  isDimmed?: boolean;
  ssrs?: string[];
  rushStatus?: boolean;
  onSelect: (seatNumber: string) => void;
}

export function SeatCell({
  seatNumber,
  status,
  isExitRow = false,
  isSelected = false,
  price,
  hasInfant,
  blockNote,
  gender,
  reseatMode = false,
  isActivePassenger = false,
  isDimmed = false,
  ssrs,
  rushStatus = false,
  onSelect,
}: SeatCellProps) {
  const clickableSet = reseatMode ? RESEAT_MODE_CLICKABLE : NORMAL_CLICKABLE;
  const isClickable = clickableSet.has(status);
  const dimmed = (reseatMode && !isClickable && status !== 'unavailable') || (isDimmed && FILTER_DIMMABLE.has(status));
  const isSideSeat = /[AF]$/.test(seatNumber);
  const showWchr = ssrs?.includes('WCHR') ?? false;
  const showSilhouette = PASSENGER_STATUSES.has(status);
  const silhouetteSrc = showSilhouette
    ? hasInfant
      ? SILHOUETTE_INFANT
      : SILHOUETTE[gender ?? 'M']
    : null;

  const classes = [
    'seat_cell',
    STATUS_CLASS[status],
    isExitRow ? 'seat_exit' : '',
    isSelected ? 'seat_selected' : '',
    dimmed ? 'seat_cell_dimmed' : '',
    isSideSeat ? 'seat_cell_side' : '',
    rushStatus ? 'seat_rush' : '',
    isActivePassenger ? 'seat_cell_active_passenger' : '',
  ]
    .filter(Boolean)
    .join(' ');

  const handleClick = () => {
    if (isClickable) {
      onSelect(seatNumber);
    }
  };

  return (
    <button className={classes} onClick={handleClick} type="button" aria-label={seatNumber}>
      {gender && (
        <span
          className={`seat_gender_badge ${GENDER_CLASS[gender]}`}
          aria-hidden="true"
        />
      )}
      {silhouetteSrc
        ? <img className="seat_silhouette" src={silhouetteSrc} alt="" aria-hidden="true" />
        : seatNumber
      }
      {price !== undefined && <span className="seat_price">{price}</span>}
      {hasInfant && <span className="seat_infant_indicator" aria-label="infant" />}
      {blockNote && <span className="seat_block_indicator" title={blockNote} aria-label="blocked" />}
      {showWchr && <span className="seat_ssr_wchr" aria-label="wheelchair" />}
    </button>
  );
}

export function AisleGap() {
  return <div className="aisle_gap" aria-hidden />;
}
