// To run: INTEGRATION_TESTS=true VITE_API_BASE_URL=http://cloud2.host INTEGRATION_FLIGHT_ID=IK100 npm test
import { describe, it, expect } from 'vitest';
import axios from 'axios';
import { Cloud2SeatPlanAdapter } from '../../Cloud2SeatPlanAdapter';
import { SeatPlanResult } from '@/domain/seat/SeatPlanResult';

const INTEGRATION_ENABLED = Boolean(process.env.INTEGRATION_TESTS);

describe.skipIf(!INTEGRATION_ENABLED)('Cloud2 Integration — getSeatPlan', () => {
  const baseURL = process.env.VITE_API_BASE_URL ?? 'http://localhost:8080';
  const http = axios.create({ baseURL, withCredentials: true });
  const adapter = new Cloud2SeatPlanAdapter(http);

  it('getSeatPlan returns a SeatPlanResult with rows and seats', async () => {
    const flightId = process.env.INTEGRATION_FLIGHT_ID ?? 'TEST-FLIGHT-001';
    const result = await adapter.getSeatPlan(flightId);

    expect(result).toBeInstanceOf(SeatPlanResult);
    expect(result.rows.length).toBeGreaterThan(0);
    expect(result.totalSeats).toBeGreaterThan(0);
    expect(result.flightId).toBe(flightId);
  });

  it('getSeatPlan maps all cloud_2 seat status codes without throwing', async () => {
    const flightId = process.env.INTEGRATION_FLIGHT_ID ?? 'TEST-FLIGHT-001';
    const result = await adapter.getSeatPlan(flightId);

    for (const row of result.rows) {
      for (const seat of row.seats) {
        expect(seat.status).toBeDefined();
        expect(seat.number.toString()).toMatch(/^\d{1,3}[A-K]$/);
      }
    }
  });
});

describe.skipIf(!INTEGRATION_ENABLED)('Cloud2 Integration — Contract assertions', () => {
  it('API base URL is configured (VITE_API_BASE_URL env var)', () => {
    expect(process.env.VITE_API_BASE_URL).toBeDefined();
    expect(process.env.VITE_API_BASE_URL).not.toBe('');
  });
});
