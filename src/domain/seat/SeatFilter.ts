export const SEAT_FILTER_IDS = [
  'extra_leg_room',
  'stretcher',
  'no_smoke',
  'infant_eligible',
  'exit_emergency',
  'bulkhead',
  'galley_proximity',
  'usb_power',
  'window',
  'window_no_view',
  'other',
] as const;

export type SeatFilterId = typeof SEAT_FILTER_IDS[number];

export const SEAT_FILTER_LABELS: Record<SeatFilterId, string> = {
  extra_leg_room: 'Extra Leg Room',
  stretcher: 'Stretcher',
  no_smoke: 'No smoke seat',
  infant_eligible: 'Seat Available for adult with infant',
  exit_emergency: 'Exit and emergency exit',
  bulkhead: 'Bulkhead seat',
  galley_proximity: 'Galley Proximity',
  usb_power: 'USB Power Port',
  window: 'Window seat',
  window_no_view: 'Window seat without window',
  other: 'Other',
};

interface SeatFilterable {
  isAvailable(): boolean;
  matchesFilter(id: SeatFilterId): boolean;
}

export function matchesFilters(
  seat: SeatFilterable,
  active: ReadonlySet<SeatFilterId>
): boolean {
  if (active.size === 0) return true;
  if (!seat.isAvailable()) return true;
  for (const id of active) {
    if (seat.matchesFilter(id)) return true;
  }
  return false;
}
