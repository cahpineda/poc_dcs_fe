import axios from 'axios';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import type { ReactNode } from 'react';
import type { ISeatPricingService } from '@/application/ports';
import { Cloud2SeatPlanAdapter } from './adapters/Cloud2SeatPlanAdapter';
import { Cloud2SeatCommandAdapter } from './adapters/Cloud2SeatCommandAdapter';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3001',
  withCredentials: true,
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 5 * 60 * 1000, retry: 1 },
  },
});

const stubPricingService: ISeatPricingService = {
  getSeatPricing: async () => { throw new Error('Not implemented'); },
};

// Single DIP wiring point — always uses real adapters against the mock server (port 3001)
export const services = {
  seatQuery: new Cloud2SeatPlanAdapter(axiosInstance),
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
