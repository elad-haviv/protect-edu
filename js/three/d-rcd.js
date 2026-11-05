/* D3 – RCD cut-away: toroidal core, sense winding, relay, latch, contacts, test circuit. */
(function () {
  "use strict";
  PE.scenes["d-rcd"] = {
    camera: { pos: [4.2, 2.6, 6], target: [0, 0.1, 0] },
    params: [{ key: "mode", type: "enum", def: "balanced", label: { he: "מצב", en: "State" }, values: [
      { v: "balanced", label: { he: "מאוזן", en: "Balanced" } }, { v: "leak", label: { he: "דליפה לאדמה", en: "Leakage to earth" } }, { v: "test", label: { he: "לחיצה על T", en: "Press T" } }] }],
    build(T, scene, ctx) {
      const H = PE.s3, css = ctx.css;
      const shell = H.box(T, 2.6, 3.4, 1.5, new T.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: 0.12, depthWrite: false }), 0.35, 0, 0); scene.add(shell);
      const edges = new T.LineSegments(new T.EdgesGeometry(shell.geometry), new T.LineBasicMaterial({ color: 0x888888 })); edges.position.copy(shell.position); scene.add(edges);
      const core = new T.Mesh(new T.TorusGeometry(0.55, 0.14, 20, 64), H.mat(T, "#7d858c", { metalness: 0.7, roughness: 0.35 })); core.rotation.x = Math.PI / 2; core.position.y = 0.5; scene.add(core);
      const ring = new T.Mesh(new T.TorusGeometry(0.55, 0.035, 8, 64), new T.MeshStandardMaterial({ color: 0xff7a00, emissive: 0xff7a00, emissiveIntensity: 0.9 })); ring.rotation.x = Math.PI / 2; ring.position.y = 0.5; ring.visible = false; scene.add(ring);
      const L = H.cyl(T, 0.06, 3.2, H.mat(T, css("--c-L")), -0.17, 0, 0); scene.add(L);
      const N = H.cyl(T, 0.06, 3.2, H.mat(T, css("--c-N")), 0.17, 0, 0); scene.add(N);
      const winding = new T.Group(); scene.add(winding);
      for (let i = 0; i < 7; i++) { const a = -0.55 + i * 0.18; const w = new T.Mesh(new T.TorusGeometry(0.17, 0.025, 8, 20), H.mat(T, "#b87333", { metalness: 0.6 })); w.position.set(0.55 * Math.cos(a), 0.5, 0.55 * Math.sin(a)); w.rotation.y = -a; winding.add(w); }
      const relay = H.box(T, 0.42, 0.5, 0.42, H.mat(T, "#2b3640"), 1.15, -0.25, 0); scene.add(relay);
      scene.add(H.tube(T, [[0.72, 0.5, 0], [1.15, 0.35, 0], [1.15, 0.0, 0]], 0.02, H.mat(T, "#b87333")));
      const latch = new T.Group(); latch.position.set(1.15, -0.75, 0); scene.add(latch);
      latch.add(H.box(T, 1.3, 0.08, 0.12, H.mat(T, "#ffcc00"), -0.6, 0, 0));
      const fixed = new T.Group(), moving = new T.Group(); scene.add(fixed, moving);
      [-0.17, 0.17].forEach(x => { fixed.add(H.box(T, 0.22, 0.1, 0.22, H.mat(T, "#d4a017", { metalness: 0.8 }), x, -0.95, 0)); moving.add(H.box(T, 0.22, 0.1, 0.22, H.mat(T, "#d4a017", { metalness: 0.8 }), x, -1.06, 0)); });
      const btn = H.cyl(T, 0.12, 0.16, H.mat(T, "#c62828"), 1.15, 1.75, 0); scene.add(btn);
      const testWire = H.tube(T, [[-0.17, 1.2, 0], [-0.55, 1.25, 0.45], [-0.95, 0.5, 0.45], [-0.55, -0.25, 0.45], [0.17, -0.3, 0]], 0.018, H.mat(T, "#888")); scene.add(testWire);
      const res = H.box(T, 0.14, 0.4, 0.14, H.mat(T, "#3b3b3b"), -0.95, 0.5, 0.45); scene.add(res);
      const parts = [
        { name: { he: "ליבה טורואידית", en: "Toroidal core" }, desc: { he: "L ו-N עוברים בתוכה. כשהזרמים שווים – השדות מתבטלים.", en: "L and N pass through it. When the currents are equal, the fields cancel." }, object: core, anchor: [0, 0.5, 0] },
        { name: { he: "סליל חישה", en: "Sense winding" }, desc: { he: "מפיק מתח רק כשיש שדה שקול בליבה – כלומר הפרש זרמים.", en: "Produces a voltage only when there is a net field in the core – a current difference." }, object: winding, anchor: [0.4, 0.5, 0] },
        { name: { he: "ממסר", en: "Relay" }, desc: { he: "מקבל את האות מסליל החישה ומשחרר את הנעילה.", en: "Receives the signal from the sense winding and releases the latch." }, object: relay, anchor: [1.15, -0.25, 0] },
        { name: { he: "נעילה ומגעים", en: "Latch and contacts" }, desc: { he: "בשחרור הנעילה הקפיץ פותח את המגעים בפאזה ובאפס.", en: "When the latch is released, a spring opens the contacts in line and neutral." }, object: moving, anchor: [0, -1, 0] },
        { name: { he: "לחצן T ונגד בדיקה", en: "Test button T and resistor" }, desc: { he: "מעביר זרם קטן מ-L אל N <b>מסביב</b> לליבה – הפרש מלאכותי.", en: "Passes a small current from L to N <b>around</b> the core – an artificial difference." }, object: btn, anchor: [1.15, 1.75, 0] }];
      let tripped = false;
      return {
        parts,
        update(s) {
          const trip = s.mode !== "balanced";
          ring.visible = trip;
          testWire.material.color.set(s.mode === "test" ? "#ff7a00" : "#888888");
          const from = tripped ? 1 : 0, to = trip ? 1 : 0; tripped = trip;
          const apply = k => { latch.rotation.z = -0.5 * k; moving.position.y = -0.3 * k; };
          const labels = [
            { pos: [-0.17, 1.75, 0], text: "L", tone: "" }, { pos: [0.17, 1.75, 0], text: "N", tone: "" },
            { pos: [-0.9, 0.5, 0], text: trip ? { he: "I(L) ≠ I(N) → IΔ", en: "I(L) ≠ I(N) → IΔ" } : { he: "I(L) = I(N)", en: "I(L) = I(N)" }, tone: trip ? "bad" : "ok" },
            { pos: [0, -1.55, 0], text: trip ? { he: "מגעים פתוחים", en: "Contacts open" } : { he: "מגעים סגורים", en: "Contacts closed" }, tone: trip ? "ok" : "" }];
          const status = { balanced: { he: "כל הזרם שיוצא ב-L חוזר ב-N: השדות בליבה מתבטלים, ואין מתח בסליל החישה.", en: "All current out on L returns on N: the fields in the core cancel and the sense winding sees no voltage." },
            leak: { he: "חלק מהזרם חוזר דרך האדמה: נוצר שדה שקול בליבה, הסליל מפעיל את הממסר, והנעילה פותחת את המגעים.", en: "Part of the current returns through earth: a net field appears in the core, the winding drives the relay and the latch opens the contacts." },
            test: { he: "לחצן T מעביר זרם דרך הנגד מסביב לליבה – אותו אפקט כמו דליפה. הבדיקה מוכיחה שהמנגנון עובד, לא שההארקה תקינה.", en: "Button T passes current through the resistor around the core – the same effect as leakage. It proves the mechanism works, not that the earthing is sound." } }[s.mode];
          return { labels, status, tone: trip ? "warn" : "safe",
            animate: from === to ? null : t => { const k = Math.min(1, t / 0.6); apply(from + (to - from) * (k * k * (3 - 2 * k))); return k < 1; } };
        }
      };
    }
  };
})();
