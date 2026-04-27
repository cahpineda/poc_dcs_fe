const LEGEND_ENTRIES = [
  { label: 'Available', className: 'seat_available' },
  { label: 'Occupied', className: 'seat_occupied' },
  { label: 'Blocked', className: 'seat_blocked' },
  { label: 'Exit Row', className: 'seat_exit_row_available' },
  { label: 'Selected', className: 'seat_selected' },
] as const;

export function SeatLegend() {
  return (
    <div className="seat_legend">
      {LEGEND_ENTRIES.map(({ label, className }) => (
        <div key={label} className="legend_item">
          <div className={`legend_swatch ${className}`} />
          <span>{label}</span>
        </div>
      ))}
    </div>
  );
}
