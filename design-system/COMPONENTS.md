# Components

Every floating surface is glass (`.ds-glass` / `.ds-glass-strong`). Values below
reference tokens in `tokens.css`. Markup uses inline styles for portability; port
to your component framework as needed.

---

## Glass panel
```html
<div class="ds-glass" style="border-radius:var(--ds-r-2xl);padding:16px 17px;
     box-shadow:var(--ds-shadow-panel)">…</div>
```
Standard side panels/flyouts use `--ds-r-2xl` (15px) + `--ds-shadow-panel`.
Popups use `.ds-glass-strong` + `--ds-shadow-pop`.

## Data / widget card
```html
<div class="ds-glass ds-card" style="border-radius:var(--ds-r-xl);padding:14px 16px">
  <div style="display:flex;align-items:flex-start;justify-content:space-between">
    <div>
      <div style="font-size:var(--ds-fs-title);font-weight:600">Reach Analysis</div>
      <div style="font-size:var(--ds-fs-micro);color:var(--ds-ink-5);margin-top:1px">Impressions by week</div>
    </div>
    <svg class="ds-drill" width="14" height="14" viewBox="0 0 24 24" fill="none"
         stroke="currentColor" stroke-width="1.9"><path d="M7 17L17 7M9 7h8v8"/></svg>
  </div>
  <!-- chart / body -->
</div>
```
`.ds-card` hover warms the border to amber and turns the `.ds-drill` arrow amber.

## KPI chip
```html
<div class="ds-glass" style="border-radius:var(--ds-r-lg);padding:11px 15px;min-width:116px">
  <div style="font-size:var(--ds-fs-micro);color:var(--ds-ink-4)">Total reach</div>
  <div style="display:flex;align-items:baseline;gap:6px;margin-top:5px">
    <span class="ds-num" style="font-size:var(--ds-fs-kpi);font-weight:300">545.0k</span>
    <span style="font-size:var(--ds-fs-small);color:var(--ds-positive)">↑ 71%</span>
  </div>
</div>
```

## Ring-gauge mini stat
Used in channel cards (two per card). 26px SVG donut + label/value.
```html
<div style="display:flex;align-items:center;gap:8px">
  <svg width="26" height="26" viewBox="0 0 42 42">
    <circle cx="21" cy="21" r="16" fill="none" stroke="rgba(255,255,255,.12)" stroke-width="4"/>
    <circle cx="21" cy="21" r="16" fill="none" stroke="var(--ds-cyan)" stroke-width="4"
            stroke-dasharray="70 30" stroke-dashoffset="25" transform="rotate(-90 21 21)"/>
  </svg>
  <div style="line-height:1.25">
    <div style="font-size:9.5px;color:var(--ds-ink-5)">Keywords</div>
    <div style="font-size:var(--ds-fs-value);font-weight:600">216</div>
  </div>
</div>
```
`stroke-dasharray` is `value 100-value` (circumference normalized to 100);
`stroke-dashoffset:25` starts the arc at 12 o'clock. Use amber for the "primary"
metric, cyan for secondary/neutral.

## Status / filter badge
```html
<span class="ds-badge ds-badge--active">ACTIVE</span>       <!-- amber -->
<span class="ds-badge ds-badge--growing">vs peers</span>    <!-- cyan  -->
```
Inline channel status uses a dot + label:
```html
<span style="display:flex;align-items:center;gap:5px;font-size:10px;color:var(--ds-positive)">
  <span style="width:5px;height:5px;border-radius:50%;background:var(--ds-positive)"></span>Organic</span>
```

## Icon button / tile
```html
<div class="ds-tbtn" title="Filter by brand"
     style="position:relative;width:40px;height:40px;border-radius:var(--ds-r-md);
            display:flex;align-items:center;justify-content:center;border:1px solid transparent">
  <svg width="17" height="17" …><!-- see ICONS.md --></svg>
  <span style="position:absolute;top:6px;right:6px;width:6px;height:6px;border-radius:50%;
               background:var(--ds-accent);box-shadow:0 0 6px var(--ds-accent)"></span> <!-- active-filter dot -->
</div>
```
Add `.ds-tbtn--active` (or its inline equivalent — amber bg + amber border +
amber icon) when the tile's menu is open.

## Filter flyout
```html
<div class="ds-glass" style="position:absolute;left:74px;top:76px;width:200px;
     border-radius:var(--ds-r-2xl);padding:12px 10px;box-shadow:var(--ds-shadow-menu)">
  <div style="display:flex;justify-content:space-between;padding:0 6px 9px">
    <span class="ds-eyebrow">Filter by brand</span>
    <span class="ds-tbtn" style="width:20px;height:20px;border-radius:6px;display:flex;
          align-items:center;justify-content:center">✕</span>
  </div>
  <!-- rows -->
  <div class="ds-row ds-row--active" style="display:flex;align-items:center;gap:10px;padding:7px 9px">
    <span style="width:30px;height:26px;border-radius:var(--ds-r-sm);display:flex;
          align-items:center;justify-content:center;font-size:9px;font-weight:700;
          background:var(--ds-accent);color:var(--ds-accent-ink)">FS</span>
    <span style="font-size:12px;font-weight:600">FSSA</span>
    <span class="ds-num" style="margin-left:auto;font-size:10.5px;color:var(--ds-accent)">4</span>
  </div>
</div>
```
Row states: idle (`.ds-row`), hover (auto), selected (`.ds-row--active` + amber
mono tile + amber count). Mono tile is `rgba(255,255,255,.09)` / `--ds-ink-2` when idle.

## Search bar (top, conversational)
```html
<label class="ds-glass" style="display:flex;align-items:center;gap:10px;height:40px;
       padding:0 12px 0 14px;border-radius:var(--ds-r-lg);max-width:560px;flex:1">
  <svg …search icon, stroke var(--ds-ink-5)…></svg>
  <span style="flex:1;font-size:var(--ds-fs-body);color:var(--ds-ink-3)">Ask anything — “…”</span>
  <span style="font-size:10px;font-weight:600;color:var(--ds-ink-5);border:1px solid var(--ds-glass-border);
        border-radius:5px;padding:3px 6px;font-family:var(--ds-font-mono)">⌘K</span>
</label>
```

## Date range selector (Google-Analytics style)
Closed control shows a 2-line "DATE RANGE / 1 Jan – 31 Mar 2026" + caret. Open
popover: preset list (left, `.ds-row`; "This quarter" active), start/end fields,
a month calendar (in-range days `--ds-accent-soft`, end cap solid amber), a
"Compare: prior period" toggle, and Cancel / **Apply** (`.ds-cta`) buttons.
```html
<div class="ds-glass ds-tbtn" style="display:flex;align-items:center;gap:9px;height:38px;
     padding:0 11px;border-radius:var(--ds-r-md)">
  <svg …calendar…></svg>
  <div style="display:flex;flex-direction:column;line-height:1.15">
    <span class="ds-eyebrow" style="font-size:9px">Date range</span>
    <span style="font-size:12px;font-weight:500;color:var(--ds-ink-1)">1 Jan – 31 Mar 2026</span>
  </div>
  <svg …chevron down…></svg>
</div>
```

## Primary CTA & zoom controls
```html
<span class="ds-cta" style="display:flex;align-items:center;justify-content:center;
      width:32px;height:32px;border-radius:var(--ds-r-md)">→</span>

<div class="ds-glass ds-tbtn" style="width:36px;height:36px;border-radius:var(--ds-r-md);
     display:flex;align-items:center;justify-content:center;color:var(--ds-ink-2)">＋</div>
```

## Map pin (Leaflet divIcon)
```js
const html = `<span class="ring" style="--c:${color};width:26px;height:26px;
  margin:-13px 0 0 -13px"></span><span class="dot" style="--c:${color};width:13px;height:13px"></span>`;
L.divIcon({ className:'ds-pin', iconSize:[13,13], iconAnchor:[6.5,6.5], html });
```
Colours: active `var(--ds-accent)`, growing `var(--ds-cyan)`, competitor
`var(--ds-neutral)`. Featured pins are larger (13px dot / 26px ring) and bind a
`.ds-pop` popup; smaller pins are 9px / 18px.

## Map popup (glass)
```js
marker.bindPopup(html, { closeButton:false, autoClose:false, closeOnClick:false,
                         autoPan:false, className:'ds-pop', offset:[8,-2] });
```
Popup body: place name + `LIVE` badge, one meta line, a big number (23px/300) +
green delta, and a unit line.

---

## Charts

Keep charts minimal, ~50px tall, inline SVG, no gridlines unless needed.
- **Bars:** `--ds-chart-bar` for baseline, `--ds-accent` to highlight a span.
- **Lines:** `--ds-accent` primary, `--ds-cyan` secondary (`opacity:.8`),
  2px stroke, round end dots; dashed amber threshold line + "Watch" label for
  attention markers.
- **Peer bars:** the FSG bar in `--ds-accent`, peers in `--ds-chart-bar`.
- All numeric labels: `.ds-num` (tabular). Axis/units: `--ds-ink-6`.
