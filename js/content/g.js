/* Module G – Extra-low voltage (SELV/PELV). */
PE.content.G = {
  code: "G", icon: "🔋",
  title: { he: "מתח נמוך מאוד (SELV / PELV)", en: "Extra-low voltage (SELV / PELV)" },
  short: { he: "מתח נמוך מאוד", en: "ELV" },
  lessons: [
    { code: "G1", id: "g-intro", kind: "intro", title: { he: "העיקרון: מתח שלא מזרים זרם מסוכן", en: "The principle: a voltage too low to drive a dangerous current" }, blocks: [
      { type: "callout", tone: "hook", he: "בבריכה יש תאורה תת-מימית של {{12 V}}. השכן חיבר לתאורת הגינה ספק {{12 V}} זול מהאינטרנט, \"כי זה אותו מתח\". האם זה אותו דבר?", en: "The pool has {{12 V}} underwater lighting. The neighbour connected a cheap {{12 V}} adapter from the internet to his garden lights, \"because it's the same voltage\". Is it the same?" },
      { type: "p", label: "principle", he: "אם המתח נמוך מספיק, גם נגיעה ישירה לא מזרימה זרם מסוכן – כי עכבת הגוף גבוהה במתחים נמוכים (מודול A1). אבל זה נכון רק אם המתח <b>נשאר</b> נמוך גם בתקלה. לכן המקור חייב להיות <b>מופרד בטיחותית</b> מהרשת: שנאי בטיחות, סוללה, או ספק שעומד בתקן.", en: "If the voltage is low enough, even direct contact does not drive a dangerous current – body impedance is high at low voltages (module A1). But only if the voltage <b>stays</b> low during a fault. So the source must be <b>safely separated</b> from the mains: a safety transformer, a battery, or a compliant power supply." },
      { type: "table", head: [{ he: "", en: "" }, { he: "SELV", en: "SELV" }, { he: "PELV", en: "PELV" }], rows: [
        [{ he: "מקור", en: "Source" }, { he: "מופרד בטיחותית", en: "Safely separated" }, { he: "מופרד בטיחותית", en: "Safely separated" }],
        [{ he: "קשר לאדמה", en: "Relation to earth" }, { he: "אין – המעגל והגופים לא מוארקים", en: "None – circuit and parts unearthed" }, { he: "המעגל או הגופים מוארקים", en: "Circuit or parts earthed" }],
        [{ he: "דוגמה", en: "Example" }, { he: "תאורת בריכה, צעצועים", en: "Pool lighting, toys" }, { he: "מעגלי פיקוד במכונות", en: "Machine control circuits" }]] },
      { type: "table", caption: { he: "גבולות מקובלים (תקנה – לאמת)", en: "Usual limits (regulation – verify)" }, head: [{ he: "תנאים", en: "Conditions" }, { he: "AC", en: "AC" }, { he: "DC חלק", en: "Ripple-free DC" }], rows: [
        [{ he: "גבול מתח נמוך מאוד", en: "Extra-low voltage limit" }, "{{50 V}}", "{{120 V}}"], [{ he: "ללא הגנה בסיסית, מקום יבש", en: "No basic protection, dry location" }, "{{25 V}}", "{{60 V}}"], [{ he: "בריכה, אזור 0", en: "Pool, zone 0" }, "{{12 V}}", "{{30 V}}"]] },
      { type: "p", label: "regulation", source: "IEC 60364-4-41 §414; IEC 60364-7-702", he: "בבריכה, מקור ה-SELV ממוקם מחוץ לאזורים 0, 1 ו-2.", en: "At a pool the SELV source is placed outside zones 0, 1 and 2." }
    ] },
    { code: "G2", id: "g-sim", kind: "sim", title: { he: "סימולטור: מתח, מקום ומקור", en: "Simulator: voltage, location and source" }, blocks: [
      { type: "sim", id: "g-elv", predict: { state: { src: "adapterFault", u: 12 }, q: { he: "ספק {{12 V}} זול – לא שנאי בטיחות – והבידוד בתוכו נפגע. אדם נוגע במנורה. מה המצב?", en: "A cheap {{12 V}} adapter – not a safety transformer – has an internal insulation fault. A person touches the lamp. What is the situation?" }, options: [{ he: "בטוח – זה {{12 V}}", en: "Safe – it's {{12 V}}" }, { he: "מסוכן – בלי הפרדה בטוחה, מתח הרשת עובר לצד הנמוך", en: "Dangerous – without safe separation, mains voltage reaches the low side" }], answer: 1,
        explain: { he: "ה-{{12 V}} מגן רק כשהמקור לא יכול להעביר את מתח הרשת. זה ההבדל בין שנאי בטיחות לספק כלשהו.", en: "{{12 V}} only protects if the source cannot pass mains voltage. That is the difference between a safety transformer and any adapter." } } },
      { type: "list", items: [{ he: "העלו את המתח בהדרגה במיקום \"רטוב\": מתי עוברים את הגבול?", en: "Raise the voltage gradually in a \"wet\" location: when is the limit exceeded?" }, { he: "השוו {{12 V}} ו-{{50 V}} בבריכה: מה הזרם בגוף?", en: "Compare {{12 V}} and {{50 V}} in the pool: what is the body current?" }] }
    ] },
    { code: "G3", id: "g-practice", kind: "practice", title: { he: "בפועל ותרגול", en: "In practice, and practice" }, blocks: [
      { type: "list", items: [
        { label: "regulation", source: "IL-1991 · מקור משני", he: "לפי התקנות, במיתקן המוגן במתח נמוך מאוד לא תותקן הארקת שיטה או הארקת הגנה – כלומר ההגנה מקבילה ל-SELV. מעגלי PELV מוארקים הם מקרה נפרד.", en: "Under the regulations, an installation protected by extra-low voltage has no system or protective earthing – the protection matches SELV. Earthed PELV circuits are a separate case." },
        { label: "practice", he: "שנאי בטיחות מסומן בסימן IEC 60417-5222 (שני מעגלים מופרדים) ועומד ב-IEC 61558-2-6.", en: "A safety transformer carries the IEC 60417-5222 mark and complies with IEC 61558-2-6." },
        { label: "practice", he: "מוליכי מעגל ה-SELV נפרדים פיזית ממוליכי מתח אחרים, או מבודדים לפי המתח הגבוה ביותר בתעלה.", en: "SELV conductors are kept physically separate from other circuits, or insulated for the highest voltage present." },
        { label: "principle", he: "מתח נמוך מאוד הוא <b>גם</b> הגנה בסיסית וגם הגנה בעת תקלה – לכן הוא נחשב שיטה שלמה בפני עצמה.", en: "Extra-low voltage provides <b>both</b> basic and fault protection – so it counts as a complete method by itself." }] },
      { type: "practice", items: [
        { given: { he: "{{24 V}}, עכבת גוף יבש בכ-{{24 V}}: {{3300 Ω}}", en: "{{24 V}}, dry body impedance at about {{24 V}}: {{3300 Ω}}" }, ask: { he: "מהו הזרם בגוף (mA)?", en: "What is the body current (mA)?" }, answer: 7.27, tol: 0.03, unit: "mA",
          steps: [{ he: "{{I = U / Z}}", en: "{{I = U / Z}}" }, { he: "{{24 / 3300 ≈ 0.0073 A ≈ 7.3 mA}} – אזור AC-2", en: "{{24 / 3300 ≈ 0.0073 A ≈ 7.3 mA}} – zone AC-2" }] },
        { given: { he: "{{230 V}}, עכבת גוף רטוב ב-{{230 V}}: {{1100 Ω}}", en: "{{230 V}}, wet body impedance at {{230 V}}: {{1100 Ω}}" }, ask: { he: "מהו הזרם בגוף (mA)?", en: "What is the body current (mA)?" }, answer: 209, tol: 0.03, unit: "mA",
          steps: [{ he: "{{I = 230 / 1100}}", en: "{{I = 230 / 1100}}" }, { he: "{{≈ 209 mA}} – פי כמעט 30", en: "{{≈ 209 mA}} – almost 30 times more" }] }
      ] }
    ] },
    { code: "G4", id: "g-check", kind: "check", title: { he: "בדקו את עצמכם", en: "Check yourself" }, blocks: [
      { type: "quiz", items: [
        { q: { he: "מה ההבדל בין SELV ל-PELV?", en: "What is the difference between SELV and PELV?" }, o: [{ he: "ב-PELV המעגל או הגופים מוארקים", en: "In PELV the circuit or parts are earthed" }, { he: "ב-SELV המתח גבוה יותר", en: "SELV has a higher voltage" }, { he: "אין הבדל", en: "No difference" }], a: 0, why: { he: "שניהם ממקור מופרד בטיחותית; רק הקשר לאדמה שונה.", en: "Both come from a safely separated source; only the earth relation differs." } },
        { q: { he: "למה {{12 V}} \"תמיד בטוח\" אינה אמירה נכונה?", en: "Why is \"{{12 V}} is always safe\" not true?" }, o: [{ he: "כי אם המקור לא מופרד, תקלה בו מעבירה מתח רשת", en: "Because if the source is not separated, a fault in it passes mains voltage" }, { he: "כי {{12 V}} תמיד מסוכן", en: "Because {{12 V}} is always dangerous" }], a: 0, why: { he: "המתח הנמוך מגן רק יחד עם הפרדה בטוחה.", en: "Low voltage protects only together with safe separation." }, mis: { he: "\"מתח נמוך = בטוח, בלי קשר למקור\".", en: "\"Low voltage = safe, whatever the source.\"" } },
        { q: { he: "מהו הגבול המקובל לתאורה בבריכה, אזור 0?", en: "What is the usual limit for pool lighting in zone 0?" }, o: [{ he: "{{50 V AC}}", en: "{{50 V AC}}" }, { he: "{{12 V AC}}", en: "{{12 V AC}}" }, { he: "{{230 V}} עם פחת", en: "{{230 V}} with an RCD" }], a: 1, why: { he: "גוף טבול – עכבה נמוכה מאוד. תקנה – לאמת.", en: "A submerged body – very low impedance. Regulation – verify." } },
        { q: { he: "למה הזרם ב-{{230 V}} גדול פי יותר מ-10 מזה שב-{{23 V}}?", en: "Why is the current at {{230 V}} more than 10 times that at {{23 V}}?" }, from: "A1", o: [{ he: "כי עכבת הגוף יורדת כשהמתח עולה", en: "Because body impedance falls as voltage rises" }, { he: "כי חוק אוהם לא חל על הגוף", en: "Because Ohm's law does not apply to the body" }], a: 0, why: { he: "חוק אוהם חל – אבל Z תלויה במתח.", en: "Ohm's law applies – but Z depends on voltage." } },
        { q: { he: "חזרה מ-F: האם מחברים PE למכשיר מחלקה II?", en: "Review from F: is a PE connected to a class II appliance?" }, from: "F2", o: [{ he: "לא", en: "No" }, { he: "כן", en: "Yes" }], a: 0, why: { he: "ההגנה מבוססת על שתי שכבות בידוד.", en: "Protection is based on two insulation layers." } }
      ] }
    ] },
    { code: "G5", id: "g-loc", kind: "location", title: { he: "איזו הגנה מתאימה כאן? (2/3)", en: "Which protection fits here? (2/3)" }, blocks: [
      { type: "p", he: "עכשיו עם כל השיטות עד G.", en: "Now with all methods up to G." },
      { type: "location", set: [2] }
    ] }
  ]
};
