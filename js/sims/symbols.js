/* Drawing kit for diagrams: IEC 60617 graphical symbols, IEC 60445 conductor colours, flow animation, people.
   All functions take a d3 selection and draw in SVG user units (diagrams are always LTR). */
(function () {
  "use strict";
  const S = PE.sym = {};
  const line = d3.line();

  S.defs = svg => {
    if (!svg.select("defs").empty()) return;
    const d = svg.append("defs");
    // PE / PEN green-yellow stripes (IEC 60445)
    const p = d.append("pattern").attr("id", "pe-stripe").attr("patternUnits", "userSpaceOnUse").attr("width", 14).attr("height", 14).attr("patternTransform", "rotate(45)");
    p.append("rect").attr("width", 14).attr("height", 14).attr("fill", "var(--c-PE-g)");
    p.append("rect").attr("width", 7).attr("height", 14).attr("fill", "var(--c-PE-y)");
    d.append("marker").attr("id", "arr").attr("viewBox", "0 0 10 10").attr("refX", 8).attr("refY", 5).attr("markerWidth", 7).attr("markerHeight", 7).attr("orient", "auto-start-reverse")
      .append("path").attr("d", "M0 0 L10 5 L0 10 z").attr("fill", "var(--flow)");
    const hatch = d.append("pattern").attr("id", "hatch").attr("patternUnits", "userSpaceOnUse").attr("width", 10).attr("height", 10).attr("patternTransform", "rotate(45)");
    hatch.append("line").attr("x1", 0).attr("y1", 0).attr("x2", 0).attr("y2", 10).attr("stroke", "var(--bad)").attr("stroke-width", 3).attr("opacity", .5);
  };

  // ---- conductors ----
  S.wire = (g, pts, kind = "gen", extra = "") => g.append("path").attr("class", `w w-${kind} ${extra}`).attr("d", line(pts));
  S.wireTag = (g, x, y, kind) => {
    const col = { L: "var(--c-L)", N: "var(--c-N)", PE: "var(--c-PE-g)", PEN: "var(--c-PE-g)", L1: "var(--c-L)", L2: "var(--c-L2)", L3: "var(--c-L3)" }[kind] || "var(--stage-line)";
    const t = g.append("g").attr("transform", `translate(${x},${y})`);
    t.append("rect").attr("x", -17).attr("y", -11).attr("width", 34).attr("height", 22).attr("rx", 5).attr("fill", "var(--stage)").attr("stroke", col).attr("stroke-width", 2);
    t.append("text").attr("text-anchor", "middle").attr("y", 5).attr("class", "sym-txt").style("font-size", "13px").style("fill", col).text(kind);
    return t;
  };
  // Animated current: speed and width scale with a clamped log of current (0.1 mA … 1 kA)
  S.flow = (g, pts, I_A, opts = {}) => {
    if (!(I_A > 0)) return null;
    const lv = PE.clamp((Math.log10(I_A * 1000) + 1) / 7, 0, 1);       // 0.1 mA → 0, 1 kA → 1
    return g.append("path").attr("class", "flow res" + (opts.body ? " body" : ""))
      .attr("d", line(pts)).style("--flow-dur", (1.4 - lv * 1.05).toFixed(2) + "s")
      .style("stroke-width", opts.body ? 4 : 2 + lv * 4)
      .attr("marker-end", PE.reducedMotion() ? "url(#arr)" : null);
  };
  S.dot = (g, x, y) => g.append("circle").attr("cx", x).attr("cy", y).attr("r", 4.5).attr("fill", "var(--stage-line)");
  // Hebrew text inside the (always-LTR) diagram: render RTL but keep the geometric anchor
  const HEB = /[\u0590-\u05FF]/;
  S.rtlAttrs = (sel, s, anchor) => {
    if (HEB.test(String(s))) { sel.attr("direction", "rtl").style("unicode-bidi", "embed"); if (anchor !== "middle") sel.attr("text-anchor", anchor === "start" ? "end" : "start"); }
    return sel;
  };
  S.text = (g, x, y, s, cls = "lbl", anchor = "middle") => S.rtlAttrs(g.append("text").attr("x", x).attr("y", y).attr("text-anchor", anchor).attr("class", cls).text(s), s, anchor);

  // ---- IEC 60617 02-15-01 earth; 02-15-03 protective earth ----
  S.earth = (g, x, y, opts = {}) => {
    const e = g.append("g").attr("class", "sym-earth");
    e.append("path").attr("class", "sym").attr("d", `M${x} ${y} v14 M${x - 14} ${y + 14} h28 M${x - 9} ${y + 20} h18 M${x - 4} ${y + 26} h8`);
    if (opts.pe) e.append("circle").attr("class", "sym").attr("cx", x).attr("cy", y + 18).attr("r", 18);
    return e;
  };
  // ---- 04-01-02 resistor ----
  S.resistor = (g, x, y, opts = {}) => {
    const len = opts.len || 44, w = opts.w || 16;
    const r = opts.vertical ? g.append("rect").attr("x", x - w / 2).attr("y", y).attr("width", w).attr("height", len)
      : g.append("rect").attr("x", x).attr("y", y - w / 2).attr("width", len).attr("height", w);
    r.attr("class", "sym-fill");
    if (opts.label) S.text(g, opts.vertical ? x + w / 2 + 6 : x + len / 2, opts.vertical ? y + len / 2 + 5 : y - w / 2 - 6, opts.label, "lbl", opts.vertical ? "start" : "middle");
    return r;
  };
  // ---- 07-13-05 circuit breaker (horizontal, wire enters at x, leaves at x+60) ----
  S.mcb = (g, x, y, opts = {}) => {
    if (S.locked) opts = Object.assign({}, opts, { open: false, flash: false });
    const b = g.append("g").attr("class", "sym-mcb" + (opts.flash ? " tripflash" : ""));
    b.append("path").attr("class", "sym").attr("d", `M${x} ${y} h12 M${x + 46} ${y} h14`);
    const ang = opts.open ? -32 : 0;
    b.append("path").attr("class", "sym").attr("d", `M${x + 12} ${y} l34 0`).attr("transform", `rotate(${ang} ${x + 12} ${y})`);
    b.append("path").attr("class", "sym").attr("d", `M${x + 42} ${y - 5} l8 8 M${x + 50} ${y - 5} l-8 8`); // × on the fixed contact
    b.append("circle").attr("cx", x + 12).attr("cy", y).attr("r", 3).attr("fill", "var(--stage-line)");
    if (opts.label) S.text(b, x + 30, y + 26, opts.label, "lbl-s");
    return b;
  };
  // ---- RCD (two-pole): switch + residual-current sensor (toroid) + mechanical link ----
  S.rcd = (g, x, yL, yN, opts = {}) => {
    if (S.locked) opts = Object.assign({}, opts, { open: false, flash: false });
    const b = g.append("g").attr("class", "sym-rcd" + (opts.flash ? " tripflash" : ""));
    const ang = opts.open ? -30 : 0;
    [yL, yN].forEach(y => {
      b.append("path").attr("class", "sym").attr("d", `M${x} ${y} h56 M${x + 90} ${y} h20`);
      b.append("path").attr("class", "sym").attr("d", `M${x + 56} ${y} l34 0`).attr("transform", `rotate(${ang} ${x + 56} ${y})`);
      b.append("circle").attr("cx", x + 56).attr("cy", y).attr("r", 3).attr("fill", "var(--stage-line)");
    });
    // toroid around both conductors
    b.append("ellipse").attr("class", "sym").attr("cx", x + 24).attr("cy", (yL + yN) / 2).attr("rx", 9).attr("ry", (yN - yL) / 2 + 12);
    // relay & link (dashed = mechanical coupling)
    b.append("path").attr("class", "sym").attr("d", `M${x + 33} ${(yL + yN) / 2} h22`);
    b.append("rect").attr("class", "sym-fill").attr("x", x + 55).attr("y", (yL + yN) / 2 - 8).attr("width", 16).attr("height", 16);
    b.append("path").attr("class", "sym").attr("stroke-dasharray", "4 4").attr("d", `M${x + 73} ${yL - 18} V${yN + 18}`);
    if (opts.label) S.text(b, x + 56, yN + 40, opts.label, "lbl-s");
    return b;
  };
  // ---- 06-09-01 transformer (two windings, single-line form) ----
  S.transformer = (g, cx, cy, opts = {}) => {
    const r = opts.r || 24, t = g.append("g");
    t.append("circle").attr("class", "sym").attr("cx", cx - r * 0.55).attr("cy", cy).attr("r", r);
    t.append("circle").attr("class", "sym").attr("cx", cx + r * 0.55).attr("cy", cy).attr("r", r);
    if (opts.safety) {                      // IEC 60417-5222 safety isolating transformer: earth-free marking
      t.append("path").attr("class", "sym").attr("d", `M${cx} ${cy - r - 6} v${2 * r + 12}`).attr("stroke-dasharray", "3 3");
    }
    if (opts.label) S.text(t, cx, cy + r + 22, opts.label, "lbl-s");
    return t;
  };
  // ---- AC source ----
  S.source = (g, cx, cy, opts = {}) => {
    const s = g.append("g");
    s.append("circle").attr("class", "sym-fill").attr("cx", cx).attr("cy", cy).attr("r", 26);
    s.append("path").attr("class", "sym").attr("d", `M${cx - 14} ${cy} c5 -14 9 -14 14 0 s9 14 14 0`);
    if (opts.label) S.text(s, cx, cy + 46, opts.label, "lbl-s");
    return s;
  };
  // ---- 08-10-01 lamp; 07-21-01 fuse ----
  S.lamp = (g, cx, cy, r = 16) => { const l = g.append("g"); l.append("circle").attr("class", "sym-fill").attr("cx", cx).attr("cy", cy).attr("r", r); l.append("path").attr("class", "sym").attr("d", `M${cx - r * .7} ${cy - r * .7} L${cx + r * .7} ${cy + r * .7} M${cx + r * .7} ${cy - r * .7} L${cx - r * .7} ${cy + r * .7}`); return l; };
  S.fuse = (g, x, y) => { const f = g.append("g"); f.append("rect").attr("class", "sym-fill").attr("x", x).attr("y", y - 8).attr("width", 40).attr("height", 16); f.append("path").attr("class", "sym").attr("d", `M${x} ${y} h40`); return f; };
  // ---- IEC 60417-5172 class II; IEC 60417-5180 class III ----
  S.classII = (g, x, y, s = 30) => { const c = g.append("g"); c.append("rect").attr("class", "sym").attr("x", x).attr("y", y).attr("width", s).attr("height", s); c.append("rect").attr("class", "sym").attr("x", x + s * .27).attr("y", y + s * .27).attr("width", s * .46).attr("height", s * .46); return c; };
  S.classIII = (g, x, y, s = 34) => { const c = g.append("g"); c.append("path").attr("class", "sym").attr("d", `M${x + s / 2} ${y} L${x + s} ${y + s / 2} L${x + s / 2} ${y + s} L${x} ${y + s / 2} Z`); S.text(c, x + s / 2, y + s / 2 + 5, "III", "sym-txt").style("font-size", "12px"); return c; };

  // ---- appliance case ----
  S.appliance = (g, x, y, w, h, opts = {}) => {
    const a = g.append("g");
    if (S.locked) opts = Object.assign({}, opts, { live: false, warm: false });
    a.append("rect").attr("class", "case" + (opts.live ? " live" : opts.warm ? " warm" : "")).attr("x", x).attr("y", y).attr("width", w).attr("height", h).attr("rx", 10);
    if (opts.live) a.append("rect").attr("x", x).attr("y", y).attr("width", w).attr("height", h).attr("rx", 10).attr("fill", "url(#hatch)").attr("class", "res");
    if (opts.label) S.text(a, x + w / 2, y + h - 12, opts.label, "lbl");
    return a;
  };
  // ---- floor / soil ----
  S.ground = (g, x1, x2, y, opts = {}) => {
    const s = g.append("g");
    s.append("rect").attr("class", "soil").attr("x", x1).attr("y", y).attr("width", x2 - x1).attr("height", opts.h || 60);
    s.append("path").attr("class", "sym").attr("d", `M${x1} ${y} H${x2}`);
    for (let x = x1 + 6; x < x2; x += 18) s.append("path").attr("class", "soil-line").attr("d", `M${x} ${y + 4} l-10 12`);
    return s;
  };
  // ---- badge (state label with text, never colour alone) ----
  S.badge = (g, x, y, s, tone = "info", cls = "") => {
    const col = { ok: "var(--ok)", warn: "var(--warn)", danger: "var(--bad)", info: "var(--stage-line)" }[tone];
    const b = g.append("g").attr("class", "badge " + cls).attr("transform", `translate(${x},${y})`);
    const t = S.rtlAttrs(b.append("text").attr("text-anchor", "middle").attr("y", 5).attr("class", "sym-txt").style("fill", col).text(s), s, "middle");
    const w = Math.max(40, s.length * 8.6 + 18);
    b.insert("rect", "text").attr("x", -w / 2).attr("y", -14).attr("width", w).attr("height", 28).attr("rx", 7).attr("fill", "var(--stage)").attr("stroke", col).attr("stroke-width", 2);
    return b;
  };
  // ---- person (feet at x,y). state 0..3 = AC-1..AC-4. Returns anchor points. ----
  const ZCOL = ["var(--zone-1)", "var(--zone-2)", "var(--zone-3)", "var(--zone-4)"];
  S.person = (g, x, y, opts = {}) => {
    const s = opts.s || 1, st = opts.state || 0, neutral = opts.neutral || S.locked, col = neutral ? "var(--stage-soft)" : ZCOL[st];
    const p = g.append("g").attr("class", "person");
    const hip = [x, y - 62 * s], sh = [x, y - 118 * s], head = [x, y - 140 * s];
    const limb = (a, b, w = 11) => p.append("path").attr("d", line([a, b])).attr("stroke", col).attr("stroke-width", w * s).attr("stroke-linecap", "round").attr("fill", "none");
    limb(hip, [x - 14 * s, y - 2]); limb(hip, [x + 14 * s, y - 2]);
    p.append("path").attr("d", line([sh, hip])).attr("stroke", col).attr("stroke-width", 22 * s).attr("stroke-linecap", "round");
    const h1 = opts.hand || [x + 30 * s, y - 70 * s];
    const h2 = opts.hand2 || [x - 26 * s, y - 72 * s];
    limb([x + 4 * s, y - 112 * s], h1, 9); limb([x - 4 * s, y - 112 * s], h2, 9);
    p.append("circle").attr("cx", head[0]).attr("cy", head[1]).attr("r", 16 * s).attr("fill", col);
    if (opts.badge !== false && !neutral) {
      const ic = ["✓", "!", "!!", "⚡"][st];
      const b = p.append("g").attr("class", "res").attr("transform", `translate(${x + 26 * s},${head[1] - 18 * s})`);
      b.append("circle").attr("r", 13).attr("fill", col);
      b.append("text").attr("text-anchor", "middle").attr("y", 5).style("fill", "#fff").style("font-weight", 900).style("font-size", "14px").text(ic);
    }
    return { hand: h1, hand2: h2, feet: [x, y], chest: [x, y - 100 * s], head };
  };
  S.zoneLevel = z => PE.model.ZONE_LEVEL[z] || 0;
})();
