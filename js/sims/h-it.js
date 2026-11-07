/* 7.2 – Floating supply (זינה צפה, IT) on a three-phase network without neutral: first fault → alarm only; second fault on another phase → line-to-line short → disconnection. */
(function () {
  "use strict";
  const S = PE.sym, C = PE.simc;
  PE.sims["h-it"] = {
    title: { he: "סימולטור זינה צפה תלת-פאזית", en: "Three-phase floating supply simulator" },
    params: [
      { key: "fault1", type: "bool", def: false, label: { he: "תקלה ראשונה: L1 נוגע בגוף מנוע 1", en: "First fault: L1 touches the case of motor 1" } },
      { key: "rf", type: "range", min: 0, max: 200, step: 1, def: 0, unit: "kΩ", label: { he: "התנגדות התקלה הראשונה", en: "First fault resistance" }, show: s => s.fault1 },
      { key: "fault2", type: "bool", def: false, label: { he: "תקלה שנייה: L2 נוגע בגוף מנוע 2", en: "Second fault: L2 touches the case of motor 2" }, show: s => s.fault1 },
      { key: "imd", type: "bool", def: true, label: { he: "מכשיר השגחה על הבידוד מותקן", en: "Insulation monitoring device installed" } },
      { key: "touch", type: "enum", def: "case", label: { he: "האדם נוגע ב-", en: "The person touches" }, values: [{ v: "case", label: { he: "גוף מנוע 2", en: "Case of motor 2" } }, { v: "phase", label: { he: "מוליך L3 חשוף", en: "A bare L3 conductor" } }] },
      C.SKIN
    ],
    render(svg, s, ctx) {
      const M = ctx.model;
      const r = M.itSupply({ fault1: s.fault1, fault2: s.fault1 && s.fault2, Rf_k: s.rf, imd: s.imd, touch: s.touch, skin: s.skin });
      const tripped = !!(r.trip && r.trip.status === "yes"), Lk = ["L1", "L2", "L3"];
      const g = svg.append("g"); const floor = 470, yPE = 410;
      S.ground(g, 0, 960, floor, { h: 70 });
      const sup = C.supply3(g, { sys: "IT", x1: 280, label: ctx.L({ he: "שנאי מבדל", en: "Isolating transformer" }) }), ys = sup.ys;
      // insulation monitor between the three phases and earth
      if (s.imd) {
        const alarm = r.alarm && !S.locked;
        Lk.forEach((k, i) => { S.dot(g, 200 + i * 14, ys[k]); S.wire(g, [[200 + i * 14, ys[k]], [200 + i * 14, 220]], k, "w-thin"); });
        g.append("rect").attr("x", 160).attr("y", 220).attr("width", 120).attr("height", 80).attr("rx", 8).attr("class", "sym-fill");
        S.text(g, 220, 242, ctx.L({ he: "השגחה על בידוד", en: "Insulation monitor" }), "lbl-s").style("font-size", "13px");
        S.math(g, 212, 268, S.locked ? "R_{iso} = \\,?" : `R_{iso} = ${r.Riso_k >= 1000 ? ">1000" : PE.fmt(r.Riso_k)}\\,\\mathrm{k\\Omega}`, { w: 170, h: 26 });
        g.append("circle").attr("cx", 268).attr("cy", 288).attr("r", 8).attr("fill", alarm ? "var(--bad)" : "var(--ok)").attr("class", alarm ? "tripflash" : null);
        S.text(g, 220, 293, alarm ? ctx.L({ he: "התראה!", en: "ALARM" }) : ctx.L({ he: "תקין", en: "OK" }), "lbl-s").style("font-size", "12px").style("fill", alarm ? "var(--bad)" : "var(--ok)");
        S.wire(g, [[220, 300], [220, yPE]], "PE", "w-thin");
      }
      S.mcb3(g, 300, Lk.map(k => ys[k]), { open: tripped, flash: tripped, label: "C16" });
      Lk.forEach(k => S.wire(g, [[280, ys[k]], [300, ys[k]]], k)); Lk.forEach(k => S.wire(g, [[360, ys[k]], [930, ys[k]]], k));
      // two three-phase motors with PE to a common bar and local earth Ra
      const ax = [470, 650];
      ax.forEach((x, i) => {
        Lk.forEach((k, j) => { S.dot(g, x + 22 + j * 22, ys[k]); S.wire(g, [[x + 22 + j * 22, ys[k]], [x + 22 + j * 22, 250]], k, "w-thin"); });
        const v = r.stage >= 1 ? r.Ut : 0;
        S.appliance(g, x, 250, 120, 100, { warm: v > 1 && !tripped, live: v > 50 && !tripped });
        S.motor3(g, x + 60, 300, 26);
        S.wire(g, [[x + 100, 350], [x + 100, yPE]], "PE", "w-thin");
      });
      S.wire(g, [[220, yPE], [800, yPE]], "PE"); S.wireTag(g, 400, yPE - 18, "PE");
      S.resistor(g, 800, yPE, { len: 40 }); S.math(g, 820, yPE - 22, "R_a", { w: 40 }); S.wire(g, [[840, yPE], [860, yPE], [860, floor]], "gen", "w-thin");
      if (s.fault1) C.bolt(g, ax[0] + 22, 275, .7);
      if (s.fault1 && s.fault2) C.bolt(g, ax[1] + 44, 275, .7);
      const lvl = C.lvl(r.body.zone);
      if (s.touch === "case") S.person(g, 900, floor, { s: 1.0, state: lvl, hand: [ax[1] + 122, 300] });
      else { S.dot(g, 900, ys.L3); S.wire(g, [[900, ys.L3], [900, 300]], "L3", "w-thin"); g.append("circle").attr("cx", 900).attr("cy", 300).attr("r", 6).attr("fill", "var(--c-PE-y)").attr("stroke", "#000"); S.person(g, 920, floor, { s: 1.0, state: lvl, hand: [903, 303] }); }
      if (s.fault1 && !s.fault2) S.flow(g, [[ax[0] + 22, ys.L1], [ax[0] + 22, 275], [ax[0] + 100, 350], [ax[0] + 100, yPE]], r.If);
      if (s.fault1 && s.fault2 && !tripped) S.flow(g, [[ax[1] + 44, ys.L2], [ax[1] + 44, 275], [ax[1] + 100, yPE], [ax[0] + 100, yPE], [ax[0] + 22, 275], [ax[0] + 22, ys.L1]], r.If);
      if (tripped) S.badge(g, 330, 20, ctx.L({ he: "נותק!", en: "TRIPPED" }), "ok", "res");
      if (s.fault1 && !S.locked) S.math(g, ax[0] + 60, 228, `U_t = ${PE.fmt(r.Ut)}\\,\\mathrm{V}`, { box: true, tone: r.Ut > 50 ? "danger" : "ok", w: 170, h: 34, cls: "res" });

      const meters = [
        { label: "$R_{iso}$", value: r.Riso_k >= 1000 ? ">1000" : r.Riso_k, unit: "kΩ" },
        { label: { he: "זרם תקלה", en: "Fault current" }, value: r.stage === 2 ? r.If : r.Id_mA, unit: r.stage === 2 ? "A" : "mA" },
        { label: { he: "מתח על הגופים", en: "Voltage on the cases" }, value: tripped ? 0 : r.Ut, unit: "V", tone: r.Ut > 50 && !tripped ? "bad" : "ok" },
        PE.kit.bodyMeter(r.body)];
      let verdict;
      if (!s.fault1) verdict = s.touch === "phase" ? { tone: C.lvl(r.body.zone) >= 2 ? "danger" : "warn", zone: r.body.zone, text: { he: `הבידוד תקין: נגיעה בפאזה סוגרת מעגל דרך קיבול הרשת לאדמה – כ-{{${PE.fmt(r.body.I_mA)} mA}}. זינה צפה <b>אינה</b> הגנה מפני נגיעה בחלק חי; ברשת גדולה הזרם הקיבולי גדל.`, en: `Insulation healthy: touching a phase closes a circuit through the network's capacitance to earth – about {{${PE.fmt(r.body.I_mA)} mA}}. A floating supply is <b>not</b> protection against touching a live part; on a larger network the capacitive current grows.` } }
        : { tone: "safe", text: { he: "הבידוד תקין – אין זרם תקלה. הפעילו תקלה ראשונה.", en: "Insulation healthy – no fault current. Switch on a first fault." } };
      else if (s.fault2) verdict = tripped ? { tone: "safe", trip: true, zone: r.body.zone, text: { he: `תקלה שנייה בפאזה אחרת = קצר בין L1 ל-L2 דרך ה-PE, במתח שזור {{400 V}}: {{${PE.fmt(r.If)} A}}, והמאמ"ת מנתק.`, en: `A second fault on another phase = a short between L1 and L2 through the PE, at the line voltage {{400 V}}: {{${PE.fmt(r.If)} A}}, and the MCB trips.` }, sub: { he: `בדיקה (אפס לא מובל): $2\\,I_a Z_s \\le \\sqrt{3}\\,U_0$ – כאן $I_a Z_{loop} = ${PE.fmt(r.cond.value)}\\,\\mathrm{V} \\le ${PE.fmt(r.U)}\\,\\mathrm{V}$ ${r.cond.ok ? "✓" : "✗"}; ניתוק תוך {{${r.trip.t_ms} ms}} ${r.trip.t_ms <= 400 ? "≤" : ">"} {{400 ms}} ${r.trip.t_ms <= 400 ? "✓" : "✗"}`, en: `Check (no neutral distributed): $2\\,I_a Z_s \\le \\sqrt{3}\\,U_0$ – here $I_a Z_{loop} = ${PE.fmt(r.cond.value)}\\,\\mathrm{V} \\le ${PE.fmt(r.U)}\\,\\mathrm{V}$ ${r.cond.ok ? "✓" : "✗"}; disconnection in {{${r.trip.t_ms} ms}} ${r.trip.t_ms <= 400 ? "≤" : ">"} {{400 ms}} ${r.trip.t_ms <= 400 ? "✓" : "✗"}` } }
        : { tone: "danger", trip: false, zone: r.body.zone, text: { he: "התקלה השנייה לא נותקה!", en: "The second fault was not disconnected!" } };
      else if (s.touch === "phase") verdict = { tone: C.lvl(r.body.zone) >= 2 ? "danger" : "warn", zone: r.body.zone, text: { he: "אחרי תקלה ראשונה ב-L1, הפאזה הזו כמעט באדמה – ונגיעה ב-L3 שמה על האדם את המתח השזור, עד {{400 V}}.", en: "After a first fault on L1, that phase sits almost at earth – touching L3 puts the line voltage, up to {{400 V}}, across the person." }, sub: C.bodyLine(r.body) };
      else verdict = { tone: r.alarm ? "warn" : s.imd ? "safe" : "danger", zone: r.body.zone,
        text: r.alarm ? { he: `תקלה ראשונה: זורמים רק {{${PE.fmt(r.Id_mA)} mA}} דרך קיבול שתי הפאזות האחרות, והמתח על הגופים {{${PE.fmt(r.Ut)} V}}. <b>אין ניתוק</b> – הזינה ממשיכה, ומכשיר ההשגחה מתריע.`, en: `First fault: only {{${PE.fmt(r.Id_mA)} mA}} flows through the other two phases' capacitance and the cases sit at {{${PE.fmt(r.Ut)} V}}. <b>No disconnection</b> – supply continues, and the monitor alarms.` }
          : s.imd ? { he: `התנגדות התקלה ({{${PE.fmt(r.Riso_k)} kΩ}}) מעל סף ההתראה – מכשיר ההשגחה עוד לא מתריע.`, en: `The fault resistance ({{${PE.fmt(r.Riso_k)} kΩ}}) is above the alarm threshold – the monitor does not alarm yet.` }
          : { he: "התקלה הראשונה לא מסוכנת כרגע – אבל בלי השגחה על הבידוד אף אחד לא יודע עליה, והתקלה הבאה תהיה קצר של {{400 V}}.", en: "The first fault is not dangerous now – but without insulation monitoring nobody knows about it, and the next fault will be a {{400 V}} short." },
        sub: { he: `תנאי (לתקלה בעכבה זניחה, $I_d \\approx 3\\,\\omega C\\,U_0$): $R_a I_d = ${PE.fmt(r.cond.value)}\\,\\mathrm{V} \\le 50\\,\\mathrm{V}$ ${r.cond.ok ? "✓" : "✗"}`, en: `Condition (for a negligible-impedance fault, $I_d \\approx 3\\,\\omega C\\,U_0$): $R_a I_d = ${PE.fmt(r.cond.value)}\\,\\mathrm{V} \\le 50\\,\\mathrm{V}$ ${r.cond.ok ? "✓" : "✗"}` } };
      return { meters, verdict };
    }
  };
})();
