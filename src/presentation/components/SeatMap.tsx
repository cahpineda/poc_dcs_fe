import { useState } from 'react';
import type { SeatPlanResult } from '@/domain/seat/SeatPlanResult';
import { CabinDeck } from './CabinDeck';
import { DeckToggle } from './DeckToggle';

interface SeatMapProps {
  seatPlan: SeatPlanResult;
  selectedSeat?: string;
  reseatMode?: boolean;
  onSeatSelect: (seatNumber: string) => void;
}

export function SeatMap({ seatPlan, selectedSeat, reseatMode = false, onSeatSelect }: SeatMapProps) {
  const [activeDeck, setActiveDeck] = useState<'lower' | 'upper'>('lower');

  return (
    <div className="seat_map_container">
      <DeckToggle
        hasUpperDeck={seatPlan.isUpperDeck}
        activeDeck={activeDeck}
        onToggle={setActiveDeck}
      />
      <CabinDeck
        rows={seatPlan.rows}
        selectedSeat={selectedSeat}
        reseatMode={reseatMode}
        onSeatSelect={onSeatSelect}
      />
    </div>
  );
}
