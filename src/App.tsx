import { useState } from 'react';
import { DependencyProvider } from '@/infrastructure/DependencyProvider';
import { SeatPlanTab } from '@/presentation/components/SeatPlanTab';

const FLIGHTS = [
  { id: 'FL003', label: 'FL003 — A320 realistic (28 rows)' },
  { id: 'FL001', label: 'FL001 — Wide-body 3-cabin (6 rows demo)' },
  { id: 'FL002', label: 'FL002 — Narrow-body 2-cabin (4 rows demo)' },
];

export default function App() {
  const [flightId, setFlightId] = useState('FL003');
  return (
    <DependencyProvider>
      <div className="flight_selector_bar">
        <label htmlFor="flight-select">Flight:</label>
        <select id="flight-select" value={flightId} onChange={(e) => setFlightId(e.target.value)}>
          {FLIGHTS.map((f) => (
            <option key={f.id} value={f.id}>{f.label}</option>
          ))}
        </select>
      </div>
      <SeatPlanTab flightId={flightId} />
    </DependencyProvider>
  );
}
