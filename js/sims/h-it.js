/* H2 – Floating supply (זינה צפה, IT): first fault → alarm only; second fault → short → disconnection. */
(function () {
  "use strict";
  const S = PE.sym, C = PE.simc;
  PE.sims["h-it"] = {
    title: { he: "סימולטור זינה צפה", en: "Floating supply simulator" },
    params: [
      { key: "fault1", type: "bool", def: false, label: { he: "תקלה ראשונה: L2 נוגע בגוף מכשיר 1", en: "First fault: L2 touches the case of appliance 1" } },
      { key: "rf", type: "range", min: 0, max: 200, step: 1, def: 0, unit: "kΩ", label: { he: "התנגדות התקלה הראשונה", en: "First fault resistance" }, show: s => s.fault1 },
      { key: "fault2", type: "bool", def: false, label: { he: "תקלה שנייה: L1 נוגע בגוף מכשיר 2", en: "Second fault: L1 touches the case of appliance 2" }, show: s => s.fault1 },
      { key: "imd", type: "bool", def: true, label: { he: "מכשיר השגחה על הבידוד מותקן", en: "Insulation monitoring device installed" } },
      { key: "touch", type: "enum", def: "case", label: { he: "האדם נוגע ב-", en: "The person touches" }, values: [{ v: "case", label: { he: "גוף מכשיר 2", en: "Case of appliance 2" } }, { v: "L1", label: { he: "מוליך L1 חשוף", en: "A bare L1 conductor" } }] },
      C.SKIN
    ],
    render(svg, s, ctx) {
      const M = ctx.model;
      const r = M.itSupply({ fault1: s.fault1, fault2: s.fault1 && s.fault2, Rf_k: s.rf, imd: s.imd, touch: s.touch, skin: s.skin });
      const tripped = !!(r.trip && r.trip.status === "yes");
      const g = svg.append("g"); const y1 = 110, y2 = 180, floor = 460, yPE = 400;
      S.ground(g, 0, 960, floor, { h: 80 });
      // supply: mains → isolating transformer, secondary not earthed
      S.wire(g, [[20, 130], [90, 130]], "L"); S.wire(g, [[20, 165], [90, 165]], "N");
      S.transformer(g, 125, 145, { r: 24 });
      S.text(g, 125, 90, ctx.L({ he: "שנאי מבדל", en: "Isolating transformer" }), "lbl-s");
      S.text(g, 125, 205, ctx.L({ he: "ללא הארקה", en: "Not earthed" }), "lbl-s");
      S.wire(g, [[160, 135], [180, y1], [300, y1]], "gen"); S.wire(g, [[160, 155], [180, y2], [300, y2]], "gen");
      S.text(g, 230, y1 - 12, "L1", "lbl-b"); S.text(g, 230, y2 + 28, "L2", "lbl-b");
      // IMD between conductors and earth
      if (s.imd) {
        S.dot(g, 250, y1); S.dot(g, 290, y2);
        S.wire(g, [[250, y1], [250, 235]], "gen", "w-thin"); S.wire(g, [[290, y2], [290, 235]], "gen", "w-thin");
        const alarm = r.alarm && !S.locked;
        g.append("rect").attr("x", 215).attr("y", 235).attr("width", 110).attr("height", 74).attr("rx", 8).attr("class", "sym-fill");
        S.text(g, 270, 258, ctx.L({ he: "השגחה על בידוד", en: "Insulation monitor" }), "lbl-s").style("font-size", "13px");
        S.text(g, 262, 284, S.locked ? "— kΩ" : `${r.Riso_k >= 1000 ? ">1000" : PE.fmt(r.Riso_k)} kΩ`, "sym-txt");
        g.append("circle").attr("cx", 306).attr("cy", 279).attr("r", 9).attr("fill", alarm ? "var(--bad)" : "var(--ok)").attr("class", alarm ? "tripflash" : null);
        S.text(g, 270, 300, alarm ? ctx.L({ he: "התראה!", en: "ALARM" }) : ctx.L({ he: "תקין", en: "OK" }), "lbl-s").style("font-size", "12px").style("fill", alarm ? "var(--bad)" : "var(--ok)");
        S.wire(g, [[270, 309], [270, yPE]], "PE", "w-thin");
      }
      // two-pole breaker
      S.mcb(g, 300, y1, { open: tripped, flash: tripped, label: "C16" }); S.mcb(g, 300, y2, { open: tripped, flash: tripped });
      S.wire(g, [[360, y1], [880, y1]], "gen"); S.wire(g, [[360, y2], [880, y2]], "gen");
      // appliances with PE to a common bar and local earth Ra
      const ax = [520, 690];
      ax.forEach((x, i) => {
        S.wire(g, [[x + 25, y1], [x + 25, 250]], "gen", "w-thin"); S.wire(g, [[x + 55, y2], [x + 55, 250]], "gen", "w-thin"); S.dot(g, x + 25, y1); S.dot(g, x + 55, y2);
        const v = i === 0 ? (r.stage >= 1 ? r.Ut : 0) : (r.stage === 2 ? r.Ut : r.stage === 1 ? r.Ut : 0);
        S.appliance(g, x, 250, 110, 100, { warm: v > 1 && !tripped, live: v > 50 && !tripped, label: `${i + 1}` });
        S.wire(g, [[x + 90, 350], [x + 90, yPE]], "PE", "w-thin");
      });
      S.wire(g, [[270, yPE], [800, yPE]], "PE"); S.wireTag(g, 440, yPE - 18, "PE");
      S.resistor(g, 800, yPE, { len: 40, label: "Ra" }); S.wire(g, [[840, yPE], [860, yPE], [860, floor]], "gen", "w-thin");
      if (s.fault1) C.bolt(g, ax[0] + 55, 275, .7);
      if (s.fault1 && s.fault2) C.bolt(g, ax[1] + 25, 275, .7);
      // person
      const lvl = C.lvl(r.body.zone);
      if (s.touch === "case") S.person(g, 900, floor, { s: 1.05, state: lvl, hand: [ax[1] + 112, 300] });
      else { S.dot(g, 880, y1); S.wire(g, [[880, y1], [880, 290]], "gen", "w-thin"); g.append("circle").attr("cx", 880).attr("cy", 290).attr("r", 6).attr("fill", "var(--sign-yellow)").attr("stroke", "#000"); S.person(g, 915, floor, { s: 1.05, state: lvl, hand: [884, 293] }); }
      // flows
      if (s.fault1 && !s.fault2) S.flow(g, [[ax[0] + 55, y2], [ax[0] + 55, 275], [ax[0] + 90, 350], [ax[0] + 90, yPE]], r.If);
      if (s.fault1 && s.fault2 && !tripped) S.flow(g, [[ax[1] + 25, y1], [ax[1] + 25, 275], [ax[1] + 90, yPE], [ax[0] + 90, yPE], [ax[0] + 55, 275], [ax[0] + 55, y2]], r.If);
      if (tripped) S.badge(g, 330, 70, ctx.L({ he: "נותק!", en: "TRIPPED" }), "ok", "res");
      if (s.fault1 && !S.locked) S.badge(g, ax[0] + 55, 228, `Ut = ${PE.fmt(r.Ut)} V`, r.Ut > 50 ? "danger" : "ok", "res");

      const meters = [
        { label: { he: "התנגדות בידוד", en: "Insulation resistance" }, value: r.Riso_k >= 1000 ? ">1000" : r.Riso_k, unit: "kΩ" },
        { label: { he: "זרם תקלה", en: "Fault current" }, value: r.stage === 2 ? r.If : r.Id_mA, unit: r.stage === 2 ? "A" : "mA" },
        { label: { he: "מתח על הגופים", en: "Voltage on the cases" }, value: tripped ? 0 : r.Ut, unit: "V", tone: r.Ut > 50 && !tripped ? "bad" : "ok" },
        PE.kit.bodyMeter(r.body)];
      let verdict;
      if (!s.fault1) verdict = s.touch === "L1" ? { tone: "warn", zone: r.body.zone, text: { he: `הבידוד תקין: נגיעה במוליך חי סוגרת מעגל דרך הקיבול של הרשת – כ-{{${PE.fmt(r.body.I_mA)} mA}}. זינה צפה <b>אינה</b> הגנה מפני נגיעה בחלק חי: ברשת גדולה הזרם הקיבולי יכול לעבור {{30 mA}}.`, en: `Insulation healthy: touching a live conductor closes a circuit through the system capacitance – about {{${PE.fmt(r.body.I_mA)} mA}}. A floating supply is <b>not</b> protection against touching a live part: on a large network the capacitive current can exceed {{30 mA}}.` } }
        : { tone: "safe", text: { he: "הבידוד תקין – אין זרם תקלה. הפעילו תקלה ראשונה.", en: "Insulation healthy – no fault current. Switch on a first fault." } };
      else if (s.fault2) verdict = tripped ? { tone: "safe", trip: true, zone: r.body.zone, text: { he: `תקלה שנייה בקוטב השני = קצר בין המוליכים דרך ה-PE: {{${PE.fmt(r.If)} A}}, והמאמ"ת מנתק.`, en: `A second fault on the other conductor = a short between conductors through the PE: {{${PE.fmt(r.If)} A}}, and the MCB trips.` }, sub: { he: "המטרה של זינה צפה היא לאתר ולתקן את התקלה הראשונה <b>לפני</b> שמגיעה שנייה.", en: "The point of a floating supply is to find and fix the first fault <b>before</b> a second one arrives." } }
        : { tone: "danger", trip: false, zone: r.body.zone, text: { he: "התקלה השנייה לא נותקה!", en: "The second fault was not disconnected!" } };
      else if (s.touch === "L1") verdict = { tone: C.lvl(r.body.zone) >= 2 ? "danger" : "warn", zone: r.body.zone, text: { he: "אחרי תקלה ראשונה, L2 מחובר לאדמה – והמערכת מתנהגת כמו רשת מוארקת. נגיעה ב-L1 מסוכנת.", en: "After a first fault, L2 is connected to earth – the system now behaves like an earthed one. Touching L1 is dangerous." }, sub: C.bodyLine(r.body) };
      else verdict = { tone: r.alarm ? "warn" : s.imd ? "safe" : "danger", zone: r.body.zone,
        text: r.alarm ? { he: `תקלה ראשונה: זורמים רק {{${PE.fmt(r.Id_mA)} mA}} דרך הקיבול, והמתח על הגופים {{${PE.fmt(r.Ut)} V}}. <b>אין ניתוק</b> – הזינה ממשיכה (חשוב בחדר ניתוח), ומכשיר ההשגחה מתריע.`, en: `First fault: only {{${PE.fmt(r.Id_mA)} mA}} flows through the capacitance and the cases sit at {{${PE.fmt(r.Ut)} V}}. <b>No disconnection</b> – supply continues (vital in an operating theatre), and the monitor raises an alarm.` }
          : s.imd ? { he: `התנגדות התקלה ({{${PE.fmt(r.Riso_k)} kΩ}}) מעל סף ההתראה – מכשיר ההשגחה עוד לא מתריע.`, en: `The fault resistance ({{${PE.fmt(r.Riso_k)} kΩ}}) is above the alarm threshold – the monitor does not alarm yet.` }
          : { he: "התקלה הראשונה לא מסוכנת כרגע – אבל בלי השגחה על הבידוד אף אחד לא יודע עליה, והתקלה הבאה תהיה מסוכנת.", en: "The first fault is not dangerous now – but without insulation monitoring nobody knows about it, and the next fault will be dangerous." },
        sub: { he: `תנאי: {{Ra·Id = ${PE.fmt(r.cond.value)} V ≤ 50 V}} ${r.cond.ok ? "✓" : "✗"}`, en: `Condition: {{Ra·Id = ${PE.fmt(r.cond.value)} V ≤ 50 V}} ${r.cond.ok ? "✓" : "✗"}` } };
      return { meters, verdict };
    }
  };
})();
