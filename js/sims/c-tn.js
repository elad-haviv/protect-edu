/* C2 – TN-C-S system (איפוס): fault loop through the PE, and the broken PEN. */
(function () {
  "use strict";
  const S = PE.sym, C = PE.simc;
  PE.sims["c-tn"] = {
    title: { he: "סימולטור איפוס (TN-C-S)", en: "Protective neutralization simulator (TN-C-S)" },
    params: [
      { key: "fault", type: "bool", def: true, label: { he: "תקלה: פאזה נוגעת בגוף מכשיר 1", en: "Fault: line touches the case of appliance 1" } },
      { key: "pen", type: "enum", def: "ok", label: { he: "מוליך ה-PEN ברשת", en: "Supply PEN conductor" }, values: [{ v: "ok", label: { he: "תקין", en: "Intact" } }, { v: "broken", label: { he: "קטוע", en: "Broken" } }] },
      { key: "len", type: "range", min: 5, max: 300, step: 5, def: 30, unit: "m", label: { he: "אורך הכבל", en: "Cable length" } },
      { key: "area", type: "enum", def: 2.5, label: { he: "חתך מוליך (פאזה = PE), ממ\"ר", en: "Conductor size (line = PE), mm²" }, values: [1.5, 2.5, 4, 6, 10].map(v => ({ v, label: String(v) })) },
      C.MCB("C16", ["B16", "C16", "C32", "D16"]),
      { key: "earth", type: "bool", def: true, label: { he: "הארקת יסוד במבנה (Ra = 10 Ω)", en: "Foundation earth at the building (Ra = 10 Ω)" }, show: s => s.pen === "broken" },
      C.SKIN
    ],
    render(svg, s, ctx) {
      const M = ctx.model;
      const r = M.tn({ L: s.len, A_ph: s.area, A_pe: s.area, mcb: s.mcb, pen: s.pen, fault: s.fault, Ra: s.earth ? 10 : null, skin: s.skin, person: true });
      const tripped = !!(r.trip && r.trip.status === "yes");
      const g = svg.append("g");
      const yL = 100, yN = 160, yPE = 215, floor = 450;
      S.ground(g, 0, 960, floor, { h: 90 });
      // supply with PEN
      const sup = C.supply(g, 60, yL, yN + 30, { pen: true, earthY: 300 });
      S.wire(g, [[112, 378], [112, floor]], "gen", "w-thin");
      S.wire(g, [sup.L, [250, yL]], "L");
      const penBreak = s.pen === "broken";
      S.wire(g, [sup.N, [160, yN + 30]], "PEN"); S.wire(g, [[200, yN + 30], [250, yN + 30]], "PEN");
      if (penBreak) { g.append("path").attr("class", "sym").attr("d", "M168 176 l24 28 M192 176 l-24 28").style("stroke", "var(--bad)").style("stroke-width", 5); S.badge(g, 180, 245, ctx.L({ he: "PEN קטוע", en: "PEN broken" }), "danger"); }
      else S.wire(g, [[160, yN + 30], [200, yN + 30]], "PEN");
      S.wireTag(g, 205, yN + 4, "PEN");
      // main board: PEN split into N and PE at the MET
      g.append("rect").attr("x", 250).attr("y", 60).attr("width", 150).attr("height", 200).attr("rx", 8).attr("fill", "none").attr("stroke", "var(--stage-soft)").attr("stroke-dasharray", "6 5");
      S.text(g, 325, 52, ctx.L({ he: "לוח ראשי", en: "Main board" }), "lbl-s");
      S.wire(g, [[250, yN + 30], [290, yN + 30]], "PEN");
      S.dot(g, 290, yN + 30);
      S.wire(g, [[290, yN + 30], [290, yN], [330, yN]], "N"); S.wire(g, [[290, yN + 30], [290, yPE], [330, yPE]], "PE");
      S.text(g, 300, yPE + 30, ctx.L({ he: "פיצול PEN", en: "PEN split" }), "lbl-s", "start");
      if (s.earth) { S.wire(g, [[290, yPE], [290, 330]], "PE", "w-thin"); S.resistor(g, 290, 330, { vertical: true, len: 36, label: "Ra" }); S.wire(g, [[290, 366], [290, floor]], "gen", "w-thin"); }
      S.wire(g, [[250, yL], [262, yL]], "L"); S.mcb(g, 262, yL, { open: tripped, flash: tripped, label: s.mcb });
      S.wire(g, [[322, yL], [900, yL]], "L"); S.wire(g, [[330, yN], [900, yN]], "N"); S.wire(g, [[330, yPE], [900, yPE]], "PE");
      S.wireTag(g, 440, yL - 22, "L"); S.wireTag(g, 440, yN - 22, "N"); S.wireTag(g, 440, yPE + 24, "PE");
      S.text(g, 560, 46, ctx.L({ he: "כבל", en: "Cable" }), "lbl-s", "end");
      S.text(g, 570, 46, `${s.len} m · ${s.area} mm²`, "lbl-s", "start");
      // three class I appliances
      const xs = [480, 630, 780];
      xs.forEach((x, i) => {
        const v = r.cases[i] || 0;
        const hot = !tripped && v > 50, warm = !tripped && v > 0;
        S.wire(g, [[x + 20, yL], [x + 20, 270]], "L", "w-thin"); S.wire(g, [[x + 45, yN], [x + 45, 270]], "N", "w-thin"); S.wire(g, [[x + 80, yPE], [x + 80, 270]], "PE", "w-thin");
        S.dot(g, x + 20, yL); S.dot(g, x + 45, yN); S.dot(g, x + 80, yPE);
        S.appliance(g, x, 270, 110, 110, { live: hot, warm, label: `${i + 1}` });
        if (!S.locked && (s.fault || penBreak)) S.badge(g, x + 55, 405, `${PE.fmt(tripped ? 0 : v)} V`, hot ? "danger" : warm ? "warn" : "ok", "res");
      });
      if (s.fault) C.bolt(g, xs[0] + 20, 300, .8);
      // person touching the healthy appliance 3
      const lvl = (s.fault || penBreak) && !tripped ? C.lvl(r.body.zone) : 0;
      S.person(g, 920, floor, { s: 1.1, state: lvl, neutral: !(s.fault || penBreak), hand: [892, 330] });
      if (s.fault && !penBreak && !tripped) S.flow(g, [[112, yL], [xs[0] + 20, yL], [xs[0] + 20, 300], [xs[0] + 80, 300], [xs[0] + 80, yPE], [290, yPE], [290, yN + 30], [112, yN + 30]], r.If);
      if (tripped) S.badge(g, 292, 30, ctx.L({ he: "נותק!", en: "TRIPPED" }), "ok", "res");
      if (penBreak && s.fault) S.badge(g, xs[0] + 55, 250, ctx.L({ he: "אין מסלול חזרה", en: "No return path" }), "danger", "res");

      const meters = [
        { label: { he: "עכבת לולאה Zs", en: "Loop impedance Zs" }, value: penBreak ? "∞" : r.Zs, unit: "Ω" },
        { label: { he: "זרם תקלה", en: "Fault current" }, value: s.fault && !penBreak ? r.If : 0, unit: "A" },
        { label: { he: "סף ניתוק מיידי Ia", en: "Instant trip current Ia" }, value: M.mcbInstant(s.mcb), unit: "A" },
        { label: { he: "מתח על גוף מכשיר 3", en: "Voltage on case 3" }, value: tripped ? 0 : (r.cases[2] || 0), unit: "V", tone: !tripped && r.cases[2] > 50 ? "bad" : "ok" },
        PE.kit.bodyMeter(r.body)
      ];
      let verdict;
      if (penBreak) verdict = { tone: r.Vcase > 50 ? "danger" : "warn", trip: false, zone: r.body.zone,
        text: { he: `PEN קטוע: <b>כל</b> גופי המכשירים ממחלקה I מחוברים דרך העומס לפאזה – כ-{{${PE.fmt(r.Vcase)} V}}, גם בלי תקלה בבידוד. שום מפסק לא רואה זאת.`, en: `Broken PEN: <b>every</b> class I case is connected to the line through the load – about {{${PE.fmt(r.Vcase)} V}}, even with no insulation fault. No device can see it.` },
        sub: s.earth ? { he: "הארקת היסוד מקטינה את המתח (מחלק מתח), אבל לא מבטלת את הסכנה.", en: "The foundation earth lowers the voltage (a divider) but does not remove the danger." } : C.bodyLine(r.body) };
      else if (!s.fault) verdict = { tone: "safe", text: { he: "אין תקלה. הפעילו תקלה או נתקו את ה-PEN.", en: "No fault. Switch on a fault or break the PEN." } };
      else if (tripped) verdict = { tone: "safe", trip: true, zone: r.body.zone, text: { he: `זרם התקלה {{${PE.fmt(r.If)} A}} ≥ {{${PE.fmt(M.mcbInstant(s.mcb))} A}} – המאמ"ת מנתק מיידית. כך עובד איפוס: התקלה הופכת לקצר מבוקר.`, en: `Fault current {{${PE.fmt(r.If)} A}} ≥ {{${PE.fmt(M.mcbInstant(s.mcb))} A}} – the MCB trips instantly. That is how TN works: the fault becomes a controlled short circuit.` },
        sub: { he: `בדיקה: {{Zs·Ia = ${PE.fmt(r.cond.value)} V ≤ 230 V}} ✓. כל גופי המכשירים על אותו PE עלו לרגע ל-{{${PE.fmt(r.Vcase)} V}}.`, en: `Check: {{Zs·Ia = ${PE.fmt(r.cond.value)} V ≤ 230 V}} ✓. Every case on the same PE rose briefly to {{${PE.fmt(r.Vcase)} V}}.` } };
      else verdict = { tone: "danger", trip: false, zone: r.body.zone, text: { he: `זרם התקלה {{${PE.fmt(r.If)} A}} קטן מסף הניתוק המיידי {{${PE.fmt(M.mcbInstant(s.mcb))} A}}. ${r.trip ? "המאמ\"ת ינתק רק תרמית – מאוחר מדי." : "המאמ\"ת לא ינתק."} כל הגופים על ה-PE נשארים ב-{{${PE.fmt(r.Vcase)} V}}.`, en: `Fault current {{${PE.fmt(r.If)} A}} is below the instant-trip current {{${PE.fmt(M.mcbInstant(s.mcb))} A}}. ${r.trip ? "The MCB only trips thermally – too late." : "The MCB will not trip."} Every case on the PE stays at {{${PE.fmt(r.Vcase)} V}}.` },
        sub: { he: `{{Zs·Ia = ${PE.fmt(r.cond.value)} V > 230 V}} ✗ – קצרו את הכבל, הגדילו חתך, או הוסיפו פחת.`, en: `{{Zs·Ia = ${PE.fmt(r.cond.value)} V > 230 V}} ✗ – shorten the cable, increase the size, or add an RCD.` } };
      return { meters, verdict };
    }
  };
})();
