/* =========================================================================
   FSG DATA HUB — Channel marketing (activity tracker) runtime
   Reads the DataHub feed (assets/data/channel-tracker.json — the Smartsheet
   "Channel tracker 2026" export) and renders a filterable birds-eye board.
   ========================================================================= */
(function () {
  const D = window.HUB_DATA;
  const FEED = 'assets/data/channel-tracker.json?v=10';

  /* ---- Icons (shared line set) ----------------------------------------- */
  const I = {
    home:'<path d="M9 4 4 6v14l5-2 6 2 5-2V4l-5 2-6-2z"/><path d="M9 4v14M15 6v14"/>',
    brand:'<path d="M20.6 13.4l-7.2 7.2a2 2 0 01-2.8 0l-6.2-6.2V4h9.4l6.8 6.8a2 2 0 010 2.6z"/><circle cx="7.5" cy="7.5" r="1.3"/>',
    channel:'<circle cx="6" cy="6" r="2.4"/><circle cx="18" cy="9" r="2.4"/><circle cx="9" cy="18" r="2.4"/><path d="M8 7l8 1M8 16l8-6"/>',
    strategy:'<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3.2"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2"/>',
    layers:'<path d="M12 3l9 5-9 5-9-5z"/><path d="M3 13l9 5 9-5"/>',
    search:'<circle cx="11" cy="11" r="7"/><path d="M21 21l-4-4"/>',
    calendar:'<rect x="3" y="4" width="18" height="17" rx="2"/><path d="M3 9h18M8 3v3M16 3v3"/>',
    chevron:'<path d="M6 9l6 6 6-6"/>',
  };
  const svg = (n, w = 17, sw = 1.7) => `<svg width="${w}" height="${w}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round">${I[n]}</svg>`;

  const state = { affiliate: 'all', channel: 'all', region: 'all', status: 'all', q: '' };
  let ACTS = [];

  /* ---- Date helpers ---------------------------------------------------- */
  const MON = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  function d(iso) { if (!iso) return null; const p = iso.split('-'); return { y: +p[0], m: +p[1], day: +p[2] }; }
  function fmt(o, withYear) { return o ? `${o.day} ${MON[o.m - 1]}${withYear ? ' ' + o.y : ''}` : ''; }
  function timeline(a) {
    const s = d(a.startDate), e = d(a.endDate) || d(a.goLive);
    if (!s && !e) return '<span class="act-num">—</span>';
    if (s && e) { const sameY = s.y === e.y; return `<span class="act-num">${fmt(s, !sameY)} – ${fmt(e, true)}</span>`; }
    return `<span class="act-num">${fmt(s || e, true)}</span>`;
  }

  const statusClass = (s) => ({ 'Live': 'st-live', 'In progress': 'st-inprogress', 'Draft': 'st-draft', 'Complete': 'st-complete' }[s] || 'st-none');

  /* ======================================================================
     CHROME
     ====================================================================== */
  function navTo(url) { document.body.classList.add('dh-fadeout'); setTimeout(() => { location.href = url; }, 240); }

  function topbar() {
    return `<div class="dh-topbar">
      <a href="index.html" style="display:flex;align-items:center;gap:10px;text-decoration:none">
        <div style="width:28px;height:28px;border-radius:8px;background:var(--dh-logo);display:flex;align-items:center;justify-content:center">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="#fff"><path d="M5 3h14v4h-9v4h7v4h-7v6H5z"/></svg></div>
        <div style="line-height:1.15">
          <div style="font-size:12.5px;font-weight:600;color:var(--ds-ink-1)">First Sentier Group</div>
          <div style="font-size:9.5px;color:var(--ds-ink-5)">Marketing intelligence</div></div>
      </a>
      <label class="dh-search" style="display:flex;align-items:center;gap:10px;height:40px;padding:0 12px 0 14px;border-radius:var(--ds-r-lg);max-width:560px;flex:1;margin:0 auto">
        <span style="color:var(--ds-ink-5)">${svg('search', 16)}</span>
        <span style="flex:1;font-size:var(--ds-fs-body);color:var(--ds-ink-3)">Ask anything — “which key activities go live this quarter?”</span>
        <span style="font-size:10px;font-weight:600;color:var(--ds-ink-5);border:1px solid var(--ds-glass-border);border-radius:5px;padding:3px 6px;font-family:var(--ds-font-mono)">⌘K</span>
      </label>
      <div class="dh-glass ds-tbtn" style="display:flex;align-items:center;gap:9px;height:38px;padding:0 11px;border-radius:var(--ds-r-md);background:var(--dh-card);border:1px solid var(--ds-hairline)">
        <span style="color:var(--ds-ink-4)">${svg('calendar', 15)}</span>
        <div style="display:flex;flex-direction:column;line-height:1.15">
          <span class="ds-eyebrow" style="font-size:9px">Date range</span>
          <span style="font-size:12px;font-weight:500;color:var(--ds-ink-1)">1 Jan – 30 Jun 2026</span>
        </div>${svg('chevron', 14, 2)}
      </div>
    </div>`;
  }

  function rail() {
    const btn = (n, menu, label) => `<div class="rail-tbtn" data-menu="${menu}" title="${label}">${svg(n)}</div>`;
    return `<div class="dh-rail">
      <div class="rail-tbtn" data-nav="map" title="Map view">${svg('home')}</div>
      <div class="hairline"></div>
      ${btn('brand', 'brand', 'Brands')}
      <div class="rail-tbtn is-active" data-menu="channel" title="Channel marketing">${svg('channel')}</div>
      ${btn('strategy', 'strategy', 'Strategy')}
      <div class="hairline"></div>
      ${btn('layers', 'layers', 'Map layers')}
    </div>
    <div id="dh-flyout" class="dh-flyout"></div>`;
  }

  /* ======================================================================
     RENDER
     ====================================================================== */
  const opts = (key) => ['all', ...Array.from(new Set(ACTS.map((a) => a[key]).filter(Boolean))).sort()];

  function selectEl(id, key, label) {
    return `<span class="act-select"><select data-key="${key}" aria-label="${label}">${opts(key).map((v) =>
      `<option value="${v}" ${state[key] === v ? 'selected' : ''}>${v === 'all' ? 'All ' + label.toLowerCase() : v}</option>`).join('')}</select></span>`;
  }

  function filtered() {
    return ACTS.filter((a) =>
      (state.affiliate === 'all' || a.affiliate === state.affiliate) &&
      (state.channel === 'all' || a.channel === state.channel) &&
      (state.region === 'all' || a.region === state.region) &&
      (state.status === 'all' || a.status === state.status) &&
      (!state.q || (a.title || '').toLowerCase().includes(state.q.toLowerCase())));
  }

  function render() {
    const rows = filtered();
    const live = ACTS.filter((a) => a.status === 'Live' || a.status === 'In progress').length;
    const keyN = ACTS.filter((a) => a.keyActivity).length;
    const chN = new Set(ACTS.map((a) => a.channel).filter(Boolean)).size;

    const kpi = (lbl, val, sub) => `<div class="act-kpi"><div class="lbl">${lbl}</div><div class="val">${val}${sub ? `<span>${sub}</span>` : ''}</div></div>`;

    const table = `<div class="act-table-wrap"><table class="act-table">
      <thead><tr><th>Activity</th><th>Channel</th><th>Brand</th><th>Region</th><th>Status</th><th>Timeline</th><th>Lead</th></tr></thead>
      <tbody>${rows.map((a) => `<tr>
        <td class="t-title">${a.title || '—'}${a.keyActivity ? '<span class="act-key" title="Key activity">★</span>' : ''}</td>
        <td>${a.channel ? `<span class="chip chip-ch">${a.channel}</span>` : '—'}</td>
        <td>${a.affiliate ? `<span class="brand-tag">${a.affiliate}</span>` : '—'}</td>
        <td>${a.region || '—'}</td>
        <td>${a.status ? `<span class="chip ${statusClass(a.status)}"><span class="dot" style="background:currentColor"></span>${a.status}</span>` : '<span class="chip st-none">Planned</span>'}</td>
        <td>${timeline(a)}</td>
        <td>${a.lead || '—'}</td>
      </tr>`).join('')}</tbody>
    </table></div>`;

    document.getElementById('act-body').innerHTML = `
      <div class="act-head">
        <div><div class="act-title">Channel marketing</div>
          <div class="act-sub">Activity tracker · Smartsheet · Channel tracker 2026</div></div>
      </div>
      <div class="act-kpis">
        ${kpi('Total activities', ACTS.length, '')}
        ${kpi('Live &amp; in progress', live, `of ${ACTS.length}`)}
        ${kpi('Key activities', keyN, '')}
        ${kpi('Channels', chN, '')}
      </div>
      <div class="act-filters">
        ${selectEl('f-aff', 'affiliate', 'Brands')}
        ${selectEl('f-ch', 'channel', 'Channels')}
        ${selectEl('f-reg', 'region', 'Regions')}
        ${selectEl('f-st', 'status', 'Statuses')}
        <span class="act-search">${svg('search', 15)}<input id="act-q" type="text" placeholder="Search activities…" value="${state.q}"></span>
        ${(state.affiliate !== 'all' || state.channel !== 'all' || state.region !== 'all' || state.status !== 'all' || state.q) ? '<span class="act-clear" id="act-clear">Clear</span>' : ''}
        <span class="act-count">${rows.length} of ${ACTS.length} activities</span>
      </div>
      ${table}`;

    // wire filter controls
    document.querySelectorAll('.act-select select').forEach((s) => s.onchange = () => { state[s.dataset.key] = s.value; render(); });
    const q = document.getElementById('act-q');
    q.oninput = () => { state.q = q.value; render(); q2(); };
    function q2() { const el = document.getElementById('act-q'); if (el) { el.focus(); el.setSelectionRange(el.value.length, el.value.length); } }
    const clr = document.getElementById('act-clear');
    if (clr) clr.onclick = () => { state.affiliate = state.channel = state.region = state.status = 'all'; state.q = ''; render(); };
  }

  /* ======================================================================
     RAIL FLYOUT (cross-nav to filtered map, same as detail pages)
     ====================================================================== */
  function wireRail() {
    const flyout = document.getElementById('dh-flyout');
    const dims = { brand: D.brands, channel: D.channels, strategy: D.strategies };
    const titles = { brand: 'Go to brand', channel: 'Go to channel', strategy: 'Go to strategy' };
    function open(key) {
      if (key === 'layers') {
        flyout.innerHTML = `<div class="dh-fly-h">Status</div>` +
          [['#60beb3', 'Live'], ['#00727d', 'In progress'], ['#d5b700', 'Draft'], ['#022b56', 'Complete']]
            .map(([c, l]) => `<div class="dh-fly-row"><span style="width:11px;height:11px;border-radius:50%;background:${c}"></span>${l}</div>`).join('');
      } else {
        flyout.innerHTML = `<div class="dh-fly-h">${titles[key]}</div>` + dims[key].map((o) =>
          `<div class="dh-fly-row" data-key="${key}" data-id="${o.id}"><span class="tile">${o.tile}</span>${o.label}</div>`).join('');
        flyout.querySelectorAll('.dh-fly-row').forEach((r) => r.onclick = () => navTo('index.html' + (r.dataset.id === 'all' ? '' : `?${r.dataset.key}=${r.dataset.id}`)));
      }
      flyout.classList.add('open');
    }
    const close = () => { flyout.classList.remove('open'); document.querySelectorAll('.rail-tbtn[data-menu]').forEach((x) => x.classList.remove('menu-open')); };
    document.querySelectorAll('.rail-tbtn[data-menu]').forEach((b) => b.onclick = (e) => {
      e.stopPropagation(); const wasOpen = b.classList.contains('menu-open'); close();
      if (!wasOpen && !b.classList.contains('is-active')) { b.classList.add('menu-open'); open(b.dataset.menu); }
      else if (!wasOpen) { open(b.dataset.menu); }
    });
    document.querySelector('.rail-tbtn[data-nav="map"]').onclick = () => navTo('index.html');
    document.addEventListener('click', (e) => { if (!e.target.closest('.dh-rail') && !e.target.closest('#dh-flyout')) close(); });
  }

  /* ---- Boot ------------------------------------------------------------- */
  document.getElementById('app').innerHTML = topbar() + rail() + `<div class="act-main"><div id="act-body"></div></div>`;
  wireRail();

  fetch(FEED).then((r) => r.json()).then((data) => {
    ACTS = data;
    render();
  }).catch((err) => {
    document.getElementById('act-body').innerHTML = `<div class="act-main" style="color:var(--ds-ink-4)">Couldn't load the channel tracker feed (${err}).</div>`;
  });
})();
