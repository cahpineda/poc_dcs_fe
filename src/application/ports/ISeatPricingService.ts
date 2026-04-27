export interface ISeatPricingService {
  getSeatPricing(flightId: string): Promise<unknown>;
}
