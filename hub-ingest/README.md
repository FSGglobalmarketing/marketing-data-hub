# hub-ingest

Pulls the live `*-mi-pipeline` sources into the Marketing Data Hub's data feeds.

```
GA-website-api  ┐
smartsheets-API ┼─(read-only clone)─► ingest.py ─► assets/data/*.json  ─► dashboard
linkedin-API    ┘                          └─► assets/img/ad_media/**   (example ads)
```

Zero dependencies — pure Python standard library. Designed feed-first so the same
JSON shapes load into the **Snowflake** database (InfoSec) later without reshaping.

## Feeds produced (`assets/data/`)

| Feed | Source | Shape |
|---|---|---|
| `channel-tracker.json` | Smartsheet Channel tracker | array of marketing activities (map + list) |
| `website.json` | GA4 traffic-by-channel | `{byBrand:[…sessions,users,engagementRate…], byChannel:[…]}` |
| `linkedin.json` | LinkedIn Ads | `{byBrand:[…impressions,clicks,spend,ctr…], topCreatives:[…copy,image,impressions]}` |

Brand labels from the feeds map to the dashboard brand ids (`fssa/stewart/fsi/rqi/igneo`)
via `brand_map` in [`sources.json`](sources.json). LinkedIn ad thumbnails are copied to
`assets/img/ad_media/<brand>/…` and referenced by `topCreatives[].image`.

## How it runs

The **Refresh hub data** Action (`.github/workflows/refresh-data.yml`) runs daily:
clones each repo in `sources.json` (via the `SOURCES_READ_TOKEN` secret), runs
`ingest.py`, and commits the refreshed feeds. GitHub Pages then serves them.

### Setup (once)

Add a repo secret **`SOURCES_READ_TOKEN`** — a PAT that can **read** the private
source repos (classic: `repo` scope; or fine-grained: *Contents → Read-only* on
`GA-website-api`, `smartsheets-API`, `linkedin-API`). Then *Actions → Refresh hub data
→ Run workflow*.

## Local run

```bash
# check out the source repos under sources/ yourself, then:
python hub-ingest/ingest.py --sources-dir sources --out assets/data --img assets/img
```

## Adding a source

1. Add the repo name to `repos` in `sources.json` (and any brand labels to `brand_map`).
2. Add a `build_<source>()` transform in `ingest.py` and register it in `main()`.
3. Point a dashboard widget at the new `assets/data/<source>.json`.
