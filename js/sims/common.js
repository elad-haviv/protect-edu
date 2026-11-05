/* Shared pieces for simulators: supply drawing, trip/verdict text, standard enums. */
(function () {
  "use strict";
  const S = PE.sym;
  const C = PE.simc = {};
  C.SKIN = { key: "skin", type: "enum", def: "dry", label: { he: "מצב העור", en: "Skin condition" }, values: [
    { v: "dry", label: { he: "יבש", en: "Dry" } }, { v: "wet", label: { he: "רטוב", en: "Wet" } }] };
  C.MCB = (def = "C16", list = ["B16", "C16", "C32", "D16"]) => ({ key: "mcb", type: "enum", def, label: { he: "מפסק זרם-יתר (מאמ\"ת)", en: "Circuit breaker (MCB)" }, values: list.map(v => ({ v, label: v })) });
  C.RCD = (def = 0) => ({ key: "rcd", type: "enum", def, label: { he: "מפסק פחת", en: "RCD" }, values: [
    { v: 0, label: { he: "ללא", en: "None" } }, { v: 30, label: "30 mA" }, { v: 300, label: "300 mA" }] });

  // Supply transformer secondary with earthed star point (Rb). Returns anchor points.
  C.supply = (g, x, yL, yN, opts = {}) => {
    S.transformer(g, x, (yL + yN) / 2, { r: 24 });
    S.text(g, x, yL - 34, PE.L({ he: "שנאי חלוקה", en: "Supply transformer" }), "lbl-s");
    S.wire(g, [[x + 38, (yL + yN) / 2 - 8], [x + 52, yL], [x + 70, yL]], "L");
    S.wire(g, [[x + 38, (yL + yN) / 2 + 8], [x + 52, yN], [x + 70, yN]], opts.pen ? "PEN" : "N");
    if (opts.earthY) {
      S.wire(g, [[x + 52, yN], [x + 52, opts.earthY]], opts.pen ? "PEN" : "N", "w-thin");
      S.dot(g, x + 52, yN);
      S.resistor(g, x + 52, opts.earthY, { vertical: true, len: 34, label: "Rb" });
      S.wire(g, [[x + 52, opts.earthY + 34], [x + 52, opts.earthY + 44]], "gen", "w-thin");
      S.earth(g, x + 52, opts.earthY + 44);
    }
    return { L: [x + 70, yL], N: [x + 70, yN], star: [x + 52, yN] };
  };
  // Fault "bolt" between two points
  C.bolt = (g, x, y, s = 1) => g.append("path").attr("class", "res").attr("transform", `translate(${x},${y}) scale(${s})`)
    .attr("d", "M0 -22 L-9 2 L-1 2 L-7 22 L10 -4 L2 -4 L8 -22 Z").attr("fill", "var(--sign-yellow)").attr("stroke", "#000").attr("stroke-width", 1.5);

  C.tripText = trip => {
    if (!trip) return { he: "אף מפסק לא ניתק", en: "No device disconnected" };
    const by = trip.by === "rcd" ? { he: "מפסק הפחת", en: "the RCD" } : { he: "המאמ\"ת", en: "the MCB" };
    if (trip.status === "slow") return { he: "המאמ\"ת ינתק רק תרמית – אחרי שניות עד דקות", en: "the MCB only trips thermally – after seconds to minutes" };
    return { he: `${by.he} ניתק תוך {{${trip.t_ms} ms}} לכל היותר`, en: `${by.en} disconnected within {{${trip.t_ms} ms}}` };
  };
  C.bodyLine = b => ({ he: `זרם בגוף {{${PE.fmt(b.I_mA)} mA}} למשך ${b.t_ms >= 5000 ? "זמן ממושך" : `{{${b.t_ms} ms}}`} – ${PE.ui[PE.kit.zoneKey(b.zone)].he}`,
    en: `Body current {{${PE.fmt(b.I_mA)} mA}} for ${b.t_ms >= 5000 ? "a long time" : `{{${b.t_ms} ms}}`} – ${PE.ui[PE.kit.zoneKey(b.zone)].en}` });
  C.lvl = z => PE.model.ZONE_LEVEL[z] || 0;
})();
