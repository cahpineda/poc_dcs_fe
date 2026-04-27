import { useState } from 'react';
import { useSeatPlan } from '@/presentation/hooks/useSeatPlan';
import { SeatMap } from './SeatMap';
import { SeatLegend } from './SeatLegend';

interface SeatPlanTabProps {
  flightId: string;
}

export function SeatPlanTab({ flightId }: SeatPlanTabProps) {
  const [selectedSeat, setSelectedSeat] = useState<string | undefined>();
  const { data: seatPlan, isLoading, error } = useSeatPlan(flightId);

  if (isLoading) return <div className="seat_plan_loading">Loading seat map…</div>;
  if (error) return <div className="seat_plan_error">Failed to load seat map</div>;
  if (!seatPlan) return null;

  return (
    <div className="seat_plan_tab">
      <SeatMap
        seatPlan={seatPlan}
        selectedSeat={selectedSeat}
        onSeatSelect={setSelectedSeat}
      />
      <SeatLegend />
      {selectedSeat && (
        <div className="selected_seat_info">Selected: {selectedSeat}</div>
      )}
    </div>
  );
}
