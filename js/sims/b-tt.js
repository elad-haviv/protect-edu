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
      const yL = 110, yN = 165, floor = 440;
      S.ground(g, 0, 960, floor, { h: 100 });
      S.text(g, 950, floor + 90, ctx.L({ he: "אדמה", en: "Soil" }), "lbl-s", "end");
      const sup = C.supply(g, 70, yL, yN, { earthY: 300 });
      S.wire(g, [[122, 300 + 78], [122, floor]], "gen", "w-thin");
      // MCB on L, optional RCD on L+N
      S.wire(g, [sup.L, [190, yL]], "L"); S.wire(g, [sup.N, [190, yN]], "N");
      S.mcb(g, 190, yL, { open: tripped && r.trip.by === "mcb", flash: tripped && r.trip.by === "mcb", label: s.mcb });
      S.wire(g, [[190, yN], [250, yN]], "N");
      if (s.rcd) { S.rcd(g, 280, yL, yN, { open: tripped && r.trip.by === "rcd", flash: tripped && r.trip.by === "rcd", label: `RCD ${s.rcd} mA` }); S.wire(g, [[250, yL], [280, yL]], "L"); S.wire(g, [[250, yN], [280, yN]], "N"); }
      S.wire(g, [[s.rcd ? 390 : 250, yL], [560, yL]], "L"); S.wire(g, [[s.rcd ? 390 : 250, yN], [560, yN]], "N");
      S.wireTag(g, 470, yL - 22, "L"); S.wireTag(g, 470, yN + 22, "N");
      // appliance
      const ax = 560, ay = 70, aw = 170, ah = 230;
      const live = s.fault && !tripped && r.Vcase > 50, warm = s.fault && !tripped && r.Vcase > 0;
      S.appliance(g, ax, ay, aw, ah, { live, warm, label: ctx.L({ he: "מכונת כביסה", en: "Washing machine" }) });
      g.append("circle").attr("cx", ax + aw / 2).attr("cy", ay + 100).attr("r", 44).attr("class", "sym-fill");
      g.append("circle").attr("cx", ax + aw / 2).attr("cy", ay + 100).attr("r", 30).attr("class", "sym");
      S.wire(g, [[560, yL], [ax + 30, yL]], "L", "w-thin"); S.wire(g, [[560, yN], [ax + 30, yN]], "N", "w-thin");
      g.append("rect").attr("x", ax + 22).attr("y", yL - 12).attr("width", 34).attr("height", yN - yL + 24).attr("rx", 4).attr("class", "sym-fill");
      S.text(g, ax + 39, (yL + yN) / 2 + 5, "M", "sym-txt");
      if (s.fault) { C.bolt(g, ax + 10, yL + 2, .8); }
      // PE and earth electrode
      const peX = ax + 60;
      if (s.earthed) {
        S.wire(g, [[peX, ay + ah], [peX, 380]], "PE");
        S.wireTag(g, peX + 32, 335, "PE");
        S.resistor(g, peX, 380, { vertical: true, len: 40, label: `Ra = ${s.ra} Ω` });
        S.wire(g, [[peX, 420], [peX, floor]], "gen", "w-thin");
        g.append("path").attr("d", `M${peX - 5} ${floor} v70 l5 12 l5 -12 v-70`).attr("fill", "#7d858c");   // earth rod
      } else {
        S.badge(g, peX, ay + ah + 40, ctx.L({ he: "אין הארקה", en: "No earth" }), "danger");
      }
      // person touching the case
      const lvl = s.person && s.fault ? C.lvl(r.body.zone) : 0;
      if (s.person) S.person(g, 840, floor, { s: 1.15, state: lvl, neutral: !s.fault, hand: [ax + aw + 2, 200] });
      // flows (current path while the fault persists)
      if (s.fault && !tripped) {
        if (s.earthed) S.flow(g, [[122, yL], [190, yL], [ax + 10, yL], [ax + 10, ay + ah - 10], [peX, ay + ah - 10], [peX, floor + 60], [122, floor + 60], [122, 378]], r.If);
        if (s.person && r.body.I_mA > 0) S.flow(g, [[ax + aw + 2, 200], [830, 230], [840, floor - 4], [840, floor + 30], [130, floor + 30]], r.body.I_mA / 1000, { body: true });
      }
      // badges
      if (s.fault) S.badge(g, ax + aw / 2, ay - 26, `U = ${PE.fmt(tripped ? 0 : r.Vcase)} V`, r.Vcase > 50 && !tripped ? "danger" : "ok", "res");
      if (tripped) S.badge(g, r.trip.by === "rcd" ? 335 : 220, 52, ctx.L({ he: "נותק!", en: "TRIPPED" }), "ok", "res");

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
