import type { Seat } from '@/domain/seat/Seat';

export interface PassengerDetailDrawerProps {
  seat: Seat | null;
  onClose: () => void;
  onReseat: (seat: Seat) => void;
  onBlock: (seat: Seat) => void;
  onUnblock: (seat: Seat) => void;
  blockPending?: boolean;
  unblockPending?: boolean;
}

const STATUS_LABEL: Record<string, string> = {
  occupied: 'Occupied',
  checked_in: 'Checked-in',
  boarded: 'Boarded',
  blocked: 'Blocked',
};

const BLOCKABLE = new Set(['occupied', 'checked_in', 'boarded']);

export function PassengerDetailDrawer({
  seat,
  onClose,
  onReseat,
  onBlock,
  onUnblock,
  blockPending,
  unblockPending,
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
      </dl>
      <div className="passenger_drawer__actions">
        {showReseat && (
          <button
            type="button"
            onClick={() => onReseat(seat)}
            disabled={anyPending}
            className={anyPending ? 'drawer_action_pending' : undefined}
          >
            Reseat
          </button>
        )}
        {showBlock && (
          <button
            type="button"
            onClick={() => onBlock(seat)}
            disabled={Boolean(blockPending)}
            className={blockPending ? 'drawer_action_pending' : undefined}
          >
            Block seat
          </button>
        )}
        {showUnblock && (
          <button
            type="button"
            onClick={() => onUnblock(seat)}
            disabled={Boolean(unblockPending)}
            className={unblockPending ? 'drawer_action_pending' : undefined}
          >
            Unblock seat
          </button>
        )}
      </div>
    </aside>
  );
}
