(function(){
const {$,val,on,svg,fmt}=Edu; $('meter').innerHTML=Edu.meterHTML();
document.querySelectorAll('button[data-v]').forEach(b=>b.addEventListener('click',()=>{ $('v').value=b.dataset.v; $('v').dispatchEvent(new Event('input')); }));
function render(){
  const V=val('v'), R=val('skin'); const I=Edu.bodyCurrent(V,R), z=Edu.zone(I);
  const cat = V<=50?'מתח נמוך במיוחד (ELV)':V<=1000?'מתח נמוך (LV)':'מתח גבוה';
  let s=`<rect x="40" y="60" width="120" height="100" rx="10" fill="#e3f2fd" stroke="#0b5cad" stroke-width="2"/>`+svg.text(100,105,'מקור בטוח',{w:700})+svg.text(100,130,V+' V',{s:16,c:V<=50?'#2e7d32':'#c62828',w:700});
  s+=`<path d="M160 90H520 M160 130H520" stroke="${V<=50?'#2e7d32':'#c62828'}" stroke-width="4"/>`;
  s+=svg.person(600,200,1.3,z.lvl,[520,92]);
  s+=`<path d="M600 140 L520 130" stroke="${Edu.COL[z.lvl]}" stroke-width="5"/>`;
  $('scene').innerHTML=s;
  $('r_i').textContent=fmt(I,2)+' mA'; $('r_c').textContent=cat;
  Edu.setMeter($('meter'),I); $('zone').innerHTML=`<span class="${z.cls}">${z.t}</span>`;
  if(V<=50&&I<30) Edu.verdict('verdict','safe','✅ במתח '+V+'V הזרם נמוך מסף הסכנה (בתנאי לחות אלה). זה העיקרון של SELV/PELV.');
  else if(V<=50) Edu.verdict('verdict','mid','⚠️ גם מתח נמוך עלול להיות מורגש בגוף רטוב מאוד – לכן במקומות רטובים מגבילים ל-12V–25V.');
  else Edu.verdict('verdict','danger','⛔ מתח מעל 50V אינו נחשב מתח בטוח – נדרשת שיטת הגנה אחרת.');
}
on(['v','skin'],render);
Edu.quiz('quiz',[
 {q:'עד איזה מתח נחשב "מתח נמוך במיוחד" (AC)?',o:['12V','50V','230V','1000V'],a:1,w:'המקובל: עד 50V AC (ו-120V DC ללא אדווה).'},
 {q:'מה ההבדל בין SELV ל-PELV?',o:['SELV מוארק','PELV מוארק','אין הבדל','SELV גבוה יותר'],a:1,w:'ב-PELV יש הארקה פונקציונלית; ב-SELV המעגל מופרד גם מהאדמה.'},
 {q:'מדוע במתח 12V עדיין חשוב שנאי בטיחות?',o:['כדי להפחית רעש','כדי להבטיח הפרדה מהרשת','להגדיל זרם','אין חשיבות'],a:1,w:'ללא הפרדה, תקלה בשנאי רגיל עלולה להעביר 230V.'},
 {q:'גוף רטוב לעומת יבש: ההתנגדות…',o:['גדולה יותר ברטוב','קטנה יותר ברטוב ולכן הזרם גדל','זהה','תלויה בצבע העור'],a:1,w:'ברטוב ההתנגדות נמוכה ולכן הזרם גבוה יותר.'}
],'m6');
Edu.init('m6');
})();
