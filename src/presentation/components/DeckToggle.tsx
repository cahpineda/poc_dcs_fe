interface DeckToggleProps {
  hasUpperDeck: boolean;
  activeDeck: 'lower' | 'upper';
  onToggle: (deck: 'lower' | 'upper') => void;
}

export function DeckToggle({ hasUpperDeck, activeDeck, onToggle }: DeckToggleProps) {
  if (!hasUpperDeck) return null;

  return (
    <div className="deck_toggle">
      <button
        className={activeDeck === 'lower' ? 'deck_active' : undefined}
        onClick={() => onToggle('lower')}
      >
        Lower Deck
      </button>
      <button
        className={activeDeck === 'upper' ? 'deck_active' : undefined}
        onClick={() => onToggle('upper')}
      >
        Upper Deck
      </button>
    </div>
  );
}
