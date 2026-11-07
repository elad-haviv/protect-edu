/* 2.2 – TN-C-S (איפוס) on a three-phase supply: fault loop through the PE, and the broken PEN with neutral shift. */
(function () {
  "use strict";
  const S = PE.sym, C = PE.simc;
  const LOAD = k => ({ key: k, type: "range", min: 0, max: 16, step: 1, unit: "A", show: s => s.pen === "broken" });
  PE.sims["c-tn"] = {
    title: { he: "סימולטור איפוס (TN-C-S) תלת-פאזי", en: "Three-phase TN-C-S simulator" },
    params: [
      { key: "fault", type: "bool", def: true, label: { he: "תקלה: L1 נוגע בגוף מכשיר 1", en: "Fault: L1 touches the case of appliance 1" } },
      { key: "pen", type: "enum", def: "ok", label: { he: "מוליך ה-PEN ברשת", en: "Supply PEN conductor" }, values: [{ v: "ok", label: { he: "תקין", en: "Intact" } }, { v: "broken", label: { he: "קטוע", en: "Broken" } }] },
      Object.assign(LOAD("i1"), { def: 10, label: { he: "עומס על L1 (מכשיר 1)", en: "Load on L1 (appliance 1)" } }),
      Object.assign(LOAD("i2"), { def: 2, label: { he: "עומס על L2 (מכשיר 2)", en: "Load on L2 (appliance 2)" } }),
      Object.assign(LOAD("i3"), { def: 2, label: { he: "עומס על L3 (מכשיר 3)", en: "Load on L3 (appliance 3)" } }),
      { key: "earth", type: "bool", def: true, label: { he: "הארקת יסוד במבנה ($R_a = 10\\,\\Omega$)", en: "Foundation earth at the building ($R_a = 10\\,\\Omega$)" }, show: s => s.pen === "broken" },
      { key: "len", type: "range", min: 5, max: 300, step: 5, def: 30, unit: "m", label: { he: "אורך הכבל", en: "Cable length" }, show: s => s.pen === "ok" },
      { key: "area", type: "enum", def: 2.5, label: { he: "חתך מוליך (פאזה = PE), ממ\"ר", en: "Conductor size (line = PE), mm²" }, values: [1.5, 2.5, 4, 6, 10].map(v => ({ v, label: String(v) })), show: s => s.pen === "ok" },
      Object.assign(C.MCB("C16", ["B16", "C16", "C32", "D16"]), { show: s => s.pen === "ok" }),
      C.SKIN
    ],
    render(svg, s, ctx) {
      const M = ctx.model, broken = s.pen === "broken";
      const r = broken ? M.brokenPEN3({ I: [s.i1, s.i2, s.i3], Ra: s.earth ? 10 : null, skin: s.skin })
        : M.tn({ L: s.len, A_ph: s.area, A_pe: s.area, mcb: s.mcb, fault: s.fault, skin: s.skin, person: true });
      const tripped = !broken && !!(r.trip && r.trip.status === "yes");
      const g = svg.append("g"); const floor = 470, Lk = ["L1", "L2", "L3"];
      S.ground(g, 0, 960, floor, { h: 70 });
      const sup = C.supply3(g, { sys: "TN", earthY: 300, x1: 250 }), ys = sup.ys;
      S.wire(g, [[sup.star[0], 378], [sup.star[0], floor]], "gen", "w-thin");
      // PEN break between the network and the building
      if (broken) { g.append("path").attr("class", "sym").attr("d", `M210 ${ys.N - 14} l24 28 M234 ${ys.N - 14} l-24 28`).style("stroke", "var(--bad)").style("stroke-width", 5); S.badge(g, 222, ys.N + 42, ctx.L({ he: "PEN קטוע", en: "PEN broken" }), "danger"); }
      // main board: PEN split, 3-pole MCB
      g.append("rect").attr("x", 250).attr("y", 36).attr("width", 150).attr("height", 160).attr("rx", 6).attr("fill", "none").attr("stroke", "var(--stage-soft)").attr("stroke-dasharray", "6 5");
      S.text(g, 325, 30, ctx.L({ he: "לוח ראשי", en: "Main board" }), "lbl-s");
      Lk.forEach(k => S.wire(g, [[250, ys[k]], [270, ys[k]]], k));
      S.mcb3(g, 270, Lk.map(k => ys[k]), { open: tripped, flash: tripped, label: broken ? null : s.mcb });
      S.wire(g, [[250, ys.N], [290, ys.N]], "PEN"); S.dot(g, 290, ys.N);
      S.wire(g, [[290, ys.N], [400, ys.N]], "N"); S.wire(g, [[290, ys.N], [290, ys.PE], [400, ys.PE]], "PE");
      S.text(g, 300, ys.PE + 26, ctx.L({ he: "פיצול PEN", en: "PEN split" }), "lbl-s", "start");
      if (broken && s.earth) { S.wire(g, [[372, ys.PE], [372, 300]], "PE", "w-thin"); S.resistor(g, 372, 300, { vertical: true, len: 36 }); S.math(g, 392, 318, "R_a", { anchor: "start", w: 40 }); S.wire(g, [[372, 336], [372, floor]], "gen", "w-thin"); }
      Lk.forEach(k => S.wire(g, [[330, ys[k]], [930, ys[k]]], k)); S.wire(g, [[400, ys.N], [930, ys.N]], "N"); S.wire(g, [[400, ys.PE], [930, ys.PE]], "PE");
      S.wireTag(g, 420, ys.PE, "PE"); S.wireTag(g, 420, ys.N, "N");
      // three-phase motor (balanced) + three single-phase appliances on L1/L2/L3
      Lk.forEach((k, i) => { S.dot(g, 450 + i * 14, ys[k]); S.wire(g, [[450 + i * 14, ys[k]], [450 + i * 14, 250]], k, "w-thin"); });
      S.dot(g, 506, ys.PE); S.wire(g, [[506, ys.PE], [506, 250]], "PE", "w-thin");
      const vAll = tripped ? 0 : broken ? r.Vcase : (s.fault ? r.Vcase : 0);
      S.appliance(g, 430, 250, 90, 110, { live: vAll > 50, warm: vAll > 0 });
      S.motor3(g, 475, 300, 24);
      const xs = [560, 680, 800], vload = broken ? r.loads : [230, 230, 230];
      xs.forEach((x, i) => {
        C.tap(g, x, ys, Lk[i], 250, true);
        S.appliance(g, x - 12, 250, 90, 110, { live: vAll > 50, warm: vAll > 0, label: `${i + 1}` });
        S.text(g, x + 33, 290, Lk[i], "lbl-s");
        if (!S.locked && broken) S.badge(g, x + 33, 390, `${PE.fmt(vload[i])} V`, vload[i] > 253 || vload[i] < 207 ? "danger" : "ok", "res");
      });
      if (!S.locked && (s.fault || broken)) S.math(g, 475, 410, `U_{\\text{case}} = ${PE.fmt(vAll)}\\,\\mathrm{V}`, { box: true, tone: vAll > 50 ? "danger" : vAll > 0 ? "warn" : "ok", w: 230, h: 36, cls: "res" });
      if (!broken && s.fault) C.bolt(g, xs[0] + 6, 280, .8);
      const lvl = (s.fault || broken) && !tripped ? C.lvl(r.body.zone) : 0;
      S.person(g, 920, floor, { s: 1.0, state: lvl, neutral: !(s.fault || broken), hand: [878, 320] });
      if (!broken && s.fault && !tripped) S.flow(g, [[sup.star[0] + 20, ys.L1], [xs[0], ys.L1], [xs[0], 280], [xs[0] + 32, 280], [xs[0] + 32, ys.PE], [290, ys.PE], [290, ys.N], [sup.star[0], ys.N]], r.If);
      if (tripped) S.badge(g, 300, 20, ctx.L({ he: "נותק!", en: "TRIPPED" }), "ok", "res");

      let meters, verdict;
      if (broken) {
        meters = [{ label: { he: "הזזת נקודת האפס", en: "Neutral shift" }, value: r.VN, unit: "V" },
          { label: { he: "מתח על הגופים", en: "Voltage on the cases" }, value: r.Vcase, unit: "V", tone: r.Vcase > 50 ? "bad" : "ok" },
          { label: { he: "מתח על מכשירים 1 / 2 / 3", en: "Voltage on appliances 1 / 2 / 3" }, value: r.loads.map(v => PE.fmt(v)).join(" / "), unit: "V", tone: Math.max(...r.loads) > 253 ? "bad" : "" },
          PE.kit.bodyMeter(r.body)];
        verdict = { tone: r.Vcase > 50 || Math.max(...r.loads) > 253 ? "danger" : "warn", trip: false, zone: r.body.zone,
          text: { he: `PEN קטוע ברשת תלת-פאזית: נקודת האפס של העומסים זזה ב-{{${PE.fmt(r.VN)} V}}. כל גופי מחלקה I (מחוברים ל-PE שהוא בעצם האפס) עולים ל-{{${PE.fmt(r.Vcase)} V}}, ומכשירים על הפאזה העמוסה פחות מקבלים עד {{${PE.fmt(Math.max(...r.loads))} V}} – סכנת חשמול ונזק לציוד. אף מפסק לא רואה זאת.`,
            en: `Broken PEN on a three-phase supply: the loads' neutral point shifts by {{${PE.fmt(r.VN)} V}}. Every class I case (on the PE, which is now the shifted neutral) rises to {{${PE.fmt(r.Vcase)} V}}, and appliances on the lightly loaded phases see up to {{${PE.fmt(Math.max(...r.loads))} V}} – shock risk and equipment damage. No device sees it.` },
          sub: { he: "השוו עומסים שווים על שלוש הפאזות (אין הזזה) לעומס על פאזה אחת.", en: "Compare equal loads on all three phases (no shift) with a load on one phase only." } };
      } else {
        meters = [{ label: "$Z_s$", value: r.Zs, unit: "Ω" }, { label: { he: "זרם תקלה", en: "Fault current" }, value: s.fault ? r.If : 0, unit: "A" },
          { label: "$I_a$", value: M.mcbInstant(s.mcb), unit: "A" }, { label: { he: "מתח על גוף מכשיר 3", en: "Voltage on case 3" }, value: vAll, unit: "V", tone: vAll > 50 ? "bad" : "ok" }, PE.kit.bodyMeter(r.body)];
        if (!s.fault) verdict = { tone: "safe", text: { he: "אין תקלה. הפעילו תקלה או נתקו את ה-PEN.", en: "No fault. Switch on a fault or break the PEN." } };
        else if (tripped) verdict = { tone: "safe", trip: true, zone: r.body.zone, text: { he: `זרם התקלה {{${PE.fmt(r.If)} A}} ≥ $I_a$ = {{${PE.fmt(M.mcbInstant(s.mcb))} A}} – המאמ"ת התלת-קוטבי מנתק מיידית. כך עובד איפוס: התקלה הופכת לקצר מבוקר.`, en: `Fault current {{${PE.fmt(r.If)} A}} ≥ $I_a$ = {{${PE.fmt(M.mcbInstant(s.mcb))} A}} – the 3-pole MCB trips instantly. That is how TN works: the fault becomes a controlled short circuit.` },
          sub: { he: `בדיקה: $Z_s I_a = ${PE.fmt(r.cond.value)}\\,\\mathrm{V} \\le 230\\,\\mathrm{V}$ ✓. כל גופי המכשירים על אותו PE עלו לרגע ל-{{${PE.fmt(r.Vcase)} V}}.`, en: `Check: $Z_s I_a = ${PE.fmt(r.cond.value)}\\,\\mathrm{V} \\le 230\\,\\mathrm{V}$ ✓. Every case on the same PE rose briefly to {{${PE.fmt(r.Vcase)} V}}.` } };
        else verdict = { tone: "danger", trip: false, zone: r.body.zone, text: { he: `זרם התקלה {{${PE.fmt(r.If)} A}} קטן מ-$I_a$. ${r.trip ? "המאמ\"ת ינתק רק תרמית – מאוחר מדי." : "המאמ\"ת לא ינתק."} כל הגופים על ה-PE נשארים ב-{{${PE.fmt(r.Vcase)} V}}.`, en: `Fault current {{${PE.fmt(r.If)} A}} is below $I_a$. ${r.trip ? "The MCB only trips thermally – too late." : "The MCB will not trip."} Every case on the PE stays at {{${PE.fmt(r.Vcase)} V}}.` },
          sub: { he: `$Z_s I_a = ${PE.fmt(r.cond.value)}\\,\\mathrm{V} > 230\\,\\mathrm{V}$ ✗ – קצרו את הכבל, הגדילו חתך, או הוסיפו פחת.`, en: `$Z_s I_a = ${PE.fmt(r.cond.value)}\\,\\mathrm{V} > 230\\,\\mathrm{V}$ ✗ – shorten the cable, increase the size, or add an RCD.` } };
      }
      return { meters, verdict };
    }
  };
})();
