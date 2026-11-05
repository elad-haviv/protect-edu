/* Module D – Residual current device. */
PE.content.D = {
  code: "D", icon: "🛡",
  title: { he: "מפסק מגן לזרם דלף (פחת)", en: "Residual current device (RCD)" },
  short: { he: "פחת", en: "RCD" },
  lessons: [
    { code: "D1", id: "d-intro", kind: "intro", title: { he: "העיקרון: לספור את הזרם שחוזר", en: "The principle: count the current that comes back" }, blocks: [
      { type: "callout", tone: "hook", he: "ילד נגע בחוט חשוף של מנורה. הפחת קפץ והילד בסדר. כמה שבועות אחר כך אביו תיקן את אותה מנורה, נגע בשני החוטים כשעמד על כיסא עץ – והפחת לא קפץ. למה?", en: "A child touched a bare lamp wire. The RCD tripped and the child is fine. A few weeks later his father, repairing the same lamp, touched both wires while standing on a wooden chair – and the RCD did not trip. Why?" },
      { type: "p", label: "principle", he: "מוליכי הפאזה והאפס עוברים יחד דרך <b>ליבה טורואידית</b>. כשכל הזרם שיוצא בפאזה חוזר באפס, השדות המגנטיים מבטלים זה את זה. אם חלק מהזרם \"בורח\" לאדמה – דרך בידוד פגום או דרך אדם – נוצר הפרש <b>IΔ</b>, בסליל החישה נוצר מתח, וממסר פותח את המגעים.", en: "The line and neutral conductors pass together through a <b>toroidal core</b>. When all current going out on the line comes back on the neutral, their magnetic fields cancel. If some current \"escapes\" to earth – through faulty insulation or through a person – a difference <b>IΔ</b> appears, the sense winding produces a voltage and a relay opens the contacts." },
      { type: "formula", tex: "I<sub>Δ</sub> = I<sub>L</sub> − I<sub>N</sub>      I<sub>Δ</sub> ≥ I<sub>Δn</sub>  ⇒  trip" },
      { type: "figure", id: "rcd-toroid", viewBox: "0 0 960 340", caption: { he: "הפחת רואה רק את ההפרש בין הזרם שיוצא לזרם שחוזר.", en: "The RCD only sees the difference between the current going out and the current coming back." } },
      { type: "h", he: "בדיקה קצרה", en: "Quick check" },
      { type: "quiz", items: [
        { q: { he: "מה מודד הפחת?", en: "What does an RCD measure?" }, o: [{ he: "את ההפרש בין זרם הפאזה לזרם האפס", en: "The difference between line and neutral current" }, { he: "את המתח בשקע", en: "The socket voltage" }], a: 0, why: { he: "הליבה הטורואידית רואה רק את סכום הזרמים.", en: "The toroidal core only sees the sum of the currents." } },
        { q: { he: "פחת {{30 mA}} מיועד בעיקר ל-", en: "A {{30 mA}} RCD is mainly for" }, o: [{ he: "הגנה נוספת על חיי אדם", en: "Additional protection of life" }, { he: "הגנה מעומס יתר", en: "Overload protection" }], a: 0, why: { he: "עומס יתר הוא תפקיד המאמ\"ת.", en: "Overload is the MCB's job." }, mis: { he: "\"פחת מגן גם מעומס יתר\".", en: "\"An RCD also protects against overload.\"" } }
      ] },
      { type: "table", head: [{ he: "רגישות", en: "Sensitivity" }, { he: "מטרה עיקרית", en: "Main purpose" }], rows: [
        ["{{10–30 mA}}", { he: "הגנה נוספת על חיי אדם, כולל במגע ישיר", en: "Additional protection of life, including direct contact" }], ["{{100–300 mA}}", { he: "הגנה בעת תקלה במערכות TT; הגנה מפני דליקה", en: "Fault protection in TT systems; fire protection" }], ["{{≥ 500 mA}}", { he: "הגנה מפני דליקה, סלקטיביות", en: "Fire protection, selectivity" }]] }
    ] },
    { code: "D2", id: "d-sim", kind: "sim", title: { he: "סימולטור: מה הפחת רואה – ומה לא", en: "Simulator: what the RCD sees – and what it doesn't" }, blocks: [
      { type: "sim", id: "d-rcd", predict: { state: { scn: "LN" }, q: { he: "אדם עומד על משטח מבודד ונוגע בפאזה <b>ובאפס</b> יחד. פחת {{30 mA}}. מה יקרה?", en: "A person standing on an insulating mat touches line <b>and neutral</b> together. {{30 mA}} RCD. What happens?" }, options: [{ he: "הפחת ינתק – יש זרם דרך אדם", en: "The RCD trips – there is current through a person" }, { he: "הפחת לא ינתק – כל הזרם חוזר באפס", en: "The RCD does not trip – all the current returns on the neutral" }, { he: "המאמ\"ת ינתק", en: "The MCB trips" }], answer: 1,
        explain: { he: "מבחינת הפחת, האדם הוא עוד עומס בין פאזה לאפס. אין הפרש – ולכן אין ניתוק. זה מה שקרה לאב בשאלת הפתיחה.", en: "To the RCD the person is just another load between line and neutral. There is no difference – so no trip. That is what happened to the father in the opening question." } } },
      { type: "list", items: [
        { he: "בחרו \"דליפה במכשיר\" והזיזו את הזרם לאט מ-{{0}} עד {{40 mA}} עם פחת {{30 mA}}: היכן מתחיל אזור ה\"אולי\"?", en: "Choose \"leak in an appliance\" and move the current slowly from {{0}} to {{40 mA}} with a {{30 mA}} RCD: where does the \"maybe\" range start?" },
        { he: "החליפו לפחת {{300 mA}} בתרחיש \"אדם בין פאזה לאדמה\": האם הוא מגן על האדם?", en: "Switch to a {{300 mA}} RCD in the \"person: line to earth\" scenario: does it protect the person?" },
        { he: "בחרו \"עומס יתר\": למה הפחת שקט?", en: "Choose \"overload\": why is the RCD silent?" }] }
    ] },
    { code: "D3", id: "d-scene", kind: "scene", title: { he: "תלת-ממד: בתוך מפסק הפחת", en: "3D: inside the RCD" }, blocks: [
      { type: "p", he: "סובבו את הדגם ולחצו על החלקים. השוו בין מצב \"מאוזן\" למצב \"דליפה\".", en: "Rotate the model and select the parts. Compare the \"balanced\" and \"leakage\" states." },
      { type: "scene", id: "d-rcd", title: { he: "מבנה מפסק פחת", en: "RCD construction" }, parts: [
        { name: { he: "ליבה טורואידית", en: "Toroidal core" }, desc: { he: "טבעת פרומגנטית ש-L ו-N עוברים דרכה; מסכמת את השדות שלהם.", en: "A ferromagnetic ring that L and N pass through; it sums their fields." } },
        { name: { he: "סליל חישה", en: "Sense winding" }, desc: { he: "מפיק מתח רק כשיש הפרש בין הזרמים.", en: "Produces a voltage only when the currents differ." } },
        { name: { he: "ממסר ומנגנון ניתוק", en: "Relay and trip mechanism" }, desc: { he: "משחרר את הנעילה ופותח את המגעים.", en: "Releases the latch and opens the contacts." } },
        { name: { he: "לחצן בדיקה T", en: "Test button T" }, desc: { he: "מעביר זרם קטן דרך נגד מסביב לליבה ויוצר הפרש מלאכותי.", en: "Passes a small current through a resistor around the core, creating an artificial difference." } },
        { name: { he: "מגעים", en: "Contacts" }, desc: { he: "מנתקים את הפאזה ואת האפס.", en: "Disconnect both line and neutral." } }] }
    ] },
    { code: "D4", id: "d-practice", kind: "practice", title: { he: "בפועל ובתקנות", en: "In practice and in the regulations" }, blocks: [
      { type: "list", items: [
        { label: "regulation", source: "IEC 61008-1", he: "זמני ניתוק מרביים לפחת כללי: {{300 ms}} ב-{{IΔn}}, {{150 ms}} ב-{{2·IΔn}}, {{40 ms}} ב-{{5·IΔn}}. בין {{0.5·IΔn}} ל-{{IΔn}} הוא עשוי לנתק או לא.", en: "Maximum trip times for a general-type RCD: {{300 ms}} at {{IΔn}}, {{150 ms}} at {{2·IΔn}}, {{40 ms}} at {{5·IΔn}}. Between {{0.5·IΔn}} and {{IΔn}} it may or may not trip." },
        { label: "regulation", source: "IL-1991 · מקור משני", he: "פחת {{30 mA}} נדרש במעגלי מגורים רבים (שקעים, חדרי רחצה). יש לאמת את היקף החובה מול נוסח התקנות העדכני.", en: "A {{30 mA}} RCD is required on many domestic circuits (sockets, bathrooms). Verify the exact scope against the current regulations." },
        { label: "regulation", source: "IL-1991 · מקור משני", he: "מפסק מגן כהגנה <b>בלעדית</b> (בלי הארקה או איפוס) מותר רק במקרים שהתקנות מגדירות – למשל אתר בנייה, קרון מגורים או מבנה ארעי. בדרך כלל הוא הגנה <b>נוספת</b>.", en: "An RCD as the <b>sole</b> protection (without earthing or neutralization) is allowed only in cases the regulations define – for example a construction site, a residential caravan or a temporary building. Normally it is <b>additional</b> protection." },
        { label: "practice", he: "לוחצים על לחצן הבדיקה T מדי כמה חודשים. הלחצן בודק את המנגנון – לא את ההארקה ולא את זמן הניתוק.", en: "Press the test button T every few months. It tests the mechanism – not the earthing and not the trip time." },
        { label: "practice", he: "פחת אינו מגן מעומס יתר או מקצר בין פאזה לאפס – לשם כך יש מאמ\"ת (או מפסק משולב RCBO).", en: "An RCD does not protect against overload or a line–neutral short – that is the MCB's job (or a combined RCBO)." },
        { label: "practice", he: "סוגים: AC (זרם חילופין בלבד), A (גם זרם ישר פועם), F, B (גם זרם ישר חלק – ממירים, מטעני רכב). הבחירה תלויה בעומסים.", en: "Types: AC (sinusoidal only), A (also pulsating DC), F, B (also smooth DC – inverters, EV chargers). The choice depends on the loads." }] },
      { type: "h", he: "תרגול", en: "Practice" },
      { type: "practice", items: [
        { given: { he: "{{Ra = 40 Ω}}, {{UL = 50 V}}", en: "{{Ra = 40 Ω}}, {{UL = 50 V}}" }, ask: { he: "מהו IΔn המרבי (mA)?", en: "What is the largest IΔn (mA)?" }, answer: 1250, tol: 0.01, unit: "mA",
          steps: [{ he: "{{IΔn ≤ UL / Ra}}", en: "{{IΔn ≤ UL / Ra}}" }, { he: "{{50 / 40 = 1.25 A = 1250 mA}}", en: "{{50 / 40 = 1.25 A = 1250 mA}}" }] },
        { given: { he: "פחת {{30 mA}}, זרם דלף {{150 mA}}", en: "{{30 mA}} RCD, residual current {{150 mA}}" }, ask: { he: "מהו זמן הניתוק המרבי לפי התקן (ms)?", en: "What is the maximum trip time per the standard (ms)?" }, answer: 40, tol: 0, unit: "ms",
          steps: [{ he: "{{150 / 30 = 5}} – כלומר {{5·IΔn}}", en: "{{150 / 30 = 5}} – that is {{5·IΔn}}" }, { he: "ב-{{5·IΔn}}: עד {{40 ms}}", en: "At {{5·IΔn}}: up to {{40 ms}}" }] },
        { given: { he: "אדם בין פאזה לאדמה: {{230 V}}, עכבת גוף {{1225 Ω}}, נעליים ורצפה {{1000 Ω}}", en: "Person from line to earth: {{230 V}}, body impedance {{1225 Ω}}, shoes and floor {{1000 Ω}}" }, ask: { he: "מהו זרם הדלף (mA)?", en: "What is the residual current (mA)?" }, answer: 103.4, tol: 0.03, unit: "mA",
          steps: [{ he: "{{I = 230 / (1225 + 1000)}}", en: "{{I = 230 / (1225 + 1000)}}" }, { he: "{{≈ 0.103 A ≈ 103 mA}} – יותר מ-{{2·IΔn}} לפחת {{30 mA}}", en: "{{≈ 0.103 A ≈ 103 mA}} – more than {{2·IΔn}} for a {{30 mA}} RCD" }] }
      ] }
    ] },
    { code: "D5", id: "d-check", kind: "check", title: { he: "בדקו את עצמכם", en: "Check yourself" }, blocks: [
      { type: "quiz", items: [
        { q: { he: "על מה מבוססת פעולת הפחת?", en: "What is RCD operation based on?" }, o: [{ he: "הפרש בין הזרם בפאזה לזרם באפס", en: "The difference between line and neutral current" }, { he: "גודל הזרם בפאזה", en: "The size of the line current" }, { he: "מתח הרשת", en: "Supply voltage" }], a: 0, why: { he: "הליבה הטורואידית מסכמת את שני הזרמים.", en: "The toroidal core sums both currents." } },
        { q: { he: "האם פחת מגן מעומס יתר?", en: "Does an RCD protect against overload?" }, o: [{ he: "כן", en: "Yes" }, { he: "לא – אין הפרש בין הזרמים", en: "No – there is no difference between the currents" }], a: 1, why: { he: "בעומס יתר יוצא ונכנס אותו זרם.", en: "In an overload the same current goes out and comes back." }, mis: { he: "\"פחת מחליף את המאמ\"ת\".", en: "\"An RCD replaces the MCB.\"" } },
        { q: { he: "פחת {{30 mA}}, זרם דלף {{20 mA}}. מה צפוי?", en: "{{30 mA}} RCD, residual current {{20 mA}}. What happens?" }, o: [{ he: "ניתוק תוך {{300 ms}}", en: "Trip within {{300 ms}}" }, { he: "עשוי לנתק או לא – מעל {{15 mA}} ומתחת ל-{{30 mA}}", en: "May or may not trip – above {{15 mA}} and below {{30 mA}}" }, { he: "בוודאות לא ינתק", en: "Certainly no trip" }], a: 1, why: { he: "התקן מבטיח ניתוק רק מ-{{IΔn}}, ולא מתיר ניתוק מתחת ל-{{0.5·IΔn}}.", en: "The standard guarantees tripping only from {{IΔn}}, and forbids tripping below {{0.5·IΔn}}." } },
        { q: { he: "לחיצה על לחצן T מוכיחה ש...", en: "Pressing the T button proves that…" }, o: [{ he: "ההארקה תקינה", en: "The earthing is sound" }, { he: "המנגנון מסוגל לנתק", en: "The mechanism can trip" }, { he: "זמן הניתוק עומד בתקן", en: "The trip time meets the standard" }], a: 1, why: { he: "הלחצן יוצר הפרש פנימי. זמן ניתוק ורמת זרם בודקים במכשיר בדיקה.", en: "The button creates an internal difference. Trip time and current are tested with an instrument." } },
        { q: { he: "חזרה מ-C: איזו תקלה מסוכנת במיוחד באיפוס ולא נראית לאף מפסק זרם-יתר?", en: "Review from C: which TN fault is especially dangerous and invisible to every overcurrent device?" }, from: "C2", o: [{ he: "קטיעת PEN", en: "A broken PEN" }, { he: "קצר בין פאזה לאפס", en: "A line–neutral short" }], a: 0, why: { he: "אין זרם חריג – רק מתח על הגופים. פחת יכול לעזור אם יש מסלול לאדמה דרך האדם.", en: "There is no abnormal current – only voltage on the cases. An RCD can help if the person provides a path to earth." } },
        { q: { he: "חזרה מ-B: למה במערכת TT כמעט תמיד חייבים פחת?", en: "Review from B: why does a TT system almost always need an RCD?" }, from: "B2", o: [{ he: "כי זרם התקלה דרך האדמה קטן מכדי להפעיל מאמ\"ת מיידית", en: "Because the fault current through earth is too small to trip an MCB instantly" }, { he: "כי אין בו אפס", en: "Because it has no neutral" }], a: 0, why: { he: "Ra ו-Rb מגבילים את הזרם לעשרות אמפר לכל היותר.", en: "Ra and Rb limit the current to tens of amps at most." } }
      ] }
    ] },
    { code: "D6", id: "d-loc", kind: "location", title: { he: "איזו הגנה מתאימה כאן? (1/3)", en: "Which protection fits here? (1/3)" }, blocks: [
      { type: "p", he: "תרגיל חזרה על השיטות שלמדתם עד עכשיו. לכל מקום, סמנו את אמצעי ההגנה שנדרשים בו.", en: "A review of the methods so far. For each place, mark the protection measures it needs." },
      { type: "location", set: [1] }
    ] }
  ]
};
