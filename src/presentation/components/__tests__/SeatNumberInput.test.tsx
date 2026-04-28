import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SeatNumberInput } from '../SeatNumberInput';
import { SeatPlanResult } from '@/domain/seat/SeatPlanResult';
import { SeatNumber } from '@/domain/seat/SeatNumber';
import { Seat } from '@/domain/seat/Seat';

function makeFixturePlan() {
  return SeatPlanResult.create({
    flightId: 'FL001',
    isUpperDeck: false,
    rows: [
      {
        rowNumber: 12,
        isExitRow: false,
        isWingZone: false,
        seats: [
          Seat.create({ seatNumber: SeatNumber.create('12A'), status: 'available', cabinClass: 'Y' }),
          Seat.create({ seatNumber: SeatNumber.create('12B'), status: 'occupied', cabinClass: 'Y' }),
        ],
      },
    ],
  });
}

describe('SeatNumberInput', () => {
  it('renders with the SEAT label', () => {
    render(<SeatNumberInput seatPlan={makeFixturePlan()} onJumpToSeat={vi.fn()} />);
    expect(screen.getByText('SEAT')).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /jump to seat/i })).toBeInTheDocument();
  });

  it('calls onJumpToSeat on Enter for a valid seat that exists in the plan', async () => {
    const user = userEvent.setup();
    const onJump = vi.fn();
    render(<SeatNumberInput seatPlan={makeFixturePlan()} onJumpToSeat={onJump} />);
    const input = screen.getByRole('textbox', { name: /jump to seat/i });
    await user.type(input, '12A');
    await user.keyboard('{Enter}');
    expect(onJump).toHaveBeenCalledWith('12A');
    expect(onJump).toHaveBeenCalledOnce();
  });

  it('does NOT call onJumpToSeat and shows error for invalid format (ZZZ)', async () => {
    const user = userEvent.setup();
    const onJump = vi.fn();
    render(<SeatNumberInput seatPlan={makeFixturePlan()} onJumpToSeat={onJump} />);
    const input = screen.getByRole('textbox', { name: /jump to seat/i });
    await user.type(input, 'ZZZ');
    await user.keyboard('{Enter}');
    expect(onJump).not.toHaveBeenCalled();
    expect(input).toHaveClass('seat_number_input_error');
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('does NOT call onJumpToSeat and shows error for valid format but unknown seat (99Z)', async () => {
    const user = userEvent.setup();
    const onJump = vi.fn();
    render(<SeatNumberInput seatPlan={makeFixturePlan()} onJumpToSeat={onJump} />);
    const input = screen.getByRole('textbox', { name: /jump to seat/i });
    await user.type(input, '99Z');
    await user.keyboard('{Enter}');
    expect(onJump).not.toHaveBeenCalled();
    expect(input).toHaveClass('seat_number_input_error');
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('input accepts lowercase and normalizes to uppercase before validation', async () => {
    const user = userEvent.setup();
    const onJump = vi.fn();
    render(<SeatNumberInput seatPlan={makeFixturePlan()} onJumpToSeat={onJump} />);
    const input = screen.getByRole('textbox', { name: /jump to seat/i });
    await user.type(input, '12a');
    await user.keyboard('{Enter}');
    expect(onJump).toHaveBeenCalledWith('12A');
  });

  it('clears error state when user starts typing after an error', async () => {
    const user = userEvent.setup();
    render(<SeatNumberInput seatPlan={makeFixturePlan()} onJumpToSeat={vi.fn()} />);
    const input = screen.getByRole('textbox', { name: /jump to seat/i });
    // Trigger error
    await user.type(input, 'ZZZ');
    await user.keyboard('{Enter}');
    expect(input).toHaveClass('seat_number_input_error');
    // Start typing again — error should clear
    await user.type(input, '1');
    expect(input).not.toHaveClass('seat_number_input_error');
  });

  it('does NOT fire onJumpToSeat when Enter is pressed on an empty input', async () => {
    const user = userEvent.setup();
    const onJump = vi.fn();
    render(<SeatNumberInput seatPlan={makeFixturePlan()} onJumpToSeat={onJump} />);
    const input = screen.getByRole('textbox', { name: /jump to seat/i });
    await user.click(input);
    await user.keyboard('{Enter}');
    expect(onJump).not.toHaveBeenCalled();
  });
});
