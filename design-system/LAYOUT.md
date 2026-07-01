# Layout & screen anatomy

Reference artboard: **1440 × 900**. The frame has `border-radius: 18px`,
`overflow:hidden`, and the satellite map bleeds to all four edges behind
floating glass. For production, treat 1440×900 as the design reference and let
the frame fill the viewport (`100vw × 100vh`); all panels are absolutely
positioned against the frame with fixed insets, so they hold at larger heights.

```
┌──────────────────────────────────────────────────────────────────────┐
│  TOP BAR  (z 20)                                                       │
│  [logo · FSG]   [ 🔍 Ask anything … ⌘K ]        [● Live·14] [📅 date ▾] │
├──┬─────────────────────────────────────────────────────────────────┬──┤
│▐▌│  Data Hub                                          (title, z 12)  │  │
│  │  [Active campaigns] [Total reach] [Live pipeline]  (KPI chips)    │+ │
│IC│                                                                   │– │
│ON│                      · · ·  SATELLITE MAP  · · ·          (zoom)  │⊚ │
│RA│           glowing pins + one glass popup (z 0/scrim z 1)          │  │
│IL│                                                                   │  │
│▐▌│  (flyout opens here when a filter icon is clicked, z 16)          │  │
├──┴─────────────────────────────────────────────────────────────────┴──┤
│  BOTTOM WIDGET RAIL  (z 15, always visible, transparent glass)         │
│  Row 1: [featured campaign] [Search] [Website] [Email]                 │
│  Row 2: [Reach Analysis] [Funnel Health] [Cost per Lead] [Share of V.] │
└──────────────────────────────────────────────────────────────────────┘
```

## Regions & insets

| Region | Position | z-index | Notes |
|---|---|---|---|
| Map | `inset:0` | 0 | Leaflet container |
| Map scrim | `inset:0` | 1 | `.ds-map-scrim`, `pointer-events:none` |
| Top bar | `top:0; left:0; right:0; height:60px` | 20 | gradient fade `rgba(8,18,34,.72)→0`, `padding:0 18px` |
| Left icon rail | `left:16px; top:76px` | 17 | glass, vertical, `padding:8px; gap:6px` |
| Filter flyout | `left:74px; top:76px; width:200px` | 16 | conditional; opens beside rail |
| Title + KPI | `top:80px; left:78px` | 12 | title then KPI chip row (`gap:10px; margin-top:18px`) |
| Zoom controls | `right:18px; top:200px` | 15 | glass stack, `gap:6px` |
| Widget rail | `left:16px; right:16px; bottom:14px` | 15 | flex column, `gap:11px` |

## Top bar

- **Left:** white rounded logo tile (28px, `#fff` bg, navy glyph) + two-line
  wordmark ("First Sentier Group" / "Marketing intelligence" 9.5px `--ds-ink-5`).
- **Center:** conversational search — `.ds-glass` pill, `height:40px`,
  `max-width:560px`, search icon + placeholder (`--ds-ink-3`) + `⌘K` kbd hint.
  This is the primary query surface (natural-language).
- **Right:** live status chip (green dot + "Live · 14 active"), **GA-style date
  range selector**, nothing else (no account avatar — the product is not
  account-based).

## Left icon rail (filters)

Minimal icon tiles. First tile = **Map/home** (amber, active view). A hairline,
then three **filter** icons — **Brand**, **Channel**, **Strategy** — then a
hairline and **Layers**. Clicking a filter icon:
- toggles a **flyout** panel beside the rail (`.ds-glass`, 200px),
- highlights the icon (`.ds-tbtn--active` amber),
- shows an **amber dot** top-right of the icon while that filter ≠ "all".

The flyout is a titled list of `.ds-row` options with a mono tile, label, and
count; the selected row is `.ds-row--active`. Selecting filters the map pins
(brand ∧ channel ∧ strategy). The **Layers** flyout is the color-key legend
(active / SoV growing / competitor).

## Title + KPI cluster

`Data Hub` in 44px/300 with a soft text-shadow for legibility over imagery,
then a row of three KPI chips (`.ds-glass`, `--ds-r-lg`, `min-width:116px`):
label (10.5px `--ds-ink-4`) + value (23px/300) + delta (amber or green).

## Bottom widget rail (always-visible, transparent)

Docked to the bottom, full width, two rows of glass cards. This is the
persistent "instrument panel" — it never scrolls away.

- **Row 1 — channel/campaign cards.** `grid-template-columns: 1.7fr 1fr 1fr 1fr`.
  - Card 1 (**featured, wide**): campaign name + `ACTIVE` badge, reach + drill
    arrow, a 2-line description, and a footer with a "Campaign specs" chip + a
    send/launch action.
  - Cards 2–4 (Search / Website / Email): title + status dot + drill arrow, then
    two mini **ring-gauge stats** (value + label).
- **Row 2 — analytics widgets.** `grid-template-columns: repeat(4,1fr)`.
  Each: title + subtitle (`--ds-ink-5`) + drill arrow, then a compact chart
  (bars / threshold line / dual line / peer bars) ~50px tall, and a footer stat.

Every card is `.ds-glass .ds-card` (hover warms the border + drill arrow to amber).

## Responsiveness / handoff notes

- Panels use fixed insets, so the composition holds as the frame grows; the map
  reflows automatically (call `map.invalidateSize()` after layout changes).
- Minimum comfortable height ≈ 760px before the title cluster and the widget
  rail begin to crowd; below that, collapse Row 2 or move KPIs into the top bar.
- Hit targets: icon tiles 40×40, control chips ≥ 34px tall.
