import type { Seat } from '@/domain/seat/Seat';

export interface PassengerDetailDrawerProps {
  seat: Seat | null;
  onClose: () => void;
  onReseat: (seat: Seat) => void;
  onBlock: (seat: Seat) => void;
  onUnblock: (seat: Seat) => void;
  onUnassign: (seat: Seat) => void;
  onSwap?: (seat: Seat) => void;
  blockPending?: boolean;
  unblockPending?: boolean;
  unassignPending?: boolean;
}

const STATUS_LABEL: Record<string, string> = {
  occupied: 'Occupied',
  exit_row_occupied: 'Exit Row Occupied',
  checked_in: 'Checked In',
  boarded: 'Boarded',
  blocked: 'Blocked',
  infant_occupied: 'Infant Occupied',
};

const BLOCKABLE = new Set(['occupied', 'exit_row_occupied', 'checked_in', 'boarded', 'infant_occupied']);

export function PassengerDetailDrawer({
  seat,
  onClose,
  onReseat,
  onBlock,
  onUnblock,
  onUnassign,
  onSwap,
  blockPending,
  unblockPending,
  unassignPending,
}: PassengerDetailDrawerProps) {
  if (!seat) return null;

  const statusLabel = STATUS_LABEL[seat.status] ?? seat.status;
  const showBlock = BLOCKABLE.has(seat.status);
  const showUnblock = seat.status === 'blocked';
  const showReseat = BLOCKABLE.has(seat.status);
  const anyPending = Boolean(blockPending || unblockPending);

  return (
    <aside className="passenger_drawer" role="complementary" aria-label="Passenger details">
      <header className="passenger_drawer__header">
        <h3 className="passenger_drawer__title">{seat.passengerName ?? '—'}</h3>
        <button
          type="button"
          className="passenger_drawer__close"
          aria-label="Close drawer"
          onClick={onClose}
        >
          ×
        </button>
      </header>
      <dl className="passenger_drawer__meta">
        <dt>Seat</dt>
        <dd>{seat.number.toString()}</dd>
        <dt>Status</dt>
        <dd>{statusLabel}</dd>
        {seat.boardingGroup !== null && (
          <>
            <dt>Boarding Group</dt>
            <dd>{seat.boardingGroup}</dd>
          </>
        )}
        {seat.pnr && (
          <>
            <dt>PNR</dt>
            <dd>{seat.pnr}</dd>
          </>
        )}
        {seat.ssrs && seat.ssrs.length > 0 && (
          <>
            <dt>SSRs</dt>
            <dd>{seat.ssrs.join(', ')}</dd>
          </>
        )}
        {seat.rushStatus && (
          <>
            <dt>Rush</dt>
            <dd className="passenger_drawer__rush">RUSH</dd>
          </>
        )}
      </dl>
      <div className="passenger_drawer__actions">
        {showReseat && (
          <button
            type="button"
            onClick={() => onReseat(seat)}
            disabled={anyPending}
            className={`drawer_action_btn${anyPending ? ' drawer_action_pending' : ''}`}
          >
            Reseat
          </button>
        )}
        {showReseat && onSwap && (
          <button
            type="button"
            onClick={() => onSwap(seat)}
            disabled={anyPending}
            className="drawer_action_btn"
          >
            Swap
          </button>
        )}
        {showBlock && (
          <button
            type="button"
            onClick={() => onBlock(seat)}
            disabled={Boolean(blockPending)}
            className={`drawer_action_btn${blockPending ? ' drawer_action_pending' : ''}`}
          >
            Block seat
          </button>
        )}
        {showBlock && (
          <button
            type="button"
            onClick={() => onUnassign(seat)}
            disabled={Boolean(unassignPending)}
            className={`drawer_action_btn${unassignPending ? ' drawer_action_pending' : ''}`}
          >
            Unseat
          </button>
        )}
        {showUnblock && (
          <button
            type="button"
            onClick={() => onUnblock(seat)}
            disabled={Boolean(unblockPending)}
            className={`drawer_action_btn${unblockPending ? ' drawer_action_pending' : ''}`}
          >
            Unblock seat
          </button>
        )}
      </div>
    </aside>
  );
}
