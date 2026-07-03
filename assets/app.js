/* =========================================================================
   FSG MARKETING DATA HUB — app runtime
   Vanilla JS. Leaflet + Esri satellite basemap, semantic map pins, three
   AND-combined filters (brand ∧ channel ∧ strategy), flyouts, zoom stack,
   and a GA-style date-range popover. Values are illustrative (see data.js).
   ========================================================================= */
(function () {
  const D = window.HUB_DATA;

  /* ---- Filter state ----------------------------------------------------- */
  const state = { brand: 'all', channel: 'all', strategy: 'all', openMenu: null };
  let ACTS = [];                       // Channel tracker activities (DataHub feed)
  const FIELD = { brand: 'affiliate', channel: 'channel', strategy: 'status' };

  // Date-range presets (today = 2026-07-01). Filters on Go Live → End dates.
  const RANGES = {
    q:     { start: '2026-07-01', end: '2026-09-30', label: '1 Jul – 30 Sep 2026' },
    lastq: { start: '2026-04-01', end: '2026-06-30', label: '1 Apr – 30 Jun 2026' },
    ytd:   { start: '2026-01-01', end: '2026-07-01', label: '1 Jan – 1 Jul 2026' },
    '12m': { start: '2025-07-01', end: '2026-07-01', label: 'Jul 2025 – Jul 2026' },
    year:  { start: '2026-01-01', end: '2026-12-31', label: '1 Jan – 31 Dec 2026' },
  };
  state.dateRange = RANGES.year;       // default: full year 2026

  /* ======================================================================
     MAP
     ====================================================================== */
  const map = L.map('map', {
    zoomControl: false, attributionControl: false,
    minZoom: 2, maxZoom: 11, zoomSnap: 0.1,
    worldCopyJump: true, scrollWheelZoom: true, doubleClickZoom: false,
  }).setView([26, 64], 2.6);

  L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    { maxZoom: 19, crossOrigin: true }).addTo(map);
  L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
    { maxZoom: 19, opacity: 0.28, crossOrigin: true }).addTo(map);

  L.control.attribution({ prefix: false })
    .addAttribution('Imagery © Esri, Maxar, Earthstar Geographics')
    .addTo(map);

  /* ---- Activity → map marker mapping (Channel tracker feed) ------------ */
  const REGION = { ANZ: [-33.87, 151.21], UK: [51.51, -0.13], EMEA: [50.11, 8.68], US: [40.71, -74.01], Global: [22, 6], HK: [22.32, 114.17] };
  const PEER_C = '#9db2cc';                                  // Google competitor peer colour
  const LI_PEER_C = '#7aa0d8';                               // LinkedIn competitor peer colour
  const BRAND_REGION = { igneo: 'EMEA', fsi: 'ANZ', fssa: 'HK', rqi: 'Global', stewart: 'UK' };
  // Country centroids (ISO-2) for placing LinkedIn competitor ads by real geography.
  const COUNTRY = { GB: [54.0, -2.0], US: [39.8, -98.6], DE: [51.2, 10.4], FR: [46.6, 2.4],
    IT: [42.8, 12.6], ES: [40.2, -3.7], NL: [52.2, 5.3], CH: [46.8, 8.2], IE: [53.4, -8.0],
    SE: [62.0, 15.0], AU: [-25.3, 133.8], HK: [22.3, 114.2], SG: [1.35, 103.8], JP: [36.2, 138.3],
    CN: [35.9, 104.2], IN: [22.6, 79.0], CA: [56.1, -106.3], AE: [23.4, 53.8], LU: [49.8, 6.1],
    BE: [50.6, 4.7], NO: [61.0, 8.5], DK: [56.0, 10.0], FI: [64.0, 26.0], ZA: [-30.6, 22.9] };
  const COLOR  = { 'Live': '#f4ad44', 'In progress': '#5ec8e6', 'Complete': '#7fdca0', 'Draft': '#9db2cc' };
  const colorFor = (s) => COLOR[s] || '#7e93ac';
  const MON = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const fmtDate = (x) => { if (!x) return null; const b = x.split('-'); return `${+b[2]} ${MON[+b[1] - 1]} ${b[0]}`; };
  const fmtRange = (a) => { const s = fmtDate(a.startDate), e = fmtDate(a.endDate) || fmtDate(a.goLive); return s && e ? `${s} – ${e}` : (s || e || ''); };

  // Pin info — Title, Channel, Audience, Status, Activated + a drill ↗ (mock).
  const ARROW = `<a class="tip-go" data-href="campaign.html?id=rqi-asia-ph2" title="Open activity"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><path d="M7 17L17 7M9 7h8v8"/></svg></a>`;
  function infoHtml(a, withArrow) {
    const row = (k, v) => `<div class="tip-row"><span>${k}</span><b>${v || '—'}</b></div>`;
    return `<div class="tip-head"><div class="tip-t">${a.title || 'Untitled'}${a.keyActivity ? ' <span style="color:#f4ad44">★</span>' : ''}</div>${withArrow ? ARROW : ''}</div>
      ${row('Channel', a.channel)}${row('Audience', a.audience)}${row('Status', a.status || 'Planned')}${row('Activated', fmtDate(a.goLive))}`;
  }

  // Cluster when activities share a market; zooming in unclusters. Clicking a
  // cluster opens a scrollable glass grid of every activity in that market.
  const layer = L.markerClusterGroup({
    maxClusterRadius: 46, showCoverageOnHover: false, spiderfyOnMaxZoom: false,
    zoomToBoundsOnClick: false, disableClusteringAtZoom: 7, chunkedLoading: true,
    iconCreateFunction: (c) => L.divIcon({ html: `<div class="ds-cluster">${c.getChildCount()}</div>`, className: 'ds-cluster-wrap', iconSize: [38, 38] }),
  }).addTo(map);
  let markers = [];
  let compMarkers = [];                                      // competitor-ad pins (Google Transparency)
  let liCompMarkers = [];                                    // competitor-ad pins (LinkedIn Ad Library)

  function buildMarkers(acts) {
    const idx = {};
    markers = acts.map((a) => {
      const base = REGION[a.region] || REGION.Global;
      const i = idx[a.region] || 0; idx[a.region] = i + 1;       // small per-market spread (uncluster on zoom)
      let lat = base[0], lng = base[1];
      if (i) { const ang = i * 2.39996, rad = 0.42 * Math.sqrt(i); lat += rad * Math.cos(ang); lng += rad * Math.sin(ang) * 1.4; }
      const color = colorFor(a.status), key = !!a.keyActivity;
      const dot = key ? 13 : 9, ring = key ? 26 : 18;
      const html = `<span class="ring" style="--c:${color};width:${ring}px;height:${ring}px;margin:${-ring/2}px 0 0 ${-ring/2}px"></span>`
        + `<span class="dot" style="--c:${color};width:${dot}px;height:${dot}px"></span>`;
      const m = L.marker([lat, lng], { icon: L.divIcon({ className: 'ds-pin', iconSize: [dot, dot], iconAnchor: [dot/2, dot/2], html }) });
      m.bindTooltip(infoHtml(a, false), { className: 'ds-tip', direction: 'top', offset: [0, -8], opacity: 1 });
      m.bindPopup(infoHtml(a, true), { className: 'ds-pop', closeButton: false, offset: [0, -6] });  // click → stays open, has ↗
      m._a = a;
      return m;
    });
  }

  // Competitor ads (Google Transparency) as neutral peer pins, placed near the
  // region of the FSG brand they're a peer of (spread), sized by ad volume.
  function buildCompMarkers() {
    compMarkers = [];
    if (!LIVE || !LIVE.competitor || !LIVE.competitor.byCompetitor) return;
    const idx = {};
    compMarkers = LIVE.competitor.byCompetitor.filter((c) => (c.ads || 0) > 0).map((c) => {
      const rk = BRAND_REGION[c.brand] || 'Global', base = REGION[rk] || REGION.Global;
      const i = idx[rk] || 0; idx[rk] = i + 1;
      const ang = i * 2.39996, rad = 0.8 * Math.sqrt(i + 1);
      const lat = base[0] + 2.4 + rad * Math.cos(ang), lng = base[1] + 2.4 + rad * Math.sin(ang) * 1.4;
      const sz = Math.max(7, Math.min(16, 6 + Math.log10(c.ads + 1) * 4));
      const html = `<span class="ring" style="--c:${PEER_C};width:${sz * 2}px;height:${sz * 2}px;margin:${-sz}px 0 0 ${-sz}px;opacity:.45"></span>`
        + `<span class="dot" style="--c:${PEER_C};width:${sz}px;height:${sz}px"></span>`;
      const m = L.marker([lat, lng], { icon: L.divIcon({ className: 'ds-pin', iconSize: [sz, sz], iconAnchor: [sz / 2, sz / 2], html }) });
      const tip = `<div class="tip-head"><div class="tip-t">${c.competitor} <span style="color:${PEER_C}">◆</span></div></div>`
        + `<div class="tip-row"><span>Type</span><b>Competitor · Google ads</b></div>`
        + `<div class="tip-row"><span>Peer of</span><b>${(c.brand || '').toUpperCase()}</b></div>`
        + `<div class="tip-row"><span>Ads live</span><b>${c.ads}</b></div>`;
      m.bindTooltip(tip, { className: 'ds-tip', direction: 'top', offset: [0, -8], opacity: 1 });
      m.bindPopup(tip, { className: 'ds-pop', closeButton: false, offset: [0, -6] });
      m._c = c;
      return m;
    });
  }

  // Competitor LinkedIn ads (Ad Library) as peer pins, placed by REAL geography
  // (top impression country), sized by total ad volume.
  function buildLiCompMarkers() {
    liCompMarkers = [];
    if (!LIVE || !LIVE.competitorLi || !LIVE.competitorLi.byCompetitor) return;
    const idx = {};
    liCompMarkers = LIVE.competitorLi.byCompetitor.filter((c) => (c.ads || 0) > 0).map((c) => {
      const base = COUNTRY[c.topCountry] || REGION[BRAND_REGION[c.brand] || 'Global'] || REGION.Global;
      const ck = c.topCountry || c.brand; const i = idx[ck] || 0; idx[ck] = i + 1;
      const ang = i * 2.39996, rad = 0.8 * Math.sqrt(i + 1);
      const lat = base[0] - 2.4 + rad * Math.cos(ang), lng = base[1] - 2.4 + rad * Math.sin(ang) * 1.4;
      const sz = Math.max(7, Math.min(17, 6 + Math.log10(c.ads + 1) * 4));
      const html = `<span class="ring" style="--c:${LI_PEER_C};width:${sz * 2}px;height:${sz * 2}px;margin:${-sz}px 0 0 ${-sz}px;opacity:.45"></span>`
        + `<span class="dot" style="--c:${LI_PEER_C};width:${sz}px;height:${sz}px"></span>`;
      const m = L.marker([lat, lng], { icon: L.divIcon({ className: 'ds-pin', iconSize: [sz, sz], iconAnchor: [sz / 2, sz / 2], html }) });
      const tip = `<div class="tip-head"><div class="tip-t">${c.competitor} <span style="color:${LI_PEER_C}">in</span></div></div>`
        + `<div class="tip-row"><span>Type</span><b>Competitor · LinkedIn ads</b></div>`
        + `<div class="tip-row"><span>Peer of</span><b>${(c.brand || '').toUpperCase()}</b></div>`
        + `<div class="tip-row"><span>Ads live</span><b>${c.ads}</b></div>`
        + `<div class="tip-row"><span>Top market</span><b>${c.topCountry || '—'}</b></div>`;
      m.bindTooltip(tip, { className: 'ds-tip', direction: 'top', offset: [0, -8], opacity: 1 });
      m.bindPopup(tip, { className: 'ds-pop', closeButton: false, offset: [0, -6] });
      m._c = c;
      return m;
    });
  }

  layer.on('clusterclick', (e) => {
    const kids = e.layer.getAllChildMarkers();
    const grid = `<div class="cluster-grid">${kids.map((m) => `<div class="tip-card">${infoHtml(m._a, true)}</div>`).join('')}</div>`;
    L.popup({ className: 'ds-cluster-pop', autoClose: true, offset: [0, -4], maxWidth: 340 })
      .setLatLng(e.latlng).setContent(grid).openOn(map);
  });

  // drill ↗ inside any popup / cluster card → open the activity (mock target)
  document.addEventListener('click', (e) => {
    const go = e.target.closest ? e.target.closest('.tip-go') : null;
    if (go) { e.preventDefault(); navTo(go.dataset.href); }
  });

  function inRange(a) {
    if (!state.dateRange) return true;
    const s = a.goLive || a.startDate, e = a.endDate || a.goLive || a.startDate;
    if (!s && !e) return true;                          // undated activities always show
    return (s || e) <= state.dateRange.end && (e || s) >= state.dateRange.start;   // span ∩ range
  }

  function applyFilters() {
    layer.clearLayers();
    layer.addLayers(markers.filter((m) => inRange(m._a) && ['brand', 'channel', 'strategy'].every((k) => state[k] === 'all' || m._a[FIELD[k]] === state[k])));
    // Competitor pins (Google + LinkedIn) follow the brand filter only.
    const cid = brandIdFor(state.brand);
    layer.addLayers(compMarkers.filter((m) => !cid || m._c.brand === cid));
    layer.addLayers(liCompMarkers.filter((m) => !cid || m._c.brand === cid));
  }

  // Activities passing the current filters (brand ∧ channel ∧ status ∧ date).
  function filteredActs() {
    return ACTS.filter((a) => inRange(a) && ['brand', 'channel', 'strategy'].every((k) => state[k] === 'all' || a[FIELD[k]] === state[k]));
  }

  // Reactive refresh: map markers + activity KPIs + live cards/widgets (brand cascade).
  function refresh() {
    applyFilters();
    updateKpis(filteredActs());
    renderLive();
  }

  /* ---- Custom zoom / recenter stack ------------------------------------ */
  document.getElementById('zoom-in').onclick     = () => map.zoomIn(0.6);
  document.getElementById('zoom-out').onclick    = () => map.zoomOut(0.6);
  document.getElementById('zoom-reset').onclick  = () => map.setView([26, 64], 2.6);

  /* ======================================================================
     LEFT RAIL FILTERS + FLYOUTS
     ====================================================================== */
  const flyout = document.getElementById('flyout');

  const dims = {
    brand:    { key: 'brand',    title: 'Filter by brand',   data: [] },
    channel:  { key: 'channel',  title: 'Filter by channel', data: [] },
    strategy: { key: 'strategy', title: 'Filter by status',  data: [] },
  };
  const BRAND_TILE = { Igneo: 'IG', FSI: 'FSI', FSSA: 'FS', FSG: 'FSG', All: 'ALL' };
  const tileFor = (k, v) => (k === 'brand' ? (BRAND_TILE[v] || v.slice(0, 3).toUpperCase()) : v.replace(/[^A-Za-z]/g, '').slice(0, 2).toUpperCase());

  function buildDims(acts) {
    ['brand', 'channel', 'strategy'].forEach((k) => {
      const vals = Array.from(new Set(acts.map((a) => a[FIELD[k]]).filter(Boolean))).sort();
      const allLabel = k === 'strategy' ? 'All statuses' : (k === 'channel' ? 'All channels' : 'All brands');
      dims[k].data = [{ id: 'all', label: allLabel, tile: '∗' }].concat(vals.map((v) => ({ id: v, label: v, tile: tileFor(k, v) })));
    });
  }

  function count(dimKey, id) {
    const field = FIELD[dimKey];
    return id === 'all' ? ACTS.length : ACTS.filter((a) => a[field] === id).length;
  }

  function renderFlyout(dimId) {
    const dim = dims[dimId];
    if (!dim) { // layers => legend
      flyout.innerHTML = legendMarkup();
      flyout.style.display = 'block';
      return;
    }
    const rows = dim.data.map((opt) => {
      const active = state[dim.key] === opt.id;
      const n = count(dim.key, opt.id);
      return `<div class="ds-row ${active ? 'ds-row--active' : ''}" data-dim="${dim.key}" data-id="${opt.id}"
                   style="display:flex;align-items:center;gap:10px;padding:7px 9px">
                <span style="width:30px;height:26px;border-radius:var(--ds-r-sm);display:flex;align-items:center;justify-content:center;
                             font-size:9px;font-weight:700;
                             background:${active ? 'var(--ds-accent)' : 'rgba(255,255,255,.09)'};
                             color:${active ? 'var(--ds-accent-ink)' : 'var(--ds-ink-2)'}">${opt.tile}</span>
                <span style="font-size:12px;font-weight:600;color:var(--ds-ink-1)">${opt.label}</span>
                <span class="ds-num" style="margin-left:auto;font-size:10.5px;color:${active ? 'var(--ds-accent)' : 'var(--ds-ink-5)'}">${n}</span>
              </div>`;
    }).join('');

    flyout.innerHTML =
      `<div style="display:flex;justify-content:space-between;align-items:center;padding:0 6px 9px">
         <span class="ds-eyebrow">${dim.title}</span>
         <span class="ds-tbtn" id="flyout-close" style="width:20px;height:20px;border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:12px">✕</span>
       </div>${rows}`;
    flyout.style.display = 'block';
    document.getElementById('flyout-close').onclick = closeMenu;
    flyout.querySelectorAll('.ds-row').forEach((row) => {
      row.onclick = () => {
        state[row.dataset.dim] = row.dataset.id;
        renderFlyout(state.openMenu);
        refresh();
        syncRailDots();
      };
    });
  }

  function legendMarkup() {
    const item = (c, label) =>
      `<div style="display:flex;align-items:center;gap:10px;padding:7px 9px">
         <span style="width:11px;height:11px;border-radius:50%;background:${c};box-shadow:0 0 8px ${c}"></span>
         <span style="font-size:12px;color:var(--ds-ink-2)">${label}</span>
       </div>`;
    return `<div style="display:flex;justify-content:space-between;align-items:center;padding:0 6px 9px">
              <span class="ds-eyebrow">Map layers</span>
              <span class="ds-tbtn" id="flyout-close" style="width:20px;height:20px;border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:12px">✕</span>
            </div>
            ${item('#f4ad44', 'Live')}
            ${item('#5ec8e6', 'In progress')}
            ${item('#c9d4e2', 'Draft')}
            ${item('#7fdca0', 'Complete')}
            ${item('#7e93ac', 'Planned')}
            ${item(PEER_C, 'Competitor ad (Google)')}
            ${item(LI_PEER_C, 'Competitor ad (LinkedIn)')}`;
  }

  function openMenu(id) {
    state.openMenu = id;
    document.querySelectorAll('.rail-tbtn').forEach((b) => b.classList.toggle('ds-tbtn--active', b.dataset.menu === id));
    renderFlyout(id);
    // legend uses the same close handler
    const close = document.getElementById('flyout-close');
    if (close) close.onclick = closeMenu;
  }

  function closeMenu() {
    state.openMenu = null;
    flyout.style.display = 'none';
    document.querySelectorAll('.rail-tbtn').forEach((b) => b.classList.remove('ds-tbtn--active'));
  }

  document.querySelectorAll('.rail-tbtn').forEach((btn) => {
    btn.onclick = () => (state.openMenu === btn.dataset.menu ? closeMenu() : openMenu(btn.dataset.menu));
  });

  // amber dot on a rail tile while its filter ≠ "all"
  function syncRailDots() {
    ['brand', 'channel', 'strategy'].forEach((k) => {
      const dotEl = document.querySelector(`.rail-tbtn[data-menu="${k}"] .rail-dot`);
      if (dotEl) dotEl.style.display = state[k] === 'all' ? 'none' : 'block';
    });
  }

  /* ======================================================================
     DATE RANGE POPOVER (open/close only — mock)
     ====================================================================== */
  const dateBtn = document.getElementById('date-btn');
  const datePop = document.getElementById('date-pop');
  if (dateBtn && datePop) {
    dateBtn.onclick = (e) => { e.stopPropagation(); datePop.style.display = datePop.style.display === 'block' ? 'none' : 'block'; };
    document.addEventListener('click', (e) => {
      if (!datePop.contains(e.target) && !dateBtn.contains(e.target)) datePop.style.display = 'none';
    });
    // presets → filter activities on Go Live → End dates
    datePop.querySelectorAll('.ds-row[data-range]').forEach((r) => {
      r.onclick = () => {
        state.dateRange = RANGES[r.dataset.range];
        const lbl = document.getElementById('date-label'); if (lbl) lbl.textContent = state.dateRange.label;
        datePop.querySelectorAll('.ds-row').forEach((x) => x.classList.toggle('ds-row--active', x === r));
        refresh();
        datePop.style.display = 'none';
      };
    });
  }

  /* ======================================================================
     DATA-DRIVEN RENDER — KPIs, channel cards, analytics widgets
     ====================================================================== */
  const drill = `<svg class="ds-drill" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><path d="M7 17L17 7M9 7h8v8"/></svg>`;

  // --- Header KPI chips ---
  document.getElementById('kpis').innerHTML = D.kpis.map((k) => {
    const tone = k.tone === 'positive' ? 'var(--ds-positive)' : 'var(--ds-ink-5)';
    return `<div class="ds-glass" style="border-radius:var(--ds-r-lg);padding:11px 15px;min-width:116px">
              <div style="font-size:var(--ds-fs-micro);color:var(--ds-ink-4)">${k.label}</div>
              <div style="display:flex;align-items:baseline;gap:6px;margin-top:5px">
                <span class="ds-num" style="font-size:var(--ds-fs-kpi);font-weight:300">${k.value}</span>
                <span style="font-size:var(--ds-fs-small);color:${tone}">${k.delta}</span>
              </div>
            </div>`;
  }).join('');

  // --- Ring gauge (26px donut) ---
  function ring(g) {
    const stroke = g.tone === 'accent' ? 'var(--ds-accent)' : 'var(--ds-cyan)';
    return `<div style="display:flex;align-items:center;gap:8px">
              <svg width="26" height="26" viewBox="0 0 42 42">
                <circle cx="21" cy="21" r="16" fill="none" stroke="rgba(255,255,255,.12)" stroke-width="4"/>
                <circle cx="21" cy="21" r="16" fill="none" stroke="${stroke}" stroke-width="4"
                        stroke-dasharray="${g.pct} ${100 - g.pct}" stroke-dashoffset="25" transform="rotate(-90 21 21)"/>
              </svg>
              <div style="line-height:1.25">
                <div style="font-size:9.5px;color:var(--ds-ink-5)">${g.label}</div>
                <div class="ds-num" style="font-size:var(--ds-fs-value);font-weight:600">${g.value}</div>
              </div>
            </div>`;
  }

  // --- Row 1: featured campaign + 3 channel cards ---
  function mkFeatured() {
   const f = D.featured;
   return `<div class="ds-glass ds-card" data-href="${f.href || 'campaign.html?id=rqi-asia-ph2'}" style="cursor:pointer;padding:14px 16px;display:flex;flex-direction:column;justify-content:space-between">
       <div style="display:flex;align-items:flex-start;justify-content:space-between">
         <div>
           <div style="display:flex;align-items:center;gap:8px">
             <span style="font-size:var(--ds-fs-title);font-weight:600;color:var(--ds-ink-1)">${f.name}</span>
             <span class="ds-badge ds-badge--active">${f.status}</span>
           </div>
           <div style="font-size:var(--ds-fs-micro);color:var(--ds-ink-5);margin-top:2px">${f.brand} · ${f.channel}</div>
         </div>
         ${drill}
       </div>
       <div style="display:flex;align-items:baseline;gap:7px;margin:10px 0">
         <span class="ds-num" style="font-size:var(--ds-fs-kpi);font-weight:300">${f.reach}</span>
         <span style="font-size:var(--ds-fs-micro);color:var(--ds-ink-5)">people reached</span>
       </div>
       <div style="font-size:11px;color:var(--ds-ink-3);line-height:1.45;margin-bottom:11px">${f.description}</div>
       <div style="display:flex;align-items:center;justify-content:space-between">
         <span class="ds-glass" style="display:flex;align-items:center;gap:6px;padding:5px 9px;border-radius:var(--ds-r-md);font-size:11px;color:var(--ds-ink-3)">
           <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 8h6M9 12h6"/></svg>Campaign specs</span>
         <span class="ds-cta" style="display:flex;align-items:center;justify-content:center;width:32px;height:32px;border-radius:var(--ds-r-md)">
           <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4z"/></svg></span>
       </div>
     </div>`;
  }

  const chTab = { search: 'search', website: 'website', email: 'leads', linkedin: 'social', competitor: 'search' };
  function mkChannelCards() { return D.channelCards.map((c) =>
    `<div class="ds-glass ds-card" data-href="channel.html?tab=${chTab[c.id] || 'website'}" style="cursor:pointer;padding:14px 16px;display:flex;flex-direction:column;justify-content:space-between">
       <div style="display:flex;align-items:flex-start;justify-content:space-between">
         <div style="display:flex;align-items:center;gap:7px">
           <span style="font-size:var(--ds-fs-title);font-weight:600;color:var(--ds-ink-1)">${c.title}</span>
           <span style="width:5px;height:5px;border-radius:50%;background:var(--ds-positive)"></span>
           <span style="font-size:10px;color:var(--ds-ink-5)">${c.status}</span>
         </div>
         ${drill}
       </div>
       <div style="display:flex;gap:16px;margin-top:12px">${c.gauges.map(ring).join('')}</div>
       <div style="font-size:10.5px;color:var(--ds-positive);margin-top:11px">${c.deltaText || (c.delta + ' vs prior quarter')}</div>
     </div>`
  ).join(''); }

  function renderRow1() { document.getElementById('rail-row1').innerHTML = mkFeatured() + mkChannelCards(); }
  renderRow1();

  // --- Row 2: analytics widgets ---
  function widgetShell(w, chart, footer, href) {
    return `<div class="ds-glass ds-card" data-href="${href}" style="cursor:pointer;padding:14px 16px;display:flex;flex-direction:column">
              <div style="display:flex;align-items:flex-start;justify-content:space-between">
                <div>
                  <div style="font-size:var(--ds-fs-title);font-weight:600;color:var(--ds-ink-1)">${w.title}</div>
                  <div style="font-size:var(--ds-fs-nano);color:var(--ds-ink-5);letter-spacing:.02em;margin-top:1px">${w.subtitle}</div>
                </div>${drill}
              </div>
              <div style="margin:12px 0 9px">${chart}</div>
              <div class="ds-num" style="font-size:10.5px;color:var(--ds-ink-4);margin-top:auto">${footer}</div>
            </div>`;
  }

  // bars
  function barsChart(w) {
    const n = w.bars.length, step = 100 / n, bw = step * 0.62, max = Math.max(...w.bars);
    const bars = w.bars.map((v, i) => {
      const h = (v / max) * 40, x = i * step + (step - bw) / 2, y = 44 - h;
      const fill = i >= w.highlightFrom ? 'var(--ds-accent)' : 'var(--ds-chart-bar)';
      return `<rect x="${x}" y="${y}" width="${bw}" height="${h}" rx="1.3" fill="${fill}"/>`;
    }).join('');
    return `<svg viewBox="0 0 100 46" preserveAspectRatio="none" style="width:100%;height:50px">${bars}</svg>`;
  }

  // funnel bars + dashed watch threshold
  function funnelChart(w) {
    const n = w.stages.length, step = 100 / n, bw = step * 0.5;
    const bars = w.stages.map((s, i) => {
      const h = (s.pct / 100) * 40, x = i * step + (step - bw) / 2, y = 44 - h;
      const fill = s.watch ? 'var(--ds-accent)' : 'var(--ds-chart-bar)';
      return `<rect x="${x}" y="${y}" width="${bw}" height="${h}" rx="1.3" fill="${fill}"/>`;
    }).join('');
    const ty = 44 - (w.threshold / 100) * 40;
    const line = `<line x1="0" y1="${ty}" x2="100" y2="${ty}" stroke="var(--ds-accent)" stroke-width="0.8" stroke-dasharray="2 2" opacity=".8"/>`;
    return `<svg viewBox="0 0 100 46" preserveAspectRatio="none" style="width:100%;height:50px">${line}${bars}</svg>`;
  }

  // dual line
  function linesChart(w) {
    const all = w.paid.concat(w.blended), max = Math.max(...all), min = Math.min(...all), rng = max - min || 1;
    const pts = (arr) => arr.map((v, i) => `${(i / (arr.length - 1)) * 100},${44 - ((v - min) / rng) * 38 - 3}`).join(' ');
    const end = (arr, c) => { const i = arr.length - 1; const x = 100, y = 44 - ((arr[i] - min) / rng) * 38 - 3; return `<circle cx="${x}" cy="${y}" r="1.6" fill="${c}"/>`; };
    return `<svg viewBox="0 0 100 46" preserveAspectRatio="none" style="width:100%;height:50px">
              <polyline points="${pts(w.blended)}" fill="none" stroke="var(--ds-cyan)" stroke-width="1.4" opacity=".8" vector-effect="non-scaling-stroke"/>
              <polyline points="${pts(w.paid)}" fill="none" stroke="var(--ds-accent)" stroke-width="1.6" vector-effect="non-scaling-stroke"/>
            </svg>`;
  }

  // horizontal peer bars
  function peerChart(w) {
    return `<div style="display:flex;flex-direction:column;gap:6px">` + w.peers.map((p) =>
      `<div style="display:flex;align-items:center;gap:8px">
         <span style="font-size:10px;color:var(--ds-ink-4);width:44px">${p.name}</span>
         <span style="flex:1;height:7px;border-radius:4px;background:rgba(255,255,255,.08);overflow:hidden">
           <span style="display:block;height:100%;width:${p.pct * 2.6}%;border-radius:4px;background:${p.self ? 'var(--ds-accent)' : 'var(--ds-chart-bar)'}"></span></span>
         <span class="ds-num" style="font-size:10px;color:var(--ds-ink-5);width:26px;text-align:right">${p.pct}%</span>
       </div>`).join('') + `</div>`;
  }

  function renderRow2() {
    const W = D.widgets;
    document.getElementById('rail-row2').innerHTML =
      widgetShell(W.reachAnalysis, barsChart(W.reachAnalysis), W.reachAnalysis.footer, 'channel.html?tab=display') +
      widgetShell(W.funnelHealth, funnelChart(W.funnelHealth), W.funnelHealth.footer, 'channel.html?tab=website') +
      widgetShell(W.costPerLead, linesChart(W.costPerLead), W.costPerLead.footer, 'channel.html?tab=leads') +
      widgetShell(W.shareOfVoice, peerChart(W.shareOfVoice), W.shareOfVoice.footer, 'channel.html?tab=search');
  }
  renderRow2();

  /* ======================================================================
     LIVE DATA HYDRATION — feeds drive the cards/widgets; the BRAND filter
     cascades across them (channel/date apply to the map + activity KPIs only,
     since the source feeds are per-brand totals without that breakdown).
     ====================================================================== */
  let LIVE = null;
  const F = window.HUB_LIVE ? HUB_LIVE.fmt : String;
  const SUM = window.HUB_LIVE ? HUB_LIVE.sum : (() => 0);
  // Map the Channel-tracker affiliate label (the brand filter value) → feed brand id.
  const BRANDID = { igneo: 'igneo', fsi: 'fsi', fssa: 'fssa', rqi: 'rqi',
                    'scottish oriental': 'stewart', stewart: 'stewart' };
  const brandIdFor = (v) => BRANDID[(v || '').toLowerCase()] || null;  // null = all / group
  function brandOrTotal(feed, id, key) {
    if (!feed || !feed.byBrand) return 0;
    if (id) { const b = feed.byBrand.find((x) => x.brand === id); return b ? (+b[key] || 0) : 0; }
    return SUM(feed.byBrand, key);
  }

  function renderLive() {
    if (!LIVE) return;
    const id = brandIdFor(state.brand);
    const scope = id ? ' · ' + state.brand : '';
    const cards = [];
    if (LIVE.website && LIVE.website.byBrand.length) {
      cards.push({ id: 'website', title: 'Website', status: 'LIVE · GA4',
        gauges: [{ label: 'Sessions', value: F(brandOrTotal(LIVE.website, id, 'sessions')), pct: 74, tone: 'accent' },
                 { label: 'Users', value: F(brandOrTotal(LIVE.website, id, 'users')), pct: 66, tone: 'cyan' }],
        deltaText: 'GA4' + scope });
    }
    if (LIVE.linkedin && LIVE.linkedin.byBrand.length) {
      cards.push({ id: 'linkedin', title: 'LinkedIn', status: 'LIVE · paid',
        gauges: [{ label: 'Impressions', value: F(brandOrTotal(LIVE.linkedin, id, 'impressions')), pct: 82, tone: 'accent' },
                 { label: 'Spend', value: 'GBP ' + F(brandOrTotal(LIVE.linkedin, id, 'spend')), pct: 48, tone: 'cyan' }],
        deltaText: 'LinkedIn Ads' + scope });
    }
    if (LIVE.competitor && LIVE.competitor.byBrand.length) {
      cards.push({ id: 'competitor', title: 'Competitor ads', status: 'LIVE',
        gauges: [{ label: 'Ads tracked', value: F(brandOrTotal(LIVE.competitor, id, 'ads')), pct: 70, tone: 'accent' },
                 { label: 'Competitors', value: String(brandOrTotal(LIVE.competitor, id, 'competitors')), pct: 40, tone: 'cyan' }],
        deltaText: 'Google Transparency' + scope });
    }
    if (cards.length) {
      D.channelCards = cards;
      D.featured = { name: 'LinkedIn advertising' + (id ? ' — ' + state.brand : ' — all brands'),
        brand: 'LinkedIn Ads', channel: 'Paid social', status: 'LIVE',
        reach: F(brandOrTotal(LIVE.linkedin, id, 'impressions')), href: 'channel.html?tab=social',
        description: `GBP ${F(brandOrTotal(LIVE.linkedin, id, 'spend'))} spend · `
          + `${F(brandOrTotal(LIVE.linkedin, id, 'clicks'))} clicks${id ? '' : ' across all brands'}. `
          + 'Historic reach to 2022.' };
      renderRow1();
    }
    // Share of voice → competitor ad volume, filtered to the brand's peers.
    if (LIVE.competitor && LIVE.competitor.byCompetitor) {
      let peers = LIVE.competitor.byCompetitor;
      if (id) peers = peers.filter((p) => p.brand === id);
      peers = peers.slice(0, 5);
      const tot = peers.reduce((a, p) => a + (p.ads || 0), 0) || 1;
      D.widgets.shareOfVoice = {
        title: 'Competitor ad volume', subtitle: id ? 'Peers of ' + state.brand : 'Top peers (Google Transparency)',
        peers: peers.map((p) => ({ name: (p.competitor || '').slice(0, 12), pct: Math.round((p.ads / tot) * 100) })),
        footer: `${brandOrTotal(LIVE.competitor, id, 'ads')} competitor ads`,
      };
      renderRow2();
    }
  }

  if (window.HUB_LIVE) window.HUB_LIVE.ready.then((feeds) => {
    LIVE = feeds;
    buildCompMarkers();     // Google competitor ad pins
    buildLiCompMarkers();   // LinkedIn competitor ad pins (real geo)
    refresh();              // re-render map + KPIs + live cards with feeds present
  });

  // Card navigation (drill-in ↗ opens a detail screen) — with a fade
  function navTo(url) { document.body.classList.add('dh-fadeout'); setTimeout(() => { location.href = url; }, 240); }
  // Delegated so re-rendered (live-hydrated) cards stay navigable.
  document.addEventListener('click', (e) => {
    if (!e.target.closest || e.target.closest('.tip-go')) return;   // .tip-go handled above
    const card = e.target.closest('[data-href]');
    if (card) navTo(card.dataset.href);
  });

  /* ---- Boot: load the Channel tracker feed and drive the map ----------- */
  function updateKpis(acts) {
    const el = document.getElementById('kpis'); if (!el) return;
    const active = acts.filter((a) => a.status === 'Live' || a.status === 'In progress').length;
    const markets = new Set(acts.map((a) => a.region).filter(Boolean)).size;
    const keyN = acts.filter((a) => a.keyActivity).length;
    const chip = (label, val, sub, tone) => `<div class="ds-glass" style="border-radius:var(--ds-r-lg);padding:11px 15px;min-width:116px">
        <div style="font-size:var(--ds-fs-micro);color:var(--ds-ink-4)">${label}</div>
        <div style="display:flex;align-items:baseline;gap:6px;margin-top:5px">
          <span class="ds-num" style="font-size:var(--ds-fs-kpi);font-weight:300">${val}</span>
          ${sub ? `<span style="font-size:var(--ds-fs-small);color:${tone || 'var(--ds-ink-5)'}">${sub}</span>` : ''}
        </div></div>`;
    el.innerHTML = chip('Active activities', active, `of ${acts.length}`, 'var(--ds-positive)')
      + chip('Markets', markets, 'regions')
      + chip('Key activities', keyN, '', 'var(--ds-accent)');
  }

  const params = new URLSearchParams(location.search);
  fetch('assets/data/channel-tracker.json?v=10').then((r) => r.json()).then((acts) => {
    ACTS = acts;
    buildDims(acts);
    buildMarkers(acts);
    updateKpis(acts);
    // incoming filter from a detail page's rail (case-insensitive: ?brand=igneo → 'Igneo')
    ['brand', 'channel', 'strategy'].forEach((k) => {
      const v = params.get(k); if (!v) return;
      const match = acts.map((a) => a[FIELD[k]]).find((x) => x && x.toLowerCase() === v.toLowerCase());
      state[k] = match || v;
    });
    refresh();
    syncRailDots();
    const incoming = ['brand', 'channel', 'strategy'].find((k) => state[k] !== 'all');
    if (incoming) openMenu(incoming);
  }).catch((e) => console.error('channel tracker feed failed', e));
  window.addEventListener('resize', () => map.invalidateSize());
})();
