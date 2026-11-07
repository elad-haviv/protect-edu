/* Global namespace and small helpers. Every script registers on window.PE; no ES modules (works from file://). */
(function () {
  "use strict";
  const PE = window.PE = window.PE || {};
  PE.version = "2.1.0";
  PE.sims = PE.sims || {};
  PE.scenes = PE.scenes || {};
  PE.figures = PE.figures || {};
  PE.content = PE.content || {};
  PE.esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  PE.el = (tag, attrs, html) => {
    const e = document.createElement(tag);
    if (attrs) for (const k in attrs) { if (attrs[k] != null && attrs[k] !== false) e.setAttribute(k, attrs[k] === true ? "" : attrs[k]); }
    if (html != null) e.innerHTML = html;
    return e;
  };
  PE.clamp = (x, a, b) => Math.max(a, Math.min(b, x));
  // Number formatting: 3 significant digits, no trailing zeros
  PE.fmt = (x, sig = 3) => {
    if (x == null || Number.isNaN(x)) return "–";
    if (!Number.isFinite(x)) return "∞";
    if (x === 0) return "0";
    const a = Math.abs(x);
    if (a >= 1000) return Math.round(x).toLocaleString("en-US");
    const d = Math.max(0, sig - 1 - Math.floor(Math.log10(a)));
    return String(+x.toFixed(Math.min(d, 4)));
  };
  // Value with unit, isolated as LTR inside RTL text
  PE.u = (x, unit) => `<bdi dir="ltr" class="m">${PE.fmt(x)}${unit ? " " + unit : ""}</bdi>`;
  // Content markup: {{…}} → LTR isolate
  PE.rich = s => String(s == null ? "" : s).replace(/\{\{([\s\S]+?)\}\}/g, '<bdi dir="ltr" class="m">$1</bdi>');
  PE.reducedMotion = () => window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  PE.hooks = { lang: [], theme: [], lesson: [] };
  PE.on = (ev, fn) => PE.hooks[ev].push(fn);
  PE.emit = (ev, arg) => PE.hooks[ev].forEach(fn => { try { fn(arg); } catch (e) { console.error(e); } });
})();
