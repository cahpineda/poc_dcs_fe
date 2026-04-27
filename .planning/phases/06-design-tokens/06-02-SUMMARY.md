---
phase: 06-design-tokens
plan: 02
completed: 2026-04-27
duration: 3m
---

# Plan 06-02: Layout + Component + Feedback Stylesheets

Three focused stylesheets covering every class name from Phases 4–5.

## Created

`src/styles/layout.css`:
- `.seat_plan_tab`: full-height flex column, centered, gap=space-4
- `.seat_map_container`: flex column, white bg, border, rounded, padding
- `.cabin_row`: flex row with seat-gap; `.exit_row` gets orange-tint background
- `.row_number`: 1.5rem, xs text, 50% opacity
- `.seat_plan_loading/error`: padding + base font; error in red

`src/styles/components.css`:
- `.deck_toggle` buttons: border/radius/hover/active states; `.deck_active` = brand-primary bg
- `.seat_legend`: flex-wrap, surface bg, border, sm font
- `.legend_item` + `.legend_swatch`: flex row with 1rem square swatch
- `.auto_assign_btn`: brand-secondary bg, bold, hover→primary, disabled→opacity 0.5

`src/styles/feedback.css`:
- 4 feedback states (pending/success/error/selected_info): matching bg/border/text color triples using rgba for soft tint
