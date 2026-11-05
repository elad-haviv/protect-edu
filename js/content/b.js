/* Module B – Protective earthing (TT). Hebrew is the master text. {{…}} marks LTR runs (numbers, units, formulas). */
PE.content.B = {
  code: "B", icon: "⏚",
  title: { he: "הארקת הגנה", en: "Protective earthing" },
  short: { he: "הארקת הגנה", en: "Earthing (TT)" },
  lessons: [
    { code: "B1", id: "b-intro", kind: "intro", title: { he: "העיקרון: לתת לזרם התקלה דרך אחרת", en: "The principle: give the fault current another path" }, blocks: [
      { type: "callout", tone: "hook", he: "שני שכנים, אותה תקלה במכונת הכביסה. אחד חטף מכה חשמלית ממושכת, השני הרגיש עקצוץ קצר והחשמל בבית נפל. מה ההבדל בין הבתים?", en: "Two neighbours, the same fault in a washing machine. One got a long electric shock; the other felt a short tingle and the power in the house went off. What was different between the two homes?" },
      { type: "p", label: "principle", he: "במכשיר מ<b>מחלקה I</b> (גוף מתכת) נמצאים מוליכי פאזה בתוך הגוף. אם הבידוד נפגם והפאזה נוגעת בגוף, הגוף מקבל מתח – זהו <b>מגע עקיף</b>. מי שנוגע בגוף ועומד על הרצפה סוגר מעגל דרך גופו אל האדמה.", en: "A <b>class I</b> appliance (metal case) has line conductors inside the case. If the insulation fails and the line touches the case, the case becomes live – this is <b>indirect contact</b>. Anyone touching the case while standing on the floor closes a circuit through their body to earth." },
      { type: "p", label: "principle", he: "בהארקת הגנה מחברים את גוף המכשיר ב<b>מוליך הגנה (PE)</b> אל <b>אלקטרודת הארקה</b> באדמה (הארקת יסוד, יתד או פס). בזמן תקלה זרם התקלה זורם דרך מוליך ההגנה, האדמה וההארקה של נקודת האפס בשנאי – ולא רק דרך האדם.", en: "Protective earthing connects the case through a <b>protective conductor (PE)</b> to an <b>earth electrode</b> (foundation earth, rod or tape). During a fault the fault current flows through the PE, the soil and the earthing of the transformer star point – not only through the person." },
      { type: "formula", tex: "I<sub>f</sub> = U<sub>0</sub> / (R<sub>a</sub> + R<sub>b</sub>)     U<sub>touch</sub> = I<sub>f</sub> · R<sub>a</sub>", he: "Ra – התנגדות הארקת המתקן; Rb – התנגדות הארקת נקודת האפס של השנאי; U0 – המתח בין פאזה לאדמה ({{230 V}}).", en: "Ra – installation earth resistance; Rb – resistance of the transformer star-point earth; U0 – line-to-earth voltage ({{230 V}})." },
      { type: "callout", tone: "warn", label: "principle", he: "ההארקה <b>מקטינה</b> את מתח המגע – אבל לא מבטלת אותו. עם {{Ra = 10 Ω}} ו-{{Rb = 2 Ω}} הגוף עדיין יושב על כ-{{190 V}}. והזרם, כ-{{19 A}}, קטן מכדי להפעיל מאמ\"ת {{C16}} מיידית (נדרשים {{160 A}}).", en: "Earthing <b>reduces</b> the touch voltage – it does not remove it. With {{Ra = 10 Ω}} and {{Rb = 2 Ω}} the case still sits at about {{190 V}}. And the current, about {{19 A}}, is too small to trip a {{C16}} MCB instantly (that needs {{160 A}})." },
      { type: "figure", id: "tt-principle", viewBox: "0 0 960 380", caption: { he: "מסלול זרם התקלה במערכת TT: פאזה ← גוף המכשיר ← PE ← אלקטרודה ← אדמה ← הארקת השנאי.", en: "The fault loop in a TT system: line → case → PE → electrode → soil → transformer earth." } },
      { type: "h", he: "בדיקה קצרה", en: "Quick check" },
      { type: "quiz", items: [
        { q: { he: "מה תפקיד מוליך ההגנה (PE) בהארקת הגנה?", en: "What is the job of the protective conductor (PE) in protective earthing?" },
          o: [{ he: "להוביל את זרם העבודה של המכשיר", en: "To carry the appliance's working current" }, { he: "לתת לזרם התקלה מסלול אל האדמה ולהקטין את מתח הגוף", en: "To give the fault current a path to earth and lower the case voltage" }, { he: "לבטל לגמרי את מתח המגע", en: "To remove the touch voltage completely" }], a: 1,
          why: { he: "ה-PE נושא זרם רק בזמן תקלה. הוא מוריד את מתח הגוף אך לא לאפס – המתח הוא {{If·Ra}}.", en: "The PE only carries current during a fault. It lowers the case voltage but not to zero – the voltage is {{If·Ra}}." },
          mis: { he: "\"אם יש הארקה – אין מתח על הגוף\".", en: "\"If it's earthed, the case has no voltage.\"" } },
        { q: { he: "Ra = 20 Ω, Rb = 2 Ω, U0 = 230 V. מה מתח המגע בקירוב?", en: "Ra = 20 Ω, Rb = 2 Ω, U0 = 230 V. What is the touch voltage, approximately?" },
          o: [{ he: "{{21 V}}", en: "{{21 V}}" }, { he: "{{115 V}}", en: "{{115 V}}" }, { he: "{{209 V}}", en: "{{209 V}}" }], a: 2,
          why: { he: "{{If = 230/22 ≈ 10.5 A}}; {{U = 10.5 × 20 ≈ 209 V}}. רוב המתח נופל על Ra כי היא גדולה מ-Rb.", en: "{{If = 230/22 ≈ 10.5 A}}; {{U = 10.5 × 20 ≈ 209 V}}. Most of the voltage drops across Ra because it is larger than Rb." } }
      ] }
    ] },
    { code: "B2", id: "b-sim", kind: "sim", title: { he: "סימולטור: תקלה במכונת כביסה", en: "Simulator: a fault in a washing machine" }, blocks: [
      { type: "p", he: "הפאזה נגעה בגוף המכונה. שנו את ההארקה, את מפסק הפחת ואת סוג המאמ\"ת, וראו מה קורה למתח המגע, לזרם בגוף ולזמן הניתוק. המודל מחשב את עכבת הגוף לפי המתח (ראו A1) ואת אזור ההשפעה לפי הזרם והזמן (A2).", en: "The line has touched the machine's case. Change the earthing, the RCD and the MCB type, and watch the touch voltage, the body current and the disconnection time. The model takes body impedance from the voltage (see A1) and the effect zone from current and time (A2)." },
      { type: "sim", id: "b-tt", predict: {
        state: { earthed: false, rcd: 30, fault: true, person: true },
        q: { he: "המכונה <b>אינה מוארקת</b>, אבל מותקן פחת {{30 mA}}. אדם נוגע בגוף החי. מה יקרה?", en: "The machine is <b>not earthed</b>, but a {{30 mA}} RCD is installed. A person touches the live case. What happens?" },
        options: [{ he: "הפחת לא יפעל – אין דליפה בלי הארקה", en: "The RCD will not act – no leakage without earthing" }, { he: "הפחת ינתק – הזרם דרך האדם הוא דליפה לאדמה", en: "The RCD trips – the current through the person is a leakage to earth" }, { he: "המאמ\"ת ינתק מיד", en: "The MCB trips immediately" }], answer: 1,
        explain: { he: "הזרם שעובר מהיד אל הרגליים ואל האדמה לא חוזר במוליך האפס – הפחת רואה הפרש של יותר מ-{{100 mA}} ומנתק. לכן פחת {{30 mA}} הוא הגנה נוספת גם כשההארקה פגומה. אבל האדם כן מקבל זרם עד הניתוק.", en: "The current flowing from hand to feet to earth does not return in the neutral – the RCD sees a difference of more than {{100 mA}} and trips. That is why a {{30 mA}} RCD is additional protection even when the earthing is faulty. But the person does carry current until it trips." } } },
      { type: "list", items: [
        { he: "הוסיפו הארקה ובטלו את הפחת: האם המאמ\"ת מנתק? מה מתח המגע?", en: "Add earthing and remove the RCD: does the MCB trip? What is the touch voltage?" },
        { he: "הגדילו את Ra ל-{{200 Ω}} עם פחת {{30 mA}}: האם התנאי {{Ra·IΔn ≤ 50 V}} עדיין מתקיים?", en: "Raise Ra to {{200 Ω}} with a {{30 mA}} RCD: does the condition {{Ra·IΔn ≤ 50 V}} still hold?" },
        { he: "החליפו לפחת {{300 mA}} ו-Ra של {{200 Ω}}: מה השתנה?", en: "Switch to a {{300 mA}} RCD and Ra of {{200 Ω}}: what changed?" }] }
    ] },
    { code: "B3", id: "b-scene", kind: "scene", title: { he: "תלת-ממד: משפך הפוטנציאל סביב האלקטרודה", en: "3D: the potential funnel around the electrode" }, blocks: [
      { type: "p", label: "principle", he: "כשזרם תקלה נכנס לאדמה דרך אלקטרודה, הפוטנציאל של פני הקרקע יורד ככל שמתרחקים ממנה – בקירוב {{V(r) ≈ If·ρ / (2πr)}} לאלקטרודה חצי-כדורית. אדם שנוגע בגוף מוארק ועומד במרחק מה נחשף ל<b>מתח מגע</b>; אדם שהולך ליד האלקטרודה נחשף ל<b>מתח צעד</b> בין רגליו.", en: "When fault current enters the soil through an electrode, the surface potential falls with distance – roughly {{V(r) ≈ If·ρ / (2πr)}} for a hemispherical electrode. A person touching an earthed case while standing some distance away sees a <b>touch voltage</b>; someone walking near the electrode sees a <b>step voltage</b> between their feet." },
      { type: "scene", id: "b-earth", title: { he: "אלקטרודה ומשפך פוטנציאל", en: "Electrode and potential funnel" }, parts: [
        { name: { he: "אלקטרודת הארקה", en: "Earth electrode" }, desc: { he: "יתד, פס או הארקת יסוד; דרכה זרם התקלה נכנס לאדמה.", en: "Rod, tape or foundation earth; the fault current enters the soil through it." } },
        { name: { he: "משפך פוטנציאל", en: "Potential funnel" }, desc: { he: "הפוטנציאל גבוה ליד האלקטרודה ויורד עם המרחק.", en: "The potential is high near the electrode and falls with distance." } },
        { name: { he: "מתח מגע", en: "Touch voltage" }, desc: { he: "ההפרש בין היד (על הגוף המוארק) לרגליים (על הקרקע).", en: "The difference between the hand (on the earthed case) and the feet (on the soil)." } },
        { name: { he: "מתח צעד", en: "Step voltage" }, desc: { he: "ההפרש בין שתי הרגליים, בערך צעד אחד זו מזו.", en: "The difference between the two feet, about one step apart." } }] }
    ] },
    { code: "B4", id: "b-practice", kind: "practice", title: { he: "בפועל ובתקנות", en: "In practice and in the regulations" }, blocks: [
      { type: "list", items: [
        { label: "regulation", source: "IEC 60364-4-41 §411.5", he: "במערכת TT עם פחת: {{Ra · IΔn ≤ 50 V}}. עם פחת {{30 mA}} מספיקה התנגדות של עד כ-{{1666 Ω}} – אבל בפועל שואפים להתנגדות נמוכה בהרבה.", en: "In a TT system with an RCD: {{Ra · IΔn ≤ 50 V}}. With a {{30 mA}} RCD a resistance up to about {{1666 Ω}} is enough – in practice one aims much lower." },
        { label: "regulation", source: "IEC 60364-4-41", he: "זמן ניתוק מרבי במעגל סופי ב-TT: {{0.2 s}} ({{230 V}}); במעגל חלוקה: {{1 s}}. יש לאמת מול התקנות הישראליות.", en: "Maximum disconnection time in a TT final circuit: {{0.2 s}} ({{230 V}}); distribution circuit: {{1 s}}. Verify against the Israeli regulations." },
        { label: "practice", he: "בישראל הארקת יסוד (בבטון היסודות) היא האלקטרודה המקובלת בבניינים חדשים; צנרת מים אינה אלקטרודה אמינה.", en: "In Israel a foundation earth electrode (in the foundation concrete) is the usual electrode in new buildings; water pipes are not a reliable electrode." },
        { label: "practice", he: "את התנגדות ההארקה בודקים במכשיר מדידה ייעודי, בבדיקה ראשונית ובבדיקות תקופתיות.", en: "Earth resistance is measured with a dedicated instrument at the initial and periodic inspections." },
        { label: "principle", he: "הארקה לבדה כמעט אף פעם לא מספיקה כדי להפעיל מאמ\"ת מיידית – לכן משלבים אותה עם מפסק פחת.", en: "Earthing on its own almost never trips an MCB instantly – so it is combined with an RCD." }] },
      { type: "h", he: "תרגול חישובי", en: "Calculation practice" },
      { type: "practice", items: [
        { given: { he: "{{U0 = 230 V}}, {{Ra = 8 Ω}}, {{Rb = 2 Ω}}", en: "{{U0 = 230 V}}, {{Ra = 8 Ω}}, {{Rb = 2 Ω}}" }, ask: { he: "מה מתח המגע על גוף המכשיר בזמן תקלה (V)?", en: "What is the touch voltage on the case during a fault (V)?" }, answer: 184, unit: "V",
          steps: [{ he: "{{If = 230 / (8 + 2) = 23 A}}", en: "{{If = 230 / (8 + 2) = 23 A}}" }, { he: "{{U = If · Ra = 23 × 8 = 184 V}}", en: "{{U = If · Ra = 23 × 8 = 184 V}}" }] },
        { given: { he: "פחת {{IΔn = 30 mA}}, מתח מגע מותר {{UL = 50 V}}", en: "RCD {{IΔn = 30 mA}}, permitted touch voltage {{UL = 50 V}}" }, ask: { he: "מהי התנגדות ההארקה המרבית Ra (Ω)?", en: "What is the maximum earth resistance Ra (Ω)?" }, answer: 1666.7, tol: 0.01, unit: "Ω",
          steps: [{ he: "{{Ra ≤ UL / IΔn}}", en: "{{Ra ≤ UL / IΔn}}" }, { he: "{{Ra ≤ 50 / 0.03 ≈ 1667 Ω}}", en: "{{Ra ≤ 50 / 0.03 ≈ 1667 Ω}}" }] },
        { given: { he: "{{Ra = 120 Ω}}, {{UL = 50 V}}", en: "{{Ra = 120 Ω}}, {{UL = 50 V}}" }, ask: { he: "מהו זרם הפחת הנקוב IΔn המרבי שמתאים (mA)?", en: "What is the largest rated residual current IΔn that works (mA)?" }, answer: 416.7, tol: 0.01, unit: "mA",
          steps: [{ he: "{{IΔn ≤ UL / Ra}}", en: "{{IΔn ≤ UL / Ra}}" }, { he: "{{IΔn ≤ 50 / 120 = 0.417 A ≈ 417 mA}}", en: "{{IΔn ≤ 50 / 120 = 0.417 A ≈ 417 mA}}" }] }
      ] }
    ] },
    { code: "B5", id: "b-check", kind: "check", title: { he: "בדקו את עצמכם", en: "Check yourself" }, blocks: [
      { type: "quiz", items: [
        { q: { he: "במתקן TT ללא פחת, {{Ra = 10 Ω}}, מאמ\"ת {{C16}}. בזמן תקלה לגוף:", en: "TT installation without an RCD, {{Ra = 10 Ω}}, {{C16}} MCB. During a fault to the case:" },
          o: [{ he: "המאמ\"ת מנתק תוך {{10 ms}}", en: "The MCB trips within {{10 ms}}" }, { he: "זרם של כ-{{19 A}} זורם, המאמ\"ת לא מנתק מיידית והגוף נשאר בכ-{{190 V}}", en: "About {{19 A}} flows, the MCB does not trip instantly and the case stays at about {{190 V}}" }, { he: "הגוף נשאר ב-{{0 V}} כי הוא מוארק", en: "The case stays at {{0 V}} because it is earthed" }], a: 1,
          why: { he: "לניתוק מיידי דרושים {{10 × 16 = 160 A}}. התנגדות האדמה מגבילה את הזרם ל-{{230/12 ≈ 19 A}}.", en: "An instant trip needs {{10 × 16 = 160 A}}. The earth resistance limits the current to {{230/12 ≈ 19 A}}." },
          mis: { he: "\"הארקה לבד מפילה את המפסק\".", en: "\"Earthing alone trips the breaker.\"" } },
        { q: { he: "מהו מתח מגע?", en: "What is touch voltage?" },
          o: [{ he: "המתח בין שתי פאזות", en: "The voltage between two lines" }, { he: "המתח בין שני חלקים שאדם נוגע בהם בו-זמנית, למשל גוף מכשיר והקרקע", en: "The voltage between two parts a person touches at once, such as a case and the ground" }, { he: "המתח הנקוב של המכשיר", en: "The appliance's rated voltage" }], a: 1,
          why: { he: "מתח מגע הוא ההפרש בין נקודת היד לנקודת הרגליים (או בין שתי ידיים).", en: "Touch voltage is the difference between the hand point and the feet point (or between two hands)." } },
        { q: { he: "בכמה מותר להגדיל את Ra כשמשתמשים בפחת {{300 mA}} (UL = {{50 V}})?", en: "How large may Ra be with a {{300 mA}} RCD (UL = {{50 V}})?" },
          o: [{ he: "עד כ-{{167 Ω}}", en: "Up to about {{167 Ω}}" }, { he: "עד כ-{{1667 Ω}}", en: "Up to about {{1667 Ω}}" }, { he: "אין הגבלה", en: "No limit" }], a: 0,
          why: { he: "{{50 / 0.3 ≈ 167 Ω}}. פחת רגיש יותר מאפשר התנגדות הארקה גבוהה יותר.", en: "{{50 / 0.3 ≈ 167 Ω}}. A more sensitive RCD allows a higher earth resistance." } },
        { q: { he: "מכשיר לא מוארק עם פחת {{30 mA}}. אדם נוגע בגוף החי ועומד על רצפה מוליכה. מה נכון?", en: "An unearthed appliance with a {{30 mA}} RCD. A person touches the live case standing on a conductive floor. Which is true?" },
          o: [{ he: "הפחת לא מזהה דבר", en: "The RCD detects nothing" }, { he: "הפחת מנתק כי הזרם דרך האדם לא חוזר באפס", en: "The RCD trips because the current through the person does not return in the neutral" }, { he: "המכשיר נשרף", en: "The appliance burns out" }], a: 1,
          why: { he: "זרם דרך הגוף אל האדמה הוא זרם דלף לכל דבר. זו בדיוק ההגנה הנוספת שהפחת נותן.", en: "Current through the body to earth is leakage like any other. This is exactly the additional protection an RCD gives." },
          mis: { he: "\"פחת עובד רק כשיש הארקה\".", en: "\"An RCD only works when there is earthing.\"" } },
        { q: { he: "למה צנרת מים מתכתית אינה אלקטרודת הארקה מספקת?", en: "Why is a metal water pipe not an adequate earth electrode?" },
          o: [{ he: "כי מים מבודדים", en: "Because water insulates" }, { he: "כי חלקים ממנה עשויים להיות מוחלפים בפלסטיק ואז הרציפות אובדת", en: "Because sections may be replaced with plastic, breaking continuity" }, { he: "כי היא מגדילה את מתח המגע", en: "Because it raises the touch voltage" }], a: 1,
          why: { he: "אלקטרודה חייבת להיות קבועה ובשליטת המתקן. צנרת – גם אם מחוברים אליה בהשוואת פוטנציאלים – אינה אמינה כאלקטרודה.", en: "An electrode must be permanent and under the installation's control. Pipework – even if it is bonded – is not reliable as an electrode." } }
      ] }
    ] }
  ]
};
