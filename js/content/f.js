/* Module F – Double / reinforced insulation (class II). */
PE.content.F = {
  code: "F", icon: "⧈",
  title: { he: "בידוד מגן / בידוד כפול", en: "Double / reinforced insulation" },
  short: { he: "בידוד כפול", en: "Class II" },
  lessons: [
    { code: "F1", id: "f-intro", kind: "intro", title: { he: "העיקרון: שתי שכבות שלא תלויות זו בזו", en: "The principle: two independent layers" }, blocks: [
      { type: "callout", tone: "hook", he: "למקדחה החדשה יש תקע עם שני פינים בלבד, בלי הארקה. האם היא פחות בטוחה ממכונת הכביסה עם התקע המוארק?", en: "The new drill has a plug with only two pins, no earth. Is it less safe than the washing machine with its earthed plug?" },
      { type: "p", label: "principle", he: "בשיטות B–D ההגנה תלויה במתקן: מוליך הגנה, מפסק, הארקה. ב<b>בידוד כפול</b> ההגנה בנויה בתוך המכשיר: <b>בידוד בסיסי</b> סביב החלקים החיים, ועוד <b>בידוד משלים</b> בלתי תלוי – או שכבה אחת של <b>בידוד מוגבר</b> שקולה לשתיהן. תקלה בשכבה אחת לא מחשמלת את הגוף.", en: "In methods B–D protection depends on the installation: PE, breaker, earthing. With <b>double insulation</b> it is built into the appliance: <b>basic insulation</b> around live parts, plus an independent <b>supplementary insulation</b> – or a single layer of <b>reinforced insulation</b> equivalent to both. A failure of one layer does not make the case live." },
      { type: "table", head: [{ he: "מחלקה", en: "Class" }, { he: "הגנה בסיסית", en: "Basic protection" }, { he: "הגנה בעת תקלה", en: "Fault protection" }, { he: "סימון", en: "Mark" }], rows: [
        ["0", { he: "בידוד בסיסי", en: "Basic insulation" }, { he: "אין", en: "None" }, "—"], ["I", { he: "בידוד בסיסי", en: "Basic insulation" }, { he: "חיבור הגוף ל-PE + ניתוק", en: "Case on PE + disconnection" }, "⏚"],
        ["II", { he: "בידוד בסיסי", en: "Basic insulation" }, { he: "בידוד משלים / מוגבר", en: "Supplementary / reinforced insulation" }, "⧈"], ["III", { he: "מתח נמוך מאוד", en: "Extra-low voltage" }, { he: "המקור (SELV)", en: "The source (SELV)" }, "◇ III"]] },
      { type: "figure", id: "class-marks", viewBox: "0 0 960 200", caption: { he: "סימני המחלקות לפי IEC 60417: הארקת הגנה (מחלקה I), ריבוע כפול (מחלקה II), מעוין עם III (מחלקה III).", en: "Class marks per IEC 60417: protective earth (class I), double square (class II), diamond with III (class III)." } },
      { type: "h", he: "בדיקה קצרה", en: "Quick check" },
      { type: "quiz", items: [
        { q: { he: "כמה שכבות הגנה בלתי תלויות יש במכשיר מחלקה II?", en: "How many independent protection layers does a class II appliance have?" }, o: [{ he: "{{1}}", en: "{{1}}" }, { he: "{{2}}", en: "{{2}}" }], a: 1, why: { he: "בידוד בסיסי ובידוד משלים (או בידוד מוגבר שקול לשניהם).", en: "Basic and supplementary insulation (or reinforced insulation equivalent to both)." } },
        { q: { he: "מה השכבה השנייה במחלקה I?", en: "What is the second layer in class I?" }, o: [{ he: "מוליך ההגנה וניתוק אוטומטי", en: "The protective conductor and automatic disconnection" }, { he: "בידוד משלים", en: "Supplementary insulation" }], a: 0, why: { he: "לכן מחלקה I בלי PE אינה מוגנת.", en: "That is why class I without a PE is unprotected." } }
      ] },
    ] },
    { code: "F2", id: "f-sim", kind: "sim", title: { he: "סימולטור: פגיעה בשכבות הבידוד", en: "Simulator: damaging the insulation layers" }, blocks: [
      { type: "sim", id: "f-class", predict: { state: { cls: 1, basic: true, pe: false }, q: { he: "מכשיר מחלקה I – מישהו ניתק את פין ההארקה בתקע. עכשיו הבידוד הבסיסי נפגע. מה המצב?", en: "A class I appliance – someone has removed the earth pin from the plug. Now the basic insulation fails. What is the situation?" }, options: [{ he: "בטוח – יש עוד שכבת בידוד", en: "Safe – there is another insulation layer" }, { he: "הגוף חי ואין שום ניתוק", en: "The case is live and nothing disconnects" }, { he: "המאמ\"ת מנתק", en: "The MCB trips" }], answer: 1,
        explain: { he: "במחלקה I ה-PE הוא שכבת ההגנה השנייה. בלעדיו נשאר רק הבידוד הבסיסי – כמו מחלקה 0.", en: "In class I the PE is the second layer of protection. Without it only basic insulation remains – as in class 0." } } },
      { type: "list", items: [{ he: "במחלקה II פגעו בשכבה אחת, ואז בשתיהן. מה ההבדל?", en: "In class II damage one layer, then both. What is the difference?" }, { he: "החזירו את ה-PE במחלקה I ופגעו בבידוד הבסיסי: מה מגן עכשיו?", en: "Restore the PE in class I and damage the basic insulation: what protects now?" }] }
    ] },
    { code: "F3", id: "f-check", kind: "check", title: { he: "בפועל, ובדקו את עצמכם", en: "In practice, and check yourself" }, blocks: [
      { type: "list", items: [
        { label: "regulation", source: "IEC 61140", he: "אין לחבר מוליך הגנה לחלקים מוליכים של מכשיר מחלקה II, ואין לו הדק הארקה.", en: "No protective conductor may be connected to conductive parts of a class II appliance, and it has no earth terminal." },
        { label: "practice", he: "בידוד כפול מגן כל עוד המעטפת שלמה: מכשיר עם גוף סדוק או כבל פגום – מוציאים משימוש.", en: "Double insulation protects only while the enclosure is intact: an appliance with a cracked case or damaged cord is taken out of use." },
        { label: "practice", he: "שיטה זו קיימת גם ברמת המתקן: לוחות חשמל וציוד ב\"בידוד שווה ערך\" (מעטפת מבודדת מלאה).", en: "The method also exists at installation level: boards and equipment with \"equivalent insulation\" (a complete insulating enclosure)." },
        { label: "practice", he: "יתרון מרכזי: ההגנה לא תלויה בטיב ההארקה או במפסק של הבית שבו משתמשים במכשיר.", en: "Main advantage: protection does not depend on the earthing or breaker of the building where the appliance is used." }] },
      { type: "quiz", items: [
        { q: { he: "מהו סימן מכשיר מחלקה II?", en: "What is the class II mark?" }, o: [{ he: "ריבוע בתוך ריבוע", en: "A square inside a square" }, { he: "סימן הארקה", en: "The earth symbol" }, { he: "משולש עם ברק", en: "A triangle with a lightning bolt" }], a: 0, why: { he: "IEC 60417-5172.", en: "IEC 60417-5172." } },
        { q: { he: "במחלקה II הבידוד הבסיסי נפגע. מה קורה?", en: "In class II the basic insulation fails. What happens?" }, o: [{ he: "הגוף חי", en: "The case is live" }, { he: "הבידוד המשלים עדיין מגן", en: "The supplementary insulation still protects" }, { he: "המפסק מנתק", en: "The breaker trips" }], a: 1, why: { he: "שתי השכבות בלתי תלויות.", en: "The two layers are independent." } },
        { q: { he: "האם צריך להאריק מכשיר מחלקה II \"ליתר ביטחון\"?", en: "Should a class II appliance be earthed \"to be safe\"?" }, o: [{ he: "כן, תמיד", en: "Yes, always" }, { he: "לא – אסור, ואין לכך מקום במכשיר", en: "No – it is not allowed, and there is no terminal for it" }], a: 1, why: { he: "המכשיר מתוכנן כך שההגנה לא תלויה ב-PE.", en: "The appliance is designed so protection does not depend on a PE." }, mis: { he: "\"מכשיר בלי הארקה הוא מסוכן\".", en: "\"An appliance without earth is dangerous.\"" } },
        { q: { he: "מה תפקיד ה-PE במכשיר מחלקה I?", en: "What is the role of the PE in a class I appliance?" }, o: [{ he: "הגנה בעת תקלה: מאפשר לזרם התקלה להפעיל את ההגנה ולנתק", en: "Fault protection: lets the fault current operate the protection and disconnect" }, { he: "הזנת המכשיר", en: "Supplying the appliance" }], a: 0, why: { he: "בלי PE, מחלקה I שקולה למחלקה 0.", en: "Without a PE, class I is equivalent to class 0." } },
        { q: { he: "חזרה מ-E: מה מבטל את ההגנה של הפרד מגן?", en: "Review from E: what defeats protective separation?" }, from: "E2", o: [{ he: "תקלה ראשונה לאדמה במעגל המשני", en: "A first fault to earth on the secondary" }, { he: "כבל קצר", en: "A short cable" }], a: 0, why: { he: "היא יוצרת מסלול חזרה.", en: "It creates a return path." } }
      ] }
    ] }
  ]
};
