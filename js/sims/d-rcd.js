/* D2 – Residual current device: what it sees and what it cannot see. */
(function () {
  "use strict";
  const S = PE.sym, C = PE.simc;
  const SCN = [
    { v: "LE", label: { he: "אדם בין פאזה לאדמה", en: "Person: line to earth" } },
    { v: "LN", label: { he: "אדם בין פאזה לאפס", en: "Person: line to neutral" } },
    { v: "leak", label: { he: "דליפה במכשיר", en: "Leak in an appliance" } },
    { v: "overload", label: { he: "עומס יתר", en: "Overload" } }];
  PE.sims["d-rcd"] = {
    title: { he: "סימולטור מפסק פחת", en: "RCD simulator" },
    params: [
      { key: "scn", type: "enum", def: "LE", label: { he: "תרחיש", en: "Scenario" }, values: SCN },
      { key: "idn", type: "enum", def: 30, label: { he: "רגישות IΔn", en: "Sensitivity IΔn" }, values: [10, 30, 100, 300].map(v => ({ v, label: v + " mA" })) },
      { key: "leak", type: "range", min: 0, max: 400, step: 1, def: 20, unit: "mA", label: { he: "זרם הדליפה", en: "Leakage current" }, show: s => s.scn === "leak" },
      C.SKIN
    ],
    render(svg, s, ctx) {
      const M = ctx.model;
      const r = M.rcdScenario({ scenario: s.scn, IdN_mA: s.idn, leak_mA: s.leak, skin: s.skin });
      const tripped = !!r.trip;
      const g = svg.append("g");
      const yL = 110, yN = 190, floor = 450;
      S.ground(g, 0, 960, floor, { h: 90 });
      const sup = C.supply(g, 60, yL, yN, { earthY: 300 });
      S.wire(g, [[112, 378], [112, floor]], "gen", "w-thin");
      S.wire(g, [sup.L, [210, yL]], "L"); S.wire(g, [sup.N, [210, yN]], "N");
      S.rcd(g, 210, yL, yN, { open: tripped, flash: tripped, label: `RCD ${s.idn} mA` });
      S.wire(g, [[320, yL], [640, yL]], "L"); S.wire(g, [[320, yN], [640, yN]], "N");
      S.wireTag(g, 380, yL - 22, "L"); S.wireTag(g, 380, yN + 22, "N");
      // load
      const big = s.scn === "overload";
      S.appliance(g, 640, 80, 150, 150, { warm: s.scn === "leak" && !tripped && s.leak > 0, label: ctx.L(big ? { he: "עומס {{25 A}}", en: "{{25 A}} load" } : { he: "מכשיר", en: "Appliance" }).replace(/\{\{|\}\}/g, "") });
      S.resistor(g, 690, 125, { len: 50 });
      // currents in/out labels
      if (!S.locked) {
        S.badge(g, 470, yL - 50, `I(L) = ${PE.fmt(r.I_L)} A`, "info", "res");
        S.badge(g, 470, yN + 56, `I(N) = ${PE.fmt(r.I_N)} A`, "info", "res");
      }
      if (s.scn === "leak") {
        S.wire(g, [[715, 230], [715, 330]], "PE"); S.resistor(g, 715, 330, { vertical: true, len: 36, label: "Ra" }); S.wire(g, [[715, 366], [715, floor]], "gen", "w-thin");
        if (!tripped && s.leak > 0) S.flow(g, [[715, 230], [715, floor + 40], [112, floor + 40], [112, 378]], s.leak / 1000);
      }
      // exposed conductor ends (a damaged cord) at hand height
      const tap = (x, y0, kind) => { S.dot(g, x, y0); S.wire(g, [[x, y0], [x, 300]], kind, "w-thin"); g.append("circle").attr("cx", x).attr("cy", 300).attr("r", 6).attr("fill", "var(--sign-yellow)").attr("stroke", "#000"); };
      if (s.scn === "LE") {
        tap(540, yL, "L");
        S.person(g, 590, floor, { s: 1.1, state: tripped ? Math.min(C.lvl(r.body.zone), 2) : C.lvl(r.body.zone), hand: [545, 302] });
        if (!tripped) S.flow(g, [[540, yL], [540, 300], [590, 340], [590, floor], [590, floor + 30], [112, floor + 30], [112, 378]], r.body.I_mA / 1000, { body: true });
        S.text(g, 590, floor + 70, ctx.L({ he: "עומד על רצפה מוליכה", en: "Standing on a conductive floor" }), "lbl-s");
      }
      if (s.scn === "LN") {
        tap(520, yL, "L"); tap(610, yN, "N");
        g.append("rect").attr("x", 490).attr("y", floor - 10).attr("width", 150).attr("height", 12).attr("rx", 3).attr("fill", "#3b3b3b");
        S.text(g, 565, floor + 32, ctx.L({ he: "משטח מבודד", en: "Insulating mat" }), "lbl-s");
        S.person(g, 565, floor - 10, { s: 1.05, state: C.lvl(r.body.zone), hand: [605, 302], hand2: [525, 302] });
        S.flow(g, [[520, yL], [520, 300], [565, 335], [610, 300], [610, yN]], r.body.I_mA / 1000, { body: true });
      }
      if (big) S.flow(g, [[112, yL], [640, yL], [640, yN], [112, yN]], 25);
      // inset: trip characteristic (staircase) with the residual current point
      const ix = 170, iy = 262, iw = 250, ih = 140;
      const gx = d3.scaleLog().domain([1, 2000]).range([ix, ix + iw]).clamp(true), gy = d3.scaleLog().domain([10, 1000]).range([iy + ih, iy]).clamp(true);
      g.append("rect").attr("x", ix).attr("y", iy).attr("width", iw).attr("height", ih).attr("fill", "var(--stage)").attr("stroke", "var(--stage-soft)");
      const st = [[s.idn, 1000], [s.idn, 300], [2 * s.idn, 300], [2 * s.idn, 150], [5 * s.idn, 150], [5 * s.idn, 40], [2000, 40]];
      g.append("path").attr("class", "sym").style("stroke", "var(--bad)").attr("d", d3.line()(st.map(([a, b]) => [gx(a), gy(b)])));
      S.text(g, ix + iw / 2, iy + ih + 22, ctx.L({ he: "זרם דלף, mA", en: "Residual current [mA]" }), "lbl-s");
      S.text(g, ix + iw - 6, iy + 18, ctx.L({ he: "זמן ניתוק מרבי, ms", en: "max trip time [ms]" }), "lbl-s", "end");
      [10, 100, 1000].forEach(v => S.text(g, gx(v), iy + ih - 4, v, "lbl-s").style("font-size", "12px"));
      if (r.residual_mA > 0 && !S.locked) g.append("circle").attr("class", "res").attr("cx", gx(Math.max(1, r.residual_mA))).attr("cy", tripped ? gy(r.trip.t_ms) : iy + 10).attr("r", 8).attr("fill", "var(--accent)").attr("stroke", "#fff").attr("stroke-width", 2);
      if (tripped) S.badge(g, 265, 40, ctx.L({ he: "נותק!", en: "TRIPPED" }), "ok", "res");

      const person = s.scn === "LE" || s.scn === "LN";
      const meters = [
        { label: { he: "זרם בפאזה", en: "Line current" }, value: r.I_L, unit: "A" },
        { label: { he: "זרם באפס", en: "Neutral current" }, value: r.I_N, unit: "A" },
        { label: { he: "הפרש IΔ", en: "Residual IΔ" }, value: r.residual_mA, unit: "mA", tone: r.residual_mA >= s.idn ? "warn" : "" },
        { label: { he: "זמן ניתוק", en: "Trip time" }, value: tripped ? r.trip.t_ms : "—", unit: tripped ? "ms" : "", tone: tripped ? "ok" : "" }];
      if (person) meters.push(PE.kit.bodyMeter(r.body));
      let verdict;
      if (s.scn === "LN") verdict = { tone: "danger", trip: false, zone: r.body.zone, text: { he: "הזרם עובר דרך האדם מהפאזה אל האפס וחוזר במלואו – אין הפרש, ו<b>הפחת לא רואה כלום</b>.", en: "The current runs through the person from line to neutral and all of it returns – there is no difference, so <b>the RCD sees nothing</b>." }, sub: C.bodyLine(r.body) };
      else if (s.scn === "overload") verdict = { tone: "warn", trip: false, text: { he: "{{25 A}} נכנסים ו-{{25 A}} חוזרים: אין הפרש. הגנה מעומס יתר וקצר היא תפקיד המאמ\"ת, לא הפחת.", en: "{{25 A}} goes out and {{25 A}} comes back: no difference. Overload and short-circuit protection is the MCB's job, not the RCD's." } };
      else if (tripped) verdict = { tone: "safe", trip: true, zone: person ? r.body.zone : null, text: { he: `הפרש של {{${PE.fmt(r.residual_mA)} mA}} ≥ {{${s.idn} mA}} – הפחת מנתק תוך {{${r.trip.t_ms} ms}} לכל היותר.`, en: `A difference of {{${PE.fmt(r.residual_mA)} mA}} ≥ {{${s.idn} mA}} – the RCD trips within {{${r.trip.t_ms} ms}}.` }, sub: person ? C.bodyLine(r.body) : null };
      else if (r.rcd.status === "maybe") verdict = { tone: "warn", trip: false, text: { he: `{{${PE.fmt(r.residual_mA)} mA}} – בין {{0.5·IΔn}} ל-{{IΔn}}: הפחת <b>עשוי</b> לנתק או לא. התקן מבטיח ניתוק רק מ-{{IΔn}}.`, en: `{{${PE.fmt(r.residual_mA)} mA}} – between {{0.5·IΔn}} and {{IΔn}}: the RCD <b>may or may not</b> trip. The standard only guarantees tripping from {{IΔn}}.` } };
      else verdict = { tone: person && C.lvl(r.body.zone) > 1 ? "danger" : "safe", trip: false, zone: person ? r.body.zone : null, text: { he: `הפרש של {{${PE.fmt(r.residual_mA)} mA}} – מתחת לסף, אין ניתוק.`, en: `A difference of {{${PE.fmt(r.residual_mA)} mA}} – below the threshold, no trip.` }, sub: person ? C.bodyLine(r.body) : null };
      return { meters, verdict };
    }
  };
})();
