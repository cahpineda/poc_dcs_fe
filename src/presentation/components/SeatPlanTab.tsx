import { useState } from 'react';
import { useSeatPlan } from '@/presentation/hooks/useSeatPlan';
import { useSeatAssign } from '@/presentation/hooks/useSeatAssign';
import { autoAssignSeat } from '@/domain/seat/autoAssignSeat';
import { AssignSeatCommand } from '@/domain/seat/commands/AssignSeatCommand';
import { SeatMap } from './SeatMap';
import { SeatLegend } from './SeatLegend';

interface SeatPlanTabProps {
  flightId: string;
}

export function SeatPlanTab({ flightId }: SeatPlanTabProps) {
  const [selectedSeat, setSelectedSeat] = useState<string | undefined>();
  const { data: seatPlan, isLoading, error } = useSeatPlan(flightId);
  const assignMutation = useSeatAssign(flightId);

  if (isLoading) return <div className="seat_plan_loading">Loading seat map…</div>;
  if (error) return <div className="seat_plan_error">Failed to load seat map</div>;
  if (!seatPlan) return null;

  function handleSeatSelect(seatNumber: string) {
    setSelectedSeat(seatNumber);
    assignMutation.mutate(
      AssignSeatCommand.create({ passengerId: 'DEMO-PAX', seatNumber, flightId })
    );
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
      <SeatMap
        seatPlan={seatPlan}
        selectedSeat={selectedSeat}
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
    </div>
  );
}
