interface SeatColumnHeadersProps {
  columns: string[];
}

// Cloud2: A/F (first and last) are side seats (38px); B-E are middle (28px).
// For a 6-seat row: aisle gap inserted between index 2 (C) and 3 (D).
const AISLE_AFTER_INDEX = 2;

export function SeatColumnHeaders({ columns }: SeatColumnHeadersProps) {
  if (columns.length === 0) return null;
  const lastIdx = columns.length - 1;
  return (
    <div className="seat_column_headers" role="row" aria-label="Seat columns">
      {columns.map((letter, idx) => {
        const isSide = idx === 0 || idx === lastIdx;
        return (
          <>
            <span
              key={letter}
              className={isSide ? 'column_label column_label_side' : 'column_label'}
              role="columnheader"
            >
              {letter}
            </span>
            {idx === AISLE_AFTER_INDEX && columns.length === 6 && (
              <span key="aisle-header" className="column_label_aisle" aria-hidden="true" />
            )}
          </>
        );
      })}
    </div>
  );
}
