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

  /* ---- Markers ---------------------------------------------------------- */
  const markers = D.campaigns.map((c) => {
    const featured = !!c.big;
    const dot = featured ? 13 : 9;
    const ring = featured ? 26 : 18;
    const html =
      `<span class="ring" style="--c:${c.color};width:${ring}px;height:${ring}px;margin:${-ring/2}px 0 0 ${-ring/2}px"></span>` +
      `<span class="dot" style="--c:${c.color};width:${dot}px;height:${dot}px"></span>`;
    const icon = L.divIcon({ className: 'ds-pin', iconSize: [dot, dot], iconAnchor: [dot/2, dot/2], html });
    const marker = L.marker([c.lat, c.lng], { icon });

    if (featured && c.popup) {
      const p = c.popup;
      marker.bindPopup(
        `<div style="min-width:150px">
           <div style="display:flex;align-items:center;gap:7px;margin-bottom:5px">
             <span style="font-size:12.5px;font-weight:600;color:var(--ds-ink-1)">${c.city}</span>
             <span class="ds-badge ds-badge--active">${p.badge}</span>
           </div>
           <div style="font-size:10px;color:var(--ds-ink-5);margin-bottom:7px">${p.meta}</div>
           <div style="display:flex;align-items:baseline;gap:7px">
             <span class="ds-num" style="font-size:23px;font-weight:300;color:var(--ds-ink-1)">${p.value}</span>
             <span style="font-size:11px;color:var(--ds-positive)">${p.delta}</span>
           </div>
           <div style="font-size:9.5px;color:var(--ds-ink-6);margin-top:2px">${p.unit}</div>
         </div>`,
        { closeButton: false, autoClose: false, closeOnClick: false, autoPan: false, className: 'ds-pop', offset: [8, -2] }
      );
    }
    marker._c = c;
    return marker;
  });

  const layer = L.layerGroup().addTo(map);

  function applyFilters() {
    layer.clearLayers();
    let shownFeatured = null;
    markers.forEach((m) => {
      const c = m._c;
      const isPeer = c.brand === 'peer';
      // peer markers only under "all" brand, and hidden unless strategy is all/competitor
      const brandOk    = state.brand === 'all' ? true : (!isPeer && c.brand === state.brand);
      const channelOk  = state.channel === 'all' ? true : c.channel === state.channel;
      const strategyOk = state.strategy === 'all' ? true : c.strategy === state.strategy;
      if (brandOk && channelOk && strategyOk) {
        layer.addLayer(m);
        if (c.big && !shownFeatured) shownFeatured = m;
      }
    });
    if (shownFeatured) setTimeout(() => shownFeatured.openPopup(), 60);
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
    brand:    { data: D.brands,     key: 'brand',    title: 'Filter by brand'    },
    channel:  { data: D.channels,   key: 'channel',  title: 'Filter by channel'  },
    strategy: { data: D.strategies, key: 'strategy', title: 'Filter by strategy' },
  };

  function count(dimKey, id) {
    if (id === 'all') return D.campaigns.filter((c) => c.brand !== 'peer').length;
    return D.campaigns.filter((c) => c[dimKey] === id).length;
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
            ${item(D.colors.active,  'Active campaign')}
            ${item(D.colors.growing, 'Share of voice growing')}
            ${item(D.colors.peer,    'Competitor / peer')}`;
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
    `<div class="ds-glass ds-card" data-href="campaign.html?id=greater-china" style="cursor:pointer;padding:14px 16px;display:flex;flex-direction:column;justify-content:space-between">
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

  // Card navigation (drill-in ↗ opens a detail screen)
  document.querySelectorAll('[data-href]').forEach((el) => {
    el.addEventListener('click', () => { location.href = el.dataset.href; });
  });

  /* ---- Boot ------------------------------------------------------------- */
  applyFilters();
  syncRailDots();
  window.addEventListener('resize', () => map.invalidateSize());
})();
