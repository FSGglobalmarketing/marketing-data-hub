# Handoff notes (for Claude Code / engineering)

This folder is a **design system + reference build** for the FSG Marketing Data
Hub. It is presentation-layer only — no backend, no real data connections.

## Files

| File | What it is |
|---|---|
| `README.md` | Master design doc — principles, type, color, radii, motion, map recipe, quick start |
| `tokens.css` | Drop-in CSS variables + utility classes (`.ds-*`). The single source of truth for styling |
| `LAYOUT.md` | Screen anatomy, region insets & z-index, responsiveness |
| `COMPONENTS.md` | Copy-paste markup for every component |
| `ICONS.md` | Full line-icon set with raw SVG paths |
| `DATA-MODEL.md` | Campaign/marker schema, filter dimensions, channels→sources, KPIs, conventions |
| `example.html` | Minimal self-contained render (tokens + static gradient, no map) — fastest way to eyeball the tokens |
| `reference.html` | **Full standalone build** of the live dashboard (map + filters + widgets) inlined into one file |
| `HANDOFF.md` | This file |

## Stack in the reference build

- **Vanilla HTML/CSS/JS** + inline styles for layout; `tokens.css` for the system.
- **Leaflet 1.9.4** (`unpkg`) with **Esri World Imagery** raster tiles + a faint
  boundaries/labels overlay; tiles graded dark via a CSS filter.
- **Fonts:** Urbanist + JetBrains Mono (Google Fonts).
- No framework required. The interaction logic (filters, flyout, date picker,
  zoom) is a small state object + event handlers; port to React/Vue/etc. freely —
  the classes and tokens are framework-agnostic.

> `reference.html` was exported from the original design tool, so it carries a
> small self-contained runtime wrapper. Treat it as a **visual reference**, not
> the production codebase — rebuild cleanly against `tokens.css` + the component
> markup in `COMPONENTS.md`.

## Recommended production architecture

```
app/
  styles/tokens.css        ← copy from here verbatim
  components/
    GlassPanel, DataCard, KpiChip, RingGauge, Badge,
    IconButton, FilterFlyout, SearchBar, DateRangePicker,
    MapPin, MapPopup, WidgetRail
  map/  (Leaflet init + marker layer + filter application)
  data/ (adapters per source — see DATA-MODEL.md)
```

State to model: `{ brand, channel, strategy, openMenu, dateRange, compare }`.
Filters combine with AND and drive both the map markers and (future) the KPI/
widget values.

## Integration TODO (wiring real data)

1. Replace sample `campaigns[]` with a live feed (see `DATA-MODEL.md` schema).
2. Connect channel sources: GA4, LinkedIn Ads, Google Ads/GSC/BrightEdge, ESP,
   Marketo forms, Salesforce, and a competitor/SoV provider.
3. Make the header KPIs + widget values recompute on filter + date-range change
   (currently static in the reference).
4. Wire the **natural-language search** bar to your query/LLM layer; render
   answers as a synthesised card + drill target.
5. Make **drill-in ↗** arrows and map pins open real detail screens (channel
   deep-dive, campaign detail, funnel view, peer benchmark).
6. Make the **date range picker** actually filter (presets + custom + compare).

## Known limitations / must-swap

- **Map needs a live connection** (Esri tiles). For offline/air-gapped, self-host
  a raster basemap or use a static image; keep `crossOrigin:true` so export/canvas
  tooling can rasterize tiles.
- **Brand mark is a placeholder** (drawn "F" glyph) — swap for the official First
  Sentier Group logo lockup.
- **No real FSSA/FSG photography or licensed imagery** is included.
- **Accessibility:** dark glass + imagery can drop contrast — verify text meets
  WCAG AA over the busiest map regions; the scrim gradient helps but test.
- Reference values are **illustrative**, not real performance data.

## Brand lineage note

This product surface intentionally diverges from the institutional FSSA brand
book (navy + red, filled proprietary icons, print-restrained) toward a **dark
navy + amber, line-icon, spatial SaaS** aesthetic (ref: Ron Design Lab). Keep the
amber accent inside the product; reserve FSSA red for corporate/brand contexts.
If strict brand parity is later required, the swap points are: accent color,
icon set (→ FSSA filled), and the logo mark.
