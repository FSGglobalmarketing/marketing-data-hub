/* =========================================================================
   FSG DATA HUB — detail page runtime (campaign view + channel view)
   Renders the persistent chrome + hero (slider / gradient) + funnel tabs +
   brief + tab-driven widget grid. Page type comes from <body data-page>.
   ========================================================================= */
(function () {
  const D = window.HUB_DATA;
  const qs = new URLSearchParams(location.search);
  const pageType = document.body.dataset.page; // 'campaign' | 'channel'

  /* ---- Inline icon set (inner SVG per ICONS.md) ------------------------- */
  const I = {
    home:'<path d="M9 4 4 6v14l5-2 6 2 5-2V4l-5 2-6-2z"/><path d="M9 4v14M15 6v14"/>',
    brand:'<path d="M20.6 13.4l-7.2 7.2a2 2 0 01-2.8 0l-6.2-6.2V4h9.4l6.8 6.8a2 2 0 010 2.6z"/><circle cx="7.5" cy="7.5" r="1.3"/>',
    channel:'<circle cx="6" cy="6" r="2.4"/><circle cx="18" cy="9" r="2.4"/><circle cx="9" cy="18" r="2.4"/><path d="M8 7l8 1M8 16l8-6"/>',
    strategy:'<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3.2"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2"/>',
    layers:'<path d="M12 3l9 5-9 5-9-5z"/><path d="M3 13l9 5 9-5"/>',
    search:'<circle cx="11" cy="11" r="7"/><path d="M21 21l-4-4"/>',
    calendar:'<rect x="3" y="4" width="18" height="17" rx="2"/><path d="M3 9h18M8 3v3M16 3v3"/>',
    chevron:'<path d="M6 9l6 6 6-6"/>',
    pin:'<path d="M12 21s7-6.2 7-11a7 7 0 10-14 0c0 4.8 7 11 7 11z"/><circle cx="12" cy="10" r="2.6"/>',
    linkedin:'<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M7 10v7M7 7v.01M11 17v-4M15 17v-2.5a1.5 1.5 0 013 0V17"/>',
    globe:'<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.5 2.5 15 0 18M12 3c-2.5 2.5-2.5 15 0 18"/>',
    doc:'<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 8h6M9 12h6M9 16h3"/>',
    display:'<rect x="3" y="4" width="18" height="13" rx="2"/><path d="M8 21h8M12 17v4"/>',
    events:'<rect x="3" y="4" width="18" height="17" rx="2"/><path d="M3 9h18M8 3v3M16 3v3M8 14h3"/>',
    leads:'<circle cx="12" cy="8" r="3.2"/><path d="M5.5 20a6.5 6.5 0 0113 0"/>',
    star:'<path d="M12 3l2.6 5.6 6 .8-4.4 4.2 1.1 6L12 17.9 6.7 19.6l1.1-6L3.4 9.4l6-.8z"/>',
    share:'<path d="M4 12v7a1 1 0 001 1h14a1 1 0 001-1v-7"/><path d="M12 15V3M8 7l4-4 4 4"/>',
    expand:'<path d="M15 3h6v6M9 21H3v-6M21 3l-8 8M3 21l8-8"/>',
    mic:'<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0014 0M12 18v3"/>',
    bolt:'<path d="M13 2L4.5 13.5H11l-1 8.5 8.5-11.5H12l1-8.5z"/>',
  };
  const svg = (name, w = 17, sw = 1.7) =>
    `<svg width="${w}" height="${w}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round">${I[name]}</svg>`;

  /* ---- Resolve the page subject ---------------------------------------- */
  let subject, activeTab, competitorOn = false, countries, slides = [];

  if (pageType === 'campaign') {
    const c = D.campaignDetails[qs.get('id')] || D.campaignDetails['greater-china'];
    subject = c;
    activeTab = qs.get('tab') || c.defaultTab || D.funnelTabs[0].id;
    countries = c.countries;
    slides = c.heroImages || [];
  } else {
    const tab = qs.get('tab') || 'website';
    const ctx = D.channelContexts[tab] || D.channelContexts.website;
    subject = ctx;
    activeTab = tab;
    countries = [
      { code: 'ALL', name: 'All markets' }, { code: 'HK', name: 'Hong Kong' },
      { code: 'SG', name: 'Singapore' }, { code: 'UK', name: 'United Kingdom' },
      { code: 'US', name: 'United States' }, { code: 'AU', name: 'Australia' },
    ];
  }
  let activeCountry = countries[0];

  /* ======================================================================
     CHROME — top bar + left rail
     ====================================================================== */
  function topbar() {
    return `<div class="dh-topbar">
      <a href="index.html" style="display:flex;align-items:center;gap:10px;text-decoration:none">
        <div style="width:28px;height:28px;border-radius:8px;background:var(--dh-logo);display:flex;align-items:center;justify-content:center">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="#1b1d21"><path d="M5 3h14v4h-9v4h7v4h-7v6H5z"/></svg></div>
        <div style="line-height:1.15">
          <div style="font-size:12.5px;font-weight:600;color:var(--ds-ink-1)">First Sentier Group</div>
          <div style="font-size:9.5px;color:var(--ds-ink-5)">Marketing intelligence</div></div>
      </a>
      <label class="dh-search" style="display:flex;align-items:center;gap:10px;height:40px;padding:0 12px 0 14px;border-radius:var(--ds-r-lg);max-width:560px;flex:1;margin:0 auto">
        <span style="color:var(--ds-ink-5)">${svg('search', 16)}</span>
        <span style="flex:1;font-size:var(--ds-fs-body);color:var(--ds-ink-3)">Ask anything — “how is this campaign pacing vs plan?”</span>
        <span style="font-size:10px;font-weight:600;color:var(--ds-ink-5);border:1px solid var(--ds-glass-border);border-radius:5px;padding:3px 6px;font-family:var(--ds-font-mono)">⌘K</span>
      </label>
      <div style="position:relative">
        <div id="date-btn" class="ds-glass ds-tbtn" style="display:flex;align-items:center;gap:9px;height:38px;padding:0 11px;border-radius:var(--ds-r-md)">
          <span style="color:var(--ds-ink-4)">${svg('calendar', 15)}</span>
          <div style="display:flex;flex-direction:column;line-height:1.15">
            <span class="ds-eyebrow" style="font-size:9px">Date range</span>
            <span style="font-size:12px;font-weight:500;color:var(--ds-ink-1)">${(pageType === 'campaign' && subject.dateRange) || '1 Jan – 31 Mar 2026'}</span>
          </div>
          <span style="color:var(--ds-ink-4)">${svg('chevron', 14, 2)}</span>
        </div>
        <div id="date-pop" class="ds-glass-strong" style="display:none;position:absolute;top:46px;right:0;width:200px;border-radius:var(--ds-r-2xl);padding:10px;box-shadow:var(--ds-shadow-menu);z-index:40">
          ${['This quarter','Last quarter','Year to date','Last 12 months','Custom range…'].map((t, i) =>
            `<div class="ds-row ${i===0?'ds-row--active':''}" style="padding:7px 9px;font-size:12px;color:${i===0?'var(--ds-ink-1)':'var(--ds-ink-2)'}">${t}</div>`).join('')}
        </div>
      </div>
    </div>`;
  }

  function rail() {
    const tile = (name, menu, active) =>
      `<a href="index.html" class="rail-tbtn ${active ? 'is-active' : ''}" title="${menu}">${svg(name)}</a>`;
    return `<div class="dh-rail">
      ${tile('home', 'Map view', true)}
      <div class="hairline"></div>
      ${tile('brand', 'Filter by brand')}
      ${tile('channel', 'Filter by channel')}
      ${tile('strategy', 'Filter by strategy')}
      <div class="hairline"></div>
      ${tile('layers', 'Map layers')}
    </div>`;
  }

  /* ======================================================================
     HERO
     ====================================================================== */
  function hero() {
    const isCampaign = pageType === 'campaign';
    const slidesHtml = slides.map((src, i) =>
      `<div class="dh-slide ${i === 0 ? 'is-active' : ''}" data-slide="${i}" style="background-image:url('${src}')"></div>`).join('');

    const thumbs = isCampaign && slides.length ?
      `<div class="dh-thumbs">${slides.slice(0, 3).map((s) => `<img src="${s}" alt="">`).join('')}${slides.length > 3 ? `<span class="more dh-glass">+${slides.length - 3}</span>` : ''}</div>` : '';

    const badge = (isCampaign && subject.status) ? `<span class="ds-badge">${subject.status}</span>` : '';
    const eyebrow = isCampaign ? `${subject.brand} · ${subject.channel}` : 'All campaigns · aggregate';
    const title = isCampaign ? subject.name : subject.subject;

    const tabs = D.funnelTabs.map((t) =>
      `<div class="dh-tab ${t.id === activeTab ? 'is-active' : ''}" data-tab="${t.id}">${svg(t.icon, 15)}<span>${t.label}</span></div>`).join('');

    return `<div class="dh-hero ${isCampaign ? '' : 'dh-hero--plain'}">
      ${slidesHtml}
      <div class="dh-hero-scrim"></div>

      <div class="dh-eyebrow-row">
        <div class="dh-country">
          <div id="country-btn" class="dh-country-btn dh-glass">
            ${svg('pin', 15)}
            <span id="country-label" style="font-size:12.5px;font-weight:500">${activeCountry.name}</span>
            ${svg('chevron', 13, 2)}
          </div>
          <div id="country-menu" class="dh-country-menu">
            ${countries.map((c) => `<div class="ds-row" data-country="${c.code}" style="display:flex;align-items:center;gap:9px;padding:8px 9px;border-radius:9px;font-size:12px;cursor:pointer">
              <span style="width:24px;font-family:var(--ds-font-mono);font-size:9.5px;color:var(--ds-ink-5)">${c.code}</span>${c.name}</div>`).join('')}
          </div>
        </div>
        ${thumbs}
      </div>

      <div class="dh-hero-body">
        <div class="dh-hero-eyebrow">${eyebrow}</div>
        <div class="dh-title">${title}${badge}</div>
        <div class="dh-summary">${subject.summary}</div>
        <div class="dh-hero-actions">
          <span class="dh-iconbtn dh-glass" title="Save">${svg('star', 15)}</span>
          <span class="dh-iconbtn dh-glass" title="Share">${svg('share', 15)}</span>
        </div>
      </div>

      <div class="dh-herobar">
        <div class="dh-tabs">${tabs}</div>
        <div class="dh-compbar dh-glass">
          <span style="font-size:12px">Competitors</span>
          <span id="comp-switch" class="dh-switch"><span class="knob"></span></span>
        </div>
      </div>
    </div>`;
  }

  /* ======================================================================
     BRIEF (yellow box) + WIDGET GRID
     ====================================================================== */
  function brief() {
    const expand = `<span class="dh-drill" style="cursor:pointer">${svg('expand', 15)}</span>`;
    if (pageType === 'campaign') {
      return `<div class="dh-brief">
        <div class="dh-brief-head">
          <div class="dh-brief-tag"><span class="dot">${svg('bolt', 13)}</span>Campaign brief</div>
          ${expand}
        </div>
        <h3>${subject.summary}</h3>
        <div class="lbl">Goals</div>
        <ul>${subject.goals.map((g) => `<li>${g}</li>`).join('')}</ul>
        <div class="lbl">Objectives</div>
        <ul>${subject.objectives.map((o) => `<li>${o}</li>`).join('')}</ul>
        <div class="dh-brief-foot">
          <span class="dh-brief-ask">Ask about this campaign…</span>
          <span class="dh-mic">${svg('mic', 16)}</span>
        </div>
      </div>`;
    }
    return `<div class="dh-brief">
      <div class="dh-brief-head">
        <div class="dh-brief-tag"><span class="dot">${svg('globe', 13)}</span>${subject.subject}</div>
        ${expand}
      </div>
      <h3>${subject.summary}</h3>
      <div class="lbl">What's measured</div>
      <ul>${subject.measures.map((m) => `<li>${m}</li>`).join('')}</ul>
      <div class="dh-brief-foot">
        <span class="dh-brief-ask">Ask about this channel…</span>
        <span class="dh-mic">${svg('mic', 16)}</span>
      </div>
    </div>`;
  }

  function widgetsFor(tab) {
    return (D.tabContent[tab] || []).filter((w) => {
      if (w.peer && !competitorOn) return false;
      if (w.campaignOnly && pageType !== 'campaign') return false;
      return true;
    });
  }

  function renderGrid() {
    const grid = document.getElementById('dh-grid');
    const list = widgetsFor(activeTab);
    grid.innerHTML = list.length ? list.map(HUB_CHARTS.widget).join('')
      : `<div class="ds-glass" style="padding:20px;border-radius:var(--ds-r-xl);color:var(--ds-ink-5);font-size:12.5px">No widgets configured for this channel yet.</div>`;
  }

  /* ======================================================================
     MOUNT + WIRE
     ====================================================================== */
  document.getElementById('app').innerHTML =
    topbar() + rail() +
    `<div class="dh-main">${hero()}<div class="dh-content">${brief()}<div id="dh-grid" class="dh-grid"></div></div></div>`;

  renderGrid();

  // Tabs
  document.querySelectorAll('.dh-tab').forEach((t) => {
    t.onclick = () => {
      activeTab = t.dataset.tab;
      document.querySelectorAll('.dh-tab').forEach((x) => x.classList.toggle('is-active', x === t));
      renderGrid();
    };
  });

  // Competitor toggle
  const sw = document.getElementById('comp-switch');
  sw.onclick = () => { competitorOn = !competitorOn; sw.classList.toggle('is-on', competitorOn); renderGrid(); };

  // Country selector
  const cBtn = document.getElementById('country-btn');
  const cMenu = document.getElementById('country-menu');
  cBtn.onclick = (e) => { e.stopPropagation(); cMenu.style.display = cMenu.style.display === 'block' ? 'none' : 'block'; };
  cMenu.querySelectorAll('[data-country]').forEach((row) => {
    row.onclick = () => {
      activeCountry = countries.find((c) => c.code === row.dataset.country) || activeCountry;
      document.getElementById('country-label').textContent = activeCountry.name;
      cMenu.style.display = 'none';
    };
  });

  // Date popover
  const dBtn = document.getElementById('date-btn');
  const dPop = document.getElementById('date-pop');
  dBtn.onclick = (e) => { e.stopPropagation(); dPop.style.display = dPop.style.display === 'block' ? 'none' : 'block'; };

  document.addEventListener('click', (e) => {
    if (!cMenu.contains(e.target) && !cBtn.contains(e.target)) cMenu.style.display = 'none';
    if (!dPop.contains(e.target) && !dBtn.contains(e.target)) dPop.style.display = 'none';
  });

  // Hero slider (campaign only) — calm crossfade + dots
  if (slides.length > 1) {
    let idx = 0;
    const go = (n) => {
      idx = (n + slides.length) % slides.length;
      document.querySelectorAll('.dh-slide').forEach((s, i) => s.classList.toggle('is-active', i === idx));
      document.querySelectorAll('.dh-dot').forEach((d, i) => d.classList.toggle('is-active', i === idx));
    };
    document.querySelectorAll('.dh-dot').forEach((d) => d.onclick = () => go(+d.dataset.dot));
    setInterval(() => go(idx + 1), 7000);
  }
})();
