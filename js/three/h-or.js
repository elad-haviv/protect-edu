/* H3 – operating theatre on a floating supply: isolating transformer, insulation monitor, alarm panel, equipment. */
(function () {
  "use strict";
  PE.scenes["h-or"] = {
    camera: { pos: [6.5, 4.6, 6.5], target: [0, 1.1, -0.6] },
    params: [
      { key: "fault1", type: "bool", def: false, label: { he: "תקלה ראשונה בציוד", en: "First fault in equipment" } },
      { key: "fault2", type: "bool", def: false, label: { he: "תקלה שנייה בקוטב השני", en: "Second fault on the other conductor" }, show: s => s.fault1 }],
    build(T, scene, ctx) {
      const H = PE.s3, dark = ctx.dark;
      scene.add(H.box(T, 7, 0.05, 6, H.mat(T, dark ? "#2f3b45" : "#cfe3e6"), 0, -0.025, 0));
      scene.add(H.box(T, 7, 3.2, 0.1, H.mat(T, dark ? "#26313b" : "#e6f0f2"), 0, 1.6, -3));
      scene.add(H.box(T, 0.1, 3.2, 6, H.mat(T, dark ? "#232d36" : "#dde9ec"), -3.5, 1.6, 0));
      // operating table + lamp
      const table = new T.Group(); scene.add(table);
      table.add(H.box(T, 2.2, 0.12, 0.7, H.mat(T, "#9aa6b0", { metalness: 0.6 }), 0.3, 0.95, 0.4));
      table.add(H.cyl(T, 0.09, 0.9, H.mat(T, "#7d858c", { metalness: 0.7 }), 0.3, 0.45, 0.4));
      const lamp = H.cyl(T, 0.45, 0.12, H.mat(T, "#f5f5f5", { emissive: 0x222222 }), 0.3, 2.7, 0.4); scene.add(lamp);
      scene.add(H.cyl(T, 0.03, 0.4, H.mat(T, "#888"), 0.3, 2.95, 0.4));
      // equipment trolley (monitor)
      const equip = new T.Group(); equip.position.set(1.9, 0, -0.8); scene.add(equip);
      const eqMat = H.mat(T, "#e2e6ea", { metalness: 0.4 });
      equip.add(H.box(T, 0.7, 0.9, 0.5, eqMat, 0, 0.6, 0));
      equip.add(H.box(T, 0.6, 0.45, 0.06, H.mat(T, "#1b2733"), 0, 1.3, 0.1));
      // isolating transformer cabinet + IMD + alarm panel on the back wall
      const cab = H.box(T, 1.1, 1.6, 0.5, H.mat(T, "#b8c2cc", { metalness: 0.4 }), -2.6, 0.8, -2.6); scene.add(cab);
      const xfmr = new T.Group(); xfmr.position.set(-2.6, 0.75, -2.32); scene.add(xfmr);
      [-0.15, 0.15].forEach(x => { const r = new T.Mesh(new T.TorusGeometry(0.18, 0.05, 10, 30), H.mat(T, "#b87333", { metalness: 0.7 })); r.position.x = x; xfmr.add(r); });
      const imd = H.box(T, 0.5, 0.35, 0.08, H.mat(T, "#2b3640"), -1.3, 1.6, -2.94); scene.add(imd);
      const lampMat = new T.MeshStandardMaterial({ color: 0x2e9d5b, emissive: 0x2e9d5b, emissiveIntensity: 0.8 });
      const alarm = new T.Mesh(new T.SphereGeometry(0.09, 16, 12), lampMat); alarm.position.set(-1.15, 1.6, -2.88); scene.add(alarm);
      const panel = H.box(T, 0.7, 0.45, 0.06, H.mat(T, "#f2f5f8"), 0.9, 1.9, -2.94); scene.add(panel);
      const panelLamp = new T.Mesh(new T.SphereGeometry(0.07, 16, 12), lampMat); panelLamp.position.set(0.7, 1.95, -2.88); scene.add(panelLamp);
      // conductors (floating, grey) and PE (green)
      const cond = H.mat(T, "#3b4650");
      scene.add(H.tube(T, [[-2.6, 1.6, -2.6], [-2.6, 2.4, -2.85], [1.9, 2.4, -2.85], [1.9, 1.05, -1.05]], 0.025, cond));
      scene.add(H.tube(T, [[-2.5, 1.6, -2.6], [-2.5, 2.3, -2.85], [2.0, 2.3, -2.85], [2.0, 1.05, -1.05]], 0.025, cond));
      const pe = H.mat(T, "#2f9e44");
      scene.add(H.tube(T, [[1.9, 0.15, -0.8], [1.9, 0.05, -2.8], [-2.0, 0.05, -2.9]], 0.025, pe));
      scene.add(H.tube(T, [[0.3, 0.05, 0.4], [0.3, 0.05, -2.9]], 0.025, pe));
      scene.add(H.box(T, 0.6, 0.1, 0.1, H.mat(T, "#b87333", { metalness: 0.8 }), -2.0, 0.2, -2.92));
      const bolt = H.box(T, 0.08, 0.3, 0.08, H.mat(T, "#ffcc00", { emissive: 0x664400 }), 1.75, 1.0, -0.55); bolt.visible = false; scene.add(bolt);
      const bolt2 = bolt.clone(); bolt2.position.set(0.0, 1.05, 0.75); bolt2.visible = false; scene.add(bolt2);
      const parts = [
        { name: { he: "שנאי מבדל", en: "Isolating transformer" }, desc: { he: "מזין את הרשת הצפה; המשני שלו אינו מוארק.", en: "Feeds the floating network; its secondary is not earthed." }, object: cab, anchor: [-2.6, 0.8, -2.6] },
        { name: { he: "מכשיר השגחה על הבידוד", en: "Insulation monitoring device" }, desc: { he: "מודד ברציפות את התנגדות הבידוד לאדמה ומדליק התראה בתקלה ראשונה.", en: "Continuously measures insulation resistance to earth and lights an alarm at a first fault." }, object: imd, anchor: [-1.3, 1.6, -2.9] },
        { name: { he: "לוח התראה", en: "Alarm panel" }, desc: { he: "מודיע לצוות שיש תקלה ראשונה; העבודה ממשיכה ומזמינים חשמלאי.", en: "Tells staff there is a first fault; work continues and an electrician is called." }, object: panel, anchor: [0.9, 1.9, -2.9] },
        { name: { he: "ציוד רפואי", en: "Medical equipment" }, desc: { he: "גוף מתכתי מחובר ל-PE ולפס השוואה מקומי.", en: "A metal case on the PE and a local bonding bar." }, object: equip, anchor: [1.9, 0.9, -0.8] },
        { name: { he: "שולחן ניתוח", en: "Operating table" }, desc: { he: "חלק מוליך נגיש, מחובר להשוואת הפוטנציאלים.", en: "An accessible conductive part, connected to the bonding." }, object: table, anchor: [0.3, 1, 0.4] }];
      return {
        parts,
        update(s, c) {
          const r = c.model.itSupply({ fault1: s.fault1, fault2: s.fault1 && s.fault2 });
          const tripped = !!(r.trip && r.trip.status === "yes");
          bolt.visible = s.fault1; bolt2.visible = s.fault1 && s.fault2;
          const col = r.alarm ? 0xc62828 : 0x2e9d5b; lampMat.color.setHex(col); lampMat.emissive.setHex(col);
          lamp.material.emissive.setHex(tripped ? 0x000000 : 0x444444);
          return {
            labels: [
              { pos: [-1.3, 2.0, -2.9], text: r.alarm ? { he: `התראה: {{${PE.fmt(r.Riso_k)} kΩ}}`, en: `Alarm: ${PE.fmt(r.Riso_k)} kΩ` } : { he: "בידוד תקין", en: "Insulation OK" }, tone: r.alarm ? "bad" : "ok" },
              { pos: [1.9, 1.75, -0.8], text: tripped ? { he: "מנותק", en: "Disconnected" } : { he: `גוף: {{${PE.fmt(r.Ut)} V}}`, en: `Case: ${PE.fmt(r.Ut)} V` }, tone: tripped ? "" : r.Ut > 50 ? "bad" : "ok" },
              { pos: [0.3, 3.1, 0.4], text: tripped ? { he: "החשמל נותק!", en: "Power cut!" } : { he: "תאורה פועלת", en: "Lights on" }, tone: tripped ? "bad" : "ok" }],
            tone: tripped ? "warn" : r.alarm ? "warn" : "safe",
            status: tripped ? { he: "תקלה שנייה לפני שתוקנה הראשונה: קצר בין המוליכים – המפסק ניתק, וחדר הניתוח בלי חשמל. בדיוק מה שהשגחה על הבידוד נועדה למנוע.", en: "A second fault before the first was fixed: a short between conductors – the breaker tripped, and the theatre lost power. Exactly what insulation monitoring is meant to prevent." }
              : r.alarm ? { he: `תקלה ראשונה: זרם של {{${PE.fmt(r.Id_mA)} mA}} בלבד, והגופים ב-{{${PE.fmt(r.Ut)} V}}. הניתוח ממשיך; הנורה האדומה מזמינה חשמלאי לאתר את התקלה.`, en: `First fault: only {{${PE.fmt(r.Id_mA)} mA}} flows and the cases sit at {{${PE.fmt(r.Ut)} V}}. The operation continues; the red lamp calls an electrician to find the fault.` }
              : { he: "הרשת הצפה תקינה: המקור לא מוארק, הגופים מוארקים, ומכשיר ההשגחה מראה בידוד תקין.", en: "The floating network is healthy: the source is unearthed, the cases are earthed, and the monitor shows good insulation." }
          };
        }
      };
    }
  };
})();
