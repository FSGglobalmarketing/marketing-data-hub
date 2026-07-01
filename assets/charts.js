/* =========================================================================
   FSG DATA HUB — shared SVG chart helpers (pure, return HTML strings)
   Used by the detail pages (campaign / channel). Styling via tokens.css.
   ========================================================================= */
window.HUB_CHARTS = (function () {

  const drill = `<svg class="ds-drill" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><path d="M7 17L17 7M9 7h8v8"/></svg>`;

  function bars(data) {
    const n = data.bars.length, step = 100 / n, bw = step * 0.62, max = Math.max(...data.bars);
    const from = data.highlightFrom == null ? n : data.highlightFrom;
    const rects = data.bars.map((v, i) => {
      const h = (v / max) * 40, x = i * step + (step - bw) / 2, y = 44 - h;
      const fill = i >= from ? 'var(--ds-accent)' : 'var(--ds-chart-bar)';
      return `<rect x="${x}" y="${y}" width="${bw}" height="${h}" rx="1.3" fill="${fill}"/>`;
    }).join('');
    return `<svg viewBox="0 0 100 46" preserveAspectRatio="none" style="width:100%;height:64px">${rects}</svg>`;
  }

  function funnel(data) {
    const n = data.stages.length, step = 100 / n, bw = step * 0.5;
    const rects = data.stages.map((s, i) => {
      const h = (s.pct / 100) * 40, x = i * step + (step - bw) / 2, y = 44 - h;
      const fill = s.watch ? 'var(--ds-accent)' : 'var(--ds-chart-bar)';
      const lbl = `<text x="${x + bw / 2}" y="45.4" font-size="3.1" text-anchor="middle" fill="var(--ds-ink-6)" style="font-family:var(--ds-font-sans)">${s.label}</text>`;
      return `<rect x="${x}" y="${y}" width="${bw}" height="${h}" rx="1.3" fill="${fill}"/>${lbl}`;
    }).join('');
    const ty = 44 - (data.threshold / 100) * 40;
    const line = `<line x1="0" y1="${ty}" x2="100" y2="${ty}" stroke="var(--ds-accent)" stroke-width="0.6" stroke-dasharray="2 2" opacity=".8"/>`;
    return `<svg viewBox="0 0 100 48" preserveAspectRatio="none" style="width:100%;height:70px">${line}${rects}</svg>`;
  }

  function lines(data) {
    const all = (data.primary || []).concat(data.secondary || []);
    const max = Math.max(...all), min = Math.min(...all), rng = (max - min) || 1;
    const pts = (arr) => arr.map((v, i) => `${(i / (arr.length - 1)) * 100},${44 - ((v - min) / rng) * 36 - 4}`).join(' ');
    let svg = '';
    if (data.secondary) svg += `<polyline points="${pts(data.secondary)}" fill="none" stroke="var(--ds-cyan)" stroke-width="1.4" opacity=".8" vector-effect="non-scaling-stroke"/>`;
    svg += `<polyline points="${pts(data.primary)}" fill="none" stroke="var(--ds-accent)" stroke-width="1.7" vector-effect="non-scaling-stroke"/>`;
    return `<svg viewBox="0 0 100 46" preserveAspectRatio="none" style="width:100%;height:64px">${svg}</svg>`;
  }

  function ring(g) {
    const stroke = g.tone === 'accent' ? 'var(--ds-accent)' : 'var(--ds-cyan)';
    return `<div style="display:flex;align-items:center;gap:9px">
              <svg width="34" height="34" viewBox="0 0 42 42">
                <circle cx="21" cy="21" r="16" fill="none" stroke="rgba(255,255,255,.12)" stroke-width="4"/>
                <circle cx="21" cy="21" r="16" fill="none" stroke="${stroke}" stroke-width="4"
                        stroke-dasharray="${g.pct} ${100 - g.pct}" stroke-dashoffset="25" transform="rotate(-90 21 21)"/>
              </svg>
              <div style="line-height:1.3">
                <div style="font-size:10px;color:var(--ds-ink-5)">${g.label}</div>
                <div class="ds-num" style="font-size:16px;font-weight:600">${g.value}</div>
              </div>
            </div>`;
  }

  function gauges(data) {
    return `<div style="display:flex;gap:22px;flex-wrap:wrap">${data.gauges.map(ring).join('')}</div>`;
  }

  function peers(data) {
    return `<div style="display:flex;flex-direction:column;gap:8px;margin-top:2px">` + data.peers.map((p) =>
      `<div style="display:flex;align-items:center;gap:9px">
         <span style="font-size:11px;color:var(--ds-ink-4);width:52px">${p.name}</span>
         <span style="flex:1;height:8px;border-radius:5px;background:rgba(255,255,255,.08);overflow:hidden">
           <span style="display:block;height:100%;width:${Math.min(100, p.pct * 2.6)}%;border-radius:5px;background:${p.self ? 'var(--ds-accent)' : 'var(--ds-chart-bar)'}"></span></span>
         <span class="ds-num" style="font-size:11px;color:var(--ds-ink-4);width:30px;text-align:right">${p.pct}%</span>
       </div>`).join('') + `</div>`;
  }

  function kpis(data) {
    return `<div style="display:flex;gap:26px;flex-wrap:wrap">` + data.items.map((k) =>
      `<div>
         <div style="font-size:10.5px;color:var(--ds-ink-5)">${k.label}</div>
         <div style="display:flex;align-items:baseline;gap:7px;margin-top:4px">
           <span class="ds-num" style="font-size:24px;font-weight:300">${k.value}</span>
           ${k.delta ? `<span style="font-size:11.5px;color:var(--ds-positive)">${k.delta}</span>` : ''}
         </div>
       </div>`).join('') + `</div>`;
  }

  function list(data) {
    return `<div style="display:flex;flex-direction:column">` + data.rows.map((r, i) =>
      `<div style="display:flex;align-items:center;justify-content:space-between;padding:7px 0;${i ? 'border-top:1px solid var(--ds-hairline)' : ''}">
         <span style="font-size:12px;color:var(--ds-ink-2)">${r.a}</span>
         <span class="ds-num" style="font-size:12px;color:var(--ds-ink-4)">${r.b}</span>
       </div>`).join('') + `</div>`;
  }

  const renderers = { bars, funnel, lines, gauges, peers, kpis, list };

  // A widget = glass card with title/subtitle + drill arrow + body chart.
  function widget(w) {
    const body = (renderers[w.kind] || (() => ''))(w);
    return `<div class="ds-glass ds-card dh-widget" style="padding:15px 17px;display:flex;flex-direction:column">
              <div style="display:flex;align-items:flex-start;justify-content:space-between">
                <div>
                  <div style="font-size:var(--ds-fs-title);font-weight:600;color:var(--ds-ink-1)">${w.title}</div>
                  ${w.subtitle ? `<div style="font-size:var(--ds-fs-nano);color:var(--ds-ink-5);letter-spacing:.02em;margin-top:2px">${w.subtitle}</div>` : ''}
                </div>${drill}
              </div>
              <div style="margin:14px 0 10px">${body}</div>
              ${w.footer ? `<div class="ds-num" style="font-size:10.5px;color:var(--ds-ink-4);margin-top:auto">${w.footer}</div>` : ''}
            </div>`;
  }

  return { widget, drill };
})();
