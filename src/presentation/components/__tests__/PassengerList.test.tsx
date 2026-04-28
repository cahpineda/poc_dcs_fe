import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PassengerList } from '../PassengerList';
import { Passenger } from '@/domain/seat/Passenger';
import { Seat } from '@/domain/seat/Seat';
import { SeatNumber } from '@/domain/seat/SeatNumber';

function makePassenger(seatNum: string, name: string, key: string): Passenger {
  return Passenger.fromSeat(
    Seat.create({
      seatNumber: SeatNumber.create(seatNum),
      status: 'occupied',
      cabinClass: 'Y',
      passengerName: name,
      passengerKey: key,
    })
  )!;
}

const pax = [
  makePassenger('1A', 'Alice Smith', 'KEY-001'),
  makePassenger('2B', 'Bob Jones', 'KEY-002'),
  makePassenger('3C', 'Carol White', 'KEY-003'),
];

describe('PassengerList', () => {
  it('renders "No passengers" and count 0 when list is empty', () => {
    render(<PassengerList passengers={[]} activePassengerKey={null} onSelect={vi.fn()} />);
    expect(screen.getByText('No passengers')).toBeTruthy();
    expect(screen.getByText('0')).toBeTruthy();
  });

  it('renders 3 passenger items and count 3', () => {
    render(<PassengerList passengers={pax} activePassengerKey={null} onSelect={vi.fn()} />);
    expect(screen.getAllByRole('button').length).toBeGreaterThanOrEqual(3);
    expect(screen.getByText('3')).toBeTruthy();
  });

  it('active passenger item has isActive=true when key matches', () => {
    const { container } = render(
      <PassengerList passengers={pax} activePassengerKey="KEY-002" onSelect={vi.fn()} />
    );
    const items = container.querySelectorAll('li.passenger_list_item');
    const activeItems = Array.from(items).filter((li) =>
      li.className.includes('passenger_list_item_active')
    );
    expect(activeItems).toHaveLength(1);
  });

  it('bubbles onSelect when an item is clicked', () => {
    const onSelect = vi.fn();
    const { container } = render(
      <PassengerList passengers={pax} activePassengerKey={null} onSelect={onSelect} />
    );
    fireEvent.click(container.querySelectorAll('li.passenger_list_item')[0]);
    expect(onSelect).toHaveBeenCalledWith(pax[0]);
  });

  it('renders disabled "Check-In Group" and "Check In" action buttons', () => {
    render(<PassengerList passengers={[]} activePassengerKey={null} onSelect={vi.fn()} />);
    const checkInGroup = screen.getByRole('button', { name: /check-in group/i });
    const checkIn = screen.getByRole('button', { name: /^check in$/i });
    expect(checkInGroup).toBeDisabled();
    expect(checkIn).toBeDisabled();
  });

  it('renders the passenger manifest aside with aria-label', () => {
    const { container } = render(
      <PassengerList passengers={[]} activePassengerKey={null} onSelect={vi.fn()} />
    );
    expect(container.querySelector('aside[aria-label="Passenger manifest"]')).toBeTruthy();
  });
});
