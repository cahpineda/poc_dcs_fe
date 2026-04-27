import { DependencyProvider } from '@/infrastructure/DependencyProvider';
import { SeatPlanTab } from '@/presentation/components/SeatPlanTab';

export default function App() {
  return (
    <DependencyProvider>
      <SeatPlanTab flightId="FL001" />
    </DependencyProvider>
  );
}
