/* F2 – Insulation classes: class 0, I and II, with damage to each layer. */
(function () {
  "use strict";
  const S = PE.sym, C = PE.simc;
  PE.sims["f-class"] = {
    title: { he: "סימולטור מחלקות הגנה", en: "Protection class simulator" },
    params: [
      { key: "cls", type: "enum", def: 2, label: { he: "סוג המכשיר", en: "Appliance type" }, values: [{ v: 0, label: { he: "מחלקה 0 – בידוד בסיסי בלבד", en: "Class 0 – basic insulation only" } }, { v: 1, label: { he: "מחלקה I – גוף מתכת + PE", en: "Class I – metal case + PE" } }, { v: 2, label: { he: "מחלקה II – בידוד כפול", en: "Class II – double insulation" } }] },
      { key: "basic", type: "bool", def: false, label: { he: "נזק לבידוד הבסיסי", en: "Damage to basic insulation" } },
      { key: "supp", type: "bool", def: false, label: { he: "נזק לבידוד המשלים", en: "Damage to supplementary insulation" }, show: s => s.cls === 2 },
      { key: "pe", type: "bool", def: true, label: { he: "מוליך הגנה מחובר", en: "Protective conductor connected" }, show: s => s.cls === 1 }
    ],
    render(svg, s, ctx) {
      const r = ctx.model.classProtection({ cls: s.cls, basic: s.basic, supp: s.supp, pe: s.pe });
      const g = svg.append("g"); const floor = 460;
      S.ground(g, 0, 960, floor, { h: 80 });
      const cx = 400, cy = 250;
      // outer case
      const metal = s.cls !== 2;
      g.append("rect").attr("x", cx - 260).attr("y", cy - 170).attr("width", 520).attr("height", 340).attr("rx", 40)
        .attr("fill", r.live && !S.locked ? "#ffb3b3" : metal ? "#b8c2cc" : "#f2e6c9").attr("stroke", "var(--stage-line)").attr("stroke-width", 4);
      S.text(g, cx, cy - 140, ctx.L(metal ? { he: "גוף מתכת – חלק מוליך נגיש", en: "Metal case – exposed conductive part" } : { he: "גוף מבודד (פלסטיק)", en: "Insulating case (plastic)" }), "lbl");
      const layer = (pad, fill, dmg, name) => {
        g.append("rect").attr("x", cx - 190 + pad).attr("y", cy - 100 + pad).attr("width", 380 - 2 * pad).attr("height", 220 - 2 * pad).attr("rx", 30)
          .attr("fill", fill).attr("stroke", dmg ? "var(--bad)" : "var(--stage-line)").attr("stroke-width", 3).attr("stroke-dasharray", dmg ? "14 10" : null);
        if (dmg) { g.append("path").attr("d", `M${cx + 190 - pad - 30} ${cy - 100 + pad - 4} l40 0 l-12 22 z`).attr("fill", "var(--stage)").attr("stroke", "var(--bad)").attr("stroke-width", 3); }
        S.text(g, cx - 190 + pad + 16, cy - 100 + pad + 24, name + (dmg ? ctx.L({ he: " – פגום", en: " – damaged" }) : ""), "lbl-s", "start");
      };
      if (s.cls === 2) layer(0, "#ffd9a8", s.supp, ctx.L({ he: "בידוד משלים", en: "Supplementary insulation" }));
      layer(s.cls === 2 ? 45 : 0, "#fff3a8", s.basic, ctx.L({ he: "בידוד בסיסי", en: "Basic insulation" }));
      // live parts
      g.append("rect").attr("x", cx - 70).attr("y", cy - 20).attr("width", 140).attr("height", 60).attr("rx", 10).attr("fill", "var(--c-L)");
      S.text(g, cx, cy + 18, ctx.L({ he: "חלקים חיים", en: "Live parts" }), "lbl-b").style("fill", "#fff");
      // fault path from live parts to the case
      const through = s.cls === 2 ? s.basic && s.supp : s.basic;
      if (through) PE.simc.bolt(g, cx + 110, cy - 100, .9);
      // PE for class I
      if (s.cls === 1) {
        S.wire(g, [[cx - 200, cy + 170], [cx - 200, floor]], s.pe ? "PE" : "gen", s.pe ? "" : "w-off");
        if (s.pe) S.earth(g, cx - 200, floor - 30);
        S.wireTag(g, cx - 165, cy + 200, "PE");
      }
      // supply cord
      const sup = C.board1ph(g, { sys: "TN", x1: 124, xt: 70, x: 6, tagX: 118 });
      S.wire(g, [sup.L, [sup.L[0], cy + 10], [cx - 260, cy + 10]], "L1"); S.wire(g, [sup.N, [sup.N[0], cy + 30], [cx - 260, cy + 30]], "N");
      if (s.cls === 2) S.classII(g, cx + 190, cy + 110, 40);
      if (s.cls === 1) S.earth(g, cx + 210, cy + 110, { pe: true });
      const lvl = r.live ? 3 : 0;
      S.person(g, 780, floor, { s: 1.15, state: lvl, hand: [cx + 262, cy] });
      if (r.disconnect) S.badge(g, cx, 40, ctx.L({ he: "תקלה → זרם ב-PE → ניתוק", en: "Fault → current in PE → disconnection" }), "ok", "res");
      if (r.live) S.badge(g, cx, 40, ctx.L({ he: "הגוף חי: 230 V", en: "Case live: 230 V" }), "danger", "res");
      const T = {
        ok: { tone: "safe", text: { he: "שתי שכבות ההגנה שלמות.", en: "Both protection layers are intact." } },
        one: { tone: "warn", text: { he: "שכבה אחת נפגעה – השנייה עדיין מבודדת. המכשיר בטוח לרגע, אבל יש להוציאו משימוש ולתקן.", en: "One layer has failed – the other still insulates. Safe for now, but take it out of use and repair it." } },
        both: { tone: "danger", text: { he: "שתי השכבות נפגעו: הגוף חי. במחלקה II אין שכבה שלישית – אין PE ואין ניתוק.", en: "Both layers failed: the case is live. Class II has no third layer – no PE and no disconnection." } },
        pe: { tone: "safe", trip: true, text: { he: "במחלקה I הבידוד הבסיסי נפגע, אבל הגוף מחובר ל-PE: זרם התקלה מפעיל את ההגנה (איפוס/פחת) ומנתק.", en: "In class I the basic insulation failed, but the case is on the PE: the fault current operates the protection (TN/RCD) and disconnects." } },
        "no-pe": { tone: "danger", text: { he: "מחלקה I בלי PE: אין שכבה שנייה. הגוף במתח מלא – זו הסיבה שאסור לנתק את פין ההארקה.", en: "Class I without PE: there is no second layer. The case is fully live – this is why the earth pin must never be removed." } },
        "basic-only": { tone: "danger", text: { he: "מחלקה 0: רק בידוד בסיסי. תקלה אחת = גוף חי. לכן מחלקה 0 אינה מקובלת במתקנים.", en: "Class 0: basic insulation only. One fault = live case. This is why class 0 is not accepted in installations." } }
      };
      const v = Object.assign({}, T[r.layer]);
      if (r.live) v.zone = "AC-4";
      if (s.cls === 2 && !r.live) v.sub = { he: "שימו לב: אין לחבר מוליך הגנה למכשיר מחלקה II.", en: "Note: never connect a protective conductor to a class II appliance." };
      return { meters: [{ label: { he: "מתח על הגוף", en: "Case voltage" }, value: r.Vcase, unit: "V", tone: r.live ? "bad" : "ok" }, { label: { he: "שכבות הגנה תקינות", en: "Intact protection layers" }, value: s.cls === 2 ? 2 - (s.basic ? 1 : 0) - (s.supp ? 1 : 0) : s.cls === 1 ? (s.basic ? 0 : 1) + (s.pe ? 1 : 0) : (s.basic ? 0 : 1), unit: "" }], verdict: v };
    }
  };
})();
