/* G2 – Extra-low voltage (SELV/PELV): voltage-dependent body impedance and the location limits. */
(function () {
  "use strict";
  const S = PE.sym, C = PE.simc;
  PE.sims["g-elv"] = {
    title: { he: "סימולטור מתח נמוך מאוד", en: "Extra-low voltage simulator" },
    params: [
      { key: "u", type: "range", min: 6, max: 230, step: 1, def: 12, unit: "V", label: { he: "מתח המקור", en: "Source voltage" } },
      { key: "ac", type: "enum", def: true, label: { he: "סוג מתח", en: "Voltage type" }, values: [{ v: true, label: "AC ~" }, { v: false, label: "DC ⎓" }] },
      { key: "loc", type: "enum", def: "dry", label: { he: "מיקום", en: "Location" }, values: [{ v: "dry", label: { he: "יבש", en: "Dry" } }, { v: "wet", label: { he: "רטוב", en: "Wet" } }, { v: "pool0", label: { he: "בריכה – אזור 0", en: "Pool – zone 0" } }] },
      { key: "src", type: "enum", def: "safety", label: { he: "מקור", en: "Source" }, values: [{ v: "safety", label: { he: "שנאי בטיחות", en: "Safety transformer" } }, { v: "adapterFault", label: { he: "ספק זול – תקלה בבידוד", en: "Cheap adapter – insulation fault" } }] },
      Object.assign({}, C.SKIN, { show: s => s.loc !== "pool0" })
    ],
    render(svg, s, ctx) {
      const r = ctx.model.elv({ U: s.u, ac: s.ac, location: s.loc, source: s.src, skin: s.skin });
      const g = svg.append("g"); const floor = 460;
      if (s.loc === "pool0") { g.append("rect").attr("x", 430).attr("y", 300).attr("width", 380).attr("height", 160).attr("fill", "#6fb7e9").attr("opacity", .55); S.text(g, 620, 445, ctx.L({ he: "בריכה – אזור 0", en: "Pool – zone 0" }), "lbl-s"); }
      S.ground(g, 0, 960, floor, { h: 80 });
      // mains → transformer → ELV circuit
      const sup = C.board1ph(g, { sys: "TN", x1: 150, xt: 120 });
      S.wire(g, [sup.L, [sup.L[0], 140], [170, 140]], "L1"); S.wire(g, [sup.N, [sup.N[0], 200], [170, 200]], "N");
      g.append("rect").attr("x", 170).attr("y", 105).attr("width", 130).attr("height", 130).attr("rx", 10).attr("class", "sym-fill");
      S.transformer(g, 235, 170, { r: 24, safety: s.src === "safety" });
      S.text(g, 235, 92, ctx.L(s.src === "safety" ? { he: "שנאי בטיחות", en: "Safety transformer" } : { he: "ספק לא מבודד", en: "Non-isolated adapter" }), "lbl-s");
      if (s.src === "adapterFault") PE.simc.bolt(g, 235, 210, .7);
      S.text(g, 60, 170, "230 V", "lbl-s", "start");
      const wireK = s.src === "safety" ? "gen" : "L";
      S.wire(g, [[300, 140], [520, 140], [520, 330]], wireK); S.wire(g, [[300, 200], [470, 200], [470, 330]], "gen");
      S.text(g, 400, 128, `${PE.fmt(r.Ueff)} V ${s.ac ? "AC" : "DC"}`, "lbl-b");
      S.lamp(g, 495, 345, 24);
      const lvl = C.lvl(r.body.zone);
      S.person(g, 660, s.loc === "pool0" ? 470 : floor, { s: 1.1, state: lvl, hand: [522, 352], hand2: [470, 360] });
      if (r.body.I_mA > 0.5) S.flow(g, [[522, 352], [650, 380], [470, 362]], r.body.I_mA / 1000, { body: true });
      // voltage scale with limits
      const sx = 880, y = d3.scaleLog().domain([6, 250]).range([440, 70]);
      g.append("path").attr("class", "sym").attr("d", `M${sx} ${y(6)} V${y(250)}`);
      [[12, "12"], [25, "25"], [50, "50"], [120, "120"], [230, "230"]].forEach(([v, l]) => { g.append("path").attr("class", "sym").attr("d", `M${sx - 8} ${y(v)} h16`); S.text(g, sx + 14, y(v) + 5, l + " V", "lbl-s", "start"); });
      g.append("path").attr("d", `M${sx - 12} ${y(r.limit)} h24`).attr("stroke", "var(--ok)").attr("stroke-width", 6);
      S.text(g, sx - 18, y(r.limit) + 5, ctx.L({ he: "גבול", en: "limit" }), "lbl-s", "end");
      g.append("path").attr("class", "res").attr("d", `M${sx - 30} ${y(Math.min(250, r.Ueff))} l14 -8 v16 z`).attr("fill", r.within ? "var(--ok)" : "var(--bad)");
      const meters = [PE.kit.bodyMeter(r.body), { label: { he: "גבול ELV למיקום", en: "ELV limit for location" }, value: r.limit, unit: s.ac ? "V AC" : "V DC" }, { label: { he: "עכבת הגוף", en: "Body impedance" }, value: r.body.Z, unit: "Ω" }];
      const zone = r.body.zone;
      let verdict;
      if (s.src !== "safety") verdict = { tone: "danger", zone, text: { he: "ספק ללא הפרדה בטוחה: תקלה בבידוד מעבירה {{230 V}} לצד \"הנמוך\". מתח נמוך מאוד מחייב מקור מופרד – שנאי בטיחות.", en: "A source without safe separation: an insulation fault passes {{230 V}} to the \"low\" side. ELV requires a separated source – a safety transformer." }, sub: C.bodyLine(r.body) };
      else if (r.within) verdict = { tone: C.lvl(zone) >= 2 ? "warn" : "safe", zone, text: { he: `{{${s.u} V}} ≤ {{${r.limit} V}}: בתוך גבול ה-ELV למיקום. עכבת הגוף גבוהה במתח נמוך (כ-{{${PE.fmt(r.body.Z)} Ω}}), ולכן הזרם קטן.`, en: `{{${s.u} V}} ≤ {{${r.limit} V}}: within the ELV limit for this location. Body impedance is high at low voltage (about {{${PE.fmt(r.body.Z)} Ω}}), so the current is small.` }, sub: s.loc === "pool0" ? { he: "בגוף טבול זרם מורגש עדיין אפשרי – {{12 V}} הוא הגבול העליון, לא \"בטוח תמיד\".", en: "Submerged, a perceptible current is still possible – {{12 V}} is the upper limit, not \"always safe\"." } : null };
      else verdict = { tone: C.lvl(zone) >= 2 ? "danger" : "warn", zone, text: { he: `{{${s.u} V}} מעל גבול ה-ELV ({{${r.limit} V}}) למיקום זה – זו כבר לא שיטת הגנה \"מתח נמוך מאוד\".`, en: `{{${s.u} V}} is above the ELV limit ({{${r.limit} V}}) for this location – this is no longer extra-low voltage protection.` }, sub: C.bodyLine(r.body) };
      return { meters, verdict, note: s.ac ? null : { he: "באזורי ההשפעה מוצגים ערכי AC; זרם DC פחות מסוכן באותה עוצמה.", en: "Effect zones shown are for AC; DC is less dangerous at the same current." } };
    }
  };
})();
