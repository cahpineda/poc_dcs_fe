const LEGEND_ENTRIES = [
  { label: 'Available',          className: 'seat_available' },
  { label: 'Occupied',           className: 'seat_occupied' },
  { label: 'Checked In',         className: 'seat_checked_in' },
  { label: 'Boarded',            className: 'seat_boarded' },
  { label: 'Blocked',            className: 'seat_blocked' },
  { label: 'Exit Row Avail.',    className: 'seat_exit_row_available' },
  { label: 'Exit Row Occ.',      className: 'seat_exit_row_occupied' },
  { label: 'Infant',             className: 'seat_infant_occupied' },
  { label: 'Unavailable',        className: 'seat_unavailable' },
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
