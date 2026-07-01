# FSG Data Hub — Design System

A dark, cinematic **command-center** aesthetic for the First Sentier Group
**Marketing Data Hub** ("Data Hub"). The signature is glassmorphic panels
floating over a live satellite map, a warm **amber** accent against deep navy,
generous negative space, light-weight display type, and restrained motion.

> **Lineage.** First Sentier Group is the parent brand; FSSA Investment Managers
> is one of its affiliates. This system deliberately reinterprets the institutional
> FSG identity as a modern retail-SaaS product surface (reference: Ron Design Lab
> case studies — Vexto/traffic dashboards). Where the FSG/FSSA brand is navy +
> red and print-restrained, the Data Hub is **navy + amber, dark, and spatial.**
> Keep the amber accent; do **not** reintroduce the FSSA red inside the product.

---

## 0. What's in this folder

| File | Purpose |
|---|---|
| `README.md` | This master doc |
| `tokens.css` | Drop-in CSS variables + utility classes — the styling source of truth |
| `LAYOUT.md` | Screen anatomy, region insets & z-index |
| `COMPONENTS.md` | Copy-paste markup for every component |
| `ICONS.md` | Full line-icon set with raw SVG paths |
| `DATA-MODEL.md` | Campaign/marker schema, filters, channels→sources, KPIs, conventions |
| `example.html` | Minimal self-contained token render (no map) |
| `reference.html` | **Full standalone build** of the live dashboard (map + filters + widgets) |
| `HANDOFF.md` | Engineering handoff: stack, architecture, integration TODOs, limitations |

---

## 1. Aesthetic principles

1. **The map is the canvas.** A full-bleed satellite basemap sits behind
   everything. All UI is glass panels floating on top — nothing is a solid,
   opaque page. Content legibility comes from a scrim gradient + blur, never
   from filling the screen with a flat color.
2. **Amber is the only warm.** One accent (`#f4ad44`) marks what's *live*,
   *primary*, or *actionable*. Everything else is cool (navy, cyan, slate).
   Data uses a small, fixed hue set (amber / cyan / green / neutral).
3. **Light display, tabular data.** Big headings and KPI numbers are weight
   **300**; labels and values are **600**. Numbers always use tabular figures.
4. **Flat-leaning glass.** Definition comes from a 1px translucent border and a
   soft wide shadow — not from heavy chrome. Radii are moderate (14px cards),
   never bubbly.
5. **Calm motion.** 200ms color/border transitions on hover; a single slow
   pulse ring on live map pins. No bounce, no parallax, no spring.
6. **Every widget can drill in.** A NE arrow (↗) top-right signals a panel
   opens a dedicated detail screen.

---

## 2. Typography

| Role | Family | Size | Weight | Notes |
|---|---|---|---|---|
| Screen title | Urbanist | 44px | 300 | e.g. "Data Hub"; `letter-spacing:-.02em`; subtle text-shadow over map |
| KPI number | Urbanist | 23px | 300 | tabular figures |
| Widget value | Urbanist | 14px | 600 | tabular |
| Widget / card title | Urbanist | 13px | 600 | sentence case |
| Body / search | Urbanist | 13.5px | 400 | |
| Caption / label | Urbanist | 12px | 400–500 | |
| Chip / table | Urbanist | 11.5px | 400 | |
| Muted meta | Urbanist | 10.5px | 400 | color `--ds-ink-6` |
| Eyebrow / unit | Urbanist | 9px | 600 | ALL CAPS, `letter-spacing:.12em` |
| Numeric / kbd | JetBrains Mono | 10–12px | 400–500 | `⌘K`, code-ish counters |

**Families**

```css
--ds-font-sans: 'Urbanist', system-ui, -apple-system, sans-serif;
--ds-font-mono: 'JetBrains Mono', ui-monospace, Menlo, monospace;
```

```html
<link href="https://fonts.googleapis.com/css2?family=Urbanist:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
```

Casing is **sentence case** for everything except tiny ALL-CAPS eyebrows
(e.g. `FILTER BY BRAND`, `DATE RANGE`). No exclamation marks; institutional,
third-person voice inherited from FSG.

---

## 3. Color

### Surfaces
| Token | Hex / value | Use |
|---|---|---|
| `--ds-bg-page` | `#0a1220` | Outermost desk / body behind the frame |
| `--ds-bg-frame` | `#0a1424` | App frame fallback (under the map) |
| `--ds-bg-gradient` | `radial-gradient(120% 90% at 50% 0%, #143257, #0c1f39 45%, #081427)` | Signature vignette for solid dark screens / behind map |
| `--ds-navy-1/2/3` | `#143257` / `#0c1f39` / `#081427` | Gradient stops, deep fills |

### Glass
| Token | Value | Use |
|---|---|---|
| `--ds-glass-fill` | `rgba(10,24,42,.50)` | Standard floating panel |
| `--ds-glass-fill-strong` | `rgba(9,22,40,.78)` | Popups / dense panels |
| `--ds-glass-fill-hover` | `rgba(14,32,56,.62)` | Card hover |
| `--ds-glass-border` | `rgba(255,255,255,.12)` | Panel edge |
| `--ds-glass-border-hover` | `rgba(244,173,68,.50)` | Card hover edge (warms to amber) |
| `--ds-hairline` | `rgba(255,255,255,.10)` | Dividers inside glass |
| blur | `14px` (panels), `16px` (strong) | `backdrop-filter` |

### Accent & data
| Token | Hex | Meaning |
|---|---|---|
| `--ds-accent` | `#f4ad44` | **Amber** — primary accent, active campaigns, CTAs, selected |
| `--ds-accent-soft` | `rgba(242,163,68,.16)` | Amber wash (badges, active rows, hover) |
| `--ds-accent-border` | `rgba(242,163,68,.35)` | Amber edge on active tiles |
| `--ds-cyan` | `#5ec8e6` | Secondary data / "share of voice growing" pins |
| `--ds-positive` | `#7fdca0` | Positive deltas (↑), good status |
| `--ds-neutral` | `#9db2cc` | Competitor / peer markers, inactive |
| `--ds-chart-bar` | `#3a5c82` | Muted bars & non-highlighted chart series |

### Text ramp (on dark)
`#ffffff` → `--ds-ink-1 #e6edf4` (headings/values) → `--ds-ink-2 #cdd9e6`
(body) → `--ds-ink-3 #aebfd2` → `--ds-ink-4 #9fb3cc` (icon idle) →
`--ds-ink-5 #8ba1bd` (meta) → `--ds-ink-6 #7e93ac` (muted/units/axis).

**Semantics for pins & data:** amber = active campaign · cyan = share-of-voice
growing · neutral (`#9db2cc`) = competitor/peer · green = positive delta.

---

## 4. Radii, elevation, spacing

**Radii** (flat-leaning): `--ds-r-sm 7` · `--ds-r-md 9` (buttons/chips) ·
`--ds-r-lg 11` (search/KPI) · `--ds-r-xl 14` (cards) · `--ds-r-2xl 15`
(panels/flyouts) · `--ds-r-frame 18` (app frame) · `--ds-r-pill 20` (badges).

**Elevation** — soft, wide, dark; glass gets a border for definition, shadow for lift:
```
--ds-shadow-panel: 0 20px 50px -18px rgba(0,0,0,.60);
--ds-shadow-pop:   0 18px 44px -14px rgba(0,0,0,.65);
--ds-shadow-menu:  0 24px 60px -20px rgba(0,0,0,.65);
--ds-shadow-frame: 0 40px 100px -30px rgba(0,0,0,.70);
```

**Spacing** — 4pt base. Common: panel padding `12–16px`, card padding `13–16px`,
inter-card gap `11px`, control gap `6–9px`.

---

## 5. Motion

- Hover: `transition: … .2s ease` on background / color / border only. Border
  warms to amber on card hover; drill arrow (↗) turns amber.
- Map pins: one slow expanding ring, `ds-pulse 2.6s ease-out infinite`
  (active pins pulse; smaller data pins may be static).
- **No** scale-on-hover, bounce, spring, or parallax. Popups **do not** auto-pan
  the map (`autoPan:false`), and double-click zoom is disabled to keep the map
  visually stable.

---

## 6. The map (Leaflet + Esri satellite)

The basemap is **Leaflet 1.9.4** with **Esri World Imagery** tiles + a faint
boundaries/labels overlay, graded dark via a CSS tile filter.

```js
const map = L.map(el, {
  zoomControl:false, attributionControl:false,
  minZoom:2, maxZoom:11, zoomSnap:0.1,
  worldCopyJump:true, scrollWheelZoom:true, doubleClickZoom:false
}).setView([26, 64], 2.6);   // Africa/Arabia-centred world view

L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
  { maxZoom:19, crossOrigin:true }).addTo(map);
L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
  { maxZoom:19, opacity:0.28, crossOrigin:true }).addTo(map);
```

- `crossOrigin:true` is **required** so canvas/export tooling can rasterize tiles.
- Grade the imagery with `.leaflet-tile-pane { filter: brightness(.6) contrast(1.06) saturate(.82); }`.
- Add `.ds-map-scrim` (see tokens) as a sibling ABOVE the map, `pointer-events:none`,
  so clicks still reach the map and markers.
- **Pins** are `L.divIcon` using `.ds-pin` markup; colour by semantic
  (amber/cyan/neutral). Featured pins bind a `.ds-pop` glass popup
  (`closeButton:false, autoClose:false, autoPan:false`).
- Custom `+ / – / recenter` controls live in a floating glass stack (top-right of
  the map body); the native Leaflet zoom control is hidden.

> Attribution: keep a small "Imagery © Esri, Maxar, Earthstar Geographics" line.
> Tiles need a live connection. For an offline/air-gapped build, swap in a
> self-hosted raster or a static image basemap.

See **LAYOUT.md** for the full screen anatomy and **COMPONENTS.md** for each part.
Icons and their SVG sources are in **ICONS.md**. Drop-in tokens & utilities are
in **tokens.css**.

---

## 7. Quick start

```html
<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <link href="https://fonts.googleapis.com/css2?family=Urbanist:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css">
  <link rel="stylesheet" href="tokens.css">
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
</head>
<body>
  <!-- App frame: 1440×900 reference artboard; scale/fluid for production -->
  <div style="position:relative;width:1440px;height:900px;overflow:hidden;
              border-radius:var(--ds-r-frame);background:var(--ds-bg-frame);
              box-shadow:var(--ds-shadow-frame)">
    <div id="map" style="position:absolute;inset:0;z-index:0"></div>
    <div class="ds-map-scrim"></div>
    <!-- floating glass panels go here, z-index ≥ 5 … -->
  </div>
</body>
</html>
```

Example panel:

```html
<div class="ds-glass ds-card" style="border-radius:var(--ds-r-xl);padding:14px 16px">
  <div style="display:flex;justify-content:space-between;align-items:center">
    <span style="font-size:var(--ds-fs-title);font-weight:600">Search</span>
    <svg class="ds-drill" width="14" height="14" viewBox="0 0 24 24" fill="none"
         stroke="currentColor" stroke-width="1.9"><path d="M7 17L17 7M9 7h8v8"/></svg>
  </div>
</div>
```
