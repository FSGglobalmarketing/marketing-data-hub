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
  const REGION = { ANZ: [-33.87, 151.21], UK: [51.51, -0.13], EMEA: [50.11, 8.68], US: [40.71, -74.01], Global: [22, 6] };
  const COLOR  = { 'Live': '#f4ad44', 'In progress': '#5ec8e6', 'Complete': '#7fdca0', 'Draft': '#9db2cc' };
  const colorFor = (s) => COLOR[s] || '#7e93ac';
  const MON = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const fmtDate = (x) => { if (!x) return null; const b = x.split('-'); return `${+b[2]} ${MON[+b[1] - 1]} ${b[0]}`; };
  const fmtRange = (a) => { const s = fmtDate(a.startDate), e = fmtDate(a.endDate) || fmtDate(a.goLive); return s && e ? `${s} – ${e}` : (s || e || ''); };

  // Pin tooltip + popup content — Title, Channel, Audience, Status, Activated.
  function content(a) {
    const row = (k, v) => `<div class="tip-row"><span>${k}</span><b>${v || '—'}</b></div>`;
    return `<div class="tip-t">${a.title || 'Untitled'}${a.keyActivity ? ' <span style="color:#f4ad44">★</span>' : ''}</div>
      ${row('Channel', a.channel)}
      ${row('Audience', a.audience)}
      ${row('Status', a.status || 'Planned')}
      ${row('Activated', fmtDate(a.goLive))}`;
  }

  // Cluster group: numbered clusters when activities share a market; zooming
  // in (or clicking a cluster) uncluster/spiderfies to the individual pins.
  const layer = L.markerClusterGroup({
    maxClusterRadius: 46, showCoverageOnHover: false, spiderfyOnMaxZoom: true,
    disableClusteringAtZoom: 7, chunkedLoading: true,
    iconCreateFunction: (c) => L.divIcon({ html: `<div class="ds-cluster">${c.getChildCount()}</div>`, className: 'ds-cluster-wrap', iconSize: [38, 38] }),
  }).addTo(map);
  let markers = [];

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
      m.bindTooltip(content(a), { className: 'ds-tip', direction: 'top', offset: [0, -8], opacity: 1 });
      m.bindPopup(content(a), { className: 'ds-pop', closeButton: false, offset: [0, -6] });   // clickable
      m._a = a;
      return m;
    });
  }

  function applyFilters() {
    layer.clearLayers();
    layer.addLayers(markers.filter((m) => ['brand', 'channel', 'strategy'].every((k) => state[k] === 'all' || m._a[FIELD[k]] === state[k])));
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
        applyFilters();
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
            ${item('#9db2cc', 'Draft')}
            ${item('#7fdca0', 'Complete')}
            ${item('#7e93ac', 'Planned')}`;
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
  const f = D.featured;
  const featuredCard =
    `<div class="ds-glass ds-card" data-href="campaign.html?id=rqi-asia-ph2" style="cursor:pointer;padding:14px 16px;display:flex;flex-direction:column;justify-content:space-between">
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

  const chTab = { search: 'search', website: 'website', email: 'leads' };
  const channelCards = D.channelCards.map((c) =>
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
       <div style="font-size:10.5px;color:var(--ds-positive);margin-top:11px">${c.delta} vs prior quarter</div>
     </div>`
  ).join('');

  document.getElementById('rail-row1').innerHTML = featuredCard + channelCards;

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

  const W = D.widgets;
  document.getElementById('rail-row2').innerHTML =
    widgetShell(W.reachAnalysis, barsChart(W.reachAnalysis), W.reachAnalysis.footer, 'channel.html?tab=display') +
    widgetShell(W.funnelHealth, funnelChart(W.funnelHealth), W.funnelHealth.footer, 'channel.html?tab=website') +
    widgetShell(W.costPerLead, linesChart(W.costPerLead), W.costPerLead.footer, 'channel.html?tab=leads') +
    widgetShell(W.shareOfVoice, peerChart(W.shareOfVoice), W.shareOfVoice.footer, 'channel.html?tab=search');

  // Card navigation (drill-in ↗ opens a detail screen) — with a fade
  function navTo(url) { document.body.classList.add('dh-fadeout'); setTimeout(() => { location.href = url; }, 240); }
  document.querySelectorAll('[data-href]').forEach((el) => {
    el.addEventListener('click', () => navTo(el.dataset.href));
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
    applyFilters();
    syncRailDots();
    const incoming = ['brand', 'channel', 'strategy'].find((k) => state[k] !== 'all');
    if (incoming) openMenu(incoming);
  }).catch((e) => console.error('channel tracker feed failed', e));
  window.addEventListener('resize', () => map.invalidateSize());
})();
