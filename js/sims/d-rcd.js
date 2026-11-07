/* 3.2 – Four-pole RCD on a three-phase TN-C-S installation: what it sees (vector sum of L1+L2+L3+N) and what it cannot see. */
(function () {
  "use strict";
  const S = PE.sym, C = PE.simc;
  const SCN = [
    { v: "LE", label: { he: "אדם בין L1 לאדמה", en: "Person: L1 to earth" } },
    { v: "LN", label: { he: "אדם בין L1 לאפס", en: "Person: L1 to neutral" } },
    { v: "LL", label: { he: "אדם בין L1 ל-L2 (400 V)", en: "Person: L1 to L2 (400 V)" } },
    { v: "leak", label: { he: "דליפה במכשיר", en: "Leak in an appliance" } },
    { v: "overload", label: { he: "עומס יתר", en: "Overload" } },
    { v: "unbalanced", label: { he: "עומס לא מאוזן", en: "Unbalanced load" } }];
  PE.sims["d-rcd"] = {
    title: { he: "סימולטור מפסק פחת ארבע-קוטבי", en: "Four-pole RCD simulator" },
    params: [
      { key: "scn", type: "enum", def: "LE", label: { he: "תרחיש", en: "Scenario" }, values: SCN },
      { key: "idn", type: "enum", def: 30, label: { he: "רגישות $I_{\\Delta n}$", en: "Sensitivity $I_{\\Delta n}$" }, values: [10, 30, 100, 300].map(v => ({ v, label: v + " mA" })) },
      { key: "leak", type: "range", min: 0, max: 400, step: 1, def: 20, unit: "mA", label: { he: "זרם הדליפה", en: "Leakage current" }, show: s => s.scn === "leak" },
      C.SKIN
    ],
    render(svg, s, ctx) {
      const M = ctx.model;
      const r = M.rcdScenario({ scenario: s.scn, IdN_mA: s.idn, leak_mA: s.leak, skin: s.skin });
      const tripped = !!r.trip, Lk = ["L1", "L2", "L3"];
      const g = svg.append("g"); const floor = 460;
      S.ground(g, 0, 960, floor, { h: 80 });
      const sup = C.supply3(g, { sys: "TN", earthY: 300, x1: 200 }), ys = sup.ys;
      S.wire(g, [[sup.star[0], 378], [sup.star[0], floor]], "gen", "w-thin");
      S.wire(g, [[200, ys.N], [220, ys.N]], "PEN"); S.dot(g, 220, ys.N); S.wire(g, [[220, ys.N], [220, ys.PE], [930, ys.PE]], "PE");
      Lk.forEach(k => S.wire(g, [[200, ys[k]], [240, ys[k]]], k)); S.wire(g, [[220, ys.N], [240, ys.N]], "N");
      S.rcd4(g, 240, [ys.L1, ys.L2, ys.L3, ys.N], { open: tripped, flash: tripped, label: `RCD 4P ${s.idn} mA` });
      Lk.forEach(k => S.wire(g, [[350, ys[k]], [930, ys[k]]], k)); S.wire(g, [[350, ys.N], [930, ys.N]], "N");
      S.wireTag(g, 380, ys.PE, "PE");
      // loads
      if (s.scn === "unbalanced") [0, 1, 2].forEach(i => { C.tap(g, 660 + i * 95, ys, Lk[i], 220, true); S.appliance(g, 648 + i * 95, 220, 70, 80, { label: `${PE.fmt(r.I3[i])} A` }); });
      else { C.tap(g, 800, ys, "L1", 220, true); S.appliance(g, 785, 220, 110, 100, { warm: s.scn === "leak" && !tripped && s.leak > 0, label: ctx.L(s.scn === "overload" ? { he: "עומס 25 A", en: "25 A load" } : { he: "מכשיר", en: "Appliance" }) }); }
      if (s.scn === "leak" && !tripped && s.leak > 0) S.flow(g, [[832, 250], [832, ys.PE], [220, ys.PE], [220, ys.N], [sup.star[0], ys.N]], s.leak / 1000);
      // exposed conductor ends at hand height
      const tap = (x, k) => { S.dot(g, x, ys[k]); S.wire(g, [[x, ys[k]], [x, 300]], k, "w-thin"); g.append("circle").attr("cx", x).attr("cy", 300).attr("r", 6).attr("fill", "var(--c-PE-y)").attr("stroke", "#000"); };
      const mat = () => { g.append("rect").attr("x", 540).attr("y", floor - 10).attr("width", 150).attr("height", 12).attr("rx", 3).attr("fill", "#3b3b3b"); S.text(g, 615, floor + 32, ctx.L({ he: "משטח מבודד", en: "Insulating mat" }), "lbl-s"); };
      const lvl = C.lvl(r.body.zone);
      if (s.scn === "LE") {
        tap(580, "L1"); S.person(g, 630, floor, { s: 1.1, state: tripped ? Math.min(lvl, 2) : lvl, hand: [585, 302] });
        if (!tripped) S.flow(g, [[580, ys.L1], [580, 300], [630, 340], [630, floor + 30], [sup.star[0], floor + 30], [sup.star[0], 378]], r.body.I_mA / 1000, { body: true });
        S.text(g, 630, floor + 66, ctx.L({ he: "עומד על רצפה מוליכה", en: "Standing on a conductive floor" }), "lbl-s");
      }
      if (s.scn === "LN" || s.scn === "LL") {
        const k2 = s.scn === "LN" ? "N" : "L2";
        tap(570, "L1"); tap(660, k2); mat();
        S.person(g, 615, floor - 10, { s: 1.05, state: lvl, hand: [655, 302], hand2: [575, 302] });
        S.flow(g, [[570, ys.L1], [570, 300], [615, 335], [660, 300], [660, ys[k2]]], r.body.I_mA / 1000, { body: true });
      }
      if (s.scn === "overload") S.flow(g, [[sup.star[0] + 20, ys.L1], [800, ys.L1], [800, 220], [816, 220], [816, ys.N], [220, ys.N]], 25);
      // inset 1: trip characteristic
      const ix = 150, iy = 250, iw = 230, ih = 120;
      const gx = d3.scaleLog().domain([1, 2000]).range([ix, ix + iw]).clamp(true), gy = d3.scaleLog().domain([10, 1000]).range([iy + ih, iy]).clamp(true);
      g.append("rect").attr("x", ix).attr("y", iy).attr("width", iw).attr("height", ih).attr("fill", "var(--stage)").attr("stroke", "var(--stage-soft)");
      const st = [[s.idn, 1000], [s.idn, 300], [2 * s.idn, 300], [2 * s.idn, 150], [5 * s.idn, 150], [5 * s.idn, 40], [2000, 40]];
      g.append("path").attr("class", "sym").style("stroke", "var(--bad)").attr("d", d3.line()(st.map(([a, b]) => [gx(a), gy(b)])));
      S.text(g, ix + iw / 2, iy + ih + 20, ctx.L({ he: "זרם דלף, mA", en: "Residual current, mA" }), "lbl-s");
      S.text(g, ix + iw - 6, iy + 16, ctx.L({ he: "זמן ניתוק מרבי, ms", en: "max trip time, ms" }), "lbl-s", "end");
      if (r.residual_mA > 0 && !S.locked) g.append("circle").attr("class", "res").attr("cx", gx(Math.max(1, r.residual_mA))).attr("cy", tripped ? gy(r.trip.t_ms) : iy + 10).attr("r", 7).attr("fill", "var(--accent)").attr("stroke", "#fff").attr("stroke-width", 2);
      // inset 2: phasor sum of the currents through the toroid
      const px = 480, py = 330, sc = 52 / Math.max(1, ...r.I3, r.IN);
      const pg = g.append("g").attr("class", "res");
      pg.append("circle").attr("cx", px).attr("cy", py).attr("r", 64).attr("fill", "var(--stage)").attr("stroke", "var(--stage-soft)");
      const arrow = (c, col, w = 4) => { if (Math.hypot(c.re, c.im) * sc < 1) return; const x2 = px + c.re * sc, y2 = py - c.im * sc;
        pg.append("path").attr("d", `M${px} ${py} L${x2} ${y2}`).attr("stroke", col).attr("stroke-width", w).attr("stroke-linecap", "round");
        pg.append("circle").attr("cx", x2).attr("cy", y2).attr("r", 5).attr("fill", col); };
      r.Iph.forEach((c, k) => arrow(c, ["var(--c-L)", "var(--c-L2)", "var(--c-L3)"][k]));
      arrow(r.INph, "var(--c-N)");
      S.text(pg, px, py + 84, ctx.L({ he: "IL1+IL2+IL3+IN", en: "IL1+IL2+IL3+IN" }), "lbl-s").style("font-size", "13px");
      if (!S.locked) S.math(g, px, py - 80, r.residual_mA > 0 ? `\\Sigma I = ${PE.fmt(r.residual_mA)}\\,\\mathrm{mA}` : "\\Sigma I = 0", { box: true, tone: r.residual_mA >= s.idn ? "warn" : "ok", w: 160, h: 34, cls: "res" });
      if (tripped) S.badge(g, 300, 22, ctx.L({ he: "נותק!", en: "TRIPPED" }), "ok", "res");

      const person = ["LE", "LN", "LL"].includes(s.scn);
      const meters = [
        { label: { he: "IL1 / IL2 / IL3", en: "IL1 / IL2 / IL3" }, value: r.I3.map(v => PE.fmt(v)).join(" / "), unit: "A" },
        { label: { he: "זרם באפס", en: "Neutral current" }, value: r.IN, unit: "A" },
        { label: "$I_\\Delta$", value: r.residual_mA, unit: "mA", tone: r.residual_mA >= s.idn ? "warn" : "" },
        { label: { he: "זמן ניתוק", en: "Trip time" }, value: tripped ? r.trip.t_ms : "—", unit: tripped ? "ms" : "", tone: tripped ? "ok" : "" }];
      if (person) meters.push(PE.kit.bodyMeter(r.body));
      let verdict;
      if (s.scn === "LL") verdict = { tone: "danger", trip: false, zone: r.body.zone, text: { he: "האדם בין שתי פאזות – {{400 V}}. כל הזרם נכנס ב-L1 וחוזר ב-L2, דרך הטבעת; הסכום הווקטורי אפס ו<b>הפחת לא רואה כלום</b>.", en: "The person is between two phases – {{400 V}}. All the current goes in on L1 and back on L2, through the toroid; the vector sum is zero and <b>the RCD sees nothing</b>." }, sub: C.bodyLine(r.body) };
      else if (s.scn === "LN") verdict = { tone: "danger", trip: false, zone: r.body.zone, text: { he: "הזרם עובר דרך האדם מ-L1 אל האפס וחוזר במלואו – אין הפרש, ו<b>הפחת לא רואה כלום</b>.", en: "The current runs through the person from L1 to neutral and all of it returns – no difference, so <b>the RCD sees nothing</b>." }, sub: C.bodyLine(r.body) };
      else if (s.scn === "unbalanced") verdict = { tone: "safe", trip: false, text: { he: `עומס לא מאוזן: {{${PE.fmt(r.IN)} A}} זורמים באפס – אבל גם האפס עובר בטבעת, והסכום הווקטורי של ארבעת המוליכים אפס. אין ניתוק, ובצדק.`, en: `Unbalanced load: {{${PE.fmt(r.IN)} A}} flows in the neutral – but the neutral also passes through the toroid, and the vector sum of all four conductors is zero. No trip, correctly.` } };
      else if (s.scn === "overload") verdict = { tone: "warn", trip: false, text: { he: "{{25 A}} נכנסים ו-{{25 A}} חוזרים: אין הפרש. הגנה מעומס יתר וקצר היא תפקיד המאמ\"ת, לא הפחת.", en: "{{25 A}} goes out and {{25 A}} comes back: no difference. Overload and short-circuit protection is the MCB's job, not the RCD's." } };
      else if (tripped) verdict = { tone: "safe", trip: true, zone: person ? r.body.zone : null, text: { he: `הפרש של {{${PE.fmt(r.residual_mA)} mA}} ≥ $I_{\\Delta n}$ = {{${s.idn} mA}} – הפחת מנתק את ארבעת הקטבים תוך {{${r.trip.t_ms} ms}} לכל היותר.`, en: `A difference of {{${PE.fmt(r.residual_mA)} mA}} ≥ $I_{\\Delta n}$ = {{${s.idn} mA}} – the RCD opens all four poles within {{${r.trip.t_ms} ms}}.` }, sub: person ? C.bodyLine(r.body) : null };
      else if (r.rcd.status === "maybe") verdict = { tone: "warn", trip: false, text: { he: `{{${PE.fmt(r.residual_mA)} mA}} – בין $0.5\\,I_{\\Delta n}$ ל-$I_{\\Delta n}$: הפחת <b>עשוי</b> לנתק או לא.`, en: `{{${PE.fmt(r.residual_mA)} mA}} – between $0.5\\,I_{\\Delta n}$ and $I_{\\Delta n}$: the RCD <b>may or may not</b> trip.` } };
      else verdict = { tone: person && C.lvl(r.body.zone) > 1 ? "danger" : "safe", trip: false, zone: person ? r.body.zone : null, text: { he: `הפרש של {{${PE.fmt(r.residual_mA)} mA}} – מתחת לסף, אין ניתוק.`, en: `A difference of {{${PE.fmt(r.residual_mA)} mA}} – below the threshold, no trip.` }, sub: person ? C.bodyLine(r.body) : null };
      return { meters, verdict };
    }
  };
})();
