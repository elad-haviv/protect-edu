(function(){
const {$,val,on,svg,fmt}=Edu; $('meter').innerHTML=Edu.meterHTML();
function render(){
  const iso=val('iso'), Riso=val('riso')*1000, touch=$('touch').value, Rb=val('skin'), Rfoot=1000;
  let R, mode;
  if(touch==='both'){ R=Rb*2/ 1 ; mode='both'; }       // hand-to-hand, ~2 body paths
  else if(iso){ R=Rb+Rfoot+Riso; mode='iso'; }
  else { R=Rb+Rfoot; mode='gnd'; }
  const I=230/R*1000, z=Edu.zone(I);
  let s=svg.ground(0,760,255,45);
  s+=`<rect x="30" y="40" width="110" height="80" rx="8" fill="#e3f2fd" stroke="#0b5cad" stroke-width="2"/>`+svg.text(85,75,'רשת 230V',{w:700})+svg.text(85,98,'אפס מוארק',{s:12});
  s+=`<path d="M85 120V255" stroke="#555" stroke-width="3"/>`+svg.rod(85,255,35);
  if(iso){
    s+=`<rect x="190" y="50" width="130" height="70" rx="8" fill="#fff" stroke="#333" stroke-width="3"/>`+svg.text(255,80,'שנאי הפרדה',{w:700,s:14})+svg.text(255,102,'1 : 1',{s:12});
    s+=`<path d="M140 65H190 M140 100H190" stroke="#c62828" stroke-width="3"/><path d="M320 65H430 M320 100H430" stroke="#c62828" stroke-width="3"/>`;
    s+=svg.text(255,150,'צד משני לא מוארק ('+fmt(Riso/1000)+' kΩ לאדמה)',{s:12,c:'#6a1b9a'});
  } else s+=`<path d="M140 65H430" stroke="#c62828" stroke-width="4"/><path d="M140 100H430" stroke="#1565c0" stroke-width="4"/>`;
  s+=`<rect x="430" y="45" width="120" height="70" rx="8" fill="#eceff1" stroke="#37474f" stroke-width="3"/>`+svg.text(490,85,'מכשיר',{w:700});
  // person touches exposed wire stub
  s+=`<path d="M550 65H600" stroke="#c62828" stroke-width="3" stroke-dasharray="4 4"/>`;
  s+=svg.person(640,255,1.5,Math.min(z.lvl,4),[600,66]);
  if(touch==='both') s+=`<path d="M640 130 L555 100" stroke="${Edu.COL[Math.min(z.lvl,4)]}" stroke-width="5"/>`;
  if(mode==='gnd') s+=`<path class="flow" d="M640 255 H85 V125" fill="none" stroke="#ef6c00" stroke-width="3"/>`;
  if(mode==='iso') s+=svg.text(400,240,'אין מסלול חזרה',{c:'#2e7d32',w:700})+svg.cross(400,200,10);
  $('scene').innerHTML=s;
  $('r_r').textContent=fmt(R/1000,1)+' kΩ'; $('r_i').textContent=fmt(I,2)+' mA';
  Edu.setMeter($('meter'),I); $('zone').innerHTML=`<span class="${z.cls}">${z.t}</span>`;
  if(mode==='iso') Edu.verdict('verdict','safe','✅ הזרם זעיר ('+fmt(I,2)+' mA) – אין מסלול חזרה אל המקור.');
  else if(mode==='both') Edu.verdict('verdict','danger','⛔ נגיעה בשני הקטבים סוגרת מעגל דרך הגוף – שנאי ההפרדה אינו מגן.');
  else Edu.verdict('verdict','danger','⛔ ללא שנאי הפרדה הזרם חוזר דרך האדמה: '+fmt(I)+' mA – סכנה.');
}
on(['iso','riso','touch','skin'],render);
Edu.quiz('quiz',[
 {q:'מדוע נגיעה בקוטב אחד אחרי שנאי הפרדה אינה מסוכנת?',o:['המתח נמוך מאוד','הצד המשני לא מוארק ולכן אין מעגל סגור דרך האדמה','כי הוא מחובר לפחת','כי הגוף עצמו מבודד'],a:1,w:'הזרם צריך מסלול חזרה למקור.'},
 {q:'מה יקרה אם נאריק את הצד המשני?',o:['ההגנה תשתפר','ההגנה תתבטל','המתח יוכפל','אין שינוי'],a:1,w:'אם הצד המשני מוארק, נקודה אחת שוב מוארקת – מתקבל מעגל דרך האדמה.'},
 {q:'האם שנאי הפרדה מגן כשנוגעים בשני הקטבים?',o:['כן','לא','רק ביום','רק עם פחת'],a:1,w:'הזרם עובר בין הקטבים דרך הגוף.'},
 {q:'מה נקודת חולשה של השיטה?',o:['בידוד נמוך של הצד המשני/כבלים ארוכים מגדילים קיבול ודליפה','המחיר הנמוך','השנאי מתחמם בקור','אין חולשות'],a:0,w:'בידוד ירוד או כבלים ארוכים יוצרים מסלול חזרה.'}
],'m4');
Edu.init('m4');
})();
