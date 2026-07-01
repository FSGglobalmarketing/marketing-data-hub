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
    name: 'RQI Asia Campaign — Phase II',
    channel: 'Out-of-home + digital', brand: 'RQI Investors', status: 'ACTIVE',
    reach: '2.0M',
    description: 'Full tram wraps, advertorials and location-targeted digital across Hong Kong, supporting the fund launch with DBS and Hang Seng Bank.',
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

  /* =======================================================================
     DETAIL PAGES (campaign view + channel view) — shared data
     ======================================================================= */

  /* Funnel-channel tabs shown on every detail page (the hero tab bar).
     The selected tab decides which widgets render below. */
  const funnelTabs = [
    { id: 'search',    label: 'Search',    icon: 'search'   },
    { id: 'social',    label: 'Social',    icon: 'linkedin' },
    { id: 'display',   label: 'Display',   icon: 'display'  },
    { id: 'editorial', label: 'Editorial', icon: 'doc'      },
    { id: 'website',   label: 'Website',   icon: 'globe'    },
    { id: 'events',    label: 'Events',    icon: 'events'   },
    { id: 'leads',     label: 'Leads',     icon: 'leads'    },
  ];

  // deterministic pseudo series for chart placeholders (no randomness)
  const ser = (seed, n, base, amp) =>
    Array.from({ length: n }, (_, i) =>
      Math.max(1, Math.round(base + amp * Math.sin(i * 0.62 + seed) + amp * 0.35 * Math.cos(i * 1.4 + seed))));

  /* Widgets per funnel tab — driven by the KPI framework (real Q1'26 metrics,
     benchmarks vs Q4/Dec, status and source). Kinds:
       stat  — big metric + label, benchmark chip, status dot, source, mini chart
       list | funnel | peers  — supporting cards
     Flags: peer:true (only when competitor toggle ON), campaignOnly:true. */
  const tabContent = {
    search: [
      { kind: 'stat', title: 'SEO — keywords', subtitle: 'Awareness', status: 'good',
        value: '216', label: 'Keywords ranked', bench: '↑ 14% vs Dec ’25',
        source: 'BrightEdge', mini: { kind: 'bars', bars: ser(1, 12, 55, 28), highlightFrom: 9 } },
      { kind: 'stat', title: 'SEO — organic traffic', subtitle: 'Awareness', status: 'good',
        value: '+43%', label: 'Est. traffic vs Q4', bench: 'Growing quarter-on-quarter',
        source: 'BrightEdge', mini: { kind: 'lines', primary: ser(8, 12, 46, 22) } },
      { kind: 'stat', title: 'Paid search (SEM)', subtitle: 'Awareness', status: 'good',
        value: '18.2k', label: 'Paid views', bench: '4.1% of Q1 traffic',
        source: 'GA4 traffic source', mini: { kind: 'bars', bars: ser(4, 12, 40, 18), highlightFrom: 10 } },
      { kind: 'list', title: 'Top keywords', subtitle: 'Position · this quarter', rows: [
        { a: 'quality growth asia', b: '#2' }, { a: 'em equity income', b: '#3' },
        { a: 'sustainable infrastructure', b: '#4' }, { a: 'china a-shares outlook', b: '#6' },
        { a: 'listed real assets', b: '#7' } ] },
      { kind: 'peers', peer: true, title: 'Share of voice', subtitle: 'Organic search vs peers',
        peers: [ { name: 'FSSA', pct: 34, self: true }, { name: 'Peer A', pct: 27 },
                 { name: 'Peer B', pct: 21 }, { name: 'Peer C', pct: 18 } ], footer: '↑ 6 pts vs prior quarter' },
    ],
    social: [
      { kind: 'stat', title: 'LinkedIn — paid', subtitle: 'Awareness', status: 'good',
        value: '486.5k', label: 'Sponsored impressions', bench: '↑ 107% vs Q4 (235.1k)',
        source: 'LinkedIn Campaign Manager', mini: { kind: 'bars', bars: ser(2, 12, 48, 30), highlightFrom: 8 } },
      { kind: 'stat', title: 'LinkedIn — organic', subtitle: 'Consideration', status: 'watch',
        value: '35.9k', label: 'Impressions', value2: '1.2%', label2: 'Avg engagement', bench: '↓ 19% vs Q4',
        source: 'organic_linkedin_q4_vs_q1', mini: { kind: 'lines', primary: ser(5, 12, 40, 12) } },
      { kind: 'stat', title: 'Followers', subtitle: 'Consideration', status: 'good',
        value: '38.1k', label: 'Company page', bench: '↑ 12% vs Q4',
        source: 'LinkedIn', mini: { kind: 'lines', primary: ser(3, 12, 44, 10) } },
      { kind: 'list', title: 'Top posts', subtitle: 'By engagement', rows: [
        { a: 'The case for Asian quality growth', b: '9.1k' }, { a: 'Infrastructure income in 2026', b: '7.4k' },
        { a: 'China reopening — three lessons', b: '6.8k' }, { a: 'Meet the EM research team', b: '5.2k' } ] },
      { kind: 'stat', campaignOnly: true, title: 'Spend pacing', subtitle: 'Campaign', status: 'good',
        value: '92%', label: 'of budget spent', bench: 'On pace to plan',
        source: 'LinkedIn Campaign Manager', mini: { kind: 'lines', primary: ser(7, 12, 55, 12) } },
      { kind: 'peers', peer: true, title: 'Share of voice', subtitle: 'LinkedIn vs peers',
        peers: [ { name: 'FSSA', pct: 31, self: true }, { name: 'Peer A', pct: 29 },
                 { name: 'Peer B', pct: 24 }, { name: 'Peer C', pct: 16 } ], footer: '↑ 4 pts vs prior quarter' },
    ],
    display: [
      { kind: 'stat', title: 'Display (Blis)', subtitle: 'Awareness', status: 'good',
        value: '40.0k', label: 'Display visits', bench: '8.7% of Q1 traffic',
        source: 'GA4 traffic source', mini: { kind: 'bars', bars: ser(3, 12, 52, 24), highlightFrom: 9 } },
      { kind: 'stat', title: 'Programmatic reach', subtitle: 'Awareness', status: 'good',
        value: '2.9M', label: 'Impressions', bench: 'Live across HK / AU',
        source: 'Blis', mini: { kind: 'bars', bars: ser(6, 12, 46, 20), highlightFrom: 8 } },
      { kind: 'stat', title: 'Click-through rate', subtitle: 'Awareness', status: 'good',
        value: '0.42%', label: 'Blended CTR', bench: '↑ 0.05pt vs Q4',
        source: 'Blis', mini: { kind: 'lines', primary: ser(4, 12, 38, 10) } },
      { kind: 'list', campaignOnly: true, title: 'Creative performance', subtitle: 'CTR by creative', rows: [
        { a: 'Quality growth — 300×250', b: '0.51%' }, { a: 'Infrastructure — 728×90', b: '0.44%' },
        { a: 'EM income — 160×600', b: '0.38%' }, { a: 'Brand — 970×250', b: '0.29%' } ] },
    ],
    editorial: [
      { kind: 'stat', title: 'Podcast', subtitle: 'Awareness', status: 'inactive',
        value: 'N/A', label: 'Streams', bench: 'No Q1 episode data', source: 'Transistor' },
      { kind: 'stat', title: 'Editorial coverage', subtitle: 'Awareness', status: 'good',
        value: '24', label: 'Articles (illustrative)', bench: '↑ 6 vs Q4',
        source: 'Signal AI', mini: { kind: 'bars', bars: ser(6, 12, 40, 20), highlightFrom: 8 } },
      { kind: 'stat', title: 'Media citations', subtitle: 'Awareness', status: 'good',
        value: '156', label: 'Citations (illustrative)', bench: '↑ 38% vs Q4',
        source: 'Signal AI', mini: { kind: 'lines', primary: ser(9, 12, 42, 16) } },
      { kind: 'list', title: 'Top publications', subtitle: 'By reach', rows: [
        { a: 'Financial Times', b: '4' }, { a: 'Bloomberg', b: '3' },
        { a: 'Citywire Asia', b: '5' }, { a: 'Ignites Asia', b: '3' } ] },
    ],
    website: [
      { kind: 'stat', title: 'Website views', subtitle: 'Consideration', status: 'good',
        value: '199.9k', label: 'Views (ex-RQI)', bench: '↑ 47% vs Q4 (136.4k)',
        source: 'GA4 Compare', mini: { kind: 'lines', primary: ser(8, 12, 52, 22) } },
      { kind: 'stat', title: 'Active users', subtitle: 'Consideration', status: 'good',
        value: '187.5k', label: 'Active users', bench: 'Growing quarter-on-quarter',
        source: 'GA4', mini: { kind: 'bars', bars: ser(2, 12, 50, 22), highlightFrom: 8 } },
      { kind: 'stat', title: 'Conversion rate', subtitle: 'Consideration', status: 'good',
        value: '2.4%', label: 'Goal completions', bench: '↑ 0.3pt vs Q4',
        source: 'GA4', mini: { kind: 'lines', primary: ser(1, 12, 36, 9) } },
      { kind: 'funnel', title: 'On-site funnel', subtitle: 'Stage conversion', stages: [
        { label: 'Landing', pct: 100 }, { label: 'Engaged', pct: 61 },
        { label: 'Intent', pct: 29, watch: true }, { label: 'Convert', pct: 12 } ], threshold: 32,
        footer: 'Intent below watch line' },
      { kind: 'list', title: 'Top pages', subtitle: 'By views', rows: [
        { a: '/strategies/asian-growth', b: '28.4k' }, { a: '/insights/china-outlook', b: '19.1k' },
        { a: '/strategies/global-listed-infra', b: '16.7k' }, { a: '/about/our-approach', b: '11.2k' } ] },
    ],
    events: [
      { kind: 'stat', title: 'Events', subtitle: 'Conversion', status: 'good',
        value: '8', label: 'Q1 events', value2: '15', label2: 'Q1–Q2 roundtables', bench: 'AEQ · EX-20 · Civitas',
        source: '2026 Events', mini: { kind: 'bars', bars: ser(9, 9, 42, 18), highlightFrom: 6 } },
      { kind: 'stat', title: 'Webinars', subtitle: 'Conversion', status: 'inactive',
        value: 'N/A', label: 'Sessions', bench: 'No Q1 webinar captured', source: '—' },
      { kind: 'stat', title: 'Registrations', subtitle: 'Conversion', status: 'good',
        value: '3.4k', label: 'Total registrations', bench: '↑ 28% vs Q4',
        source: '2026 Events', mini: { kind: 'lines', primary: ser(7, 12, 40, 14) } },
      { kind: 'list', title: 'Upcoming events', subtitle: 'Next 60 days', rows: [
        { a: 'HK institutional roundtable', b: '18 Jul' }, { a: 'Singapore wholesale forum', b: '02 Aug' },
        { a: 'China outlook webinar', b: '14 Aug' }, { a: 'Infrastructure deep-dive', b: '28 Aug' } ] },
    ],
    leads: [
      { kind: 'stat', title: 'Email (Pardot)', subtitle: 'Conversion', status: 'good',
        value: '17.7k', label: 'Opens', value2: '6.0k', label2: 'Clicks', bench: '↑ 5% opens vs Q4',
        source: 'Salesforce Activity', mini: { kind: 'bars', bars: ser(10, 12, 44, 16), highlightFrom: 9 } },
      { kind: 'stat', title: 'Pipeline', subtitle: 'Service & loyalty', status: 'good',
        value: '584', label: 'Live opportunities', value2: '74', label2: 'Advancing (DD)', bench: 'From 2,207 total',
        source: 'FSI Opportunities', mini: { kind: 'bars', bars: ser(11, 12, 48, 14), highlightFrom: 8 } },
      { kind: 'stat', title: 'Marketing-qualified leads', subtitle: 'Conversion', status: 'good',
        value: '584', label: 'MQLs', bench: '↑ 27% vs Q4',
        source: 'Pardot / CRM', mini: { kind: 'lines', primary: ser(6, 12, 40, 16) } },
      { kind: 'funnel', title: 'Lead funnel', subtitle: 'Stage conversion', stages: [
        { label: 'Visitor', pct: 100 }, { label: 'Lead', pct: 44 },
        { label: 'MQL', pct: 21 }, { label: 'SQL', pct: 9, watch: true } ], threshold: 12,
        footer: 'SQL conversion below watch line' },
      { kind: 'list', title: 'Advancing opportunities', subtitle: 'Listed infra leads', rows: [
        { a: 'Wholesale · Greater China growth', b: 'USD 1.1M' }, { a: 'Institutional · Listed infra', b: 'USD 0.9M' },
        { a: 'Wholesale · EM income', b: 'USD 0.6M' }, { a: 'Institutional · Sustainable listed', b: 'USD 0.5M' } ] },
    ],
  };

  /* Campaign detail records (hero imagery, summary, goals, objectives). */
  const campaignDetails = {
    'rqi-asia-ph2': {
      id: 'rqi-asia-ph2',
      name: 'RQI Asia Campaign — Phase II',
      brand: 'RQI Investors', channel: 'Out-of-home + digital', status: 'COMPLETE',
      dateRange: '1 Jan – 28 Feb 2026',
      defaultTab: 'display',
      countries: [
        { code: 'ALL', name: 'All markets' },
        { code: 'HK', name: 'Hong Kong' }, { code: 'SG', name: 'Singapore' },
      ],
      heroImages: [
        'assets/img/rqi/tram-1.png',
        'assets/img/rqi/billboard.jpg',
        'assets/img/rqi/bus1.jpg',
        'assets/img/rqi/tram-2.png',
        'assets/img/rqi/bus2.jpg',
      ],
      takeaway: 'Phase II continued to support the fund launch with DBS and Hang Seng Bank in Hong Kong — over 2 million impressions across outdoor and digital, and more than 14,000 website visitors.',
      summary: 'Phase II focused on driving awareness of the RQI brand and the Value Strategy, specifically targeting gatekeepers in the Asian wholesale market. Messaging centred on the systematic approach — how a data-driven alpha model and AI capabilities enhance risk-return profiles and build resilient portfolios. A mix of outdoor placements and targeted digital media was deployed to maximise reach.',
      goals: [
        'Continue building brand awareness and increasing brand recall',
        'Educate the market on quantitative equities and RQI Investors’ proposition and investment philosophy',
        'Target gatekeepers with key strategy messages',
      ],
      objectives: [
        '2M+ impressions across outdoor & digital',
        '14,000+ website visitors',
        'Reach gatekeepers at DBS & Hang Seng branches (HK)',
      ],
      activities: [
        'Full tram wraps — Hong Kong, from 1 Jan 2026 (one month)',
        'Sponsored advertorials (Chinese) — HKET & iMoney',
        'Location-targeted programmatic — DBS & Hang Seng branches',
        'Banner ads on financial websites',
        'Always-on search (SEM)',
      ],
    },
    'greater-china': {
      id: 'greater-china',
      name: 'Greater China — thematic equity',
      brand: 'FSSA', channel: 'LinkedIn', status: 'ACTIVE',
      dateRange: '1 Jan – 31 Mar 2026',
      defaultTab: 'social',
      countries: [
        { code: 'ALL', name: 'All markets' },
        { code: 'HK', name: 'Hong Kong' }, { code: 'CN', name: 'Mainland China' },
        { code: 'TW', name: 'Taiwan' }, { code: 'SG', name: 'Singapore' },
      ],
      heroImages: [
        'https://picsum.photos/seed/fsg-china-1/1600/640',
        'https://picsum.photos/seed/fsg-china-2/1600/640',
        'https://picsum.photos/seed/fsg-china-3/1600/640',
      ],
      summary: 'Paid thematic campaign across Greater China positioning FSSA quality-growth research against regional peers, spanning LinkedIn, search, display and editorial.',
      goals: [
        'Grow qualified reach among institutional and wholesale audiences',
        'Lift share of voice versus regional peers',
        'Drive marketing-qualified leads into the Greater China product range',
      ],
      objectives: [
        '486.5k reach at ≤ USD 44 cost per lead',
        '+6 pts share of voice vs peers',
        '580+ marketing-qualified leads',
      ],
    },
  };

  /* Channel view contexts (no imagery — gradient hero). Keyed by funnel tab. */
  const channelContexts = {
    search:    { subject: 'Search performance',    summary: 'Organic and paid search across all First Sentier Group brands and campaigns — rankings, impressions and share of voice.', measures: ['Ranking keywords & positions', 'Impressions & clicks', 'Share of voice vs peers', 'Paid vs organic mix'] },
    social:    { subject: 'Social performance',     summary: 'Paid and organic social — primarily LinkedIn Campaign Manager and organic — across all brands and campaigns.', measures: ['Reach & engagement', 'Follower growth', 'Top posts', 'Paid vs organic split'] },
    display:   { subject: 'Display performance',    summary: 'Programmatic and direct display advertising across all campaigns.', measures: ['Impressions & CTR', 'Viewability', 'CPM & spend', 'Creative performance'] },
    editorial: { subject: 'Editorial & PR',         summary: 'Earned media, thought-leadership and AI answer citations across all brands.', measures: ['Articles & citations', 'AI answers', 'Top publications', 'Share of coverage'] },
    website:   { subject: 'Website performance',    summary: 'GA4 web analytics across all brand and campaign sites.', measures: ['Sessions & users', 'Conversions', 'On-site funnel', 'Top pages'] },
    events:    { subject: 'Events performance',     summary: 'Physical and online events including webinars across all regions.', measures: ['Registrations & attendance', 'Follow-up rate', 'Upcoming events'] },
    leads:     { subject: 'Leads & pipeline',       summary: 'Marketing-sourced leads and pipeline, from form capture through to CRM opportunities.', measures: ['MQLs & submissions', 'Lead funnel', 'Pipeline value', 'Opportunities from marketing'] },
  };

  return { brands, channels, strategies, campaigns, kpis, featured, channelCards, widgets, colors: C,
           funnelTabs, tabContent, campaignDetails, channelContexts };
})();
