/* Shared pieces for simulators: supply drawing, trip/verdict text, standard enums. */
(function () {
  "use strict";
  const S = PE.sym;
  const C = PE.simc = {};
  C.SKIN = { key: "skin", type: "enum", def: "dry", label: { he: "מצב העור", en: "Skin condition" }, values: [
    { v: "dry", label: { he: "יבש", en: "Dry" } }, { v: "wet", label: { he: "רטוב", en: "Wet" } }] };
  C.MCB = (def = "C16", list = ["B16", "C16", "C32", "D16"]) => ({ key: "mcb", type: "enum", def, label: { he: "מפסק זרם-יתר (מאמ\"ת)", en: "Circuit breaker (MCB)" }, values: list.map(v => ({ v, label: v })) });
  C.RCD = (def = 0) => ({ key: "rcd", type: "enum", def, label: { he: "מפסק פחת", en: "RCD" }, values: [
    { v: 0, label: { he: "ללא", en: "None" } }, { v: 30, label: "30 mA" }, { v: 300, label: "300 mA" }] });

  // Supply transformer secondary with earthed star point (Rb). Returns anchor points.
  C.supply = (g, x, yL, yN, opts = {}) => {
    S.transformer(g, x, (yL + yN) / 2, { r: 24 });
    S.text(g, x, yL - 34, PE.L({ he: "שנאי חלוקה", en: "Supply transformer" }), "lbl-s");
    S.wire(g, [[x + 38, (yL + yN) / 2 - 8], [x + 52, yL], [x + 70, yL]], "L");
    S.wire(g, [[x + 38, (yL + yN) / 2 + 8], [x + 52, yN], [x + 70, yN]], opts.pen ? "PEN" : "N");
    if (opts.earthY) {
      S.wire(g, [[x + 52, yN], [x + 52, opts.earthY]], opts.pen ? "PEN" : "N", "w-thin");
      S.dot(g, x + 52, yN);
      S.resistor(g, x + 52, opts.earthY, { vertical: true, len: 34, label: "Rb" });
      S.wire(g, [[x + 52, opts.earthY + 34], [x + 52, opts.earthY + 44]], "gen", "w-thin");
      S.earth(g, x + 52, opts.earthY + 44);
    }
    return { L: [x + 70, yL], N: [x + 70, yN], star: [x + 52, yN] };
  };
  // Three-phase supply: Dyn11 distribution transformer, star point earthed through Rb (TN, TT) or isolated (IT).
  // Draws L1, L2, L3 and N/PEN bus conductors from the transformer to x1; returns the y of each.
  C.YS = { L1: 64, L2: 88, L3: 112, N: 136, PE: 160 };
  C.supply3 = (g, opts = {}) => {
    const ys = Object.assign({}, C.YS, opts.ys || {}), x = opts.x || 34, x1 = opts.x1 || 170, sys = opts.sys || "TN";
    const cy = (ys.L1 + ys.N) / 2;
    g.append("circle").attr("class", "sym").attr("cx", x + 18).attr("cy", cy).attr("r", 22);
    g.append("circle").attr("class", "sym").attr("cx", x + 44).attr("cy", cy).attr("r", 22);
    S.text(g, x + 13, cy + 5, "△", "lbl-s").style("font-size", "13px");
    S.text(g, x + 50, cy + 5, "Y", "lbl-s").style("font-size", "13px");
    S.text(g, x + 31, ys.L1 - 26, opts.label || "Dyn11", "lbl-s");
    const xo = x + 66, xs = xo + 26;
    ["L1", "L2", "L3"].forEach((k, i) => { S.wire(g, [[xo, cy - 8 + i * 8], [xs, ys[k]], [x1, ys[k]]], k); });
    const star = [xs - 10, ys.N];
    if (sys !== "IT") {
      S.wire(g, [[xo, cy + 14], [star[0], ys.N], [x1, ys.N]], sys === "TN" ? "PEN" : "N");
      S.dot(g, star[0], ys.N);
      if (opts.earthY) {
        S.wire(g, [[star[0], ys.N], [star[0], opts.earthY]], sys === "TN" ? "PEN" : "N", "w-thin");
        S.resistor(g, star[0], opts.earthY, { vertical: true, len: 34, label: "Rb" });
        S.wire(g, [[star[0], opts.earthY + 34], [star[0], opts.earthY + 44]], "gen", "w-thin");
        S.earth(g, star[0], opts.earthY + 44);
      }
    } else S.text(g, star[0] + 4, ys.N + 18, PE.L({ he: "נקודת כוכב מבודדת", en: "star point isolated" }), "lbl-s", "start").style("font-size", "13px");
    const tagX = opts.tagX || xs + 22;
    ["L1", "L2", "L3"].forEach(k => S.wireTag(g, tagX, ys[k], k));
    if (sys !== "IT") S.wireTag(g, tagX, ys.N, sys === "TN" ? "PEN" : "N");
    return { ys, star, x1 };
  };
  C.YS_TOP = { L1: 30, L2: 46, L3: 62, N: 78, PE: 94 };
  // Compact three-phase board at the top of a diagram; a single-phase circuit leaves it from L1 and N at x = xt
  C.board1ph = (g, opts = {}) => {
    const sup = C.supply3(g, Object.assign({ ys: C.YS_TOP, x1: opts.x1 || 230, label: " ", tagX: 150 }, opts));
    const xt = opts.xt || 196;
    S.dot(g, xt, sup.ys.L1); S.dot(g, xt + 16, sup.ys.N);
    return { ys: sup.ys, star: sup.star, L: [xt, sup.ys.L1], N: [xt + 16, sup.ys.N] };
  };
  // A single-phase circuit tapped from a three-phase bus: L (from phase k) and N
  C.tap = (g, x, ys, phase, yTo, withPE) => {
    S.dot(g, x, ys[phase]); S.wire(g, [[x, ys[phase]], [x, yTo]], phase, "w-thin");
    S.dot(g, x + 16, ys.N); S.wire(g, [[x + 16, ys.N], [x + 16, yTo]], "N", "w-thin");
    if (withPE) { S.dot(g, x + 32, ys.PE); S.wire(g, [[x + 32, ys.PE], [x + 32, yTo]], "PE", "w-thin"); }
  };

  // Fault "bolt" between two points
  C.bolt = (g, x, y, s = 1) => g.append("path").attr("class", "res").attr("transform", `translate(${x},${y}) scale(${s})`)
    .attr("d", "M0 -22 L-9 2 L-1 2 L-7 22 L10 -4 L2 -4 L8 -22 Z").attr("fill", "var(--bolt)").attr("stroke", "#000").attr("stroke-width", 1.5);

  C.tripText = trip => {
    if (!trip) return { he: "אף מפסק לא ניתק", en: "No device disconnected" };
    const by = trip.by === "rcd" ? { he: "מפסק הפחת", en: "the RCD" } : { he: "המאמ\"ת", en: "the MCB" };
    if (trip.status === "slow") return { he: "המאמ\"ת ינתק רק תרמית – אחרי שניות עד דקות", en: "the MCB only trips thermally – after seconds to minutes" };
    return { he: `${by.he} ניתק תוך {{${trip.t_ms} ms}} לכל היותר`, en: `${by.en} disconnected within {{${trip.t_ms} ms}}` };
  };
  C.bodyLine = b => ({ he: `זרם בגוף {{${PE.fmt(b.I_mA)} mA}} למשך ${b.t_ms >= 5000 ? "זמן ממושך" : `{{${b.t_ms} ms}}`} – ${PE.ui[PE.kit.zoneKey(b.zone)].he}`,
    en: `Body current {{${PE.fmt(b.I_mA)} mA}} for ${b.t_ms >= 5000 ? "a long time" : `{{${b.t_ms} ms}}`} – ${PE.ui[PE.kit.zoneKey(b.zone)].en}` });
  C.lvl = z => PE.model.ZONE_LEVEL[z] || 0;
})();
