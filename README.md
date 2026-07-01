# Marketing Data Hub

Front-end mockups for the First Sentier Group **Marketing Data Hub** — a single,
governed source of truth that consolidates marketing performance data across all
channels and source systems, with a conversational query surface and feeds into
bespoke monthly / quarterly reporting.

> **Status:** presentation-layer mockups with **dummy data**. No backend, no live
> data connections yet. Ingestion pipelines live in the sibling `alphix-mi-pipeline`
> and `hubspot-mi-pipeline` repos.

## What's here

| Path | Purpose |
|---|---|
| `index.html` | **Main command-centre** dashboard (map + filters + KPIs + widget rail) |
| `assets/data.js` | Dummy data — shapes follow `design-system/DATA-MODEL.md`. Swap for a live adapter later |
| `assets/app.js` | Runtime — Leaflet map, semantic pins, AND-combined filters, flyouts, charts |
| `design-system/` | The design system (tokens, components, icons, layout, data model) + `reference.html` |

## Run it

Pure static files — no build step. Open `index.html` in a browser, or serve the
folder:

```bash
python -m http.server 8000    # then open http://localhost:8000
```

The satellite basemap (Esri tiles) needs a live internet connection.

## Design language

Dark "command-centre": glassmorphic panels floating over a live satellite map,
a warm **amber** accent on deep navy, Urbanist + JetBrains Mono. The map is the
canvas; amber marks what is *live / active*. Every widget's drill-in ↗ arrow is
intended to open a dedicated detail screen (next milestone). Full spec in
[`design-system/README.md`](design-system/README.md).

## Roadmap

- [x] Main command-centre dashboard (this pass)
- [ ] Drill-in detail screens — channel deep-dive, campaign detail, funnel health, share of voice
- [ ] Wire the conversational search bar to a query / LLM layer
- [ ] Recompute KPIs + widgets on filter + date-range change
- [ ] Replace dummy `data.js` with live adapters (GA4, LinkedIn, Alphix, HubSpot, Salesforce, …)
- [ ] Swap the placeholder brand mark for the official FSG logo lockup

## Data sources in scope (per PMO business case)

LinkedIn (paid + organic), Google Trends, search / competitor ranking, AI answers &
citations, podcasts, advertorial, website analytics, email, forms, events, WhatsApp
Business (Asia) — via Adobe Analytics, Alphix, Brightcove, GA4, GSC, HubSpot,
LinkedIn Campaign Manager, Salesforce Marketing Cloud, Signal AI, Siteimprove,
Transistor, and retained Pardot history.
