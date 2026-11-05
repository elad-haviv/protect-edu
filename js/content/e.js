/* Module E – Protective separation (הפרד מגן). */
PE.content.E = {
  code: "E", icon: "⧉",
  title: { he: "הפרד מגן", en: "Protective separation" },
  short: { he: "הפרד מגן", en: "Separation" },
  lessons: [
    { code: "E1", id: "e-intro", kind: "intro", title: { he: "העיקרון: לנתק את הדרך חזרה", en: "The principle: cut the way back" }, blocks: [
      { type: "callout", tone: "hook", he: "רתך עובד בתוך מיכל מתכת רטוב עם מנורה ידנית. המנורה מוזנת משנאי קטן שעומד בחוץ. הכבל של המנורה נקרע והוא נוגע בגיד חשוף – ולא קורה כלום. למה?", en: "A welder works inside a wet metal tank with a hand lamp fed from a small transformer standing outside. The lamp cable tears and he touches a bare core – and nothing happens. Why?" },
      { type: "p", label: "principle", he: "ברשת הרגילה נקודת האפס של השנאי מוארקת. לכן אדם שעומד על הקרקע ונוגע בפאזה סוגר מעגל: פאזה ← גוף ← אדמה ← הארקת השנאי. <b>שנאי הפרדה</b> (יחס {{1:1}}) מזין את המכשיר ממעגל משני ש<b>אינו מחובר לאדמה</b> בשום נקודה. נגיעה במוליך אחד לא סוגרת מעגל.", en: "On the normal supply the transformer star point is earthed. So a person on the ground touching the line closes a circuit: line → body → soil → transformer earth. An <b>isolating transformer</b> ({{1:1}} ratio) feeds the appliance from a secondary circuit that is <b>not connected to earth</b> anywhere. Touching one conductor closes no circuit." },
      { type: "callout", tone: "warn", label: "principle", he: "השיטה מגינה רק כל עוד המעגל המשני <b>נשאר מבודד</b>: תקלה ראשונה לאדמה, כבל ארוך מדי (קיבול), או נגיעה בשני המוליכים – מבטלות אותה.", en: "The method only protects while the secondary <b>stays isolated</b>: a first fault to earth, a cable that is too long (capacitance), or touching both conductors – each defeats it." },
      { type: "h", he: "בדיקה קצרה", en: "Quick check" },
      { type: "quiz", items: [
        { q: { he: "למה נגיעה במוליך אחד של מעגל מופרד אינה סוגרת מעגל?", en: "Why does touching one conductor of a separated circuit not close a circuit?" }, o: [{ he: "כי המעגל המשני לא מחובר לאדמה", en: "Because the secondary is not connected to earth" }, { he: "כי המתח נמוך", en: "Because the voltage is low" }], a: 0, why: { he: "המתח הוא {{230 V}} – אבל אין דרך חזרה.", en: "The voltage is {{230 V}} – but there is no way back." }, mis: { he: "\"שנאי הפרדה מוריד את המתח\".", en: "\"An isolating transformer lowers the voltage.\"" } },
        { q: { he: "מה מבטל את ההגנה?", en: "What defeats the protection?" }, o: [{ he: "תקלה ראשונה לאדמה במעגל המשני", en: "A first fault to earth on the secondary" }, { he: "כבל קצר", en: "A short cable" }], a: 0, why: { he: "היא יוצרת מסלול חזרה דרך האדמה.", en: "It creates a return path through earth." } }
      ] },
      { type: "table", head: [{ he: "", en: "" }, { he: "שנאי הפרדה", en: "Isolating transformer" }, { he: "שנאי בטיחות (מודול G)", en: "Safety transformer (module G)" }], rows: [
        [{ he: "מתח יציאה", en: "Output voltage" }, { he: "כמו הכניסה, למשל {{230 V}}", en: "Same as input, e.g. {{230 V}}" }, { he: "מתח נמוך מאוד, למשל {{12 V}} או {{24 V}}", en: "Extra-low, e.g. {{12 V}} or {{24 V}}" }],
        [{ he: "מה מגן", en: "What protects" }, { he: "אין מסלול חזרה דרך האדמה", en: "No return path through earth" }, { he: "המתח נמוך מכדי להזרים זרם מסוכן", en: "The voltage is too low to drive a dangerous current" }]] }
    ] },
    { code: "E2", id: "e-sim", kind: "sim", title: { he: "סימולטור: נגיעה במעגל מופרד", en: "Simulator: touching a separated circuit" }, blocks: [
      { type: "sim", id: "e-sep", predict: { state: { firstFault: true }, q: { he: "המוליך <b>b</b> של המעגל המשני נגע בצנרת מוארקת (תקלה ראשונה), ואף אחד לא שם לב. עכשיו מישהו נוגע במוליך <b>a</b>. מה יקרה?", en: "Conductor <b>b</b> of the secondary has touched an earthed pipe (a first fault), and nobody noticed. Now someone touches conductor <b>a</b>. What happens?" }, options: [{ he: "כלום – המעגל מופרד", en: "Nothing – the circuit is separated" }, { he: "מכה מסוכנת – התקלה הראשונה הפכה את המעגל למוארק", en: "A dangerous shock – the first fault made the circuit earthed" }, { he: "השנאי נשרף", en: "The transformer burns out" }], answer: 1,
        explain: { he: "אחרי התקלה הראשונה יש מסלול חזרה דרך האדמה, ונגיעה במוליך השני מסוכנת כמו ברשת רגילה. לכן אסור להאריק את המעגל המשני, ומזינים בדרך כלל מכשיר אחד בלבד.", en: "After the first fault there is a return path through earth, and touching the other conductor is as dangerous as on the mains. That is why the secondary must never be earthed, and normally feeds just one appliance." } } },
      { type: "list", items: [
        { he: "הגדילו את אורך הכבל ל-{{800 m}}: מה קורה לזרם בגוף ולמה?", en: "Increase the cable to {{800 m}}: what happens to the body current, and why?" },
        { he: "הפעילו \"שני מכשירים\" וכבו את מוליך ההשוואה: מה המתח בין הגופים?", en: "Switch on \"two appliances\" and turn off the bonding conductor: what is the voltage between the cases?" }] }
    ] },
    { code: "E3", id: "e-practice", kind: "practice", title: { he: "בפועל ובתקנות", en: "In practice and in the regulations" }, blocks: [
      { type: "list", items: [
        { label: "regulation", source: "IEC 60364-4-41 §413", he: "המעגל המשני: מתח עד {{500 V}}; אסור לחבר חלק חי שלו לאדמה או למעגל אחר; גופי המכשירים אינם מחוברים לאדמה או ל-PE.", en: "Secondary circuit: up to {{500 V}}; no live part connected to earth or to another circuit; appliance cases not connected to earth or to a PE." },
        { label: "regulation", source: "IEC 60364-4-41 §413", he: "מגבלה מקובלת: {{U × L ≤ 100,000 V·m}} ואורך כבל עד {{500 m}}. יש לאמת מול התקנות.", en: "Usual limit: {{U × L ≤ 100,000 V·m}} and cable length up to {{500 m}}. Verify against the regulations." },
        { label: "regulation", source: "IEC 60364-4-41 Annex C", he: "כשמזינים יותר ממכשיר אחד: מחברים את הגופים זה לזה במוליך השוואה <b>לא מוארק</b>, כדי שתקלה שנייה תהפוך לקצר ותנותק.", en: "When more than one appliance is fed: the cases are connected together by an <b>unearthed</b> bonding conductor, so a second fault becomes a short circuit and is disconnected." },
        { label: "regulation", source: "IL-1991 · מקור משני", he: "בתקנות השיטה נקראת \"הפרד מגן\". במיתקן המוגן בהפרד מגן לא תותקן הארקת שיטה או הארקת הגנה.", en: "The regulations call this method \"protective separation\". An installation protected by it must have no system earthing or protective earthing." },
        { label: "practice", he: "שימושים: עבודה במקומות מוליכים מוגבלים (מיכלים, דודים), שקעי מכונות גילוח, כלי עבודה באתרים רטובים.", en: "Uses: work in confined conductive locations (tanks, boilers), shaver sockets, tools on wet sites." },
        { label: "practice", he: "השנאי עצמו חייב להיות שנאי הפרדה תקני (IEC 61558-2-4) – לא כל שנאי {{1:1}} מתאים.", en: "The transformer must be a standard isolating transformer (IEC 61558-2-4) – not every {{1:1}} transformer qualifies." }] },
      { type: "h", he: "תרגול", en: "Practice" },
      { type: "practice", items: [
        { given: { he: "מעגל משני {{230 V}}", en: "{{230 V}} secondary" }, ask: { he: "מהו אורך הכבל המרבי לפי {{U·L ≤ 100,000}} (m)?", en: "What is the maximum cable length by {{U·L ≤ 100,000}} (m)?" }, answer: 434.8, tol: 0.01, unit: "m",
          steps: [{ he: "{{L ≤ 100000 / 230}}", en: "{{L ≤ 100000 / 230}}" }, { he: "{{≈ 435 m}} (וגם לא יותר מ-{{500 m}})", en: "{{≈ 435 m}} (and no more than {{500 m}})" }] },
        { given: { he: "כבל {{100 m}}, קיבול {{100 pF/m}}, {{50 Hz}}", en: "{{100 m}} cable, {{100 pF/m}}, {{50 Hz}}" }, ask: { he: "מהי ההיגב הקיבולי של הכבל לאדמה (MΩ)?", en: "What is the cable's capacitive reactance to earth (MΩ)?" }, answer: 0.318, tol: 0.03, unit: "MΩ",
          steps: [{ he: "{{C = 100 × 100 pF = 10 nF}}", en: "{{C = 100 × 100 pF = 10 nF}}" }, { he: "{{Xc = 1 / (2π·50·10⁻⁸) ≈ 318 kΩ = 0.318 MΩ}}", en: "{{Xc = 1 / (2π·50·10⁻⁸) ≈ 318 kΩ = 0.318 MΩ}}" }] }
      ] }
    ] },
    { code: "E4", id: "e-check", kind: "check", title: { he: "בדקו את עצמכם", en: "Check yourself" }, blocks: [
      { type: "quiz", items: [
        { q: { he: "למה נגיעה במוליך אחד אחרי שנאי הפרדה אינה מסוכנת (בתנאים תקינים)?", en: "Why is touching one conductor after an isolating transformer not dangerous (when healthy)?" }, o: [{ he: "כי המתח נמוך", en: "Because the voltage is low" }, { he: "כי למעגל המשני אין חיבור לאדמה, ולכן הזרם לא יכול לחזור", en: "Because the secondary has no connection to earth, so current cannot return" }, { he: "כי יש פחת מובנה", en: "Because there is a built-in RCD" }], a: 1, why: { he: "המתח {{230 V}} – אבל אין מסלול סגור.", en: "The voltage is {{230 V}} – but there is no closed path." }, mis: { he: "\"שנאי הפרדה מוריד את המתח\".", en: "\"An isolating transformer lowers the voltage.\"" } },
        { q: { he: "חשמלאי מאריק את המעגל המשני \"ליתר ביטחון\". מה התוצאה?", en: "An electrician earths the secondary \"to be safe\". What is the result?" }, o: [{ he: "הבטיחות משתפרת", en: "Safety improves" }, { he: "ההגנה מתבטלת – נגיעה במוליך השני מסוכנת", en: "The protection is lost – touching the other conductor is dangerous" }], a: 1, why: { he: "זו בדיוק \"תקלה ראשונה\" שנעשתה בכוונה.", en: "That is a deliberate \"first fault\"." }, mis: { he: "\"הארקה תמיד מוסיפה בטיחות\".", en: "\"Earthing always adds safety.\"" } },
        { q: { he: "מתי הפרד מגן <b>לא</b> מגן?", en: "When does protective separation <b>not</b> protect?" }, o: [{ he: "כשנוגעים בשני מוליכי המעגל המשני", en: "When both secondary conductors are touched" }, { he: "כשנוגעים במוליך אחד בלבד", en: "When only one conductor is touched" }], a: 0, why: { he: "האדם סוגר את המעגל בעצמו.", en: "The person closes the circuit themselves." } },
        { q: { he: "שני מכשירים על אותו שנאי הפרדה. מה תפקיד מוליך ההשוואה ביניהם?", en: "Two appliances on one isolating transformer. What does the bonding conductor between them do?" }, o: [{ he: "מאריק אותם", en: "Earths them" }, { he: "הופך תקלה שנייה בקוטב אחר לקצר שמנותק", en: "Turns a second fault on the other pole into a short that is disconnected" }], a: 1, why: { he: "המוליך <b>לא</b> מוארק – הוא רק מחבר את הגופים.", en: "The conductor is <b>not</b> earthed – it only links the cases." } },
        { q: { he: "חזרה מ-D: אדם בין פאזה לאפס על משטח מבודד – האם פחת מנתק?", en: "Review from D: a person between line and neutral on an insulating mat – does an RCD trip?" }, from: "D2", o: [{ he: "כן", en: "Yes" }, { he: "לא", en: "No" }], a: 1, why: { he: "אין הפרש בין הזרמים.", en: "There is no difference between the currents." } }
      ] }
    ] }
  ]
};
