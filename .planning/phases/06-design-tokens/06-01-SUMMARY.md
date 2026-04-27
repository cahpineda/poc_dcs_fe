---
phase: 06-design-tokens
plan: 01
completed: 2026-04-27
duration: 3m
---

# Plan 06-01: Color Palette + Seat-State Tokens

Created the CSS custom property foundation for the DCS seat map design system.

## Created

`src/styles/tokens.css` — 53-line `:root` block:
- Brand: `--color-brand-primary` (#1a3a5c), `--color-brand-secondary` (#2e6da4)
- Seat states: 8 color tokens (available/occupied/blocked/exit-available/exit-occupied/unavailable/infant/selected)
- Text: light/dark variants
- Surface: white/alt/border
- Feedback: success/error/pending
- Typography: font-family, 5 size steps, 2 weight levels
- Spacing: --space-1 through --space-8
- Geometry: --seat-size (2rem), --seat-radius (4px), --seat-gap, --aisle-gap (1rem)
- Animation: --transition-fast (80ms ease)

`src/styles/seat-states.css` — all 7 status variants:
- `.seat_cell` base: 2rem square, flex center, no border, transition
- Each status class sets background via token; blocked/unavailable use dark text
- `.seat_cell.seat_selected`: blue override + scale(1.1) + outline
- Hover: brightness(1.15) for clickable statuses only
- `.aisle_gap`: 1rem width spacer
