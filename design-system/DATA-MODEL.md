# Data model & content spec

The Data Hub visualises marketing data across the customer-journey pipeline and
every channel, differentiating **Paid vs Organic** and including **peer /
competitor** data. This is the shape the UI expects. Values in the reference
build are representative sample data.

## Campaign / map marker

Each map pin is a campaign (or a competitor signal):

```ts
type Campaign = {
  city: string;          // display name, e.g. "Hong Kong"
  lat: number;           // WGS84
  lng: number;
  brand: BrandId;        // FSG affiliate (or 'peer' for competitor)
  channel: ChannelId;
  strategy: StrategyId;  // 'paid' | 'organic' | 'competitor'
  color: string;         // semantic marker colour (see below)
  big?: boolean;         // featured pin (larger + pulse + popup)
  popup?: string;        // HTML for the glass popup (featured only)
};
```

**Marker colour = status semantic**, not brand:
- `#f4ad44` amber — **active campaign**
- `#5ec8e6` cyan — **share of voice growing** in that market
- `#9db2cc` neutral — **competitor / peer** activity

## Filter dimensions

Three independent filters combine with logical **AND**. Each has an "all" option.

| Dimension | IDs | Notes |
|---|---|---|
| **Brand** | `all, fssa, stewart, fsi, rqi, igneo` | FSG affiliates. `peer` markers show only under "all" and are hidden when a specific brand is selected. |
| **Channel** | `all, search, linkedin, website, email, forms, salesforce` | `forms` & `salesforce` may have 0 active campaigns but still list (count 0). |
| **Strategy** | `all, paid, organic, competitor` | Paid vs Organic is a first-class split; `competitor` reveals peer markers. |

Filter counts are derived live: `count(dim, id) = campaigns.filter(c => c[dim]===id).length`,
and `all = campaigns.length`.

## Brands (FSG affiliates)

| id | Label | Mono tile |
|---|---|---|
| `fssa` | FSSA | `FS` |
| `stewart` | Stewart Investors | `SI` |
| `fsi` | First Sentier | `FSI` |
| `rqi` | RQI Investors | `RQI` |
| `igneo` | Igneo | `IG` |
| `peer` | (competitor) | — |

## Channels & their source systems

The hub ingests up and down the funnel; each channel maps to a source:

| Channel | Typical source | Paid / Organic | Example metrics |
|---|---|---|---|
| Search (SEO/SEM) | BrightEdge / GSC / Google Ads | both | ranking keywords, impressions, CPC |
| LinkedIn | LinkedIn Ads + organic | both | impressions, engagement rate, CPL |
| Website | GA4 | organic (+ referral) | sessions, users, conversions |
| Email | ESP (opens/clicks) | paid nurture / organic | opens, CTR, MQLs |
| Forms / lead capture | Marketo / form tool | — | submissions, conversion rate |
| Salesforce (CRM) | Salesforce contacts/opps | — | opportunities, pipeline value, win rate |
| Competitor / peer | third-party SoV / share tools | competitor | share of voice, delta vs FSG |

## Funnel stages (customer journey)

Awareness → Consideration → Conversion → Loyalty. The "Funnel Health" widget
plots stage-to-stage conversion with a dashed **"Watch"** threshold line where a
stage is underperforming.

## KPIs & widgets (reference values)

- **Header KPIs:** Active campaigns (14 · 6 markets), Total reach (545.0k ↑71%),
  Live pipeline (584 ↑27%).
- **Channel cards:** Search (216 keywords, +43%), Website (199.9k sessions,
  +47%), Email (17.7k opens, 33.9% CTR), featured LinkedIn · Greater China
  (486.5k reach, ACTIVE).
- **Analytics widgets:** Reach Analysis (impressions by week), Funnel Health
  (stage conversion), Cost per Lead (paid vs blended, USD 71→44, ↓38%), Share of
  Voice (FSSA vs peers).

## Number & copy conventions (inherited from FSG)

- Currency with ISO code in front: **USD 71**, not `$71`.
- Deltas: `↑ / ↓` + percent, coloured `--ds-positive` (up/good) or amber (watch).
- Sentence case; institutional, third-person voice; no exclamation marks/emoji.
- Compact magnitudes: `486.5k`, `199.9k`, `545.0k`. Tabular figures everywhere.
