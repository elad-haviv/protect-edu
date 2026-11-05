/* H3 – bathroom: potentials of heater, pipes and bath during a fault, with and without supplementary bonding. */
(function () {
  "use strict";
  PE.scenes["h-bath"] = {
    camera: { pos: [5.5, 4.2, 5.5], target: [0, 1, -1] },
    params: [
      { key: "bond", type: "bool", def: false, label: { he: "השוואת פוטנציאלים משלימה", en: "Supplementary bonding" } },
      { key: "if", type: "range", min: 100, max: 800, step: 50, def: 300, unit: "A", label: { he: "זרם תקלה בדוד", en: "Fault current in the heater" } }],
    build(T, scene, ctx) {
      const H = PE.s3, css = ctx.css;
      scene.add(H.box(T, 6, 0.05, 5, H.mat(T, "#dfe6ec"), 0, -0.025, 0));
      scene.add(H.box(T, 6, 3, 0.1, H.mat(T, "#f2f5f8"), 0, 1.5, -2.5));
      scene.add(H.box(T, 0.1, 3, 5, H.mat(T, "#eef2f5"), -3, 1.5, 0));
      const bath = new T.Group(); scene.add(bath);
      bath.add(H.box(T, 1.9, 0.6, 0.9, H.mat(T, "#e8edf2", { metalness: 0.6, roughness: 0.3 }), -1.9, 0.3, -1.95));
      bath.add(H.box(T, 1.7, 0.1, 0.7, H.mat(T, "#9fc7e6"), -1.9, 0.56, -1.95));
      const pipes = new T.Group(); scene.add(pipes);
      const pm = H.mat(T, "#9aa3ab", { metalness: 0.8, roughness: 0.3 });
      pipes.add(H.cyl(T, 0.05, 2.2, pm, -0.4, 1.1, -2.4)); pipes.add(H.cyl(T, 0.05, 2.2, pm, -0.2, 1.1, -2.4));
      pipes.add(H.tube(T, [[-0.4, 0.9, -2.4], [-1.3, 0.9, -2.4], [-1.3, 0.75, -2.15]], 0.04, pm));
      const heater = H.cyl(T, 0.32, 1.1, H.mat(T, "#ffffff", { metalness: 0.3 }), 1.4, 1.9, -2.1); scene.add(heater);
      const bar = H.box(T, 0.6, 0.12, 0.12, H.mat(T, "#b87333", { metalness: 0.8 }), 2.4, 0.3, -2.4); scene.add(bar);
      const gy = H.mat(T, "#2f9e44");
      scene.add(H.tube(T, [[1.4, 1.35, -2.4], [1.4, 0.3, -2.4], [2.1, 0.3, -2.4]], 0.025, gy));         // heater PE
      const bonds = new T.Group(); scene.add(bonds);
      bonds.add(H.tube(T, [[-0.2, 0.3, -2.4], [2.1, 0.3, -2.45]], 0.025, gy));
      bonds.add(H.tube(T, [[-1.0, 0.15, -1.5], [-0.3, 0.12, -2.3], [-0.2, 0.3, -2.4]], 0.025, gy));
      bonds.add(H.tube(T, [[1.7, 1.6, -2.1], [1.75, 0.6, -2.4], [2.6, 0.3, -2.4]], 0.025, gy));
      const pm2 = H.mat(T, css("--zone-1")), person = H.person(T, pm2); person.position.set(0.55, 0, -1.3); scene.add(person);
      person.add(H.arm(T, pm2, [-0.08, 1.42, 0], [-0.88, 1.3, -1.05]));
      person.add(H.arm(T, pm2, [0.08, 1.42, 0], [0.62, 1.55, -0.55]));
      const parts = [
        { name: { he: "פס השוואת פוטנציאלים", en: "Bonding bar" }, desc: { he: "נקודת חיבור משותפת; מחוברת ל-PE ולהארקה.", en: "A common connection point; tied to the PE and earth." }, object: bar, anchor: [2.4, 0.3, -2.4] },
        { name: { he: "צנרת מים מתכתית", en: "Metal water pipes" }, desc: { he: "חלק מוליך זר, מחובר להשוואה הראשית.", en: "An extraneous conductive part, on the main bonding." }, object: pipes, anchor: [-0.3, 1.1, -2.4] },
        { name: { he: "אמבט מתכתי", en: "Metal bath" }, desc: { he: "חלק מוליך זר במגע עם גוף רטוב.", en: "An extraneous conductive part touching a wet body." }, object: bath, anchor: [-1.9, 0.5, -1.95] },
        { name: { he: "דוד חשמלי", en: "Electric water heater" }, desc: { he: "חלק מוליך נגיש מחלקה I; בתקלה – זרם ב-PE.", en: "A class I exposed conductive part; in a fault, current flows in its PE." }, object: heater, anchor: [1.4, 1.9, -2.1] },
        { name: { he: "מוליכי השוואה משלימה", en: "Supplementary bonding conductors" }, desc: { he: "מחברים את הדוד, הצנרת והאמבט זה לזה – ההפרש ביניהם קטן.", en: "Tie heater, pipes and bath together – the difference between them stays small." }, object: bonds, anchor: [1, 0.3, -2.4] }];
      return {
        parts,
        update(s, c) {
          bonds.visible = s.bond;
          const r = c.model.bonding({ If: s.if, bond: s.bond, R_sb: 0.05 });
          const b = c.model.body(r.Ut, { skin: "wet", path: "hh" }, 400);
          pm2.color.set(css(["--zone-1", "--zone-2", "--zone-3", "--zone-4"][c.model.ZONE_LEVEL[b.zone]]));
          heater.material.color.set(r.Vcase > 50 ? "#ffb3b3" : "#ffffff");
          return {
            labels: [
              { pos: [1.4, 2.65, -2.1], text: { he: `דוד: {{${PE.fmt(r.Vcase)} V}}`, en: `Heater: ${PE.fmt(r.Vcase)} V` }, tone: r.Vcase > 50 ? "bad" : "" },
              { pos: [-0.3, 2.35, -2.4], text: { he: `צנרת: {{${PE.fmt(r.Vpipe)} V}}`, en: `Pipes: ${PE.fmt(r.Vpipe)} V` } },
              { pos: [-1.9, 0.85, -1.95], text: { he: `אמבט: {{${PE.fmt(r.Vpipe)} V}}`, en: `Bath: ${PE.fmt(r.Vpipe)} V` } },
              { pos: [0.55, 2.1, -1.3], text: { he: `ΔU = ${PE.fmt(r.Ut)} V`, en: `ΔU = ${PE.fmt(r.Ut)} V` }, tone: r.Ut > 25 ? "bad" : "ok" }],
            tone: r.Ut > 50 ? "danger" : r.Ut > 25 ? "warn" : "safe",
            status: s.bond ? { he: `עם השוואה משלימה כל החלקים עולים יחד; ההפרש בין הדוד לצנרת רק {{${PE.fmt(r.Ut)} V}}.`, en: `With supplementary bonding all parts rise together; the difference between heater and pipes is only {{${PE.fmt(r.Ut)} V}}.` }
              : { he: `בלי השוואה משלימה, עד שהמפסק מנתק, יש {{${PE.fmt(r.Ut)} V}} בין הדוד לצנרת ולאמבט.`, en: `Without supplementary bonding, until the device disconnects, there are {{${PE.fmt(r.Ut)} V}} between the heater and the pipes and bath.` }
          };
        }
      };
    }
  };
})();
