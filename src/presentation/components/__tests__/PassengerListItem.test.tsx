import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PassengerListItem } from '../PassengerListItem';
import { Passenger } from '@/domain/seat/Passenger';
import { Seat } from '@/domain/seat/Seat';
import { SeatNumber } from '@/domain/seat/SeatNumber';

function makePassenger(overrides: Partial<Parameters<typeof Seat.create>[0]> = {}): Passenger {
  const seat = Seat.create({
    seatNumber: SeatNumber.create('3C'),
    status: 'occupied',
    cabinClass: 'Y',
    passengerName: 'John Doe',
    passengerKey: 'PKY-001',
    boardingGroup: 2,
    pnr: 'ABC123',
    gender: 'M',
    ssrs: [],
    hasInfant: false,
    rushStatus: false,
    ...overrides,
  });
  return Passenger.fromSeat(seat)!;
}

describe('PassengerListItem', () => {
  it('renders the formattedName (LASTNAME,FIRSTNAME)', () => {
    const p = makePassenger();
    render(<PassengerListItem passenger={p} isActive={false} onSelect={vi.fn()} />);
    expect(screen.getByText('DOE,JOHN')).toBeTruthy();
  });

  it('renders the current seat number', () => {
    const p = makePassenger();
    render(<PassengerListItem passenger={p} isActive={false} onSelect={vi.fn()} />);
    expect(screen.getByText('3C')).toBeTruthy();
  });

  it('renders "Unchecked" badge with status_pill_unchecked class when not checked in', () => {
    const p = makePassenger({ status: 'occupied' });
    render(<PassengerListItem passenger={p} isActive={false} onSelect={vi.fn()} />);
    const badge = screen.getByText('Unchecked');
    expect(badge.className).toContain('status_pill');
    expect(badge.className).toContain('status_pill_unchecked');
  });

  it('renders "Checked" badge with status_pill_checked class when checked in', () => {
    const p = makePassenger({ status: 'checked_in' });
    render(<PassengerListItem passenger={p} isActive={false} onSelect={vi.fn()} />);
    const badge = screen.getByText('Checked');
    expect(badge.className).toContain('status_pill_checked');
  });

  it('adds passenger_list_item_active class when isActive is true', () => {
    const p = makePassenger();
    const { container } = render(<PassengerListItem passenger={p} isActive={true} onSelect={vi.fn()} />);
    const li = container.querySelector('li');
    expect(li!.className).toContain('passenger_list_item_active');
  });

  it('does not add passenger_list_item_active class when isActive is false', () => {
    const p = makePassenger();
    const { container } = render(<PassengerListItem passenger={p} isActive={false} onSelect={vi.fn()} />);
    const li = container.querySelector('li');
    expect(li!.className).not.toContain('passenger_list_item_active');
  });

  it('fires onSelect with the passenger when clicked', () => {
    const p = makePassenger();
    const onSelect = vi.fn();
    const { container } = render(<PassengerListItem passenger={p} isActive={false} onSelect={onSelect} />);
    fireEvent.click(container.querySelector('li')!);
    expect(onSelect).toHaveBeenCalledWith(p);
  });
});
