/* =========================================================================
   FSG DATA HUB — shared SVG chart helpers (return HTML strings) + hover.
   Charts carry a faint dashed benchmark line and, on hover, show pins + a
   tooltip (call HUB_CHARTS.initInteractions after inserting the markup).
   Colours come from the FSG brand palette via CSS variables (see detail.css).
   ========================================================================= */
window.HUB_CHARTS = (function () {

  /* icons for the dark circular badge on each widget (per kind) */
  const ICONS = {
    kpis:'<path d="M13 2L4.5 13.5H11l-1 8.5 8.5-11.5H12l1-8.5z"/>',
    bars:'<path d="M4 20V10M10 20V4M16 20v-7M2 20h20"/>',
    lines:'<path d="M3 17l6-6 4 4 8-8M15 7h6v6"/>',
    funnel:'<path d="M3 5h18l-7 8v6l-4 2v-8z"/>',
    list:'<path d="M8 6h13M8 12h13M8 18h13M3.5 6h.01M3.5 12h.01M3.5 18h.01"/>',
    gauges:'<path d="M4 19a8 8 0 1116 0"/><path d="M12 14l3.5-3.5"/>',
    peers:'<circle cx="9" cy="8" r="3"/><path d="M3 20a6 6 0 0112 0M16 5.5a3 3 0 010 5M21.5 20a6.2 6.2 0 00-4-5.5"/>',
    stat:'<path d="M3 12h3.5l2.5-7 4 14 2.5-7H21"/>',
  };
  const expand = '<path d="M15 3h6v6M9 21H3v-6M21 3l-8 8M3 21l8-8"/>';
  const icon = (paths, w = 15, sw = 1.7) =>
    `<svg width="${w}" height="${w}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round">${paths}</svg>`;

  const statusColor = (s) => ({ good: 'var(--ds-positive)', watch: 'var(--ds-watch)', inactive: 'var(--ds-neutral)' }[s] || 'var(--ds-ink-5)');
  const statusSoft = (s) => ({ good: 'rgba(96,190,179,.18)', watch: 'rgba(213,183,0,.18)', inactive: 'rgba(154,160,168,.16)' }[s] || 'rgba(154,160,168,.16)');
  const mean = (a) => a.reduce((x, y) => x + y, 0) / a.length;
  const fmt = (v) => (Number.isInteger(v) ? v.toLocaleString() : (+v).toFixed(1));

  /* ---- Shared chart wrapper (bars / lines / funnel) --------------------
     viewBox 0..100 in both axes with preserveAspectRatio:none, so hover
     pixel mapping is exact. Draws a faint dashed benchmark line. */
  function chartWrap(kind, series, opts) {
    opts = opts || {};
    const a = series.a || (series.stages ? series.stages.map((s) => s.pct) : []);
    const b = series.b || null;
    const all = b ? a.concat(b) : a;
    const max = Math.max(...all), min = Math.min(...all), range = (max - min) || 1;
    const Y = (v) => 10 + (1 - (v - min) / range) * 80;         // 10=top pad, 90=bottom
    const H = opts.height || 96;

    const benchV = opts.bench != null ? opts.bench : mean(a);
    const benchLine = `<line x1="0" y1="${Y(benchV)}" x2="100" y2="${Y(benchV)}" stroke="var(--dh-bench)" stroke-width="0.8" stroke-dasharray="2.4 2.4" vector-effect="non-scaling-stroke"/>`;

    let body = '';
    if (kind === 'bars') {
      const n = a.length, step = 100 / n, bw = step * 0.6, from = opts.highlightFrom == null ? n : opts.highlightFrom;
      body = a.map((v, i) => {
        const y = Y(v), x = i * step + (step - bw) / 2;
        const fill = i >= from ? 'var(--ds-accent)' : 'var(--ds-chart-bar)';
        return `<rect x="${x}" y="${y}" width="${bw}" height="${100 - y}" rx="1" fill="${fill}"/>`;
      }).join('');
    } else if (kind === 'funnel') {
      const st = series.stages, n = st.length, step = 100 / n, bw = step * 0.46;
      body = st.map((s, i) => {
        const y = Y(s.pct), x = i * step + (step - bw) / 2;
        const fill = s.watch ? 'var(--ds-watch)' : 'var(--ds-chart-bar)';
        return `<rect x="${x}" y="${y}" width="${bw}" height="${100 - y}" rx="1" fill="${fill}"/>`;
      }).join('');
    } else { // lines
      const pts = (arr) => arr.map((v, i) => `${(i / (arr.length - 1)) * 100},${Y(v)}`).join(' ');
      if (b) body += `<polyline points="${pts(b)}" fill="none" stroke="var(--ds-cyan)" stroke-width="1.7" opacity=".85" vector-effect="non-scaling-stroke"/>`;
      body += `<polyline points="${pts(a)}" fill="none" stroke="var(--ds-accent)" stroke-width="2.1" vector-effect="non-scaling-stroke"/>`;
    }

    const labels = series.labels || (series.stages ? series.stages.map((s) => s.label) : null);
    const attrs = `data-min="${min}" data-max="${max}" data-a='${JSON.stringify(a)}'`
      + (b ? ` data-b='${JSON.stringify(b)}'` : '')
      + (labels ? ` data-labels='${JSON.stringify(labels)}'` : '')
      + (opts.unit ? ` data-unit="${opts.unit}"` : '');
    return `<div class="hub-chart" ${attrs} style="position:relative;height:${H}px">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" style="width:100%;height:100%;display:block">${benchLine}${body}</svg>
        <span class="hub-guide"></span><span class="hub-dot hub-dot-a"></span>${b ? '<span class="hub-dot hub-dot-b"></span>' : ''}
      </div>`;
  }

  const bars = (d) => chartWrap('bars', { a: d.bars, labels: d.labels }, { highlightFrom: d.highlightFrom, height: d.h, bench: d.bench, unit: d.unit });
  const lines = (d) => chartWrap('lines', { a: d.primary, b: d.secondary, labels: d.labels }, { height: d.h, bench: d.bench, unit: d.unit });
  const funnel = (d) => chartWrap('funnel', { stages: d.stages }, { height: d.h || 104, bench: d.threshold });

  function ring(g) {
    const stroke = g.tone === 'accent' ? 'var(--ds-accent)' : 'var(--ds-cyan)';
    return `<div style="display:flex;align-items:center;gap:10px">
              <svg width="44" height="44" viewBox="0 0 42 42">
                <circle cx="21" cy="21" r="16" fill="none" stroke="var(--ds-chart-bar)" stroke-width="4"/>
                <circle cx="21" cy="21" r="16" fill="none" stroke="${stroke}" stroke-width="4"
                        stroke-dasharray="${g.pct} ${100 - g.pct}" stroke-dashoffset="25" transform="rotate(-90 21 21)"/>
              </svg>
              <div style="line-height:1.3">
                <div style="font-size:10px;color:var(--ds-ink-5)">${g.label}</div>
                <div class="ds-num" style="font-size:16px;font-weight:600">${g.value}</div>
              </div>
            </div>`;
  }
  const gauges = (d) => `<div style="display:flex;gap:22px;flex-wrap:wrap">${d.gauges.map(ring).join('')}</div>`;

  function peers(d) {
    const avg = mean(d.peers.map((p) => p.pct)), sc = 2.4;
    return `<div style="display:flex;flex-direction:column;gap:10px;margin-top:2px">` + d.peers.map((p) =>
      `<div class="hub-peerrow" data-name="${p.name}" data-pct="${p.pct}" style="display:flex;align-items:center;gap:10px;cursor:default">
         <span style="font-size:11px;color:var(--ds-ink-4);width:54px">${p.name}</span>
         <span style="position:relative;flex:1;height:9px;border-radius:5px;background:var(--ds-chart-bar)">
           <span style="position:absolute;inset:0;border-radius:5px;overflow:hidden"><span style="display:block;height:100%;width:${Math.min(100, p.pct * sc)}%;border-radius:5px;background:${p.self ? 'var(--ds-accent)' : 'var(--ds-peer)'}"></span></span>
           <span style="position:absolute;top:-2px;bottom:-2px;left:${Math.min(100, avg * sc)}%;border-left:1.5px dashed var(--dh-bench)"></span>
         </span>
         <span class="ds-num" style="font-size:11px;color:var(--ds-ink-4);width:30px;text-align:right">${p.pct}%</span>
       </div>`).join('') + `</div>`;
  }

  function kpis(d) {
    return `<div style="display:flex;gap:26px;flex-wrap:wrap">` + d.items.map((k) =>
      `<div>
         <div style="font-size:10.5px;color:var(--ds-ink-5)">${k.label}</div>
         <div style="display:flex;align-items:baseline;gap:7px;margin-top:5px">
           <span class="ds-num" style="font-size:30px;font-weight:300">${k.value}</span>
           ${k.delta ? `<span style="font-size:11.5px;color:var(--ds-positive)">${k.delta}</span>` : ''}
         </div>
       </div>`).join('') + `</div>`;
  }

  function list(d) {
    return `<div style="display:flex;flex-direction:column">` + d.rows.map((r, i) =>
      `<div class="hub-listrow" style="display:flex;align-items:center;justify-content:space-between;padding:8px 6px;margin:0 -6px;border-radius:8px;${i ? 'border-top:1px solid var(--ds-hairline)' : ''}">
         <span style="font-size:12px;color:var(--ds-ink-2)">${r.a}</span>
         <span class="ds-num" style="font-size:12px;color:var(--ds-ink-4)">${r.b}</span>
       </div>`).join('') + `</div>`;
  }

  function stat(w) {
    const bench = w.bench
      ? `<div style="display:inline-flex;align-items:center;margin-top:14px;padding:5px 12px;border-radius:20px;background:${statusSoft(w.status)};font-size:11px;font-weight:600;color:${statusColor(w.status)}">${w.bench}</div>`
      : '';
    const second = w.value2
      ? `<div style="margin-top:9px;font-size:12.5px;color:var(--ds-ink-4)"><span class="ds-num" style="font-weight:600;color:var(--ds-ink-2)">${w.value2}</span> ${w.label2 || ''}</div>`
      : '';
    const mini = w.mini && renderers[w.mini.kind] ? `<div style="margin-top:16px">${renderers[w.mini.kind](w.mini)}</div>` : '';
    return `<div style="display:flex;align-items:baseline"><span class="ds-num" style="font-size:38px;font-weight:300;color:var(--ds-ink-1);line-height:1">${w.value}</span></div>
            <div style="font-size:11.5px;color:var(--ds-ink-5);margin-top:6px">${w.label || ''}</div>
            ${second}${bench}${mini}`;
  }

  const renderers = { bars, funnel, lines, gauges, peers, kpis, list, stat };

  // A widget = white card with a dark circular icon badge, titles, expand ↗.
  function widget(w) {
    const body = (renderers[w.kind] || (() => ''))(w);
    const dot = w.status
      ? `<span style="display:inline-block;width:7px;height:7px;border-radius:50%;margin-left:7px;vertical-align:middle;background:${statusColor(w.status)}"></span>`
      : '';
    const foot = w.source ? `Source: ${w.source}` : w.footer;
    return `<div class="dh-widget">
              <div class="dh-w-head">
                <span class="dh-w-badge">${icon(ICONS[w.kind] || ICONS.stat, 15)}</span>
                <div class="dh-w-titles">
                  <div class="t">${w.title}${dot}</div>
                  ${w.subtitle ? `<div class="s">${w.subtitle}</div>` : ''}
                </div>
                <span class="dh-drill">${icon(expand, 14)}</span>
              </div>
              <div style="margin:16px 0 10px">${body}</div>
              ${foot ? `<div class="dh-w-foot">${foot}</div>` : ''}
            </div>`;
  }

  /* ---- Hover interactions (pins + tooltip) ------------------------------ */
  let tip;
  const ensureTip = () => { if (!tip) { tip = document.createElement('div'); tip.className = 'hub-tip'; document.body.appendChild(tip); } return tip; };
  function showTip(e, html) {
    const t = ensureTip(); t.innerHTML = html; t.style.display = 'block';
    let x = e.clientX + 14, y = e.clientY + 14;
    if (x + t.offsetWidth > innerWidth) x = e.clientX - t.offsetWidth - 14;
    if (y + t.offsetHeight > innerHeight) y = e.clientY - t.offsetHeight - 14;
    t.style.left = x + 'px'; t.style.top = y + 'px';
  }
  const hideTip = () => { if (tip) tip.style.display = 'none'; };

  function initInteractions(root) {
    root.querySelectorAll('.hub-chart').forEach((wrap) => {
      if (wrap._wired) return; wrap._wired = true;
      const a = JSON.parse(wrap.dataset.a), b = wrap.dataset.b ? JSON.parse(wrap.dataset.b) : null;
      const min = +wrap.dataset.min, max = +wrap.dataset.max, n = a.length;
      const labels = wrap.dataset.labels ? JSON.parse(wrap.dataset.labels) : null, unit = wrap.dataset.unit || '';
      const guide = wrap.querySelector('.hub-guide'), dA = wrap.querySelector('.hub-dot-a'), dB = wrap.querySelector('.hub-dot-b');
      const Y = (v) => (10 + (1 - (v - min) / ((max - min) || 1)) * 80) / 100;
      wrap.addEventListener('mousemove', (e) => {
        const r = wrap.getBoundingClientRect();
        let fx = (e.clientX - r.left) / r.width; fx = Math.max(0, Math.min(1, fx));
        const idx = n > 1 ? Math.round(fx * (n - 1)) : 0, x = (n > 1 ? idx / (n - 1) : 0) * r.width;
        guide.style.display = 'block'; guide.style.left = x + 'px';
        dA.style.display = 'block'; dA.style.left = x + 'px'; dA.style.top = Y(a[idx]) * r.height + 'px';
        let html = `<span class="k">${labels ? labels[idx] : ('Point ' + (idx + 1))}</span><span class="v">${fmt(a[idx])}${unit}</span>`;
        if (b && dB) { dB.style.display = 'block'; dB.style.left = x + 'px'; dB.style.top = Y(b[idx]) * r.height + 'px'; html += `<span class="v2">${fmt(b[idx])}${unit}</span>`; }
        showTip(e, html);
      });
      wrap.addEventListener('mouseleave', () => { guide.style.display = 'none'; dA.style.display = 'none'; if (dB) dB.style.display = 'none'; hideTip(); });
    });
    root.querySelectorAll('.hub-peerrow').forEach((row) => {
      if (row._wired) return; row._wired = true;
      row.addEventListener('mousemove', (e) => showTip(e, `<span class="k">${row.dataset.name}</span><span class="v">${row.dataset.pct}%</span>`));
      row.addEventListener('mouseleave', hideTip);
    });
  }

  return { widget, initInteractions };
})();
