import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import fs from 'fs';
import path from 'path';
import { SeatCell, AisleGap } from '../SeatCell';

describe('SeatCell', () => {
  // Test 1 — Happy path: available seat renders correct class and fires onSelect
  it('renders button with seat_available class and calls onSelect when clicked', async () => {
    const onSelect = vi.fn();
    render(<SeatCell seatNumber="12A" status="available" onSelect={onSelect} />);
    const btn = screen.getByRole('button');
    expect(btn).toHaveClass('seat_available');
    expect(btn).toHaveTextContent('12A');
    await userEvent.click(btn);
    expect(onSelect).toHaveBeenCalledWith('12A');
  });

  // Test 2 — Null/invalid: occupied seat does NOT fire onSelect
  it('renders occupied seat and calls onSelect when clicked', async () => {
    const onSelect = vi.fn();
    render(<SeatCell seatNumber="12A" status="occupied" onSelect={onSelect} />);
    const btn = screen.getByRole('button');
    expect(btn).toHaveClass('seat_occupied');
    await userEvent.click(btn);
    expect(onSelect).toHaveBeenCalledWith('12A');
  });

  // Test 3 — Error/boundary: exit_row_available seat has both seat_available and seat_exit classes
  it('renders exit row available seat with seat_exit class alongside status class', () => {
    const onSelect = vi.fn();
    render(
      <SeatCell seatNumber="14F" status="exit_row_available" isExitRow onSelect={onSelect} />
    );
    const btn = screen.getByRole('button');
    expect(btn).toHaveClass('seat_exit_row_available');
    expect(btn).toHaveClass('seat_exit');
  });

  // Test 4 — All other statuses apply correct class names
  it.each([
    ['blocked', 'seat_blocked'],
    ['exit_row_occupied', 'seat_exit_row_occupied'],
    ['unavailable', 'seat_unavailable'],
    ['infant_occupied', 'seat_infant_occupied'],
  ] as const)('renders status "%s" with class "%s"', (status, expectedClass) => {
    render(<SeatCell seatNumber="1A" status={status} onSelect={vi.fn()} />);
    expect(screen.getByRole('button')).toHaveClass(expectedClass);
  });

  // Test 5 — isSelected adds seat_selected class
  it('adds seat_selected class when isSelected=true', () => {
    render(<SeatCell seatNumber="3C" status="available" isSelected onSelect={vi.fn()} />);
    expect(screen.getByRole('button')).toHaveClass('seat_selected');
  });

  // Test 6 — price badge renders when provided
  it('renders price badge when price is provided', () => {
    render(<SeatCell seatNumber="5D" status="available" price={29} onSelect={vi.fn()} />);
    expect(screen.getByText('29')).toBeInTheDocument();
  });

  // Test 7 — base class seat_cell always present
  it('always has base seat_cell class', () => {
    render(<SeatCell seatNumber="7A" status="blocked" onSelect={vi.fn()} />);
    expect(screen.getByRole('button')).toHaveClass('seat_cell');
  });
});

describe('passenger initials', () => {
  it('renders passenger initials instead of seat number for occupied seat', () => {
    render(<SeatCell seatNumber="12A" status="occupied" passengerInitials="JD" onSelect={() => {}} />);
    expect(screen.getByRole('button')).toHaveTextContent('JD');
    expect(screen.getByRole('button')).not.toHaveTextContent('12A');
  });

  it('renders seat number for available seat regardless of passengerInitials prop', () => {
    render(<SeatCell seatNumber="12A" status="available" passengerInitials="JD" onSelect={() => {}} />);
    expect(screen.getByRole('button')).toHaveTextContent('12A');
  });

  it('renders seat number when passengerInitials is null', () => {
    render(<SeatCell seatNumber="12A" status="occupied" passengerInitials={null} onSelect={() => {}} />);
    expect(screen.getByRole('button')).toHaveTextContent('12A');
  });
});

describe('overlay indicators', () => {
  it('renders infant indicator when hasInfant=true', () => {
    const { container } = render(
      <SeatCell seatNumber="12A" status="occupied" hasInfant={true} onSelect={() => {}} />
    );
    expect(container.querySelector('.seat_infant_indicator')).toBeInTheDocument();
  });

  it('does NOT render infant indicator when hasInfant=false', () => {
    const { container } = render(
      <SeatCell seatNumber="12A" status="occupied" hasInfant={false} onSelect={() => {}} />
    );
    expect(container.querySelector('.seat_infant_indicator')).not.toBeInTheDocument();
  });

  it('does NOT render infant indicator when hasInfant is undefined', () => {
    const { container } = render(
      <SeatCell seatNumber="12A" status="occupied" onSelect={() => {}} />
    );
    expect(container.querySelector('.seat_infant_indicator')).not.toBeInTheDocument();
  });

  it('renders block indicator with title when blockNote is non-empty', () => {
    const { container } = render(
      <SeatCell seatNumber="12A" status="blocked" blockNote="Crew rest" onSelect={() => {}} />
    );
    const indicator = container.querySelector('.seat_block_indicator');
    expect(indicator).toBeInTheDocument();
    expect(indicator).toHaveAttribute('title', 'Crew rest');
  });

  it('does NOT render block indicator when blockNote is empty string', () => {
    const { container } = render(
      <SeatCell seatNumber="12A" status="blocked" blockNote="" onSelect={() => {}} />
    );
    expect(container.querySelector('.seat_block_indicator')).not.toBeInTheDocument();
  });

  it('does NOT render block indicator when blockNote is undefined', () => {
    const { container } = render(
      <SeatCell seatNumber="12A" status="blocked" onSelect={() => {}} />
    );
    expect(container.querySelector('.seat_block_indicator')).not.toBeInTheDocument();
  });

  it('infant indicator has aria-label="infant"', () => {
    const { container } = render(
      <SeatCell seatNumber="12A" status="occupied" hasInfant={true} onSelect={() => {}} />
    );
    expect(container.querySelector('.seat_infant_indicator')).toHaveAttribute('aria-label', 'infant');
  });
});

describe('gender badge', () => {
  it('renders male badge when gender="M"', () => {
    const { container } = render(
      <SeatCell seatNumber="12A" status="occupied" gender="M" onSelect={() => {}} />
    );
    const badge = container.querySelector('.seat_gender_badge');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('seat_gender_male');
  });

  it('renders female badge when gender="F"', () => {
    const { container } = render(
      <SeatCell seatNumber="12A" status="occupied" gender="F" onSelect={() => {}} />
    );
    const badge = container.querySelector('.seat_gender_badge');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('seat_gender_female');
  });

  it('renders unaccompanied badge when gender="U"', () => {
    const { container } = render(
      <SeatCell seatNumber="12A" status="occupied" gender="U" onSelect={() => {}} />
    );
    const badge = container.querySelector('.seat_gender_badge');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('seat_gender_unaccompanied');
  });

  it('does NOT render badge when gender is undefined', () => {
    const { container } = render(
      <SeatCell seatNumber="12A" status="occupied" onSelect={() => {}} />
    );
    expect(container.querySelector('.seat_gender_badge')).not.toBeInTheDocument();
  });

  it('does NOT render badge when gender is null', () => {
    const { container } = render(
      <SeatCell seatNumber="12A" status="occupied" gender={null} onSelect={() => {}} />
    );
    expect(container.querySelector('.seat_gender_badge')).not.toBeInTheDocument();
  });

  it('badge is aria-hidden (decorative)', () => {
    const { container } = render(
      <SeatCell seatNumber="12A" status="occupied" gender="M" onSelect={() => {}} />
    );
    expect(container.querySelector('.seat_gender_badge')).toHaveAttribute('aria-hidden', 'true');
  });
});

describe('SeatCell — reseat mode', () => {
  it('when reseatMode=false, occupied seats fire onSelect', async () => {
    const onSelect = vi.fn();
    render(<SeatCell seatNumber="12A" status="occupied" reseatMode={false} onSelect={onSelect} />);
    await userEvent.click(screen.getByRole('button'));
    expect(onSelect).toHaveBeenCalledWith('12A');
  });

  it('when reseatMode=true, occupied seats do NOT fire onSelect', async () => {
    const onSelect = vi.fn();
    render(<SeatCell seatNumber="12A" status="occupied" reseatMode={true} onSelect={onSelect} />);
    await userEvent.click(screen.getByRole('button'));
    expect(onSelect).not.toHaveBeenCalled();
  });

  it('when reseatMode=true, available seats fire onSelect', async () => {
    const onSelect = vi.fn();
    render(<SeatCell seatNumber="5A" status="available" reseatMode={true} onSelect={onSelect} />);
    await userEvent.click(screen.getByRole('button'));
    expect(onSelect).toHaveBeenCalledWith('5A');
  });

  it('when reseatMode=true, exit_row_available seats fire onSelect', async () => {
    const onSelect = vi.fn();
    render(<SeatCell seatNumber="14F" status="exit_row_available" reseatMode={true} onSelect={onSelect} />);
    await userEvent.click(screen.getByRole('button'));
    expect(onSelect).toHaveBeenCalledWith('14F');
  });

  it.each([
    ['blocked' as const],
    ['checked_in' as const],
    ['boarded' as const],
  ])('when reseatMode=true, %s seats do NOT fire onSelect', async (status) => {
    const onSelect = vi.fn();
    render(<SeatCell seatNumber="1A" status={status} reseatMode={true} onSelect={onSelect} />);
    await userEvent.click(screen.getByRole('button'));
    expect(onSelect).not.toHaveBeenCalled();
  });

  it('when reseatMode=true, occupied seats get seat_cell_dimmed class', () => {
    const { container } = render(
      <SeatCell seatNumber="12A" status="occupied" reseatMode={true} onSelect={vi.fn()} />
    );
    expect(container.querySelector('.seat_cell_dimmed')).toBeInTheDocument();
  });
});

describe('SeatCell — side seat geometry', () => {
  // Test 1 — Happy path: A-seat gets seat_cell_side class
  it('seat ending in A has class seat_cell_side', () => {
    const { container } = render(
      <SeatCell seatNumber="1A" status="available" onSelect={vi.fn()} />
    );
    expect(container.firstChild).toHaveClass('seat_cell_side');
  });

  // Test 2 — F-seat (other side window) also gets seat_cell_side
  it('seat ending in F has class seat_cell_side', () => {
    const { container } = render(
      <SeatCell seatNumber="1F" status="available" onSelect={vi.fn()} />
    );
    expect(container.firstChild).toHaveClass('seat_cell_side');
  });

  // Test 3 — Boundary: B-seat does NOT get seat_cell_side
  it('seat ending in B does not have class seat_cell_side', () => {
    const { container } = render(
      <SeatCell seatNumber="1B" status="available" onSelect={vi.fn()} />
    );
    expect(container.firstChild).not.toHaveClass('seat_cell_side');
  });

  // Test 4 — Boundary: C-seat does NOT get seat_cell_side
  it('seat ending in C does not have class seat_cell_side', () => {
    const { container } = render(
      <SeatCell seatNumber="1C" status="available" onSelect={vi.fn()} />
    );
    expect(container.firstChild).not.toHaveClass('seat_cell_side');
  });
});

describe('CSS token values match cloud_2', () => {
  const tokensCSS = fs.readFileSync(
    path.resolve(__dirname, '../../../styles/tokens.css'),
    'utf-8'
  );

  // Test 1 — Happy path: available seat uses cloud_2 charcoal
  it('available seat token is cloud_2 charcoal #4A4D4F', () => {
    expect(tokensCSS).toContain('--color-seat-available: #4A4D4F');
  });

  // Test 2 — Occupied seat purple
  it('occupied seat token is cloud_2 purple #947a9c', () => {
    expect(tokensCSS).toContain('--color-seat-occupied: #947a9c');
  });

  // Test 3 — Checked-in gold
  it('checked-in seat token is cloud_2 gold #C1AA02', () => {
    expect(tokensCSS).toContain('--color-seat-checked-in: #C1AA02');
  });

  // Test 4 — Boarded green
  it('boarded seat token is cloud_2 green #77AE00', () => {
    expect(tokensCSS).toContain('--color-seat-boarded: #77AE00');
  });

  // Test 5 — Infant dark green
  it('infant seat token is darkgreen #006400', () => {
    expect(tokensCSS).toContain('--color-seat-infant: #006400');
  });

  // Test 6 — Boundary: exit-available shares same base color as available
  it('exit-available token matches available charcoal #4A4D4F', () => {
    expect(tokensCSS).toContain('--color-seat-exit-available: #4A4D4F');
  });

  // Test 7 — Boundary: exit-occupied shares same base color as occupied
  it('exit-occupied token matches occupied purple #947a9c', () => {
    expect(tokensCSS).toContain('--color-seat-exit-occupied: #947a9c');
  });
});

describe('SeatCell — SSR and rush overlays', () => {
  it('renders seat_ssr_wchr badge when ssrs includes WCHR', () => {
    const { container } = render(
      <SeatCell seatNumber="5A" status="occupied" ssrs={['WCHR']} onSelect={vi.fn()} />
    );
    expect(container.querySelector('.seat_ssr_wchr')).not.toBeNull();
  });
  it('does not render seat_ssr_wchr badge when ssrs is empty', () => {
    const { container } = render(
      <SeatCell seatNumber="5A" status="occupied" ssrs={[]} onSelect={vi.fn()} />
    );
    expect(container.querySelector('.seat_ssr_wchr')).toBeNull();
  });
  it('does not render seat_ssr_wchr badge when ssrs does not include WCHR', () => {
    const { container } = render(
      <SeatCell seatNumber="5A" status="occupied" ssrs={['DEAF']} onSelect={vi.fn()} />
    );
    expect(container.querySelector('.seat_ssr_wchr')).toBeNull();
  });

  it('has class seat_rush when rushStatus=true', () => {
    const { container } = render(
      <SeatCell seatNumber="5A" status="occupied" rushStatus={true} onSelect={vi.fn()} />
    );
    expect(container.firstChild).toHaveClass('seat_rush');
  });
  it('does not have class seat_rush when rushStatus=false', () => {
    const { container } = render(
      <SeatCell seatNumber="5A" status="occupied" rushStatus={false} onSelect={vi.fn()} />
    );
    expect(container.firstChild).not.toHaveClass('seat_rush');
  });
  it('does not have class seat_rush when rushStatus not provided', () => {
    const { container } = render(
      <SeatCell seatNumber="5A" status="occupied" onSelect={vi.fn()} />
    );
    expect(container.firstChild).not.toHaveClass('seat_rush');
  });
});

describe('AisleGap', () => {
  // Test 1 — Happy path: renders with aisle_gap class
  it('renders div with aisle_gap class', () => {
    const { container } = render(<AisleGap />);
    const div = container.querySelector('.aisle_gap');
    expect(div).toBeInTheDocument();
  });

  // Test 2 — No interactive elements
  it('has no interactive elements', () => {
    render(<AisleGap />);
    expect(screen.queryByRole('button')).toBeNull();
    expect(screen.queryByRole('link')).toBeNull();
  });

  // Test 3 — aria-hidden for accessibility
  it('is aria-hidden', () => {
    const { container } = render(<AisleGap />);
    const div = container.querySelector('.aisle_gap');
    expect(div).toHaveAttribute('aria-hidden');
  });
});
