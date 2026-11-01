(function(){
const {$,val,on,svg,fmt}=Edu; $('meter').innerHTML=Edu.meterHTML();
function render(){
  const Vr=val('vr'), bond=val('bond'), Rb=val('rb')/1000, R=val('skin'), floor=val('floor');
  const mode=$('mode').value;
  let U = (mode==='two' && bond)? Vr*Rb/(Rb+0.5) : Vr;
  let Rtot = mode==='two' ? R : R + (floor? 100000 : 1000);
  const I=Edu.bodyCurrent(U,Rtot), z=Edu.zone(I);
  let s=`<rect x="0" y="245" width="760" height="55" fill="${floor?'#cfd8dc':'#e7d9c9'}"/><path d="M0 245H760" stroke="#5d4037" stroke-width="3"/>`;
  s+=svg.text(60,285,floor?'רצפה מבודדת':'רצפה רגילה',{s:12,a:'start',c:'#555'});
  s+=`<rect x="120" y="60" width="90" height="170" rx="6" fill="#b0bec5" stroke="#455a64" stroke-width="3"/>`+svg.text(165,150,'צינור מים',{s:13,w:700})+svg.text(165,170,'0 V',{s:13});
  s+=`<rect x="460" y="90" width="150" height="140" rx="10" fill="${U>50?'#ef9a9a':'#fff59d'}" stroke="#37474f" stroke-width="3"/>`+svg.text(535,150,'גוף מכשיר',{w:700})+svg.text(535,172,fmt(Vr)+' V',{s:13});
  if(bond) s+=`<path d="M210 75 H300 M460 75" stroke="#2e7d32" stroke-width="5" fill="none"/><rect x="300" y="55" width="160" height="40" rx="6" fill="#c8e6c9" stroke="#2e7d32" stroke-width="3"/>`+svg.text(380,80,'פס שוות פוטנציאל',{s:13,w:700}); 
  if(bond) s+=`<path d="M210 75 H300 M460 75 H535 V90" stroke="#2e7d32" stroke-width="5" fill="none"/>`;
  if(mode==='two'){ s+=svg.person(340,245,1.5,z.lvl,[460,150]); s+=`<path d="M340 160 L210 120" stroke="${Edu.COL[z.lvl]}" stroke-width="4"/>`; }
  else s+=svg.person(340,245,1.5,z.lvl,[460,150]);
  s+=svg.text(335,40,(mode==='two'?'הפרש מתח = ':'מתח מגע לאדמה = ')+fmt(U,2)+' V',{c:U>50?'#c62828':'#2e7d32',w:700,s:15});
  $('scene').innerHTML=s;
  $('r_u').textContent=fmt(U,2)+' V'; $('r_i').textContent=fmt(I,2)+' mA';
  Edu.setMeter($('meter'),I); $('zone').innerHTML=`<span class="${z.cls}">${z.t}</span>`;
  if(z.lvl<=1) Edu.verdict('verdict','safe','✅ זרם הגוף קטן ('+fmt(I,2)+' mA). '+(mode==='two'?(bond?'שוות הפוטנציאל מבטלת את ההפרש בין החלקים.':'ההפרש קטן.'):'הרצפה המבודדת מגבילה את הזרם – אין מעגל לאדמה.'));
  else Edu.verdict('verdict','danger','⛔ '+(mode==='two'?'הפרש מתח '+fmt(U)+'V בין שני חלקים נגישים – חברו אותם בשוות פוטנציאל.':'הגוף במתח '+fmt(U)+'V ביחס לרצפה המוליכה – סכנה.'));
}
on(['mode','vr','bond','rb','skin','floor'],render);
Edu.quiz('quiz',[
 {q:'מה מסוכן בעת תקלה?',o:['המתח המוחלט של הבניין','הפרש מתח בין שני חלקים שנוגעים בהם','צבע הכבל','תדר הרשת'],a:1,w:'האדם סוגר מעגל בין שני פוטנציאלים שונים.'},
 {q:'מה מחברים בפס שוות הפוטנציאל בחדר רחצה?',o:['רק את שקע החשמל','צנרת מתכתית וחלקים מוליכים נגישים','רק את התאורה','כלום'],a:1,w:'מחברים את כל החלקים המוליכים הנגישים.'},
 {q:'מה היתרון של "מקום מבודד"?',o:['קל להתקין','אי אפשר להיסגר מעגל לאדמה דרך הרצפה/הקירות','מוריד חשבון','מבטל צורך בחיווט'],a:1,w:'הבידוד מונע סגירת מעגל לאדמה.'},
 {q:'כשמותקן חיבור שוות פוטנציאל, מתח המגע בין צינור וגוף מכשיר הוא…',o:['230V','כמעט אפס (נפילת מתח על המוליך)','50V','תלוי במזג האוויר'],a:1,w:'מוליך בהתנגדות נמוכה מקצר את ההפרש.'}
],'m7');
Edu.init('m7');
})();
