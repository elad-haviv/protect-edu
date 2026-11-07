/* B2 – TT system: protective earthing with or without an RCD. */
(function () {
  "use strict";
  const S = PE.sym, C = PE.simc;
  PE.sims["b-tt"] = {
    title: { he: "סימולטור הארקת הגנה (TT)", en: "Protective earthing simulator (TT)" },
    params: [
      { key: "fault", type: "bool", def: true, label: { he: "תקלה: הפאזה נוגעת בגוף המכשיר", en: "Fault: line touches the metal case" } },
      { key: "earthed", type: "bool", def: true, label: { he: "הגוף מחובר להארקה (PE)", en: "Case connected to earth (PE)" } },
      { key: "ra", type: "range", min: 1, max: 200, step: 1, def: 10, unit: "Ω", label: { he: "התנגדות אלקטרודת ההארקה Ra", en: "Earth electrode resistance Ra" }, show: s => s.earthed },
      C.RCD(0), C.MCB("C16", ["B16", "C16", "C32"]), C.SKIN,
      { key: "person", type: "bool", def: true, label: { he: "אדם נוגע בגוף המכשיר", en: "A person touches the case" } }
    ],
    render(svg, s, ctx) {
      const M = ctx.model;
      const r = M.tt({ Ra: s.ra, earthed: s.earthed, rcd_mA: s.rcd || null, mcb: s.mcb, person: s.person, skin: s.skin, fault: s.fault });
      const tripped = !!(r.trip && r.trip.status === "yes");
      const g = svg.append("g");
      const floor = 450;
      S.ground(g, 0, 960, floor, { h: 100 });
      S.text(g, 950, floor + 90, ctx.L({ he: "אדמה", en: "Soil" }), "lbl-s", "end");
      const sup = C.supply3(g, { sys: "TT", earthY: 300, x1: 200 }), ys = sup.ys, Lk = ["L1", "L2", "L3"];
      S.wire(g, [[sup.star[0], 378], [sup.star[0], floor]], "gen", "w-thin");
      // 3-pole MCB, optional 4-pole RCD
      S.mcb3(g, 200, Lk.map(k => ys[k]), { open: tripped && r.trip.by === "mcb", flash: tripped && r.trip.by === "mcb", label: s.mcb });
      S.wire(g, [[200, ys.N], [260, ys.N]], "N");
      let xa = 260;
      if (s.rcd) {
        Lk.forEach(k => S.wire(g, [[260, ys[k]], [290, ys[k]]], k)); S.wire(g, [[260, ys.N], [290, ys.N]], "N");
        S.rcd4(g, 290, [ys.L1, ys.L2, ys.L3, ys.N], { open: tripped && r.trip.by === "rcd", flash: tripped && r.trip.by === "rcd", label: `RCD ${s.rcd} mA` });
        xa = 400;
      }
      Lk.forEach(k => S.wire(g, [[xa, ys[k]], [600, ys[k]]], k)); S.wire(g, [[xa, ys.N], [600, ys.N]], "N");
      // three-phase pump: case with motor symbol
      const ax = 560, ay = 200, aw = 190, ah = 150;
      const live = s.fault && !tripped && r.Vcase > 50, warm = s.fault && !tripped && r.Vcase > 0;
      Lk.forEach((k, i) => S.wire(g, [[600 + i * 30, ys[k]], [600 + i * 30, ay + 30]], k, "w-thin"));
      Lk.forEach((k, i) => S.dot(g, 600 + i * 30, ys[k]));
      S.appliance(g, ax, ay, aw, ah, { live, warm, label: ctx.L({ he: "משאבה תלת-פאזית", en: "Three-phase pump" }) });
      S.motor3(g, ax + 70, ay + 65, 30);
      if (s.fault) C.bolt(g, ax + 145, ay + 40, .8);
      // PE and earth electrode
      const peX = ax + 160;
      if (s.earthed) {
        S.wire(g, [[peX, ay + ah], [peX, 380]], "PE");
        S.wireTag(g, peX + 32, 368, "PE");
        S.resistor(g, peX, 380, { vertical: true, len: 40 });
        S.math(g, peX + 22, 400, `R_a = ${s.ra}\\,\\Omega`, { anchor: "start", w: 160 });
        S.wire(g, [[peX, 420], [peX, floor]], "gen", "w-thin");
        g.append("path").attr("d", `M${peX - 5} ${floor} v70 l5 12 l5 -12 v-70`).attr("fill", "#7d858c");
      } else S.badge(g, peX, ay + ah + 40, ctx.L({ he: "אין הארקה", en: "No earth" }), "danger");
      const lvl = s.person && s.fault ? C.lvl(r.body.zone) : 0;
      if (s.person) S.person(g, 880, floor, { s: 1.15, state: lvl, neutral: !s.fault, hand: [ax + aw + 2, 280] });
      if (s.fault && !tripped) {
        if (s.earthed) S.flow(g, [[sup.star[0] + 20, ys.L1], [600, ys.L1], [600, ay + 40], [peX, ay + 40], [peX, floor + 60], [sup.star[0], floor + 60], [sup.star[0], 378]], r.If);
        if (s.person && r.body.I_mA > 0) S.flow(g, [[ax + aw + 2, 280], [870, 300], [880, floor - 4], [880, floor + 30], [sup.star[0] + 10, floor + 30]], r.body.I_mA / 1000, { body: true });
      }
      if (s.fault && !S.locked) S.math(g, 450, ay + 60, `U_t = ${PE.fmt(tripped ? 0 : r.Vcase)}\\,\\mathrm{V}`, { box: true, tone: r.Vcase > 50 && !tripped ? "danger" : "ok", w: 200, h: 36, cls: "res" });
      if (tripped) S.badge(g, r.trip.by === "rcd" ? 345 : 230, 30, ctx.L({ he: "נותק!", en: "TRIPPED" }), "ok", "res");

      const meters = [
        { label: { he: "זרם תקלה", en: "Fault current" }, value: s.fault ? r.If : 0, unit: "A" },
        { label: { he: "מתח מגע (גוף–אדמה)", en: "Touch voltage (case–earth)" }, value: s.fault ? r.Vcase : 0, unit: "V", tone: r.Vcase > 50 ? "bad" : "ok" },
        { label: { he: "ניתוק", en: "Disconnection" }, value: tripped ? r.trip.t_ms : r.trip && r.trip.status === "slow" ? ctx.L({ he: "איטי", en: "slow" }) : "—", unit: tripped ? "ms" : "", tone: tripped ? "ok" : s.fault ? "bad" : "" },
      ];
      if (s.person) meters.push(PE.kit.bodyMeter(r.body));
      let verdict;
      if (!s.fault) verdict = { tone: "safe", text: { he: "אין תקלה – גוף המכשיר ללא מתח. הפעילו תקלה.", en: "No fault – the case carries no voltage. Switch on a fault." } };
      else if (tripped && r.trip.t_ms <= r.required_ms) verdict = { tone: "safe", trip: true, zone: s.person ? r.body.zone : null, text: C.tripText(r.trip), sub: { he: `נדרש ניתוק תוך {{${r.required_ms} ms}} במעגל סופי (IEC 60364-4-41 – לאמת מול התקנות).`, en: `Required within {{${r.required_ms} ms}} for a final circuit (IEC 60364-4-41 – verify against the regulations).` } };
      else if (r.Vcase <= 50) verdict = { tone: "warn", trip: false, zone: s.person ? r.body.zone : null, text: { he: `מתח המגע {{${PE.fmt(r.Vcase)} V}} אינו עולה על {{50 V}}, אך התקלה נשארת. יש לתקן.`, en: `Touch voltage {{${PE.fmt(r.Vcase)} V}} is within {{50 V}}, but the fault stays. Repair it.` } };
      else verdict = { tone: "danger", trip: false, zone: s.person ? r.body.zone : null,
        text: s.earthed ? { he: `הגוף נשאר ב-{{${PE.fmt(r.Vcase)} V}} ו${r.trip ? "המאמ\"ת ינתק רק לאחר זמן רב" : "אין ניתוק"}. הארקה לבדה לא הספיקה.`, en: `The case stays at {{${PE.fmt(r.Vcase)} V}} and ${r.trip ? "the MCB only trips after a long time" : "nothing disconnects"}. Earthing alone was not enough.` }
          : { he: "הגוף במתח הפאזה ואין דרך לזרם התקלה – רק דרך גוף האדם.", en: "The case is at line voltage and the only path for fault current is through the person." },
        sub: s.person ? C.bodyLine(r.body) : null };
      const note = s.rcd ? { he: `תנאי: {{Ra·IΔn = ${PE.fmt(s.earthed ? s.ra * s.rcd / 1000 : Infinity)} V ≤ 50 V}} ${r.cond.ok ? "✓" : "✗"}`, en: `Condition: {{Ra·IΔn = ${PE.fmt(s.earthed ? s.ra * s.rcd / 1000 : Infinity)} V ≤ 50 V}} ${r.cond.ok ? "✓" : "✗"}` }
        : { he: `ללא פחת המאמ"ת צריך {{${PE.fmt(M.mcbInstant(s.mcb))} A}} לניתוק מיידי; זרם התקלה {{${PE.fmt(r.If)} A}}.`, en: `Without an RCD the MCB needs {{${PE.fmt(M.mcbInstant(s.mcb))} A}} to trip instantly; the fault current is {{${PE.fmt(r.If)} A}}.` };
      return { meters, verdict, note: s.fault && !PE.sym.locked ? note : null };
    }
  };
})();
