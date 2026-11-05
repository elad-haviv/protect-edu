/* Hash routing: #<code>[?key=value&…]. Example: #C2?pen=broken&lang=en&present=1 */
(function () {
  "use strict";
  PE.parseHash = (hash) => {
    const h = (hash || "").replace(/^#/, "");
    const [code, q] = h.split("?");
    const params = {};
    if (q) q.split("&").forEach(kv => { const [k, v] = kv.split("="); if (k) params[decodeURIComponent(k)] = v == null ? "1" : decodeURIComponent(v); });
    return { code: (code || "").toUpperCase(), params };
  };
  PE.buildHash = (code, params) => {
    const q = Object.keys(params || {}).filter(k => params[k] != null && params[k] !== "").map(k => encodeURIComponent(k) + "=" + encodeURIComponent(params[k])).join("&");
    return "#" + code + (q ? "?" + q : "");
  };
  PE.replaceHash = (code, params) => {
    try { history.replaceState(null, "", PE.buildHash(code, params)); } catch (e) { /* sandboxed */ }
  };
})();
