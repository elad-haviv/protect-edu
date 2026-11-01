(function(){
const {$,val,on,svg}=Edu;
function render(){
  const cls=val('cls'), d1=val('d1'), d2=val('d2'), earth=val('earth');
  $('earthRow').style.display = cls===1?'flex':'none';
  $('d2').parentElement.style.display = cls===2?'flex':'none';
  let live=false, tripped=false, msg;
  if(cls===2){ live = d1&&d2; msg = live?['danger','⛔ שתי השכבות נפגעו – גוף המכשיר תחת מתח!']
      : d1||d2?['safe','✅ שכבה אחת נפגעה, השנייה מגינה. המכשיר בטוח (אך יש לתקן/להחליף!).']:['safe','✅ המכשיר תקין.']; }
  else if(cls===1){ if(d1){ if(earth){tripped=true;msg=['safe','✅ הפאזה נגעה בגוף, אך הוא מוארק – זרם התקלה מנתק את המעגל.'];} else {live=true;msg=['danger','⛔ אין הארקה! הגוף במתח.'];} } else msg=['safe','✅ המכשיר תקין.']; }
  else { live=d1; msg= d1?['danger','⛔ בידוד יחיד נפגע – אין הגנה נוספת.']:['mid','המכשיר פועל, אבל אין שכבת הגנה נוספת.']; }
  let s=svg.ground(0,760,255,45);
  const body=live?'#ef9a9a':'#eceff1';
  s+=`<rect x="190" y="40" width="300" height="190" rx="22" fill="${body}" stroke="#37474f" stroke-width="4"/>`;
  if(cls===2){ s+=`<rect x="215" y="65" width="250" height="140" rx="14" fill="#ffe0b2" stroke="#e65100" stroke-width="4" ${d2?'stroke-dasharray="14 10"':''}/>`+svg.text(340,60,'בידוד משלים'+(d2?' – פגום':''),{s:12,c:'#e65100'}); }
  if(cls!==0){} 
  s+=`<rect x="250" y="95" width="130" height="80" rx="10" fill="#fff9c4" stroke="#f9a825" stroke-width="4" ${d1?'stroke-dasharray="14 10"':''}/>`+svg.text(315,92,'בידוד בסיסי'+(d1?' – פגום':''),{s:12,c:'#b8860b'});
  s+=`<circle cx="315" cy="135" r="22" fill="#c62828"/>`+svg.text(315,140,'פאזה',{s:12,c:'#fff',w:700});
  if(d1 && (cls!==2 || d2)) s+=`<path d="M315 135 L315 40" stroke="#c62828" stroke-width="5" stroke-dasharray="4 3"/>`+svg.bolt(320,30,.6);
  if(cls===1&&earth) s+=`<path d="M340 230V255" stroke="#2e7d32" stroke-width="5" stroke-dasharray="8 4"/>`+svg.text(340,285,'הארקה',{c:'#2e7d32',s:12});
  if(cls===2) s+=`<rect x="520" y="60" width="40" height="40" fill="none" stroke="#000" stroke-width="3"/><rect x="530" y="70" width="20" height="20" fill="none" stroke="#000" stroke-width="3"/>`+svg.text(540,125,'סימון מחלקה II',{s:11});
  s+=svg.person(640,255,1.5,live?4:0,[490,120]);
  $('scene').innerHTML=s;
  Edu.verdict('verdict',msg[0],msg[1]);
}
on(['cls','d1','d2','earth'],render);
Edu.quiz('quiz',[
 {q:'מהו סימון מכשיר מחלקה II?',o:['משולש עם ברק','ריבוע בתוך ריבוע','אות E','עיגול ירוק'],a:1,w:'ריבוע בתוך ריבוע = בידוד כפול.'},
 {q:'במכשיר מחלקה II נפגע הבידוד הבסיסי בלבד. מה המצב?',o:['הגוף תחת מתח','הבידוד המשלים עדיין מגן','המכשיר התפוצץ','נדרש פחת'],a:1,w:'שתי השכבות בלתי תלויות.'},
 {q:'האם לחבר הארקה למכשיר מחלקה II?',o:['חובה','לא נדרש ואסור','רק בחדר רחצה','רק אם הגוף מתכת'],a:1,w:'המכשיר מתוכנן ללא הארקה.'},
 {q:'מה היתרון המרכזי של השיטה?',o:['ההגנה אינה תלויה בהתקנה/בהארקת הבית','זולה לתיקון','מתאימה רק לתעשייה','אינה מתיישנת'],a:0,w:'ההגנה מובנית במכשיר.'}
],'m5');
Edu.init('m5');
})();
