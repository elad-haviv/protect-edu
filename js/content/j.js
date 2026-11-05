/* Module J – Compare and choose. */
PE.content.J = {
  code: "J", icon: "⚖",
  title: { he: "השוואה ובחירה", en: "Compare and choose" },
  short: { he: "השוואה", en: "Compare" },
  lessons: [
    { code: "J1", id: "j-card", kind: "card", title: { he: "כרטיס השוואה: שבע השיטות", en: "Comparison card: the seven methods" }, blocks: [
      { type: "p", he: "הטבלה מסכמת את שבע השיטות. סימן ✓ מופיע ליד כל שיטה שעברתם את הבדיקה שלה.", en: "The table sums up the seven methods. A ✓ appears next to each method whose check you have passed." },
      { type: "card" },
      { type: "callout", tone: "info", label: "principle", he: "שלוש קבוצות: <b>ניתוק אוטומטי</b> (B, C, D) – ההגנה תלויה במפסק ובמוליך ההגנה; <b>מניעת מתח מסוכן</b> (F, G) – ההגנה בתוך המכשיר או במקור; <b>מניעת מסלול או מניעת ניתוק מיותר</b> (E, H) – אין דרך לזרם לחזור דרך האדמה.", en: "Three groups: <b>automatic disconnection</b> (B, C, D) – depends on a device and the protective conductor; <b>no dangerous voltage</b> (F, G) – protection is in the appliance or the source; <b>no return path</b> (E, H) – no way for current to return through earth." }
    ] },
    { code: "J2", id: "j-loc", kind: "location", title: { he: "איזו הגנה מתאימה כאן? (3/3)", en: "Which protection fits here? (3/3)" }, blocks: [
      { type: "p", he: "התרגיל האחרון, עם כל שבע השיטות.", en: "The last exercise, with all seven methods." },
      { type: "location", set: [3] }
    ] },
    { code: "J3", id: "j-layers", kind: "intro", title: { he: "הגנה בשכבות", en: "Layered protection" }, blocks: [
      { type: "callout", tone: "hook", he: "אם כל שיטה מגינה לבד – למה בחדר רחצה בדירה משתמשים בשלוש?", en: "If each method protects on its own – why does a home bathroom use three?" },
      { type: "p", label: "principle", he: "לכל שיטה יש נקודת כשל: ה-PEN יכול להיקטע (C), ה-PE יכול להתנתק (B, C), הפחת לא רואה מגע בין פאזה לאפס (D). שילוב שיטות שכשליהן <b>שונים</b> משאיר הגנה גם כששכבה אחת נכשלת.", en: "Every method has a failure point: the PEN can break (C), the PE can come loose (B, C), the RCD cannot see a line–neutral touch (D). Combining methods with <b>different</b> failure points leaves protection when one layer fails." },
      { type: "table", head: [{ he: "כשל", en: "Failure" }, { he: "מה עדיין מגן בחדר הרחצה", en: "What still protects in the bathroom" }], rows: [
        [{ he: "PE מנותק בדוד", en: "Heater PE disconnected" }, { he: "פחת {{30 mA}} – הזרם דרך האדם הוא דליפה", en: "The {{30 mA}} RCD – current through the person is leakage" }],
        [{ he: "PEN קטוע ברשת", en: "Supply PEN broken" }, { he: "השוואת פוטנציאלים (אמצעי משלים, J4) מקטינה את ההפרש בין החלקים; פחת במגע לאדמה", en: "Bonding (a complementary measure, J4) keeps the difference between parts small; the RCD for contact to earth" }],
        [{ he: "פחת תקול", en: "Faulty RCD" }, { he: "איפוס מנתק את תקלת הבידוד; השוואה מקטינה את מתח המגע", en: "TN disconnects the insulation fault; bonding limits the touch voltage" }],
        [{ he: "מגע בפאזה ובאפס יחד", en: "Touching line and neutral together" }, { he: "שום שיטה במעגל – רק בידוד ומניעת גישה לחלקים חיים", en: "No method in the circuit – only insulation and keeping live parts out of reach" }]] },
      { type: "h", he: "נסו: דוד עם השוואה ובלעדיה", en: "Try it: a heater with and without bonding" },
      { type: "sim", id: "h-bond", defaults: { bond: true } }
    ] },
    { code: "J4", id: "j-bond", kind: "sim", title: { he: "אמצעים משלימים: השוואת פוטנציאלים ומקום מבודד", en: "Complementary measures: equipotential bonding and non-conducting location" }, blocks: [
      { type: "callout", tone: "info", label: "practice", he: "השוואת פוטנציאלים ומקום מבודד אינם אחת משבע שיטות ההגנה שבתקנות. השוואת פוטנציאלים היא <b>אמצעי משלים</b> שמקטין את מתח המגע בין חלקים (חדרי רחצה, בריכות); מקום מבודד הוא <b>אמצעי מיוחד נפרד</b>, רק בפיקוח אנשי מקצוע.", en: "Equipotential bonding and non-conducting locations are not among the seven protection methods in the regulations. Bonding is a <b>complementary measure</b> that reduces the touch voltage between parts (bathrooms, pools); a non-conducting location is a <b>separate special measure</b>, only under skilled supervision." },
      { type: "callout", tone: "hook", he: "ציפור יושבת על קו מתח גבוה ולא קורה לה כלום. אדם רטוב באמבטיה נוגע בברז ובדוד – ומקבל מכה, אף שהמאמ\"ת ירד אחרי חלקיק שנייה. מה ההבדל?", en: "A bird sits on a high-voltage line and nothing happens to it. A wet person in a bath touches the tap and the water heater – and gets a shock, even though the breaker tripped within a fraction of a second. What is the difference?" },
      { type: "p", label: "principle", he: "זרם עובר בגוף רק כשיש <b>הפרש מתח</b> בין שתי נקודות שהגוף נוגע בהן. בהשוואת פוטנציאלים מחברים את כל החלקים המוליכים שאפשר לגעת בהם יחד – צנרת מתכתית, מבנה, גופי מכשירים – במוליכים בעלי התנגדות נמוכה. כשהפוטנציאל של אחד עולה בתקלה, כולם עולים יחד, וההפרש ביניהם קטן.", en: "Current flows in the body only when there is a <b>voltage difference</b> between two points it touches. Equipotential bonding connects all touchable conductive parts – metal pipes, structure, appliance cases – with low-resistance conductors. When one part's potential rises in a fault, they all rise together, and the difference between them stays small." },
      { type: "table", head: [{ he: "סוג", en: "Type" }, { he: "מה מחברים", en: "What is connected" }], rows: [
        [{ he: "השוואת פוטנציאלים ראשית", en: "Main bonding" }, { he: "צנרת נכנסת (מים, גז), חלקי מבנה מתכתיים, מוליך ההארקה – לפס ההשוואה הראשי (MET)", en: "Incoming pipes (water, gas), metal structure, the earthing conductor – to the main earthing terminal (MET)" }],
        [{ he: "השוואת פוטנציאלים משלימה (מקומית)", en: "Supplementary (local) bonding" }, { he: "חלקים שאפשר לגעת בהם יחד במקום מסוכן – למשל בחדר רחצה", en: "Parts that can be touched together in a hazardous location – e.g. a bathroom" }]] },
      { type: "p", label: "principle", he: "<b>מקום מבודד (לא מוליך)</b> פועל אחרת: רצפה וקירות מבודדים, אין מוליך הגנה, וחלקים מוליכים מרוחקים כך שאי אפשר לגעת בשניים יחד. כך אין מסלול לאדמה דרך הגוף.", en: "A <b>non-conducting location</b> works differently: insulating floor and walls, no protective conductor, and conductive parts spaced so two cannot be touched at once. So there is no path to earth through the body." },
      { type: "h", he: "בדיקה קצרה", en: "Quick check" },
      { type: "quiz", items: [
        { q: { he: "מה מסוכן לאדם שנוגע בשני חלקים?", en: "What is dangerous for a person touching two parts?" }, o: [{ he: "הפרש המתח ביניהם", en: "The voltage difference between them" }, { he: "המתח של כל אחד לבד", en: "The voltage of each one alone" }], a: 0, why: { he: "זרם עובר רק כשיש הפרש.", en: "Current only flows when there is a difference." } },
        { q: { he: "מה עושה השוואת פוטנציאלים בזמן תקלה?", en: "What does bonding do during a fault?" }, o: [{ he: "כל החלקים עולים יחד וההפרש קטן", en: "All parts rise together and the difference stays small" }, { he: "היא מנתקת את המעגל", en: "It disconnects the circuit" }], a: 0, why: { he: "הניתוק עדיין תפקיד המפסק.", en: "Disconnection is still the device's job." } }
      ] },
      { type: "callout", tone: "warn", label: "regulation", source: "IEC 60364-4-41 Annex C", he: "מקום מבודד והשוואת פוטנציאלים מקומית לא מוארקת מיועדים <b>רק</b> למתקנים בפיקוח אנשי מקצוע מוסמכים – לא לדירות.", en: "Non-conducting locations and earth-free local bonding are <b>only</b> for installations supervised by skilled persons – not for homes." },
      { type: "h", he: "סימולטור", en: "Simulator" },
      { type: "sim", id: "h-bond", predict: { state: { bond: false }, q: { he: "בזמן תקלה בדוד, המאמ\"ת עוד לא ניתק. האדם נוגע בדוד ובצינור. הצינור מחובר לפס ההשוואה הראשי, והדוד מחובר ל-PE. מה ההפרש ביניהם?", en: "During a fault in the heater, the MCB has not yet tripped. The person touches the heater and the pipe. The pipe is bonded to the main bar; the heater is on the PE. What is the voltage between them?" }, options: [{ he: "{{0 V}} – שניהם מחוברים לאותו פס", en: "{{0 V}} – both connect to the same bar" }, { he: "{{If × R_PE}} – נפילת המתח על ה-PE", en: "{{If × R_PE}} – the voltage drop along the PE" }, { he: "{{230 V}}", en: "{{230 V}}" }], answer: 1,
        explain: { he: "זרם התקלה זורם ב-PE ויוצר עליו נפילת מתח – כאן {{300 A × 0.2 Ω = 60 V}}. הצינור נשאר ב-{{0 V}}. מוליך השוואה משלים בין הדוד לצינור מקטין את ההפרש לכמה וולטים.", en: "The fault current flows in the PE and drops a voltage along it – here {{300 A × 0.2 Ω = 60 V}}. The pipe stays at {{0 V}}. A supplementary bond between heater and pipe cuts the difference to a few volts." } } },
      { type: "list", items: [{ he: "הפעילו השוואה משלימה ושנו את התנגדותה: מה קורה למתח המגע?", en: "Switch on supplementary bonding and change its resistance: what happens to the touch voltage?" }, { he: "עברו ל\"מקום מבודד\" והורידו את התנגדות הרצפה מתחת ל-{{50 kΩ}}.", en: "Switch to \"non-conducting location\" and lower the floor resistance below {{50 kΩ}}." }] },
      { type: "h", he: "בפועל ותרגול", en: "In practice, and practice" },
      { type: "list", items: [
        { label: "regulation", source: "IL-1991 · מקור משני / IEC 60364-4-41 §411.3.1.2", he: "בכל מבנה מבצעים השוואת פוטנציאלים ראשית לפס השוואה ראשי. חתכים מינימליים לפי התקנות – לאמת.", en: "Every building has main bonding to a main earthing terminal. Minimum sizes per the regulations – verify." },
        { label: "regulation", source: "IEC 60364-7-701", he: "בחדרי רחצה: פחת {{30 mA}} לכל המעגלים, והשוואה משלימה כשנדרשת. יש לאמת את הדרישות הישראליות.", en: "In bathrooms: a {{30 mA}} RCD on all circuits, plus supplementary bonding where required. Verify the Israeli requirements." },
        { label: "practice", he: "חיבורי השוואה צריכים להיות נגישים לבדיקה ומסומנים; צנרת פלסטיק לא מחייבת השוואה.", en: "Bonding connections should be accessible for inspection and labelled; plastic pipework needs no bonding." },
        { label: "principle", he: "השוואה משלימה לא מחליפה ניתוק – היא מקטינה את מתח המגע עד שהמפסק מנתק.", en: "Supplementary bonding does not replace disconnection – it reduces the touch voltage until the device disconnects." }] },
      { type: "practice", items: [
        { given: { he: "זרם תקלה {{250 A}}, התנגדות PE מהדוד לפס {{0.16 Ω}}, אין השוואה משלימה", en: "Fault current {{250 A}}, PE resistance from heater to bar {{0.16 Ω}}, no supplementary bonding" }, ask: { he: "מהו מתח המגע בין הדוד לצינור (V)?", en: "What is the touch voltage between heater and pipe (V)?" }, answer: 40, tol: 0.02, unit: "V",
          steps: [{ he: "הצינור ב-{{0 V}} (מחובר לפס)", en: "The pipe is at {{0 V}} (on the bar)" }, { he: "{{U = 250 × 0.16 = 40 V}}", en: "{{U = 250 × 0.16 = 40 V}}" }] },
        { given: { he: "מקום מבודד, {{230 V}}, רצפה {{50 kΩ}}, עכבת גוף {{1000 Ω}}", en: "Non-conducting location, {{230 V}}, floor {{50 kΩ}}, body impedance {{1000 Ω}}" }, ask: { he: "מהו הזרם בגוף (mA)?", en: "What is the body current (mA)?" }, answer: 4.51, tol: 0.03, unit: "mA",
          steps: [{ he: "{{I = 230 / (1000 + 50000)}}", en: "{{I = 230 / (1000 + 50000)}}" }, { he: "{{≈ 4.5 mA}} – אזור AC-2", en: "{{≈ 4.5 mA}} – zone AC-2" }] }
      ] }
    ] },
    { code: "J5", id: "j-bath", kind: "scene", title: { he: "תלת-ממד: חדר רחצה", en: "3D: a bathroom" }, blocks: [
      { type: "p", he: "סובבו את החדר ובחרו שני חלקים כדי לראות את המתח ביניהם, עם השוואה משלימה ובלעדיה.", en: "Rotate the room and pick two parts to see the voltage between them, with and without supplementary bonding." },
      { type: "scene", id: "h-bath", title: { he: "השוואת פוטנציאלים בחדר רחצה", en: "Bonding in a bathroom" }, parts: [
        { name: { he: "פס השוואת פוטנציאלים", en: "Bonding bar" }, desc: { he: "נקודת חיבור משותפת לכל מוליכי ההשוואה.", en: "A common connection point for all bonding conductors." } },
        { name: { he: "צנרת מים מתכתית", en: "Metal water pipes" }, desc: { he: "חלק מוליך זר – יכול להביא פוטנציאל מבחוץ.", en: "An extraneous conductive part – it can bring in a potential from outside." } },
        { name: { he: "אמבט מתכתי", en: "Metal bath" }, desc: { he: "חלק מוליך זר במגע ישיר עם גוף רטוב.", en: "An extraneous conductive part in direct contact with a wet body." } },
        { name: { he: "דוד חשמלי", en: "Electric water heater" }, desc: { he: "חלק מוליך נגיש (מחלקה I) מחובר ל-PE.", en: "An exposed conductive part (class I) on the PE." } },
        { name: { he: "מוליכי השוואה משלימה", en: "Supplementary bonding conductors" }, desc: { he: "מחברים את החלקים זה לזה ולפס, כך שההפרש ביניהם קטן.", en: "Connect the parts to each other and to the bar, so the difference between them is small." } }] }
    ] }
  ]
};
