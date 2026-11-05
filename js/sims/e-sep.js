/* E2 – Electrical separation (isolating transformer). */
(function () {
  "use strict";
  const S = PE.sym, C = PE.simc;
  PE.sims["e-sep"] = {
    title: { he: "סימולטור שנאי הפרדה", en: "Isolating transformer simulator" },
    params: [
      { key: "isolated", type: "bool", def: true, label: { he: "המכשיר מוזן דרך שנאי הפרדה", en: "Appliance fed through an isolating transformer" } },
      { key: "touch", type: "enum", def: "one", label: { he: "האדם נוגע ב-", en: "The person touches" }, values: [{ v: "one", label: { he: "מוליך אחד", en: "One conductor" } }, { v: "two", label: { he: "שני המוליכים", en: "Both conductors" } }], show: s => !s.dual },
      { key: "firstFault", type: "bool", def: false, label: { he: "תקלה ראשונה: המוליך השני נגע באדמה", en: "First fault: the other conductor touched earth" }, show: s => s.isolated && !s.dual && s.touch === "one" },
      { key: "len", type: "range", min: 5, max: 800, step: 5, def: 20, unit: "m", label: { he: "אורך הכבל במעגל המשני", en: "Secondary cable length" }, show: s => s.isolated && !s.dual },
      { key: "dual", type: "bool", def: false, label: { he: "שני מכשירים, תקלות בקטבים שונים", en: "Two appliances, faults on different poles" }, show: s => s.isolated },
      { key: "bond", type: "bool", def: true, label: { he: "מוליך השוואת פוטנציאלים לא מוארק בין הגופים", en: "Unearthed bonding conductor between the cases" }, show: s => s.isolated && s.dual },
      C.SKIN
    ],
    render(svg, s, ctx) {
      const M = ctx.model;
      const r = M.separation({ isolated: s.isolated, touch: s.dual ? "one" : s.touch, firstFault: s.firstFault, len: s.len, dual: s.isolated && s.dual, bond: s.bond, skin: s.skin });
      const g = svg.append("g"); const floor = 450, y1 = 120, y2 = 200;
      S.ground(g, 0, 960, floor, { h: 90 });
      const sup = C.supply(g, 60, y1, y2, { earthY: 300 });
      S.wire(g, [[112, 378], [112, floor]], "gen", "w-thin");
      const lvl = C.lvl(r.body.zone);
      if (s.isolated) {
        S.wire(g, [sup.L, [250, y1]], "L"); S.wire(g, [sup.N, [250, y2]], "N");
        g.append("rect").attr("x", 250).attr("y", 90).attr("width", 130).attr("height", 140).attr("rx", 10).attr("class", "sym-fill");
        S.transformer(g, 315, 160, { r: 26, safety: false });
        S.text(g, 315, 82, ctx.L({ he: "שנאי הפרדה 1:1", en: "Isolating transformer 1:1" }), "lbl-s");
        S.wire(g, [[380, y1], [560, y1]], "gen"); S.wire(g, [[380, y2], [560, y2]], "gen");
        S.text(g, 470, y1 - 14, "a", "lbl-b"); S.text(g, 470, y2 + 30, "b", "lbl-b");
        S.text(g, 470, 262, ctx.L({ he: "מעגל משני – לא מוארק", en: "Secondary – not earthed" }), "lbl-s");
      } else {
        S.wire(g, [sup.L, [560, y1]], "L"); S.wire(g, [sup.N, [560, y2]], "N");
        S.wireTag(g, 470, y1 - 22, "L"); S.wireTag(g, 470, y2 + 22, "N");
      }
      if (s.isolated && s.dual) {
        [[600, "a"], [760, "b"]].forEach(([x, pole], i) => {
          S.wire(g, [[x + 20, y1], [x + 20, 280]], "gen", "w-thin"); S.wire(g, [[x + 60, y2], [x + 60, 280]], "gen", "w-thin"); S.dot(g, x + 20, y1); S.dot(g, x + 60, y2);
          S.appliance(g, x, 280, 110, 90, { live: !s.bond, label: `${i + 1}` });
          C.bolt(g, pole === "a" ? x + 20 : x + 60, 300, .7);
        });
        S.wire(g, [[560, y1], [880, y1]], "gen"); S.wire(g, [[560, y2], [880, y2]], "gen");
        if (s.bond) { S.wire(g, [[655, 370], [655, 395], [815, 395], [815, 370]], "gen", "w-thin"); S.text(g, 735, 418, ctx.L({ he: "חיבור השוואה (לא מוארק)", en: "Bond (not earthed)" }), "lbl-s"); }
        S.person(g, 735, floor, { s: .9, state: lvl, hand: [700, 330], hand2: [770, 330] });
        if (!s.bond) S.flow(g, [[700, 330], [735, 360], [770, 330]], r.body.I_mA / 1000, { body: true });
        else S.badge(g, 735, 250, ctx.L({ he: "קצר בין a ל-b ← המאמ\"ת מנתק", en: "a–b short → MCB trips" }), "ok", "res");
      } else {
        S.appliance(g, 560, 80, 160, 150, { label: ctx.L({ he: "כלי עבודה", en: "Power tool" }) });
        // exposed points
        const tapA = [640, 300], tapB = [700, 300];
        S.wire(g, [[600, y1], [600, 255], [640, 270], tapA], s.isolated ? "gen" : "L", "w-thin");
        g.append("circle").attr("cx", tapA[0]).attr("cy", tapA[1]).attr("r", 6).attr("fill", "var(--sign-yellow)").attr("stroke", "#000");
        if (s.touch === "two") { S.wire(g, [[690, y2], [690, 255], tapB], s.isolated ? "gen" : "N", "w-thin"); g.append("circle").attr("cx", tapB[0]).attr("cy", tapB[1]).attr("r", 6).attr("fill", "var(--sign-yellow)").attr("stroke", "#000"); }
        if (s.isolated && s.firstFault) { S.wire(g, [[380, y2], [420, y2], [420, floor]], "gen", "w-thin"); C.bolt(g, 420, 330, .7); S.badge(g, 420, 290, ctx.L({ he: "תקלה ראשונה", en: "First fault" }), "warn"); }
        S.person(g, 690, floor, { s: 1.1, state: lvl, hand: [tapA[0] + 4, tapA[1] + 2], hand2: s.touch === "two" ? [tapB[0] + 2, tapB[1] + 4] : undefined });
        if (r.body.I_mA > 1) {
          if (s.touch === "two") S.flow(g, [tapA, [690, 340], tapB], r.body.I_mA / 1000, { body: true });
          else S.flow(g, [tapA, [690, 340], [690, floor + 30], [s.isolated ? 420 : 112, floor + 30], [s.isolated ? 420 : 112, s.isolated ? floor : 378]], r.body.I_mA / 1000, { body: true });
        } else if (s.isolated) S.badge(g, 560, floor - 30, ctx.L({ he: "אין מסלול חזרה", en: "No return path" }), "ok", "res");
      }
      const meters = [PE.kit.bodyMeter(r.body), { label: { he: "מתח מגע", en: "Touch voltage" }, value: r.Ut, unit: "V", tone: r.Ut > 50 ? "bad" : "ok" }];
      if (s.isolated && !s.dual) meters.push({ label: { he: "מתח × אורך", en: "Voltage × length" }, value: r.Vm, unit: "V·m", tone: r.Vm > 100000 ? "bad" : "" });
      let verdict;
      const zone = r.body.zone, sub = C.bodyLine(r.body);
      if (s.isolated && s.dual) verdict = s.bond ? { tone: "safe", trip: true, text: { he: "מוליך ההשוואה יוצר קצר בין הקטבים ברגע התקלה השנייה – המאמ\"ת מנתק, ואין הפרש מתח בין הגופים.", en: "The bonding conductor turns the second fault into a short between poles – the MCB trips, and there is no voltage between the cases." } }
        : { tone: "danger", trip: false, zone, text: { he: "שתי תקלות בקטבים שונים: בין שני הגופים יש {{230 V}}, ואדם שנוגע בשניהם סוגר מעגל.", en: "Two faults on different poles: there is {{230 V}} between the cases, and a person touching both closes the circuit." }, sub };
      else if (!s.isolated) verdict = { tone: "danger", zone, text: { he: "בלי הפרדה: נקודת האפס של הרשת מוארקת, והזרם חוזר דרך האדם והאדמה.", en: "Without separation: the supply star point is earthed, so current returns through the person and the soil." }, sub };
      else if (s.touch === "two") verdict = { tone: "danger", zone, text: { he: "נגיעה בשני המוליכים סוגרת מעגל דרך הגוף – הפרדה לא מגינה במקרה זה.", en: "Touching both conductors closes a circuit through the body – separation does not protect here." }, sub };
      else if (s.firstFault) verdict = { tone: "danger", zone, text: { he: "אחרי תקלה ראשונה לאדמה, המעגל המשני כבר \"מוארק\" – ונגיעה במוליך השני מסוכנת כמו ברשת רגילה. לכן אסור להאריק את המעגל המשני.", en: "After a first fault to earth, the secondary is effectively earthed – touching the other conductor is as dangerous as on the mains. This is why the secondary must not be earthed." }, sub };
      else if (r.body.I_mA > 10) verdict = { tone: "danger", zone, text: { he: "הכבל ארוך מדי: הקיבול לאדמה סוגר מעגל.", en: "The cable is too long: its capacitance to earth closes the circuit." }, sub };
      else verdict = { tone: r.warnings.length ? "warn" : "safe", zone, text: { he: `אין מסלול חזרה מלבד בידוד וקיבול הכבל – רק {{${PE.fmt(r.body.I_mA)} mA}}.`, en: `No return path except the cable's insulation and capacitance – only {{${PE.fmt(r.body.I_mA)} mA}}.` },
        sub: r.warnings.length ? { he: "חריגה מהמגבלה המקובלת: {{U·L ≤ 100,000 V·m}} ו-{{L ≤ 500 m}} (IEC 60364-4-41 – לאמת).", en: "Exceeds the usual limit: {{U·L ≤ 100,000 V·m}} and {{L ≤ 500 m}} (IEC 60364-4-41 – verify)." } : null };
      return { meters, verdict };
    }
  };
})();
