# Iconography

**Style:** single-weight **line icons**, `stroke="currentColor"`, `fill="none"`,
`stroke-width` **1.7–1.8** (2 for +/−/arrows), 24×24 viewBox, rendered at 14–18px.
Icons inherit color from their container (`--ds-ink-4` idle, `--ds-accent` active,
`--ds-ink` on hover). Rounded joins read best (`stroke-linecap/linejoin:round`
optional but recommended).

> This diverges from FSSA's brand book (which specifies *filled* proprietary
> icons). The Data Hub product surface uses line icons for a lighter, modern-SaaS
> feel. If strict FSG icon parity is required later, swap in the FSSA filled set
> and tint to `--ds-ink` / `--ds-accent`. Line-icon substitutes: **Lucide**.

All paths below go inside:
```html
<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7">…</svg>
```

## Navigation / rail
| Name | Meaning | Inner SVG |
|---|---|---|
| **Map** | Home / map view (rail top, amber) | `<path d="M9 4 4 6v14l5-2 6 2 5-2V4l-5 2-6-2z"/><path d="M9 4v14M15 6v14"/>` |
| **Brand** (tag) | Filter by brand | `<path d="M20.6 13.4l-7.2 7.2a2 2 0 01-2.8 0l-6.2-6.2V4h9.4l6.8 6.8a2 2 0 010 2.6z"/><circle cx="7.5" cy="7.5" r="1.3"/>` |
| **Channel** (nodes) | Filter by channel | `<circle cx="6" cy="6" r="2.4"/><circle cx="18" cy="9" r="2.4"/><circle cx="9" cy="18" r="2.4"/><path d="M8 7l8 1M8 16l8-6"/>` |
| **Strategy** (target) | Filter by strategy (paid/organic/competitor) | `<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3.2"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2"/>` |
| **Layers** | Map layers / legend | `<path d="M12 3l9 5-9 5-9-5z"/><path d="M3 13l9 5 9-5"/>` |

## Actions / controls
| Name | Meaning | Inner SVG |
|---|---|---|
| **Drill-in** (↗) | Open detail screen (top-right of every widget) | `<path d="M7 17L17 7M9 7h8v8"/>` |
| **Search** | Query / search | `<circle cx="11" cy="11" r="7"/><path d="M21 21l-4-4"/>` |
| **Calendar** | Date range | `<rect x="3" y="4" width="18" height="17" rx="2"/><path d="M3 9h18M8 3v3M16 3v3"/>` |
| **Chevron down** | Dropdown / expand | `<path d="M6 9l6 6 6-6"/>` (stroke-width 2) |
| **Plus** | Zoom in | `<path d="M12 5v14M5 12h14"/>` (stroke-width 2) |
| **Minus** | Zoom out | `<path d="M5 12h14"/>` (stroke-width 2) |
| **Recenter** (target-dot) | Reset map view | `<circle cx="12" cy="12" r="7"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3"/>` |
| **Close** (✕) | Dismiss flyout/panel | `<path d="M6 6l12 12M18 6L6 18"/>` (stroke-width 2) |
| **Send / launch** | Launch / open campaign | `<path d="M22 2L11 13M22 2l-7 20-4-9-9-4z"/>` |
| **Doc / brief** | Campaign specs | `<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 8h6M9 12h6"/>` |

## Channel glyphs (for detail views)
| Channel | Inner SVG |
|---|---|
| **LinkedIn** | `<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M7 10v7M7 7v.01M11 17v-4M15 17v-2.5a1.5 1.5 0 013 0V17"/>` |
| **Website / globe** | `<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.5 2.5 15 0 18M12 3c-2.5 2.5-2.5 15 0 18"/>` |
| **Email** | `<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M4 7l8 6 8-6"/>` |
| **Forms** | `<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 8h6M9 12h6M9 16h3"/>` |
| **CRM / contact** | `<circle cx="12" cy="8" r="3.2"/><path d="M5.5 20a6.5 6.5 0 0113 0"/>` |

## Brand mark (placeholder)
The wordmark uses a white rounded tile with a navy stylised **F** glyph. This is a
**placeholder** — replace with the official First Sentier Group logo lockup for
production.
```html
<div style="width:28px;height:28px;border-radius:7px;background:#fff;display:flex;align-items:center;justify-content:center">
  <svg width="15" height="15" viewBox="0 0 24 24" fill="#0c1f39"><path d="M5 3h14v4h-9v4h7v4h-7v6H5z"/></svg>
</div>
```

## Usage rules
- Never use emoji as icons.
- One icon = one meaning; keep the drill-in ↗ exclusively for "opens a screen".
- Active state: color to `--ds-accent`; never fill line icons.
- Size 17px inside 40px rail tiles; 14–16px inline; 13–15px in chips.
