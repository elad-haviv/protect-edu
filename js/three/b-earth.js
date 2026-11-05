/* B3 – earth electrode and the potential "hill" on the soil surface; touch and step voltage. */
(function () {
  "use strict";
  const ZCOL = ["--zone-1", "--zone-2", "--zone-3", "--zone-4"];
  PE.scenes["b-earth"] = {
    camera: { pos: [7.5, 6, 9], target: [0.6, 0.8, 0] },
    params: [
      { key: "rho", type: "enum", def: 100, label: { he: "התנגדות סגולית של הקרקע ρ", en: "Soil resistivity ρ" }, values: [30, 100, 300].map(v => ({ v, label: v + " Ω·m" })) },
      { key: "d", type: "range", min: 1, max: 10, step: 0.5, def: 2, unit: "m", label: { he: "מרחק ההולך מהאלקטרודה", en: "Walker's distance from the electrode" } }
    ],
    build(T, scene, ctx) {
      const H = PE.s3, css = ctx.css;
      const soil = H.box(T, 16, 2.5, 12, H.mat(T, css("--soil")), 0, -1.25, 0); scene.add(soil);
      // colour map on the surface (normalised 1/r)
      const g = new T.PlaneGeometry(16, 12, 128, 96); g.rotateX(-Math.PI / 2);
      const cols = [], hill = g.clone(), pos = hill.attributes.position;
      const soilC = new T.Color(css("--soil")), stops = [[0, soilC], [0.05, soilC], [0.15, new T.Color("#f2c200")], [0.4, new T.Color("#ff7a00")], [0.8, new T.Color("#c62828")]];
      const ramp = t => { for (let i = stops.length - 1; i >= 0; i--) if (t >= stops[i][0]) { const n = stops[i + 1]; if (!n) return stops[i][1].clone(); return stops[i][1].clone().lerp(n[1], (t - stops[i][0]) / (n[0] - stops[i][0])); } return soilC.clone(); };
      for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i), z = pos.getZ(i), r = Math.max(0.3, Math.hypot(x, z)), t = 0.3 / r;
        const c = ramp(Math.min(1, t)); cols.push(c.r, c.g, c.b); pos.setY(i, 2.4 * t);
      }
      g.setAttribute("color", new T.Float32BufferAttribute(cols, 3)); hill.setAttribute("color", new T.Float32BufferAttribute(cols, 3)); hill.computeVertexNormals();
      const surf = new T.Mesh(g, new T.MeshStandardMaterial({ vertexColors: true, roughness: 0.9 })); surf.position.y = 0.005; scene.add(surf);
      const hillMesh = new T.Mesh(hill, new T.MeshStandardMaterial({ vertexColors: true, transparent: true, opacity: 0.35, side: T.DoubleSide, depthWrite: false })); hillMesh.position.y = 0.01; scene.add(hillMesh);
      // electrode rod
      const rod = H.cyl(T, 0.05, 2.3, H.mat(T, "#8a9198", { metalness: 0.8, roughness: 0.3 }), 0, -0.95, 0); scene.add(rod);
      // appliance (pump) + PE
      const app = H.box(T, 0.6, 0.7, 0.5, H.mat(T, "#c9d2da", { metalness: 0.5 }), -0.7, 0.35, 0.9); scene.add(app);
      const pe = H.tube(T, [[-0.7, 0.05, 0.9], [-0.35, 0.05, 0.45], [0, 0.2, 0]], 0.025, H.mat(T, "#2f9e44")); scene.add(pe);
      // person A touching the pump, standing 1 m from the electrode
      const mA = H.mat(T, css("--zone-3")), pA = H.person(T, mA); pA.position.set(-1.0 * Math.cos(Math.PI * 0.35), 0, 1.0 * Math.sin(Math.PI * 0.35) + 0.6); scene.add(pA);
      pA.add(H.arm(T, mA, [0.05, 1.42, 0], [0.25, 0.75, 0.0]));
      // person B walking at distance d (feet 0.8 m apart along x)
      const mB = H.mat(T, css("--zone-2")), pB = new T.Group(); scene.add(pB);
      const body = H.person(T, mB); pB.add(body);
      body.children[2].position.x = -0.4; body.children[3].position.x = 0.4;
      body.children[2].rotation.z = -0.45; body.children[3].rotation.z = 0.45;
      const parts = [
        { key: "rod", name: { he: "אלקטרודת הארקה", en: "Earth electrode" }, desc: { he: "דרכה זרם התקלה נכנס לקרקע. הפוטנציאל שלה הוא Ve.", en: "The fault current enters the soil through it. Its potential is Ve." }, object: rod, anchor: [0, 0, 0] },
        { key: "hill", name: { he: "\"גבעת\" הפוטנציאל", en: "Potential \"hill\"" }, desc: { he: "גובה המשטח השקוף = הפוטנציאל על פני הקרקע. הוא יורד בערך כ-1/r.", en: "The height of the transparent surface = the surface potential. It falls roughly as 1/r." }, object: hillMesh, anchor: [0, 1.2, 0] },
        { key: "pA", name: { he: "מתח מגע", en: "Touch voltage" }, desc: { he: "היד על המשאבה (פוטנציאל Ve), הרגליים על קרקע בפוטנציאל נמוך יותר.", en: "Hand on the pump (potential Ve), feet on soil at a lower potential." }, object: pA, anchor: [pA.position.x, 1, pA.position.z] },
        { key: "pB", name: { he: "מתח צעד", en: "Step voltage" }, desc: { he: "ההפרש בין שתי הרגליים. יורד מהר עם המרחק.", en: "The difference between the two feet. It falls quickly with distance." }, object: pB, anchor: [2, 1, 0] }];
      return {
        parts,
        update(s, c) {
          const M = c.model, e = M.electrodeTT({ rho: s.rho });
          const rA = Math.hypot(pA.position.x, pA.position.z);
          const touch = e.Ve - M.potentialAt(rA, e.If, s.rho);
          pB.position.set(s.d, 0, -0.6); parts[3].anchor = [s.d, 1, -0.6];
          const step = M.potentialAt(s.d - 0.4, e.If, s.rho) - M.potentialAt(s.d + 0.4, e.If, s.rho);
          const zA = M.body(touch, { path: "hf", Rfoot: 1000 }), zB = M.body(step, { path: "hf", Rfoot: 2000 });
          mA.color.set(css(ZCOL[M.ZONE_LEVEL[zA.zone]])); mB.color.set(css(ZCOL[M.ZONE_LEVEL[zB.zone]]));
          return {
            labels: [
              { pos: [0, 2.6, 0], text: `Ve = ${PE.fmt(e.Ve)} V` },
              { pos: [pA.position.x, 2.05, pA.position.z], text: { he: `מגע: {{${PE.fmt(touch)} V}}`, en: `Touch: ${PE.fmt(touch)} V` }, tone: touch > 50 ? "bad" : "ok" },
              { pos: [s.d, 2.05, -0.6], text: { he: `צעד: {{${PE.fmt(step)} V}}`, en: `Step: ${PE.fmt(step)} V` }, tone: step > 50 ? "bad" : "ok" }],
            tone: touch > 50 ? "danger" : "safe",
            status: { he: `התנגדות האלקטרודה כ-{{${PE.fmt(e.Re)} Ω}}, זרם התקלה {{${PE.fmt(e.If)} A}}. המשאבה והאלקטרודה ב-{{${PE.fmt(e.Ve)} V}}; האדם שעומד במרחק {{1 m}} מקבל מתח מגע {{${PE.fmt(touch)} V}}. מתח הצעד במרחק {{${s.d} m}}: {{${PE.fmt(step)} V}}. ערכים להמחשה.`,
              en: `Electrode resistance about {{${PE.fmt(e.Re)} Ω}}, fault current {{${PE.fmt(e.If)} A}}. Pump and electrode at {{${PE.fmt(e.Ve)} V}}; the person standing {{1 m}} away sees a touch voltage of {{${PE.fmt(touch)} V}}. Step voltage at {{${s.d} m}}: {{${PE.fmt(step)} V}}. Illustrative values.` }
          };
        }
      };
    }
  };
})();
