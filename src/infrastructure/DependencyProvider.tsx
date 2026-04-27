import axios from 'axios';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import type { ReactNode } from 'react';
import type { ISeatPricingService } from '@/application/ports';
import { Cloud2SeatPlanAdapter } from './adapters/Cloud2SeatPlanAdapter';
import { Cloud2SeatCommandAdapter } from './adapters/Cloud2SeatCommandAdapter';
import { MockSeatPlanAdapter } from './adapters/MockSeatPlanAdapter';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? '',
  withCredentials: true,
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 5 * 60 * 1000, retry: 1 },
  },
});

// Pricing is deferred to Phase 4 — stub remains
const stubPricingService: ISeatPricingService = {
  getSeatPricing: async () => { throw new Error('Not implemented'); },
};

// Single DIP wiring point — ONLY place where adapters are instantiated
// DEV: MockSeatPlanAdapter returns hardcoded data so the UI can be previewed without cloud_2 API
export const services = {
  seatQuery: import.meta.env.DEV
    ? new MockSeatPlanAdapter()
    : new Cloud2SeatPlanAdapter(axiosInstance),
  seatCommand: new Cloud2SeatCommandAdapter(axiosInstance),
  seatPricing: stubPricingService,
} as const;

interface Props { children: ReactNode; }

export function DependencyProvider({ children }: Props) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
}
