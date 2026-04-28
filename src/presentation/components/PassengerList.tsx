import type { Passenger } from '@/domain/seat/Passenger';
import { PassengerListItem } from './PassengerListItem';

interface PassengerListProps {
  passengers: Passenger[];
  activePassengerKey: string | null;
  onSelect: (p: Passenger) => void;
}

export function PassengerList({ passengers, activePassengerKey, onSelect }: PassengerListProps) {
  return (
    <aside className="passenger_list_panel" aria-label="Passenger manifest">
      <div className="passenger_list_actions">
        <button type="button" disabled>Check-In Group</button>
        <button type="button" disabled>Check In</button>
        <button type="button" disabled>Finish and Search Passengers</button>
      </div>
      {passengers.length === 0 ? (
        <p className="passenger_list_empty">No passengers</p>
      ) : (
        <ul className="passenger_list">
          {passengers.map((p) => (
            <PassengerListItem
              key={p.passengerKey ?? `${p.name}-${p.currentSeatNumber}`}
              passenger={p}
              isActive={p.passengerKey != null ? p.passengerKey === activePassengerKey : false}
              onSelect={onSelect}
            />
          ))}
        </ul>
      )}
      <footer className="passenger_list_count">{passengers.length}</footer>
    </aside>
  );
}
