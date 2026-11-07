/* Static explanatory figures (also the fallbacks for 3D scenes). PE.figures[id](svg, ctx). */
(function () {
  "use strict";
  const S = PE.sym, C = PE.simc, F = PE.figures;
  const L = o => PE.L(o);

  F["tt-principle"] = (svg) => {
    S.defs(svg); const g = svg.append("g"); const floor = 300, Lk = ["L1", "L2", "L3"];
    S.ground(g, 0, 960, floor, { h: 80 });
    const sup = C.supply3(g, { sys: "TT", earthY: 190, x1: 640, ys: { L1: 40, L2: 60, L3: 80, N: 100 } }), ys = sup.ys, sx = sup.star[0];
    S.wire(g, [[sx, 268], [sx, floor]], "gen", "w-thin");
    Lk.forEach((k, i) => { S.dot(g, 600 + i * 20, ys[k]); S.wire(g, [[600 + i * 20, ys[k]], [600 + i * 20, 130]], k, "w-thin"); });
    S.appliance(g, 560, 130, 170, 120, { warm: true, label: L({ he: "גוף מתכת (מחלקה I)", en: "Metal case (class I)" }) });
    S.motor3(g, 620, 180, 24);
    C.bolt(g, 700, 150, .8);
    S.wire(g, [[690, 250], [690, 262]], "PE"); S.resistor(g, 690, 262, { vertical: true, len: 30 }); S.math(g, 712, 278, "R_a", { anchor: "start", w: 40 });
    S.wire(g, [[690, 292], [690, floor]], "gen", "w-thin");
    g.append("path").attr("d", `M685 ${floor} v50 l5 10 l5 -10 v-50`).attr("fill", "#7d858c");
    S.flow(g, [[sx + 20, ys.L1], [600, ys.L1], [600, 150], [690, 150], [690, floor + 40], [sx, floor + 40], [sx, 268]], 19);
    S.math(g, 840, 150, "U_t = I_f \\cdot R_a", { box: true, tone: "warn", w: 200, h: 36 });
    S.text(g, 400, floor + 70, L({ he: "זרם התקלה חוזר דרך האדמה", en: "Fault current returns through the soil" }), "lbl");
  };

  // Fallback for 3D scene B3: potential profile across the soil surface
  F["b-earth"] = (svg) => {
    S.defs(svg); const g = svg.append("g");
    const x0 = 480, base = 330;
    const x = d3.scaleLinear().domain([-12, 12]).range([60, 900]);
    const y = d3.scaleLinear().domain([0, 100]).range([base, 80]);
    const V = r => Math.min(100, 100 * 0.5 / Math.max(Math.abs(r), 0.5));
    const pts = d3.range(-12, 12.01, 0.1).map(r => [x(r), y(V(r))]);
    g.append("path").attr("d", d3.area().x(d => d[0]).y0(base).y1(d => d[1])(pts)).attr("fill", "var(--zone-3)").attr("opacity", .25);
    g.append("path").attr("d", d3.line()(pts)).attr("class", "sym").style("stroke", "var(--zone-4)");
    S.ground(g, 40, 920, base, { h: 110 });
    g.append("path").attr("d", `M${x0 - 6} ${base} v90 l6 14 l6 -14 v-90`).attr("fill", "#7d858c");
    S.text(g, x0, 60, L({ he: "פוטנציאל פני הקרקע", en: "Surface potential" }), "lbl-b");
    // touch: person at 3 m holding a case connected to electrode potential
    S.person(g, x(3.5), base, { s: .9, state: 2, badge: false, hand: [x(1), base - 80] });
    S.appliance(g, x(0.3), base - 120, 70, 90, {});
    g.append("path").attr("d", `M${x(3.5) + 40} ${y(100)} V${y(V(3.5))}`).attr("class", "sym").attr("stroke-dasharray", "5 4").attr("marker-end", null);
    S.badge(g, x(3.5) + 110, (y(100) + y(V(3.5))) / 2, L({ he: "מתח מגע", en: "Touch voltage" }), "danger");
    // step: person at -2..-3
    S.person(g, x(-2.5), base, { s: .9, state: 1, badge: false });
    S.badge(g, x(-2.5), y(V(-2)) - 30, L({ he: "מתח צעד", en: "Step voltage" }), "warn");
    S.text(g, x(-11), base + 95, "r →", "lbl-s", "start");
  };

  F["rcd-toroid"] = (svg) => {
    S.defs(svg); const g = svg.append("g"); const ys = [70, 110, 150, 190], kinds = ["L1", "L2", "L3", "N"];
    ys.forEach((y, i) => { S.wire(g, [[40, y], [920, y]], kinds[i]); S.wireTag(g, 70, y, kinds[i]); });
    g.append("ellipse").attr("cx", 420).attr("cy", 130).attr("rx", 34).attr("ry", 100).attr("fill", "none").attr("stroke", "#7d858c").attr("stroke-width", 18);
    S.text(g, 420, 262, L({ he: "ליבה טורואידית", en: "Toroidal core" }), "lbl");
    for (let i = 0; i < 6; i++) g.append("path").attr("class", "sym").attr("d", `M${396 + i * 8} 228 q4 12 8 0`);
    S.wire(g, [[440, 236], [440, 290], [600, 290]], "gen", "w-thin");
    g.append("rect").attr("x", 600).attr("y", 272).attr("width", 70).attr("height", 36).attr("rx", 6).attr("class", "sym-fill");
    S.text(g, 635, 296, L({ he: "ממסר", en: "Relay" }), "lbl-s");
    S.math(g, 760, 290, "I_\\Delta = \\left|\\sum I\\right|", { box: true, tone: "warn", w: 200, h: 38 });
  };
  F["class-marks"] = (svg) => {
    S.defs(svg); const g = svg.append("g");
    S.earth(g, 170, 50, { pe: true }); S.text(g, 170, 160, L({ he: "מחלקה I", en: "Class I" }), "lbl-b");
    S.classII(g, 440, 50, 70); S.text(g, 475, 160, L({ he: "מחלקה II", en: "Class II" }), "lbl-b");
    S.classIII(g, 740, 40, 80); S.text(g, 780, 160, L({ he: "מחלקה III", en: "Class III" }), "lbl-b");
  };
  // fallback for H3: floating supply in an operating theatre (single-line)
  F["h-or"] = (svg) => {
    S.defs(svg); const g = svg.append("g");
    S.transformer(g, 140, 150, { r: 30 }); S.text(g, 140, 95, L({ he: "שנאי מבדל", en: "Isolating transformer" }), "lbl");
    S.text(g, 140, 215, L({ he: "ללא הארקה", en: "Not earthed" }), "lbl-s");
    S.wire(g, [[182, 130], [880, 130]], "gen"); S.wire(g, [[182, 150], [880, 150]], "gen"); S.wire(g, [[182, 170], [880, 170]], "gen");
    S.text(g, 60, 150, "3~", "lbl-s");
    g.append("rect").attr("x", 250).attr("y", 220).attr("width", 150).attr("height", 80).attr("rx", 8).attr("class", "sym-fill");
    S.text(g, 325, 255, L({ he: "השגחה על בידוד", en: "Insulation monitor" }), "lbl-s"); S.text(g, 325, 282, "kΩ", "sym-txt");
    S.wire(g, [[300, 140], [300, 220]], "gen", "w-thin"); S.wire(g, [[325, 300], [325, 380], [880, 380]], "PE");
    [540, 720].forEach((x, i) => { S.wire(g, [[x, 140], [x, 230]], "gen", "w-thin"); S.wire(g, [[x + 30, 165], [x + 30, 230]], "gen", "w-thin"); S.appliance(g, x - 20, 230, 110, 90, { label: L(i ? { he: "שולחן", en: "Table" } : { he: "ציוד רפואי", en: "Equipment" }) }); S.wire(g, [[x + 60, 320], [x + 60, 380]], "PE", "w-thin"); });
    S.earth(g, 880, 380);
  };
  // 3D fallbacks for D3 and H3
  F["d-rcd"] = (svg) => { F["rcd-toroid"](svg); };
  F["h-bath"] = (svg) => {
    S.defs(svg); const g = svg.append("g");
    g.append("rect").attr("x", 40).attr("y", 300).attr("width", 300).attr("height", 90).attr("rx", 30).attr("fill", "#cfd6dd").attr("stroke", "var(--stage-line)").attr("stroke-width", 3);
    S.text(g, 190, 352, L({ he: "אמבט מתכת", en: "Metal bath" }), "lbl");
    g.append("rect").attr("x", 420).attr("y", 60).attr("width", 20).attr("height", 340).attr("fill", "#9aa3ab");
    S.text(g, 430, 50, L({ he: "צנרת", en: "Pipes" }), "lbl");
    S.appliance(g, 620, 80, 140, 200, { label: L({ he: "דוד", en: "Heater" }) });
    g.append("rect").attr("x", 800).attr("y", 360).attr("width", 120).attr("height", 26).attr("fill", "#b87333");
    S.text(g, 860, 410, L({ he: "פס השוואה", en: "Bonding bar" }), "lbl-s");
    S.wire(g, [[340, 340], [380, 340], [380, 420], [860, 420], [860, 386]], "PE");
    S.wire(g, [[440, 380], [500, 380], [500, 420]], "PE");
    S.wire(g, [[690, 280], [690, 420]], "PE");
  };
})();
