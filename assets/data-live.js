/* =========================================================================
   FSG MARKETING DATA HUB — LIVE DATA ADAPTER
   Fetches the DataHub feeds (assets/data/*.json, produced by hub-ingest) and
   exposes them + small helpers. Defensive: any feed that 404s or fails resolves
   to null, and app.js falls back to the dummy data.js values for that widget.
   ========================================================================= */
window.HUB_LIVE = (function () {
  const V = '?v=' + Date.now();                        // cache-bust while iterating
  const load = (f) =>
    fetch('assets/data/' + f + '.json' + V)
      .then((r) => (r.ok ? r.json() : null))
      .catch(() => null);

  // compact magnitudes, FSG house style: 486.5k · 1.6m
  const fmt = (n) => {
    n = +n || 0;
    if (n >= 1e6) return (n / 1e6).toFixed(1) + 'm';
    if (n >= 1e3) return (n / 1e3).toFixed(1) + 'k';
    return String(Math.round(n));
  };
  const pct = (x) => Math.round((+x || 0) * 100);
  const sum = (arr, k) => (arr || []).reduce((a, x) => a + (+x[k] || 0), 0);

  const ready = Promise.all(
    ['website', 'linkedin', 'competitor-ads', 'alphix', 'hubspot'].map(load)
  ).then(([website, linkedin, competitor, alphix, hubspot]) => ({
    website, linkedin, competitor, alphix, hubspot,
  }));

  return { ready, fmt, pct, sum };
})();
