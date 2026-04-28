import { useState, useEffect } from 'react';
import { useSeatPlan } from '@/presentation/hooks/useSeatPlan';
import { useSeatAssign } from '@/presentation/hooks/useSeatAssign';
import { useSeatBlock, useSeatUnblock } from '@/presentation/hooks/useSeatBlock';
import { useSeatReseat } from '@/presentation/hooks/useSeatReseat';
import { useSeatUnassign } from '@/presentation/hooks/useSeatUnassign';
import { useSeatSwap } from '@/presentation/hooks/useSeatSwap';
import { useSeatGroupReseat } from '@/presentation/hooks/useSeatGroupReseat';
import { autoAssignSeat } from '@/domain/seat/autoAssignSeat';
import type { SeatFilterId } from '@/domain/seat/SeatFilter';
import { AssignSeatCommand } from '@/domain/seat/commands/AssignSeatCommand';
import { BlockSeatCommand } from '@/domain/seat/commands/BlockSeatCommand';
import { UnblockSeatCommand } from '@/domain/seat/commands/UnblockSeatCommand';
import { ReseatPassengerCommand } from '@/domain/seat/commands/ReseatPassengerCommand';
import { UnassignSeatCommand } from '@/domain/seat/commands/UnassignSeatCommand';
import type { Seat } from '@/domain/seat/Seat';
import type { Passenger } from '@/domain/seat/Passenger';
import { SeatMap } from './SeatMap';
import { SeatLegend } from './SeatLegend';
import { PassengerDetailDrawer } from './PassengerDetailDrawer';
import { SeatNumberInput } from './SeatNumberInput';
import { PassengerList } from './PassengerList';
import { SeatFilterPanel } from './SeatFilterPanel';

interface SeatPlanTabProps {
  flightId: string;
}

const DRAWER_STATUSES = new Set(['occupied', 'exit_row_occupied', 'checked_in', 'boarded', 'blocked', 'infant_occupied']);

function resolvePassengerId(seat: Seat): string {
  return seat.passengerKey ?? 'PAX-' + seat.number.toString();
}

export function SeatPlanTab({ flightId }: SeatPlanTabProps) {
  const [selectedSeat, setSelectedSeat] = useState<string | undefined>();
  const [selectedSeatObj, setSelectedSeatObj] = useState<Seat | null>(null);
  const [reseatPassengerId, setReseatPassengerId] = useState<string | null>(null);
  const [reseatFromSeat, setReseatFromSeat] = useState<string | null>(null);
  const [reseatPassengerName, setReseatPassengerName] = useState<string | null>(null);
  const [groupReseatMode, setGroupReseatMode] = useState(false);
  const [activeFilters, setActiveFilters] = useState<ReadonlySet<SeatFilterId>>(new Set());
  const reseatMode = reseatPassengerId !== null;

  const { data: seatPlan, isLoading, error } = useSeatPlan(flightId);
  const assignMutation = useSeatAssign(flightId);
  const { mutate: blockMutate, isPending: blockPending } = useSeatBlock(flightId);
  const { mutate: unblockMutate, isPending: unblockPending } = useSeatUnblock(flightId);
  const reseatMutation = useSeatReseat(flightId);
  const unassignMutation = useSeatUnassign(flightId);
  const swapHook = useSeatSwap(flightId);
  const groupReseatHook = useSeatGroupReseat(flightId);
  const swapMode = swapHook.firstSeat !== null;

  // Wire Escape key to cancel reseat mode (E-008 parity fix)
  useEffect(() => {
    if (!reseatMode) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleCancelReseat();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reseatMode]);

  if (isLoading) return <div className="seat_plan_loading">Loading seat map…</div>;
  if (error) {
    const msg = (error as Error).message?.includes('404') || (error as Error).message?.includes('not found')
      ? `Flight ${flightId} not found`
      : `Failed to load seat map for flight ${flightId}`;
    return <div className="seat_plan_error">{msg}</div>;
  }
  if (!seatPlan) return null;

  function handleSeatSelect(seatNumber: string) {
    const seat = seatPlan!.getSeat(seatNumber);
    if (!seat) return;

    // Reseat mode takes precedence — only available seats are clickable here (SeatCell guards this too)
    if (reseatMode && reseatPassengerId && reseatFromSeat) {
      if (seat.status !== 'available' && seat.status !== 'exit_row_available') return;
      reseatMutation.mutate(
        ReseatPassengerCommand.create({
          passengerId: reseatPassengerId,
          fromSeat: reseatFromSeat,
          toSeat: seatNumber,
          flightId,
        }),
        {
          onSuccess: () => {
            setReseatPassengerId(null);
            setReseatFromSeat(null);
            setReseatPassengerName(null);
          },
        }
      );
      return;
    }

    // Normal flow: occupied-like → open drawer; available → assign
    if (DRAWER_STATUSES.has(seat.status)) {
      setSelectedSeatObj(seat);
      return;
    }

    setSelectedSeat(seatNumber);
    assignMutation.mutate(
      AssignSeatCommand.create({ passengerId: 'DEMO-PAX', seatNumber, flightId })
    );
  }

  function handleDrawerClose() {
    setSelectedSeatObj(null);
  }

  function handleReseat(seat: Seat) {
    if (!seat.passengerName) return;
    setReseatPassengerId(resolvePassengerId(seat));
    setReseatFromSeat(seat.number.toString());
    setReseatPassengerName(seat.passengerName);
    setSelectedSeatObj(null);
  }

  function handleBlock(seat: Seat) {
    blockMutate(BlockSeatCommand.create({ seatNumber: seat.number.toString(), flightId, reason: '' }));
    setSelectedSeatObj(null);
  }

  function handleUnblock(seat: Seat) {
    unblockMutate(UnblockSeatCommand.create({ seatNumber: seat.number.toString(), flightId }));
    setSelectedSeatObj(null);
  }

  function handleUnassign(seat: Seat) {
    unassignMutation.mutate(
      UnassignSeatCommand.create({ flightId, seatNumber: seat.number.toString() })
    );
    setSelectedSeatObj(null);
  }

  function handleCancelReseat() {
    setReseatPassengerId(null);
    setReseatFromSeat(null);
    setReseatPassengerName(null);
  }

  function handleSwap(seat: Seat) {
    swapHook.selectSeat(seat);
    setSelectedSeatObj(null);
  }

  function handleGroupReseat() {
    setGroupReseatMode(true);
  }

  function handleCancelGroupReseat() {
    setGroupReseatMode(false);
    groupReseatHook.cancel();
  }

  function handleJumpToSeat(seatNumber: string) {
    handleSeatSelect(seatNumber);
  }

  function handlePassengerSelect(passenger: Passenger) {
    const seat = seatPlan!.getSeat(passenger.currentSeatNumber);
    if (seat) setSelectedSeatObj(seat);
  }

  function handleMoveGroup() {
    groupReseatHook.confirm();
    setGroupReseatMode(false);
  }

  function handleAutoAssign() {
    const recommended = autoAssignSeat(seatPlan!);
    if (recommended) {
      setSelectedSeat(recommended);
      assignMutation.mutate(
        AssignSeatCommand.create({ passengerId: 'DEMO-PAX', seatNumber: recommended, flightId })
      );
    }
  }

  const handleFilterToggle = (id: SeatFilterId, checked: boolean) => {
    setActiveFilters((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id); else next.delete(id);
      return next;
    });
  };

  const passengers = seatPlan.derivePassengers();
  const activePassengerKey = reseatPassengerId;

  return (
    <div className="seat_plan_tab">
      {selectedSeatObj && <div className="passenger_drawer_backdrop" onClick={handleDrawerClose} />}
      {reseatMode && (
        <div className="reseat_mode_banner" role="status">
          <span>
            Reseat mode: select new seat for <strong>{reseatPassengerName}</strong>{' '}
            <span className="status_pill status_pill_unchecked">NOT CHECKEDIN</span>
          </span>
          <button type="button" onClick={handleCancelReseat}>Cancel</button>
        </div>
      )}
      {swapMode && (
        <div className="swap_mode_banner" role="status">
          <span>Swap mode: select second seat to swap</span>
          <button type="button" onClick={swapHook.cancel}>Cancel</button>
        </div>
      )}
      {groupReseatMode && (
        <div className="group_reseat_banner" role="status">
          <span>Group select: click passengers to add to group</span>
          <button type="button" onClick={handleMoveGroup}>Move group</button>
          <button type="button" onClick={handleCancelGroupReseat}>Cancel</button>
        </div>
      )}
      <div className="seat_plan_layout">
        <div className="seat_plan_sidebar">
          <PassengerList
            passengers={passengers}
            activePassengerKey={activePassengerKey}
            onSelect={handlePassengerSelect}
          />
          <SeatFilterPanel activeFilters={activeFilters} onToggle={handleFilterToggle} />
        </div>
        <div className="seat_plan_main">
          <div className="seat_map_chrome">
            <SeatNumberInput seatPlan={seatPlan} onJumpToSeat={handleJumpToSeat} />
            <button type="button" className="print_seat_plan_link" onClick={() => window.print()}>
              Print Seat Plan (Graphical Printers Only)
            </button>
          </div>
          <SeatMap
            seatPlan={seatPlan}
            selectedSeat={selectedSeat}
            reseatMode={reseatMode}
            reseatFromSeat={reseatFromSeat ?? undefined}
            activeFilters={activeFilters}
            onSeatSelect={handleSeatSelect}
          />
          <SeatLegend />
          <button
            className="auto_assign_btn"
            onClick={handleAutoAssign}
            disabled={assignMutation.isPending}
          >
            Auto-assign
          </button>
          <button
            className="group_reseat_btn"
            type="button"
            onClick={handleGroupReseat}
          >
            Group reseat
          </button>
          {assignMutation.isPending && (
            <div className="seat_assign_pending">Assigning…</div>
          )}
          {assignMutation.isError && (
            <div className="seat_assign_error">{(assignMutation.error as Error).message}</div>
          )}
          {assignMutation.isSuccess && (
            <div className="seat_assign_success">Seat assigned</div>
          )}
          {reseatMutation.isPending && (
            <div className="seat_assign_pending">Reseating passenger…</div>
          )}
          {reseatMutation.isError && (
            <div className="seat_assign_error">{(reseatMutation.error as Error).message}</div>
          )}
          {unassignMutation.isError && (
            <div className="seat_assign_error">{(unassignMutation.error as Error).message}</div>
          )}
          {swapHook.isError && (
            <div className="seat_assign_error">{(swapHook.error as Error).message}</div>
          )}
          {groupReseatHook.isError && (
            <div className="seat_assign_error">{(groupReseatHook.error as Error).message}</div>
          )}
          {selectedSeat && !assignMutation.isPending && (
            <div className="selected_seat_info">Selected: {selectedSeat}</div>
          )}
        </div>
      </div>
      <PassengerDetailDrawer
        seat={selectedSeatObj}
        onClose={handleDrawerClose}
        onReseat={handleReseat}
        onBlock={handleBlock}
        onUnblock={handleUnblock}
        onUnassign={handleUnassign}
        onSwap={handleSwap}
        blockPending={blockPending}
        unblockPending={unblockPending}
        unassignPending={unassignMutation.isPending}
      />
    </div>
  );
}
