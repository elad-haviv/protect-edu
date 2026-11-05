/* H2 – Supplementary equipotential bonding, and the non-conducting location. */
(function () {
  "use strict";
  const S = PE.sym, C = PE.simc;
  PE.sims["h-bond"] = {
    title: { he: "סימולטור השוואת פוטנציאלים", en: "Equipotential bonding simulator" },
    params: [
      { key: "mode", type: "enum", def: "bond", label: { he: "שיטה", en: "Method" }, values: [{ v: "bond", label: { he: "השוואת פוטנציאלים", en: "Equipotential bonding" } }, { v: "ncl", label: { he: "מקום מבודד", en: "Non-conducting location" } }] },
      { key: "if", type: "range", min: 50, max: 1000, step: 10, def: 300, unit: "A", label: { he: "זרם תקלה בדוד", en: "Fault current in the heater" }, show: s => s.mode === "bond" },
      { key: "bond", type: "bool", def: false, label: { he: "מוליך השוואה משלים בין הדוד לצינור", en: "Supplementary bond between heater and pipe" }, show: s => s.mode === "bond" },
      { key: "rsb", type: "range", min: 0.01, max: 0.5, step: 0.01, def: 0.05, unit: "Ω", label: { he: "התנגדות מוליך ההשוואה", en: "Bond resistance" }, show: s => s.mode === "bond" && s.bond },
      { key: "floor", type: "range", min: 1, max: 500, step: 1, def: 50, unit: "kΩ", label: { he: "התנגדות הרצפה והקירות", en: "Floor and wall resistance" }, show: s => s.mode === "ncl" },
      C.SKIN
    ],
    render(svg, s, ctx) {
      const M = ctx.model; const g = svg.append("g"); const floor = 460;
      if (s.mode === "ncl") {
        const r = M.nonConducting({ Rfloor_k: s.floor, skin: s.skin });
        g.append("rect").attr("x", 0).attr("y", floor).attr("width", 960).attr("height", 80).attr("fill", "#7a7f86");
        S.text(g, 480, floor + 45, ctx.L({ he: `רצפה מבודדת: {{${s.floor} kΩ}}`, en: `Insulating floor: ${s.floor} kΩ` }).replace(/\{\{|\}\}/g, ""), "lbl").style("fill", "#fff");
        S.appliance(g, 300, 200, 180, 200, { live: true, label: ctx.L({ he: "מכונה – תקלה לגוף", en: "Machine – fault to case" }) });
        PE.simc.bolt(g, 330, 230, .8);
        S.text(g, 390, 180, ctx.L({ he: "אין מוליך הגנה", en: "No protective conductor" }), "lbl-s");
        S.person(g, 560, floor, { s: 1.1, state: C.lvl(r.body.zone), hand: [482, 300] });
        S.flow(g, [[482, 300], [560, 340], [560, floor]], r.body.I_mA / 1000, { body: true });
        g.append("path").attr("d", "M640 300 h200").attr("class", "sym").attr("stroke-dasharray", "6 6");
        S.text(g, 740, 290, ctx.L({ he: "חלקים מוליכים אחרים – מחוץ להישג יד", en: "Other conductive parts – out of reach" }), "lbl-s");
        return { meters: [PE.kit.bodyMeter(r.body), { label: { he: "דרישה מינימלית", en: "Minimum required" }, value: r.limit_k, unit: "kΩ" }],
          verdict: r.ok ? { tone: "safe", zone: r.body.zone, text: { he: `הרצפה ({{${s.floor} kΩ}} ≥ {{${r.limit_k} kΩ}}) מגבילה את הזרם – אין מסלול לאדמה.`, en: `The floor ({{${s.floor} kΩ}} ≥ {{${r.limit_k} kΩ}}) limits the current – there is no path to earth.` }, sub: { he: "מותר רק במתקנים בפיקוח אנשי מקצוע, וכשאי אפשר לגעת בשני חלקים בו-זמנית.", en: "Only for installations supervised by skilled persons, where two parts cannot be touched at once." } }
            : { tone: "danger", zone: r.body.zone, text: { he: `הרצפה מוליכה מדי ({{${s.floor} kΩ}} < {{${r.limit_k} kΩ}}) – זה כבר לא מקום מבודד.`, en: `The floor conducts too well ({{${s.floor} kΩ}} < {{${r.limit_k} kΩ}}) – this is no longer a non-conducting location.` }, sub: C.bodyLine(r.body) } };
      }
      const r = M.bonding({ If: s.if, bond: s.bond, R_sb: s.rsb });
      const b = M.body(r.Ut, { skin: s.skin, path: "hh" }, 400);
      // bathroom wall + floor
      g.append("rect").attr("x", 0).attr("y", 0).attr("width", 960).attr("height", floor).attr("fill", "var(--stage)");
      for (let x = 0; x < 960; x += 60) g.append("path").attr("d", `M${x} 0 V${floor}`).attr("stroke", "var(--rule)");
      S.ground(g, 0, 960, floor, { h: 80 });
      // MET
      g.append("rect").attr("x", 40).attr("y", 300).attr("width", 120).attr("height", 30).attr("rx", 4).attr("fill", "#b87333").attr("stroke", "var(--stage-line)");
      S.text(g, 100, 288, ctx.L({ he: "פס השוואה ראשי", en: "Main bonding bar" }), "lbl-s");
      S.earth(g, 100, 330);
      // pipe (bonded to MET)
      g.append("rect").attr("x", 250).attr("y", 60).attr("width", 26).attr("height", 400).attr("fill", "#9aa3ab").attr("stroke", "var(--stage-line)");
      S.text(g, 263, 50, ctx.L({ he: "צינור מים מתכתי", en: "Metal water pipe" }), "lbl-s");
      S.wire(g, [[250, 400], [140, 400], [140, 330]], "PE");
      // heater with PE to MET
      S.appliance(g, 600, 80, 170, 230, { live: !S.locked && r.Ut > 50, warm: !S.locked && r.Ut > 0, label: ctx.L({ he: "דוד חשמלי", en: "Electric water heater" }) });
      PE.simc.bolt(g, 620, 110, .8);
      S.wire(g, [[770, 120], [900, 120], [900, 40], [60, 40], [60, 300]], "PE");
      S.text(g, 480, 30, ctx.L({ he: "PE אל הלוח (התנגדות R_PE)", en: "PE back to the board (resistance R_PE)" }), "lbl-s");
      if (s.bond) { S.wire(g, [[276, 200], [600, 200]], "PE"); S.text(g, 440, 190, ctx.L({ he: "השוואה משלימה", en: "Supplementary bond" }), "lbl-s"); }
      S.person(g, 440, floor, { s: 1.15, state: C.lvl(b.zone), hand: [600, 280], hand2: [278, 280] });
      if (r.Ut > 1) S.flow(g, [[600, 280], [440, 320], [278, 280]], b.I_mA / 1000, { body: true });
      S.badge(g, 685, 340, `${PE.fmt(r.Vcase)} V`, r.Vcase > 50 ? "danger" : "warn", "res");
      S.badge(g, 263, 330, `${PE.fmt(r.Vpipe)} V`, "info", "res");
      S.badge(g, 440, 250, `ΔU = ${PE.fmt(r.Ut)} V`, r.Ut > 50 ? "danger" : r.Ut > 25 ? "warn" : "ok", "res");
      return { meters: [{ label: { he: "פוטנציאל הדוד", en: "Heater potential" }, value: r.Vcase, unit: "V" }, { label: { he: "פוטנציאל הצינור", en: "Pipe potential" }, value: r.Vpipe, unit: "V" }, { label: { he: "מתח מגע ביניהם", en: "Touch voltage between them" }, value: r.Ut, unit: "V", tone: r.Ut > 25 ? "bad" : "ok" }, PE.kit.bodyMeter(b)],
        verdict: r.Ut <= 25 ? { tone: "safe", zone: b.zone, text: { he: `ההשוואה מחברת את החלקים יחד: ההפרש ביניהם רק {{${PE.fmt(r.Ut)} V}}, גם כשהפוטנציאל של שניהם עולה.`, en: `Bonding ties the parts together: the difference between them is only {{${PE.fmt(r.Ut)} V}}, even though both rise.` } }
          : { tone: r.Ut > 50 ? "danger" : "warn", zone: b.zone, text: { he: `עד שהמפסק ינתק, יש {{${PE.fmt(r.Ut)} V}} בין הדוד לצינור – אדם רטוב שנוגע בשניהם בחדר רחצה בסכנה.`, en: `Until the device disconnects, there are {{${PE.fmt(r.Ut)} V}} between heater and pipe – a wet person touching both in a bathroom is at risk.` }, sub: { he: "הסכנה היא ההפרש בין חלקים, לא המתח המוחלט. נסו להפעיל השוואה משלימה.", en: "The danger is the difference between parts, not the absolute voltage. Try switching on supplementary bonding." } } };
    }
  };
})();
