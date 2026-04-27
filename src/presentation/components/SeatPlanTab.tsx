import { useState } from 'react';
import { useSeatPlan } from '@/presentation/hooks/useSeatPlan';
import { useSeatAssign } from '@/presentation/hooks/useSeatAssign';
import { useSeatBlock, useSeatUnblock } from '@/presentation/hooks/useSeatBlock';
import { useSeatReseat } from '@/presentation/hooks/useSeatReseat';
import { autoAssignSeat } from '@/domain/seat/autoAssignSeat';
import { AssignSeatCommand } from '@/domain/seat/commands/AssignSeatCommand';
import { BlockSeatCommand } from '@/domain/seat/commands/BlockSeatCommand';
import { UnblockSeatCommand } from '@/domain/seat/commands/UnblockSeatCommand';
import { ReseatPassengerCommand } from '@/domain/seat/commands/ReseatPassengerCommand';
import type { Seat } from '@/domain/seat/Seat';
import { SeatMap } from './SeatMap';
import { SeatLegend } from './SeatLegend';
import { PassengerDetailDrawer } from './PassengerDetailDrawer';

interface SeatPlanTabProps {
  flightId: string;
}

const DRAWER_STATUSES = new Set(['occupied', 'exit_row_occupied', 'checked_in', 'boarded', 'blocked']);

// Seat has no passengerId field; synthesize from seat number until a real passenger registry exists.
// TODO: replace with actual passenger lookup when passenger entity is introduced.
function resolvePassengerId(seat: Seat): string {
  return 'PAX-' + seat.number.toString();
}

export function SeatPlanTab({ flightId }: SeatPlanTabProps) {
  const [selectedSeat, setSelectedSeat] = useState<string | undefined>();
  const [selectedSeatObj, setSelectedSeatObj] = useState<Seat | null>(null);
  const [reseatPassengerId, setReseatPassengerId] = useState<string | null>(null);
  const [reseatFromSeat, setReseatFromSeat] = useState<string | null>(null);
  const [reseatPassengerName, setReseatPassengerName] = useState<string | null>(null);
  const reseatMode = reseatPassengerId !== null;

  const { data: seatPlan, isLoading, error } = useSeatPlan(flightId);
  const assignMutation = useSeatAssign(flightId);
  const { mutate: blockMutate, isPending: blockPending } = useSeatBlock(flightId);
  const { mutate: unblockMutate, isPending: unblockPending } = useSeatUnblock(flightId);
  const reseatMutation = useSeatReseat(flightId);

  if (isLoading) return <div className="seat_plan_loading">Loading seat map…</div>;
  if (error) return <div className="seat_plan_error">Failed to load seat map</div>;
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

  function handleCancelReseat() {
    setReseatPassengerId(null);
    setReseatFromSeat(null);
    setReseatPassengerName(null);
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

  return (
    <div className="seat_plan_tab">
      {reseatMode && (
        <div className="reseat_mode_banner" role="status">
          <span>
            Reseat mode: select new seat for <strong>{reseatPassengerName}</strong>
          </span>
          <button type="button" onClick={handleCancelReseat}>Cancel</button>
        </div>
      )}
      <SeatMap
        seatPlan={seatPlan}
        selectedSeat={selectedSeat}
        reseatMode={reseatMode}
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
      {assignMutation.isPending && (
        <div className="seat_assign_pending">Assigning…</div>
      )}
      {assignMutation.isError && (
        <div className="seat_assign_error">{(assignMutation.error as Error).message}</div>
      )}
      {assignMutation.isSuccess && (
        <div className="seat_assign_success">Seat assigned</div>
      )}
      {selectedSeat && !assignMutation.isPending && (
        <div className="selected_seat_info">Selected: {selectedSeat}</div>
      )}
      <PassengerDetailDrawer
        seat={selectedSeatObj}
        onClose={handleDrawerClose}
        onReseat={handleReseat}
        onBlock={handleBlock}
        onUnblock={handleUnblock}
        blockPending={blockPending}
        unblockPending={unblockPending}
      />
    </div>
  );
}
