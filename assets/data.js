/* =========================================================================
   FSG MARKETING DATA HUB — DUMMY DATA
   Illustrative sample data only. Shapes follow design-system/DATA-MODEL.md.
   Swap this file for a live adapter (GA4, LinkedIn, Alphix, HubSpot, …) later.
   ========================================================================= */
window.HUB_DATA = (function () {

  /* ---- Filter dimensions (labels + mono tiles for the flyouts) ---------- */
  const brands = [
    { id: 'all',     label: 'All brands',        tile: '∗'   },
    { id: 'fssa',    label: 'FSSA',              tile: 'FS'  },
    { id: 'stewart', label: 'Stewart Investors', tile: 'SI'  },
    { id: 'fsi',     label: 'First Sentier',     tile: 'FSI' },
    { id: 'rqi',     label: 'RQI Investors',     tile: 'RQI' },
    { id: 'igneo',   label: 'Igneo',             tile: 'IG'  },
  ];

  const channels = [
    { id: 'all',        label: 'All channels', tile: '∗'  },
    { id: 'search',     label: 'Search',       tile: 'SE' },
    { id: 'linkedin',   label: 'LinkedIn',     tile: 'IN' },
    { id: 'website',    label: 'Website',      tile: 'WB' },
    { id: 'email',      label: 'Email',        tile: 'EM' },
    { id: 'forms',      label: 'Forms',        tile: 'FM' },
    { id: 'salesforce', label: 'Salesforce',   tile: 'CRM'},
  ];

  const strategies = [
    { id: 'all',         label: 'All strategies', tile: '∗'  },
    { id: 'paid',        label: 'Paid',           tile: 'PD' },
    { id: 'organic',     label: 'Organic',        tile: 'OR' },
    { id: 'competitor',  label: 'Competitor',     tile: 'VS' },
  ];

  /* Semantic marker colours (status, not brand) — match tokens.css ---------*/
  const C = { active: '#f4ad44', growing: '#5ec8e6', peer: '#9db2cc' };

  /* ---- Campaigns / map markers ------------------------------------------ */
  /* strategy 'competitor' + brand 'peer' => neutral marker, shown under
     "all" brand only. `big:true` = featured pin (larger, pulse, glass popup). */
  const campaigns = [
    // ---- FSSA (Asia-led) --------------------------------------------------
    { city: 'Hong Kong', lat: 22.32,  lng: 114.17, brand: 'fssa', channel: 'linkedin', strategy: 'paid',
      color: C.active, big: true,
      popup: { badge: 'LIVE', meta: 'FSSA · LinkedIn · Greater China', value: '486.5k', delta: '↑ 71%', unit: 'people reached' } },
    { city: 'Singapore', lat: 1.35,   lng: 103.82, brand: 'fssa', channel: 'search',   strategy: 'organic', color: C.active },
    { city: 'Tokyo',     lat: 35.68,  lng: 139.69, brand: 'fssa', channel: 'website',  strategy: 'organic', color: C.active },
    { city: 'Shanghai',  lat: 31.23,  lng: 121.47, brand: 'fssa', channel: 'email',    strategy: 'paid',    color: C.active },
    { city: 'Taipei',    lat: 25.03,  lng: 121.57, brand: 'fssa', channel: 'search',   strategy: 'organic', color: C.growing },
    { city: 'Seoul',     lat: 37.57,  lng: 126.98, brand: 'fssa', channel: 'linkedin', strategy: 'paid',    color: C.active },
    // ---- First Sentier (EMEA/US) -----------------------------------------
    { city: 'London',    lat: 51.51,  lng: -0.13,  brand: 'fsi',  channel: 'linkedin', strategy: 'paid',
      color: C.active, big: true,
      popup: { badge: 'LIVE', meta: 'First Sentier · LinkedIn · UK', value: '212.4k', delta: '↑ 38%', unit: 'people reached' } },
    { city: 'Frankfurt', lat: 50.11,  lng: 8.68,   brand: 'fsi',  channel: 'search',   strategy: 'organic', color: C.active },
    { city: 'New York',  lat: 40.71,  lng: -74.01, brand: 'fsi',  channel: 'email',    strategy: 'paid',    color: C.active },
    { city: 'Paris',     lat: 48.85,  lng: 2.35,   brand: 'fsi',  channel: 'website',  strategy: 'organic', color: C.growing },
    // ---- Stewart / Igneo / RQI -------------------------------------------
    { city: 'Edinburgh', lat: 55.95,  lng: -3.19,  brand: 'stewart', channel: 'website',  strategy: 'organic', color: C.active },
    { city: 'Sydney',    lat: -33.87, lng: 151.21, brand: 'igneo',   channel: 'linkedin', strategy: 'paid',    color: C.active },
    { city: 'Melbourne', lat: -37.81, lng: 144.96, brand: 'igneo',   channel: 'search',   strategy: 'organic', color: C.active },
    { city: 'Zurich',    lat: 47.37,  lng: 8.54,   brand: 'rqi',     channel: 'website',  strategy: 'organic', color: C.active },
    // ---- Competitor / peer signals (neutral; only under "all" brand) -----
    { city: 'Boston',    lat: 42.36,  lng: -71.06, brand: 'peer', channel: 'all', strategy: 'competitor', color: C.peer },
    { city: 'Amsterdam', lat: 52.37,  lng: 4.90,   brand: 'peer', channel: 'all', strategy: 'competitor', color: C.peer },
    { city: 'Toronto',   lat: 43.65,  lng: -79.38, brand: 'peer', channel: 'all', strategy: 'competitor', color: C.peer },
  ];

  /* ---- Header KPIs (static in the mock; recompute on filter later) ------- */
  const kpis = [
    { label: 'Active campaigns', value: '14',     delta: '6 markets', tone: 'meta'     },
    { label: 'Total reach',      value: '545.0k', delta: '↑ 71%',     tone: 'positive' },
    { label: 'Live pipeline',    value: '584',    delta: '↑ 27%',     tone: 'positive' },
  ];

  /* ---- Bottom rail: featured campaign + channel cards ------------------- */
  const featured = {
    name: 'Greater China — thematic equity',
    channel: 'LinkedIn', brand: 'FSSA', status: 'ACTIVE',
    reach: '486.5k',
    description: 'Paid thematic campaign across Greater China positioning FSSA quality-growth research against regional peers.',
  };

  const channelCards = [
    { id: 'search',  title: 'Search',  status: 'Organic', dot: 'positive',
      gauges: [ { label: 'Keywords', value: '216', pct: 68, tone: 'accent' },
                { label: 'Top-3',    value: '54',  pct: 41, tone: 'cyan'   } ],
      delta: '+43%' },
    { id: 'website', title: 'Website', status: 'GA4', dot: 'positive',
      gauges: [ { label: 'Sessions', value: '199.9k', pct: 74, tone: 'accent' },
                { label: 'Conv.',    value: '2.4%',   pct: 24, tone: 'cyan'   } ],
      delta: '+47%' },
    { id: 'email',   title: 'Email',   status: 'Nurture', dot: 'positive',
      gauges: [ { label: 'Opens', value: '17.7k', pct: 52, tone: 'accent' },
                { label: 'CTR',   value: '33.9%', pct: 34, tone: 'cyan'   } ],
      delta: '+12%' },
  ];

  /* ---- Bottom rail: analytics widgets (row 2) --------------------------- */
  const widgets = {
    // impressions by week — bars, last span highlighted amber
    reachAnalysis: {
      title: 'Reach analysis', subtitle: 'Impressions by week',
      bars: [34, 41, 38, 52, 47, 63, 58, 71, 66, 82, 78, 94],
      highlightFrom: 9, footer: '↑ 71% vs prior quarter',
    },
    // funnel stage conversion — threshold "watch" line
    funnelHealth: {
      title: 'Funnel health', subtitle: 'Stage conversion',
      stages: [
        { label: 'Awareness',     pct: 100 },
        { label: 'Consideration', pct: 58  },
        { label: 'Conversion',    pct: 22, watch: true },
        { label: 'Loyalty',       pct: 14  },
      ],
      threshold: 28, footer: 'Conversion below watch line',
    },
    // paid vs blended cost per lead — dual line, USD 71 -> 44
    costPerLead: {
      title: 'Cost per lead', subtitle: 'Paid vs blended',
      paid:    [71, 68, 63, 66, 59, 54, 49, 44],
      blended: [52, 50, 47, 45, 42, 39, 37, 34],
      footer: 'USD 71 → 44 · ↓ 38%',
    },
    // share of voice — FSSA vs peers, FSG bar amber
    shareOfVoice: {
      title: 'Share of voice', subtitle: 'FSSA vs peers',
      peers: [
        { name: 'FSSA',    pct: 34, self: true },
        { name: 'Peer A',  pct: 27 },
        { name: 'Peer B',  pct: 21 },
        { name: 'Peer C',  pct: 18 },
      ],
      footer: '↑ 6 pts share vs prior quarter',
    },
  };

  return { brands, channels, strategies, campaigns, kpis, featured, channelCards, widgets, colors: C };
})();
