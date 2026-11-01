(function(){
const {$,val,on,svg,fmt}=Edu; const U=230, Rb=2, IB_INST=80; // MCB 16A type B: instantaneous at 5xIn
$('meter').innerHTML=Edu.meterHTML();
function render(){
  const Ra=val('ra'), Rbody=val('skin'), earthed=val('earthed'), rcd=val('rcd'), fault=val('fault');
  let If=0, Ut=0, tripped=false, tripT='–', how='';
  if(fault){
    if(earthed){ If=U/(Ra+Rb); Ut=If*Ra;
      if(If>=IB_INST){tripped=true;tripT='< 0.1 שנ׳';how='מפסק זרם-יתר';}
      else if(rcd){tripped=true;tripT='≤ 0.3 שנ׳';how='מפסק פחת';}
      else {tripT='לא מנתק!';}
    } else { Ut=U; If=0; if(rcd){tripT='לא מזהה דליפה'} else tripT='לא מנתק!'; }
  }
  const Ib = fault ? Edu.bodyCurrent(Ut,Rbody) : 0;
  const z = Edu.zone(Ib); const lvl = fault? (tripped?Math.min(z.lvl,2):z.lvl):0;
  // scene
  const chassisCol = !fault?'#cfd8dc': Ut>50?'#ef9a9a':'#fff59d';
  let s=svg.ground(0,760,250,80);
  // source
  s+=`<rect x="20" y="60" width="110" height="90" rx="8" fill="#e3f2fd" stroke="#0b5cad" stroke-width="2"/>`+svg.text(75,95,'מקור',{w:700})+svg.text(75,118,'230V',{s:13});
  s+=`<path d="M75 150 V250" stroke="#555" stroke-width="3"/>`+svg.rod(75,250,40)+svg.text(75,320,'R<tspan baseline-shift="sub" font-size="10">b</tspan> = 2Ω',{s:12});
  // phase wire
  s+=`<path d="M130 85 H330" stroke="#c62828" stroke-width="4"/>`+svg.text(230,75,'פאזה',{c:'#c62828',s:12});
  s+=`<path d="M130 125 H330" stroke="#1565c0" stroke-width="4"/>`+svg.text(230,145,'אפס',{c:'#1565c0',s:12});
  // appliance
  s+=`<rect x="330" y="60" width="140" height="140" rx="10" fill="${chassisCol}" stroke="#37474f" stroke-width="3"/>`+svg.text(400,180,'גוף המכונה',{s:13,w:700});
  s+=`<circle cx="400" cy="120" r="22" fill="#fff" stroke="#37474f" stroke-width="3"/>`;
  if(fault){ s+=`<path d="M330 85 H400 V150" stroke="#c62828" stroke-width="3" stroke-dasharray="3 3"/>`+svg.bolt(404,148,.6); }
  // earth wire
  if(earthed){
    s+=`<path d="M400 200 V250" stroke="#2e7d32" stroke-width="4" stroke-dasharray="10 4"/>`+svg.rod(400,250,45)+svg.text(400,320,'R<tspan baseline-shift="sub" font-size="10">a</tspan> = '+Ra+'Ω',{s:12});
    if(fault) s+=`<path class="flow" d="M400 200 V272 H75" fill="none" stroke="#ef6c00" stroke-width="3"/><path class="flow" d="M75 272 V150" stroke="#ef6c00" stroke-width="3"/>`;
  } else s+=svg.text(400,225,'אין הארקה!',{c:'#c62828',w:700,s:14});
  // person
  s+=svg.person(560,250,1.5,lvl,[470,150]);
  if(fault && Ut>0) s+=svg.text(400,45,'U מגע ≈ '+fmt(Ut)+'V',{c:Ut>50?'#c62828':'#2e7d32',w:700,s:16});
  $('scene').innerHTML=s;
  // readouts
  $('r_if').textContent = fault? (earthed? fmt(If)+' A':'≈ 0 A') : '–';
  $('r_ut').textContent = fault? fmt(Ut)+' V' : '0 V';
  $('r_ib').textContent = fault? fmt(Ib)+' mA':'0 mA';
  $('r_t').textContent = fault? tripT : '–';
  Edu.setMeter($('meter'),Ib);
  $('zone').innerHTML = `<span class="${z.cls}">אזור: ${z.t}</span>`;
  if(!fault) Edu.verdict('verdict','safe','המכונה תקינה – אין מתח על הגוף. הפעילו "תקלה" כדי לראות מה קורה.');
  else if(tripped) Edu.verdict('verdict','safe',`✅ ההגנה פעלה: ${how} ניתק את המעגל תוך ${tripT}. האדם הרגיש לכל היותר מכה קצרה.`);
  else if(Ut<=50) Edu.verdict('verdict','mid',`⚠️ מתח המגע (${fmt(Ut)}V) מתחת ל-50V, אך אין ניתוק – התקלה נשארת במערכת. יש לתקן!`);
  else Edu.verdict('verdict','danger',`⛔ סכנה! הגוף נשאר בטווח ${fmt(Ut)}V ואין ניתוק. ${earthed?'הארקה בלבד לא הפילה את המפסק – נדרש פחת או הקטנת R<sub>a</sub>.':'ללא הארקה כל הזרם עובר דרך האדם.'}`);
}
on(['ra','skin','earthed','rcd','fault'],render);
Edu.quiz('quiz',[
 {q:'מהי מטרת הארקת ההגנה?',o:['להגדיל את הזרם במכשיר','להוריד את מתח המגע על גוף המכשיר בעת תקלה','לחסוך חשמל','להגן מנגיעה ישירה בפאזה'],a:1,w:'ההארקה יוצרת מסלול לזרם התקלה ומורידה את מתח הגוף ביחס לאדמה.'},
 {q:'התנגדות ההארקה R<sub>a</sub> = 20Ω וזרם התקלה 10A. מהו מתח המגע?',o:['2V','30V','200V','230V'],a:2,w:'U = I × R<sub>a</sub> = 10 × 20 = 200V – מסוכן!'},
 {q:'מדוע בהארקת הגנה משלבים מפסק פחת?',o:['כי זרם התקלה קטן ועלול לא להפיל את מפסק הזרם','כי הפחת מחליף את האלקטרודה','כי הפחת מגדיל את R<sub>a</sub>','אין סיבה'],a:0,w:'ההתנגדות של האדמה מגבילה את הזרם, והפחת מזהה גם זרמים של 30mA.'},
 {q:'מהו מתח המגע שנחשב בטוח בדרך כלל (בתנאים רגילים)?',o:['עד 50V','עד 230V','עד 400V','כל מתח, אם יש הארקה'],a:0,w:'המתח המרבי המותר לשהייה ממושכת במגע עקיף הוא 50V (ו-25V במקומות מיוחדים).'}
],'m1');
Edu.init('m1');
})();
