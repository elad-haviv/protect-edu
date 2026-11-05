/* Module J – Compare and choose. */
PE.content.J = {
  code: "J", icon: "⚖",
  title: { he: "השוואה ובחירה", en: "Compare and choose" },
  short: { he: "השוואה", en: "Compare" },
  lessons: [
    { code: "J1", id: "j-card", kind: "card", title: { he: "כרטיס השוואה: שבע השיטות", en: "Comparison card: the seven methods" }, blocks: [
      { type: "p", he: "הטבלה מסכמת את שבע השיטות. סימן ✓ מופיע ליד כל שיטה שעברתם את הבדיקה שלה.", en: "The table sums up the seven methods. A ✓ appears next to each method whose check you have passed." },
      { type: "card" },
      { type: "callout", tone: "info", label: "principle", he: "שלוש קבוצות: <b>ניתוק אוטומטי</b> (B, C, D) – ההגנה תלויה במפסק ובמוליך ההגנה; <b>מניעת מתח מסוכן</b> (F, G) – ההגנה בתוך המכשיר או במקור; <b>מניעת מסלול</b> (E, H) – אין דרך לזרם לעבור דרך הגוף.", en: "Three groups: <b>automatic disconnection</b> (B, C, D) – depends on a device and the protective conductor; <b>no dangerous voltage</b> (F, G) – protection is in the appliance or the source; <b>no path</b> (E, H) – no route for current through the body." }
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
        [{ he: "PEN קטוע ברשת", en: "Supply PEN broken" }, { he: "השוואת פוטנציאלים מקטינה את ההפרש בין החלקים; פחת במגע לאדמה", en: "Bonding keeps the difference between parts small; the RCD for contact to earth" }],
        [{ he: "פחת תקול", en: "Faulty RCD" }, { he: "איפוס מנתק את תקלת הבידוד; השוואה מקטינה את מתח המגע", en: "TN disconnects the insulation fault; bonding limits the touch voltage" }],
        [{ he: "מגע בפאזה ובאפס יחד", en: "Touching line and neutral together" }, { he: "שום שיטה במעגל – רק בידוד ומניעת גישה לחלקים חיים", en: "No method in the circuit – only insulation and keeping live parts out of reach" }]] },
      { type: "h", he: "נסו: דוד עם השוואה ובלעדיה", en: "Try it: a heater with and without bonding" },
      { type: "sim", id: "h-bond", defaults: { bond: true } }
    ] }
  ]
};
