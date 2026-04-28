import type { Passenger } from '@/domain/seat/Passenger';

interface PassengerListItemProps {
  passenger: Passenger;
  isActive: boolean;
  onSelect: (p: Passenger) => void;
}

export function PassengerListItem({ passenger, isActive, onSelect }: PassengerListItemProps) {
  return (
    <li
      className={`passenger_list_item${isActive ? ' passenger_list_item_active' : ''}`}
      onClick={() => onSelect(passenger)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') onSelect(passenger);
      }}
    >
      <span className="passenger_name">{passenger.formattedName}</span>
      <span className="passenger_seat">{passenger.currentSeatNumber}</span>
      <span className={`status_pill ${passenger.isCheckedIn ? 'status_pill_checked' : 'status_pill_unchecked'}`}>
        {passenger.checkInLabel}
      </span>
    </li>
  );
}
