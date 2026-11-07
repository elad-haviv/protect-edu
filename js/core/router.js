/* Hash routing: #<code>[?key=value&…]. Example: #C2?pen=broken&lang=en&present=1 */
(function () {
  "use strict";
  PE.parseHash = (hash) => {
    const h = (hash || "").replace(/^#/, "");
    const [code, q] = h.split("?");
    const params = {};
    if (q) q.split("&").forEach(kv => { const [k, v] = kv.split("="); if (k) params[decodeURIComponent(k)] = v == null ? "1" : decodeURIComponent(v); });
    return { code: PE.legacyCode((code || "").toUpperCase()), params };
  };
  // v2 used letter modules (A–M, no I); v3 numbers them 0–11 and lessons m.n
  const LEGACY = { A: 0, B: 1, C: 2, D: 3, E: 4, F: 5, G: 6, H: 7, J: 8, K: 9, L: 10, M: 11 };
  PE.legacyCode = c => { const m = /^([A-HJ-M])(\d*)$/.exec(c); return m ? LEGACY[m[1]] + "." + (m[2] || "1") : c; };
  PE.buildHash = (code, params) => {
    const q = Object.keys(params || {}).filter(k => params[k] != null && params[k] !== "").map(k => encodeURIComponent(k) + "=" + encodeURIComponent(params[k])).join("&");
    return "#" + code + (q ? "?" + q : "");
  };
  PE.replaceHash = (code, params) => {
    try { history.replaceState(null, "", PE.buildHash(code, params)); } catch (e) { /* sandboxed */ }
  };
})();
