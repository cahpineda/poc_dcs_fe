interface SeatColumnHeadersProps {
  columns: string[];
}

export function SeatColumnHeaders({ columns }: SeatColumnHeadersProps) {
  if (columns.length === 0) return null;
  return (
    <div className="seat_column_headers" role="row" aria-label="Seat columns">
      {columns.map((letter) => (
        <span key={letter} className="column_label" role="columnheader">
          {letter}
        </span>
      ))}
    </div>
  );
}
