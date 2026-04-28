const LEGEND_ENTRIES = [
  { label: 'Available',          className: 'seat_available' },
  { label: 'Occupied',           className: 'seat_occupied' },
  { label: 'Checked In',         className: 'seat_checked_in' },
  { label: 'Boarded',            className: 'seat_boarded' },
  { label: 'Blocked',            className: 'seat_blocked' },
  { label: 'Exit Row Avail.',    className: 'seat_exit_row_available' },
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
      <div className="legend_item">
        <img src="/window.svg" className="legend_window_img" alt="" aria-hidden="true" />
        <span>Window</span>
      </div>
      <div className="legend_item">
        <div className="legend_swatch_exit_marker" />
        <span>Wing Exit</span>
      </div>
      <div className="legend_item">
        <span className="legend_dot seat_gender_male" aria-hidden="true" />
        <span>Male</span>
      </div>
      <div className="legend_item">
        <span className="legend_dot seat_gender_female" aria-hidden="true" />
        <span>Female</span>
      </div>
      <div className="legend_item">
        <span className="legend_dot seat_gender_unaccompanied" aria-hidden="true" />
        <span>Unaccompanied</span>
      </div>
      <div className="legend_item">
        <span className="legend_wchr_badge" aria-hidden="true" />
        <span>Wheelchair (WCHR)</span>
      </div>
    </div>
  );
}
