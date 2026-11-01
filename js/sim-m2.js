(function(){
const {$,val,on,svg,fmt}=Edu; const U=230, Zsrc=0.35, rho=0.0225;
function render(){
  const L=val('len'), A=val('area'), k=val('brk'), In=val('in'), fault=val('fault'), broken=val('broken');
  const Rpe=rho*L/A, Rph=rho*L/A, Zs=Zsrc+Rpe+Rph;
  const If = broken?0:U/Zs, thr=k*In;
  const inst = fault && !broken && If>=thr;
  const slow = fault && !broken && !inst && If>=1.45*In;
  const Ut = !fault?0 : broken? U : If*Rpe;
  const body = Edu.bodyCurrent(Ut,1000);
  let s=svg.ground(0,760,265,40);
  s+=`<rect x="20" y="50" width="100" height="110" rx="8" fill="#e3f2fd" stroke="#0b5cad" stroke-width="2"/>`+svg.text(70,95,'מקור',{w:700})+svg.text(70,118,'230V',{s:13})+svg.text(70,142,'נקודת אפס',{s:11});
  // breaker
  s+=`<rect x="150" y="62" width="60" height="38" rx="6" fill="${inst?'#ef9a9a':'#fff'}" stroke="#333" stroke-width="2"/>`+svg.text(180,86,inst?'מנותק':'מפסק',{s:12,w:700});
  s+=`<path d="M120 80 H150 M210 80 H330" stroke="#c62828" stroke-width="4"/>`+svg.text(270,70,'פאזה',{c:'#c62828',s:12});
  // PE / neutral return
  s+= broken
    ? `<path d="M120 140 H220" stroke="#2e7d32" stroke-width="4"/><path d="M260 140 H400" stroke="#2e7d32" stroke-width="4" stroke-dasharray="8 4"/>`+svg.cross(240,140)
    : `<path d="M120 140 H400 V190" stroke="#2e7d32" stroke-width="4" stroke-dasharray="10 4"/>`;
  s+=svg.text(270,160,'מוליך אפס / PE',{c:'#2e7d32',s:12});
  const col=!fault?'#cfd8dc':Ut>50?'#ef9a9a':'#fff59d';
  s+=`<rect x="330" y="60" width="140" height="130" rx="10" fill="${col}" stroke="#37474f" stroke-width="3"/>`+svg.text(400,175,'גוף המכשיר',{s:13,w:700});
  if(fault){ s+=`<path d="M330 80 H400 V120" stroke="#c62828" stroke-width="3" stroke-dasharray="3 3"/>`+svg.bolt(404,118,.6);
    if(!broken) s+=`<path class="flow" d="M330 80 H120" stroke="#ef6c00" stroke-width="3" fill="none"/>`; }
  s+=svg.person(570,265,1.5,fault?(inst?1:(Ut>50?4:0)):0,[470,130]);
  if(fault) s+=svg.text(400,40,'U מגע ≈ '+fmt(Ut)+'V',{c:Ut>50?'#c62828':'#2e7d32',w:700,s:16});
  $('scene').innerHTML=s;
  $('r_z').textContent = broken?'∞':fmt(Zs,2)+' Ω';
  $('r_if').textContent = fault? (broken?'0 A':fmt(If)+' A') : '–';
  $('r_thr').textContent = thr+' A';
  $('r_ut').textContent = fault? fmt(Ut)+' V':'0 V';
  if(!fault) Edu.verdict('verdict','safe','אין תקלה. הפעילו "תקלה" לראות את הקצר המבוקר.');
  else if(broken) Edu.verdict('verdict','danger','⛔ מוליך האפס קטוע! אין מסלול לתקלה, המפסק לא מנתק והגוף נמצא במתח '+U+'V (זרם גוף ≈ '+fmt(body)+' mA).');
  else if(inst) Edu.verdict('verdict','safe',`✅ זרם התקלה (${fmt(If)}A) גדול מסף הניתוק (${thr}A) – המפסק מנתק מיידית.`);
  else if(slow) Edu.verdict('verdict','danger',`⛔ הזרם (${fmt(If)}A) מעל זרם הנקוב אך מתחת לסף המיידי (${thr}A): הניתוק תרמי ואיטי (שניות עד דקות). המכשיר נשאר מסוכן. קצרו את הכבל או הגדילו חתך.`);
  else Edu.verdict('verdict','danger',`⛔ הזרם (${fmt(If)}A) כמעט כמו זרם עבודה – המפסק לא מנתק כלל!`);
}
on(['len','area','brk','in','fault','broken'],render);
Edu.quiz('quiz',[
 {q:'מה קורה בתקלה כשהמכשיר מאופס?',o:['הפאזה זורמת לאדמה בלבד','נוצר קצר בין הפאזה לאפס והמפסק מנתק','לא קורה כלום','המכשיר מקבל 400V'],a:1,w:'חיבור הגוף לאפס הופך תקלת בידוד לקצר, בזרם גבוה, שמפיל מיד את המפסק.'},
 {q:'מה משפיע על גודל זרם התקלה באיפוס?',o:['צבע הכבל','אורך וחתך המוליכים','מזג האוויר','הספק המכשיר'],a:1,w:'התנגדות הלולאה Z<sub>s</sub> תלויה באורך ובחתך המוליכים.'},
 {q:'מפסק C16 דורש זרם תקלה של לפחות כמה אמפר להפעלה מיידית (פי 10)?',o:['16A','80A','160A','10A'],a:2,w:'10 × 16 = 160A.'},
 {q:'מדוע אסור לחבר מפסק או נתיך במוליך האפס/PE?',o:['זה יקר','ניתוקו מבטל את ההגנה והגוף נשאר במתח','זה מגדיל מתח','אין סיבה'],a:1,w:'מוליך האפס המגן חייב להישאר רציף כל הזמן.'}
],'m2');
Edu.init('m2');
})();
