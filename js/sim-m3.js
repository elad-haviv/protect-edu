(function(){
const {$,val,on,svg,fmt}=Edu; const LOAD=8; let tripped=false, testing=false;
$('meter').innerHTML=Edu.meterHTML();
const tripTime=(I,In)=>{ const r=I/In; if(r<0.5) return null; if(r<1) return Infinity; if(r>=5) return 40; return 300*Math.pow(40/300, Math.log(r)/Math.log(5)); };
function curve(In,I){
  let s=`<rect x="50" y="10" width="520" height="170" fill="#fff" stroke="#999"/>`;
  const X=m=>50+ (Math.log10(m/1)/Math.log10(2000))*520, Y=t=>180-(Math.log10(t/10)/Math.log10(100))*170;
  [1,10,100,1000].forEach(m=>{ s+=`<path d="M${X(m)} 10V180" stroke="#eee"/>`+svg.text(X(m),198,m+' mA',{s:11}); });
  [10,100,1000].forEach(t=>{ s+=`<path d="M50 ${Y(t)}H570" stroke="#eee"/>`+svg.text(44,Y(t)+4,t+' ms',{s:11,a:'end'}); });
  let d=''; for(let m=In; m<=2000; m*=1.08){ const t=tripTime(m,In); if(t&&isFinite(t)) d+=(d?'L':'M')+X(m)+' '+Y(t); }
  s+=`<path d="${d}" fill="none" stroke="#c62828" stroke-width="3"/>`;
  s+=`<path d="M${X(In)} 10V180" stroke="#c62828" stroke-dasharray="4 4"/>`+svg.text(X(In),22,'I<tspan baseline-shift="sub" font-size="9">Δn</tspan>',{c:'#c62828',s:12});
  if(I>0){ const t=tripTime(I,In); const y = t&&isFinite(t)?Y(t):175; s+=`<circle cx="${Math.min(Math.max(X(I),50),570)}" cy="${y}" r="7" fill="#0b5cad"/>`; }
  s+=svg.text(310,222,'זרם דליפה',{s:12});
  $('curve').innerHTML=s;
}
function render(){
  const scn=$('scn').value, In=val('sens'), Rb=val('skin');
  const bodyI = 230/Rb*1000;               // mA
  let leak = scn==='leak'? val('leak') : scn==='pg'? bodyI : 0;
  if(testing) leak=Math.max(leak,In*1.5);
  const I_L=LOAD*1000+ (scn==='pn'?bodyI:0) + leak, I_N=LOAD*1000 + (scn==='pn'?bodyI:0);
  const diff=I_L-I_N; const t=tripTime(diff,In);
  if(!tripped && t && isFinite(t) && diff>0) tripped=true;
  const person = scn!=='leak';
  const bodyNow = person? bodyI:0; const z=Edu.zone(bodyNow);
  let s=`<rect x="20" y="50" width="90" height="100" rx="8" fill="#e3f2fd" stroke="#0b5cad" stroke-width="2"/>`+svg.text(65,105,'מקור 230V',{s:13,w:700});
  s+=`<path d="M110 80H200 M110 120H200" stroke="${tripped?'#bbb':'#c62828'}" stroke-width="4"/>`;
  s+=`<rect x="200" y="60" width="90" height="80" rx="8" fill="${tripped?'#ef9a9a':'#fff'}" stroke="#333" stroke-width="3"/>`+svg.text(245,95,'פחת',{w:700})+svg.text(245,118,tripped?'🔴 מנותק':'🟢 מחובר',{s:12})
      +`<circle cx="245" cy="90" r="38" fill="none" stroke="#999" stroke-dasharray="3 3" opacity=".0"/>`;
  s+=`<path d="M290 80H${tripped?305:420} M290 120H${tripped?305:420}" stroke="${tripped?'#bbb':'#c62828'}" stroke-width="4"/>`+(tripped?svg.cross(320,100,10):'');
  s+=`<path d="M290 120H${tripped?305:420}" stroke="${tripped?'#bbb':'#1565c0'}" stroke-width="4"/>`;
  s+=`<rect x="420" y="55" width="120" height="85" rx="8" fill="#eceff1" stroke="#37474f" stroke-width="3"/>`+svg.text(480,102,'מכשיר',{w:700});
  s+=svg.ground(0,760,255,45);
  if(scn==='leak'&&leak>0&&!tripped) s+=`<path class="flow" d="M480 140V255" stroke="#ef6c00" stroke-width="3" fill="none"/>`+svg.text(520,200,fmt(leak)+' mA לאדמה',{s:12,c:'#ef6c00',a:'start'});
  if(scn==='pg') s+=svg.person(640,255,1.4,tripped?2:Math.min(4,z.lvl),[540,90])+(!tripped?`<path class="flow" d="M640 255 H480 V140" stroke="#ef6c00" stroke-width="2" fill="none" opacity=".0"/>`:'');
  if(scn==='pn') s+=svg.person(640,255,1.4,Math.min(4,z.lvl),[540,80]);
  s+=svg.text(115,45,'L',{c:'#c62828',w:700})+svg.text(115,140,'N',{c:'#1565c0',w:700});
  $('scene').innerHTML=s;
  $('r_l').textContent=fmt(I_L/1000,2)+' A'; $('r_n').textContent=fmt(I_N/1000,2)+' A'; $('r_d').textContent=fmt(diff)+' mA';
  $('r_t').textContent = tripped? (t&&isFinite(t)? '≈ '+Math.round(t)+' ms':'—') : '–';
  Edu.setMeter($('meter'),bodyNow); $('zone').innerHTML= person? `<span class="${z.cls}">זרם דרך האדם ${fmt(bodyNow)} mA – ${z.t}</span>`:'';
  curve(In,diff);
  if(tripped && t && isFinite(t)) Edu.verdict('verdict','safe',`✅ הפחת זיהה הפרש של ${fmt(diff)}mA וניתק תוך כ-${Math.round(t)}ms. ${person?'האדם נחשף לזרם רק לרגע קצר.':''}`);
  else if(scn==='pn') Edu.verdict('verdict','danger','⛔ הזרם עובר דרך האדם מהפאזה לאפס – אין הפרש, הפחת לא מזהה! (≈'+fmt(bodyI)+' mA – סכנת חיים).');
  else if(diff>0 && diff<In) Edu.verdict('verdict','mid',`הפרש ${fmt(diff)}mA קטן מרגישות הפחת (${In}mA) – אין ניתוק.`);
  else Edu.verdict('verdict','safe','אין דליפה – המעגל תקין. הגדילו דליפה או בחרו תרחיש אחר.');
}
$('reset').addEventListener('click',()=>{tripped=false;testing=false;render();});
$('test').addEventListener('click',()=>{testing=true;render();testing=false;});
on(['scn','leak','sens','skin'],()=>{render();});
Edu.quiz('quiz',[
 {q:'על מה מבוסס עקרון הפעולה של מפסק פחת?',o:['הפרש בין זרם הפאזה לזרם האפס','מתח יתר ברשת','טמפרטורת הכבל','תדר הרשת'],a:0,w:'הטבעת המגנטית מודדת את סכום הזרמים; סכום שונה מאפס = דליפה לאדמה.'},
 {q:'אדם נוגע בו-זמנית בפאזה ובאפס כשהוא מבודד מהאדמה. האם הפחת יפעל?',o:['כן תמיד','לא – הזרם חוזר דרך האפס ואין הפרש','רק בלילה','רק אם הפחת 300mA'],a:1,w:'זו מגבלה ידועה של הפחת.'},
 {q:'מהי רגישות פחת להגנת חיים במגורים?',o:['3A','300mA','30mA','1A'],a:2,w:'30mA בזמן ≤300ms (ובזרם גבוה יותר – מהר יותר).'},
 {q:'מדוע חשוב ללחוץ על כפתור T מדי פעם?',o:['כדי לאפס את החשבון','כדי לוודא שהמפסק עדיין מנתק','כדי לחסוך חשמל','אין צורך'],a:1,w:'הבדיקה מדמה דליפה ומוודאת שהמנגנון המכני והאלקטרוני תקינים.'}
],'m3');
Edu.init('m3');
})();
