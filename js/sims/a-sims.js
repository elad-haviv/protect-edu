/* Module A simulators: body impedance, IEC 60479 zones, earthing systems, fault loop. */
(function () {
  "use strict";
  const S = PE.sym, C = PE.simc;

  // A1 – body impedance depends on voltage
  PE.sims["a1-impedance"] = {
    title: { he: "עכבת הגוף כתלות במתח", en: "Body impedance versus voltage" },
    params: [
      { key: "u", type: "range", min: 10, max: 1000, step: 5, def: 230, unit: "V", label: { he: "מתח מגע", en: "Touch voltage" } },
      { key: "skin", type: "enum", def: "dry", label: { he: "מצב העור", en: "Skin condition" }, values: [{ v: "dry", label: { he: "יבש", en: "Dry" } }, { v: "wet", label: { he: "רטוב", en: "Wet" } }] },
      { key: "path", type: "enum", def: "hh", label: { he: "מסלול הזרם", en: "Current path" }, values: [{ v: "hh", label: { he: "יד–יד", en: "Hand–hand" } }, { v: "hf", label: { he: "יד–רגליים", en: "Hand–feet" } }, { v: "hhf", label: { he: "ידיים–רגליים", en: "Hands–feet" } }] }
    ],
    render(svg, s, ctx) {
      const M = ctx.model, g = svg.append("g");
      const x = d3.scaleLog().domain([10, 1000]).range([110, 640]), y = d3.scaleLinear().domain([0, 5000]).range([470, 50]);
      g.append("g").attr("transform", "translate(0,470)").call(d3.axisBottom(x).tickValues([10, 25, 50, 100, 230, 500, 1000]).tickFormat(d => d + " V"));
      g.append("g").attr("transform", "translate(110,0)").call(d3.axisLeft(y).ticks(5).tickFormat(d => d + " Ω"));
      g.selectAll(".tick text").style("font-size", "14px");
      const us = d3.range(1, 3.0001, 0.02).map(e => Math.pow(10, e));
      [["dry", "var(--accent)"], ["wet", "var(--zone-3)"]].forEach(([k, col]) => {
        g.append("path").attr("d", d3.line()(us.map(u => [x(u), y(M.bodyZ(u, k, s.path))]))).attr("fill", "none").attr("stroke", col).attr("stroke-width", k === s.skin ? 5 : 2).attr("stroke-dasharray", k === "wet" ? "8 5" : null);
        S.text(g, x(14), y(M.bodyZ(14, k, s.path)) - 12, ctx.L(k === "dry" ? { he: "יבש", en: "dry" } : { he: "רטוב", en: "wet" }), "lbl-s", "start");
      });
      const Z = M.bodyZ(s.u, s.skin, s.path), I = s.u / Z * 1000;
      g.append("circle").attr("class", "res").attr("cx", x(s.u)).attr("cy", y(Z)).attr("r", 9).attr("fill", "var(--accent)").attr("stroke", "#fff").attr("stroke-width", 2);
      S.badge(g, x(s.u), y(Z) - 30, `${PE.fmt(Z)} Ω`, "info", "res");
      S.text(g, 375, 30, ctx.L({ he: "עכבת הגוף הכוללת (50% מהאוכלוסייה)", en: "Total body impedance (50th percentile)" }), "lbl-b");
      // person with path
      const lvl = C.lvl(M.zone(I, 1000));
      const p = S.person(g, 820, 470, { s: 1.6, state: lvl, hand: [880, 330], hand2: [760, 330] });
      const pathPts = s.path === "hh" ? [[880, 330], [820, 300], [760, 330]] : s.path === "hf" ? [[880, 330], [820, 340], [820, 430], [840, 468]] : [[880, 330], [820, 320], [760, 330], [820, 320], [820, 430], [800, 468]];
      S.flow(g, pathPts, I / 1000, { body: true });
      const z = M.zone(I, 1000);
      return { meters: [{ label: { he: "עכבת הגוף", en: "Body impedance" }, value: Z, unit: "Ω" }, { label: "bodyCurrent", value: I, unit: "mA", tone: lvl >= 2 ? "bad" : lvl ? "warn" : "ok" }],
        verdict: { tone: lvl >= 2 ? "danger" : lvl ? "warn" : "safe", zone: z, text: { he: `ב-{{${s.u} V}} העכבה כ-{{${PE.fmt(Z)} Ω}} והזרם {{${PE.fmt(I)} mA}}. ככל שהמתח עולה – העכבה <b>יורדת</b>, והזרם עולה מהר יותר מהמתח.`, en: `At {{${s.u} V}} the impedance is about {{${PE.fmt(Z)} Ω}} and the current {{${PE.fmt(I)} mA}}. As voltage rises the impedance <b>falls</b>, so current rises faster than voltage.` }, sub: { he: "אזור ההשפעה מחושב לחשיפה של {{1 s}}.", en: "The effect zone assumes a {{1 s}} exposure." } },
        note: { he: "ערכים להמחשה לפי IEC 60479-1; גורמי מסלול מקורבים.", en: "Illustrative values after IEC 60479-1; path factors are approximate." } };
    }
  };

  // A2 – IEC 60479 time/current zones
  const fmtI = v => { const mA = Math.pow(10, v); return (mA < 10 ? PE.fmt(mA) : Math.round(mA)) + " mA"; };
  const fmtT = v => Math.round(Math.pow(10, v)) + " ms";
  PE.sims["a2-zones"] = {
    title: { he: "אזורי השפעת הזרם (IEC 60479-1)", en: "Current effect zones (IEC 60479-1)" },
    params: [
      { key: "li", type: "range", min: -1, max: 3.7, step: 0.05, def: 1.48, label: { he: "זרם בגוף", en: "Body current" }, fmt: fmtI },
      { key: "lt", type: "range", min: 1, max: 4, step: 0.05, def: 2.5, label: { he: "משך הזרם", en: "Duration" }, fmt: fmtT },
      { key: "rcd", type: "bool", def: true, label: { he: "הצג את תחום הפחת {{30 mA}}".replace(/\{\{|\}\}/g, ""), en: "Show the 30 mA RCD limits" } }
    ],
    render(svg, s, ctx) {
      const M = ctx.model, g = svg.append("g");
      const x = d3.scaleLog().domain([0.1, 5000]).range([100, 900]), y = d3.scaleLog().domain([10, 10000]).range([470, 40]);
      const cur = M.zoneCurves();
      const poly = (pts) => d3.line()(pts.map(([I, t]) => [x(I), y(t)]));
      const top = 10000, bot = 10;
      // fill zones between curves
      const area = (left, right, col) => {
        const L = left ? left : [[0.1, bot], [0.1, top]];
        const pts = L.map(([I, t]) => [x(I), y(t)]).concat(right.slice().reverse().map(([I, t]) => [x(I), y(t)]));
        g.append("path").attr("d", d3.line()(pts) + "Z").attr("fill", col).attr("opacity", .28);
      };
      const right = [[5000, 10], [5000, 10000]];
      area(null, cur.a, "var(--zone-1)"); area(cur.a, cur.b, "var(--zone-2)"); area(cur.b, cur.c1, "var(--zone-3)"); area(cur.c1, right, "var(--zone-4)");
      ["a", "b", "c1"].forEach(k => { g.append("path").attr("d", poly(cur[k])).attr("fill", "none").attr("stroke", "var(--stage-line)").attr("stroke-width", 2.5); });
      [["AC-1", 0.2, 900], ["AC-2", 2, 900], ["AC-3", 22, 1200], ["AC-4", 900, 900]].forEach(([l, I, t]) => S.text(g, x(I), y(t), l, "lbl-b"));
      g.append("g").attr("transform", "translate(0,470)").call(d3.axisBottom(x).tickValues([0.1, 0.5, 1, 10, 30, 100, 1000, 5000]).tickFormat(d => d + ""));
      g.append("g").attr("transform", "translate(100,0)").call(d3.axisLeft(y).tickValues([10, 40, 100, 300, 1000, 5000, 10000]).tickFormat(d => d + ""));
      g.selectAll(".tick text").style("font-size", "14px");
      S.text(g, 500, 515, ctx.L({ he: "זרם בגוף, mA", en: "Body current, mA" }), "lbl");
      S.text(g, 40, 30, ctx.L({ he: "זמן, ms", en: "Time, ms" }), "lbl", "start");
      if (s.rcd) {
        const st = [[30, 10000], [30, 300], [60, 300], [60, 150], [150, 150], [150, 40], [5000, 40]];
        g.append("path").attr("d", poly(st)).attr("fill", "none").attr("stroke", "var(--accent)").attr("stroke-width", 4).attr("stroke-dasharray", "10 6");
        S.badge(g, x(400), y(40) - 22, ctx.L({ he: "פחת 30 mA: זמן ניתוק מרבי", en: "30 mA RCD: max trip time" }), "info");
      }
      const I = Math.pow(10, s.li), t = Math.pow(10, s.lt), z = M.zone(I, t), lvl = C.lvl(z);
      g.append("circle").attr("class", "res").attr("cx", x(I)).attr("cy", y(t)).attr("r", 11).attr("fill", ["var(--zone-1)", "var(--zone-2)", "var(--zone-3)", "var(--zone-4)"][lvl]).attr("stroke", "var(--stage-line)").attr("stroke-width", 3);
      return { meters: [{ label: "bodyCurrent", value: I, unit: "mA" }, { label: "exposure", value: t, unit: "ms" }],
        verdict: { tone: ["safe", "warn", "danger", "danger"][lvl], zone: z, text: PE.ui[PE.kit.zoneKey(z)] },
        note: { he: "קירוב של עקומות a, b ו-c1 מתוך IEC 60479-1 (מסלול יד שמאל–רגליים, AC 50/60 Hz). להמחשה.", en: "Approximation of curves a, b and c1 from IEC 60479-1 (left hand to feet, AC 50/60 Hz). Illustrative." } };
    }
  };

  // A4 – earthing systems
  PE.sims["a4-systems"] = {
    title: { he: "שיטות הארקה במערכת: TN-C-S, TT, IT", en: "System earthing: TN-C-S, TT, IT" },
    params: [
      { key: "sys", type: "enum", def: "TN", label: { he: "שיטת הארקה", en: "Earthing system" }, values: [{ v: "TN", label: "TN-C-S" }, { v: "TT", label: "TT" }, { v: "IT", label: "IT" }] },
      { key: "fault", type: "bool", def: true, label: { he: "תקלה לגוף המכשיר", en: "Fault to the case" } }
    ],
    render(svg, s, ctx) {
      const M = ctx.model, g = svg.append("g"); const floor = 450, yL = 110, yN = 180;
      S.ground(g, 0, 960, floor, { h: 90 });
      S.transformer(g, 90, 145, { r: 26 });
      S.wire(g, [[118, 135], [140, yL], [700, yL]], "L");
      const nKind = s.sys === "TN" ? "PEN" : "N";
      if (s.sys !== "IT") { S.wire(g, [[118, 155], [140, yN], s.sys === "TN" ? [380, yN] : [700, yN]], nKind); S.wire(g, [[140, yN], [140, 330]], nKind, "w-thin"); S.resistor(g, 140, 330, { vertical: true, len: 34, label: "Rb" }); S.wire(g, [[140, 364], [140, floor]], "gen", "w-thin"); }
      else { S.wire(g, [[118, 155], [140, yN], [700, yN]], "N"); g.append("path").attr("class", "sym").attr("d", `M140 ${yN} v60`).attr("stroke-dasharray", "4 5"); S.text(g, 150, yN + 80, ctx.L({ he: "לא מוארק (או דרך עכבה גבוהה)", en: "Not earthed (or via high impedance)" }), "lbl-s", "start"); }
      if (s.sys === "TN") { S.dot(g, 380, yN); S.wire(g, [[380, yN], [700, yN]], "N"); S.wire(g, [[380, yN], [380, 250], [620, 250], [620, 280]], "PE"); S.text(g, 380, yN - 14, ctx.L({ he: "פיצול PEN", en: "PEN split" }), "lbl-s"); }
      else { S.wire(g, [[620, 380], [620, 400]], "PE"); S.resistor(g, 620, 400, { vertical: true, len: 30, label: "Ra" }); S.wire(g, [[620, 430], [620, floor]], "gen", "w-thin"); }
      S.wire(g, [[600, yL], [600, 280]], "L", "w-thin"); S.wire(g, [[650, yN], [650, 280]], "N", "w-thin");
      S.appliance(g, 560, 280, 140, 100, { warm: s.fault, label: ctx.L({ he: "מכשיר", en: "Appliance" }) });
      if (s.fault) C.bolt(g, 590, 300, .7);
      S.text(g, 820, 80, s.sys === "TN" ? "TN-C-S" : s.sys, "lbl-b").style("font-size", "36px");
      const desc = { TN: { he: "T: נקודת האפס מוארקת · N: הגופים מחוברים לאפס (דרך PE)", en: "T: star point earthed · N: cases connected to the neutral (via PE)" }, TT: { he: "T: נקודת האפס מוארקת · T: הגופים מוארקים באלקטרודה נפרדת", en: "T: star point earthed · T: cases earthed by a separate electrode" }, IT: { he: "I: נקודת האפס מבודדת · T: הגופים מוארקים", en: "I: star point isolated · T: cases earthed" } }[s.sys];
      S.text(g, 820, 120, ctx.L(desc).split(" · ")[0], "lbl-s"); S.text(g, 820, 145, ctx.L(desc).split(" · ")[1], "lbl-s");
      let res, verdict, path;
      if (s.sys === "TN") { res = M.tn({ fault: s.fault }); path = [[140, yL], [590, yL], [590, 300], [620, 300], [620, 250], [380, 250], [380, yN], [140, yN]]; verdict = { tone: "safe", text: { he: "מסלול התקלה כולו מתכתי (PE ← PEN): זרם גדול – המאמ\"ת מנתק.", en: "The fault loop is all metal (PE → PEN): a large current – the MCB trips." } }; }
      else if (s.sys === "TT") { res = M.tt({ fault: s.fault, person: false }); path = [[140, yL], [590, yL], [590, 370], [620, 370], [620, floor + 40], [140, floor + 40], [140, 364]]; verdict = { tone: "warn", text: { he: "מסלול התקלה עובר באדמה (Ra + Rb): זרם קטן יחסית – נדרש מפסק פחת.", en: "The fault loop passes through the soil (Ra + Rb): a relatively small current – an RCD is needed." } }; }
      else { res = { If: M.it({}).body.I_mA / 1000 }; path = [[600, 300], [620, 370], [620, floor + 30], [300, floor + 30]]; verdict = { tone: "safe", text: { he: "תקלה ראשונה: אין מסלול חזרה מלבד קיבול הרשת – זרם של מיליאמפרים. המערכת ממשיכה לעבוד, ונדרש ניטור בידוד ואיתור התקלה לפני תקלה שנייה.", en: "First fault: no return path except system capacitance – a few milliamps. The system keeps running; insulation monitoring must find the fault before a second one." } }; }
      if (s.fault) S.flow(g, path, res.If);
      if (!s.fault) verdict = { tone: "safe", text: { he: "הפעילו תקלה כדי לראות את לולאת התקלה.", en: "Switch on a fault to see the fault loop." } };
      return { meters: [{ label: { he: "זרם תקלה", en: "Fault current" }, value: s.fault ? res.If : 0, unit: "A" }], verdict };
    }
  };

  // A5 – fault loop and disconnection (TN, single circuit)
  PE.sims["a5-loop"] = {
    title: { he: "לולאת התקלה וזמן הניתוק", en: "Fault loop and disconnection time" },
    params: [
      { key: "len", type: "range", min: 5, max: 200, step: 5, def: 40, unit: "m", label: { he: "אורך הכבל", en: "Cable length" } },
      { key: "area", type: "enum", def: 2.5, label: { he: "חתך, ממ\"ר", en: "Size, mm²" }, values: [1.5, 2.5, 4, 6].map(v => ({ v, label: String(v) })) },
      PE.simc.MCB("C16", ["B16", "C16", "B32", "C32"])
    ],
    render(svg, s, ctx) {
      const M = ctx.model, g = svg.append("g");
      const r = M.tn({ L: s.len, A_ph: s.area, A_pe: s.area, mcb: s.mcb, person: false });
      const Rph = 0.0225 * s.len / s.area;
      // loop diagram
      S.source(g, 110, 250, { label: "U0 = 230 V" });
      S.wire(g, [[110, 224], [110, 120], [260, 120]], "L"); S.resistor(g, 260, 120, { len: 60, label: "Zsrc 0.3 Ω" });
      S.wire(g, [[320, 120], [400, 120]], "L"); S.mcb(g, 400, 120, { label: s.mcb });
      S.wire(g, [[460, 120], [560, 120]], "L"); S.resistor(g, 560, 120, { len: 80, label: `R_L = ${PE.fmt(Rph)} Ω` });
      S.wire(g, [[640, 120], [800, 120], [800, 380], [640, 380]], "L"); C.bolt(g, 800, 250, .9);
      S.resistor(g, 560, 380, { len: 80, label: `R_PE = ${PE.fmt(r.Rpe)} Ω` });
      S.wire(g, [[560, 380], [110, 380], [110, 276]], "PE");
      S.flow(g, [[110, 224], [110, 120], [800, 120], [800, 380], [110, 380], [110, 276]], r.If);
      S.text(g, 450, 470, `Zs = ${PE.fmt(r.Zs)} Ω   →   If = ${PE.fmt(r.If)} A   ·   Ia = ${PE.fmt(M.mcbInstant(s.mcb))} A`, "lbl-b");
      const inst = r.trip && r.trip.mode === "instant";
      return { meters: [{ label: { he: "Zs", en: "Zs" }, value: r.Zs, unit: "Ω" }, { label: { he: "זרם תקלה", en: "Fault current" }, value: r.If, unit: "A" }, { label: { he: "Zs·Ia", en: "Zs·Ia" }, value: r.cond.value, unit: "V", tone: r.cond.ok ? "ok" : "bad" }],
        verdict: inst ? { tone: "safe", trip: true, text: { he: `{{Zs·Ia = ${PE.fmt(r.cond.value)} V ≤ 230 V}}: ניתוק מיידי, בתוך {{0.4 s}}.`, en: `{{Zs·Ia = ${PE.fmt(r.cond.value)} V ≤ 230 V}}: instant trip, within {{0.4 s}}.` } }
          : { tone: "danger", trip: false, text: { he: `{{Zs·Ia = ${PE.fmt(r.cond.value)} V > 230 V}}: אין ניתוק מיידי. אורך מרבי לחתך ולמפסק זה: כ-{{${PE.fmt(Math.max(0, (230 / M.mcbInstant(s.mcb) - 0.3) / (0.0225 * 2 / s.area)))} m}}.`, en: `{{Zs·Ia = ${PE.fmt(r.cond.value)} V > 230 V}}: no instant trip. Maximum length for this size and breaker: about {{${PE.fmt(Math.max(0, (230 / M.mcbInstant(s.mcb) - 0.3) / (0.0225 * 2 / s.area)))} m}}.` } } };
    }
  };
})();
