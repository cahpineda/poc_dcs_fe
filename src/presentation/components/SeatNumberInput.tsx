import { useState } from 'react';
import { SeatNumber } from '@/domain/seat/SeatNumber';
import type { SeatPlanResult } from '@/domain/seat/SeatPlanResult';

export interface SeatNumberInputProps {
  seatPlan: SeatPlanResult;
  onJumpToSeat: (seatNumber: string) => void;
}

export function SeatNumberInput({ seatPlan, onJumpToSeat }: SeatNumberInputProps) {
  const [value, setValue] = useState('');
  const [hasError, setHasError] = useState(false);

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key !== 'Enter') return;

    const trimmed = value.trim().toUpperCase();

    // Validate format via domain VO
    let isValidFormat = true;
    try {
      SeatNumber.create(trimmed);
    } catch {
      isValidFormat = false;
    }

    if (!isValidFormat) {
      setHasError(true);
      return;
    }

    // Validate seat exists in current plan
    const seat = seatPlan.getSeat(trimmed);
    if (!seat) {
      setHasError(true);
      return;
    }

    setHasError(false);
    onJumpToSeat(trimmed);
    setValue('');
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setValue(e.target.value);
    if (hasError) setHasError(false);
  }

  return (
    <div className="seat_number_input_wrapper">
      <label htmlFor="seat_number_input" className="seat_number_input_label">
        SEAT
      </label>
      <input
        id="seat_number_input"
        type="text"
        className={['seat_number_input', hasError ? 'seat_number_input_error' : ''].filter(Boolean).join(' ')}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder="e.g. 12A"
        aria-label="Jump to seat"
        aria-invalid={hasError}
        aria-describedby={hasError ? 'seat_number_input_hint' : undefined}
        maxLength={5}
        autoComplete="off"
      />
      {hasError && (
        <span id="seat_number_input_hint" className="seat_number_input_hint" role="alert">
          Invalid or unknown seat
        </span>
      )}
    </div>
  );
}
