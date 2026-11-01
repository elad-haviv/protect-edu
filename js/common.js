/* Shared helpers: navigation, progress, quiz engine, body-current model, SVG helpers */
const Edu = (() => {
  const MODULES = [
    {id:'m1', file:'m1-earthing.html',      icon:'⏚', title:'הארקת הגנה',            short:'חיבור החלקים המוליכים לאלקטרודה באדמה'},
    {id:'m2', file:'m2-neutralization.html',icon:'🔗', title:'איפוס',                 short:'חיבור הגוף למוליך האפס כך שתקלה תהפוך לקצר ותנתק'},
    {id:'m3', file:'m3-rcd.html',           icon:'🛡️', title:'מפסק מגן (פחת)',        short:'ניתוק מהיר בזרם דליפה של 30 מיליאמפר'},
    {id:'m4', file:'m4-isolation.html',     icon:'🔄', title:'שנאי הפרדה',            short:'מעגל משני מבודד מהאדמה – אין מסלול חזרה'},
    {id:'m5', file:'m5-double-insulation.html',icon:'◻️', title:'בידוד כפול / מוגן',  short:'שתי שכבות בידוד – תקלה בשכבה אחת לא מסוכנת'},
    {id:'m6', file:'m6-selv.html',          icon:'🔋', title:'מתח נמוך במיוחד',       short:'SELV / PELV – מתח שאינו מסוכן לגוף האדם'},
    {id:'m7', file:'m7-equipotential.html', icon:'⚖️', title:'שוות פוטנציאל / מקום מבודד', short:'אין הפרש מתח בין חלקים שנוגעים בהם'}
  ];
  const $ = id => document.getElementById(id);
  const root = () => document.body.dataset.root || '';
  const store = {
    get(){ try{return JSON.parse(localStorage.getItem('protectEdu')||'{}')}catch(e){return {}} },
    set(o){ try{localStorage.setItem('protectEdu',JSON.stringify(o))}catch(e){} }
  };
  const fmt = (x,d=1) => {
    if(!isFinite(x)) return '∞';
    if(x>=100) return Math.round(x).toString();
    return (+x.toFixed(d)).toString();
  };

  /* ---- body model ---- */
  // Returns current in mA for voltage V (volts) across resistance R (ohms)
  const bodyCurrent = (V,R=1000) => V/R*1000;
  const zone = mA => {
    if(mA<0.5) return {lvl:0,cls:'z0',t:'לא מורגש'};
    if(mA<10)  return {lvl:1,cls:'z1',t:'מורגש (עקצוץ), בדרך כלל לא מסוכן'};
    if(mA<30)  return {lvl:2,cls:'z2',t:'התכווצות שרירים – קושי להשתחרר מהמוליך'};
    if(mA<100) return {lvl:3,cls:'z3',t:'קושי בנשימה, סכנת חיים אם נמשך'};
    return {lvl:4,cls:'z4',t:'סכנת פרפור חדרים – סכנת מוות'};
  };
  // log-scale meter 0.1mA .. 1000mA
  const meterPos = mA => Math.max(0,Math.min(100,(Math.log10(Math.max(mA,0.1)/0.1)/4)*100));
  const meterHTML = () => {
    const ticks=[[0.5,'0.5'],[10,'10'],[30,'30'],[100,'100'],[1000,'1000 mA']]
      .map(([v,l])=>`<span class="tick" style="left:${meterPos(v)}%">${l}</span>`).join('');
    return `<div class="meter"><div class="needle"></div>${ticks}</div>`;
  };
  const setMeter = (el,mA) => { const n=el.querySelector('.needle'); if(n) n.style.left=`calc(${meterPos(mA)}% - 3px)`; };

  /* ---- inputs ---- */
  const val = id => { const e=$(id); if(!e) return 0; if(e.type==='checkbox') return e.checked; return e.tagName==='SELECT'||e.type==='range'||e.type==='number' ? +e.value : e.value; };
  const on = (ids,fn) => {
    ids.forEach(id=>{
      const e=$(id); if(!e) return;
      const upd=()=>{ const o=$('o_'+id); if(o) o.textContent=e.value; fn(); };
      e.addEventListener('input',upd); e.addEventListener('change',upd);
      const o=$('o_'+id); if(o) o.textContent=e.value;
    });
    fn();
  };
  const set = (id,html) => { const e=$(id); if(e) e.innerHTML=html; };
  const verdict = (id,kind,html) => { const e=$(id); e.className='verdict '+kind; e.innerHTML=html; };

  /* ---- SVG helpers ---- */
  const COL=['#2e7d32','#9e9d24','#f9a825','#ef6c00','#c62828'];
  const svg = {
    // person with feet at (x,y), height ~ 130*s
    person(x,y,s=1,lvl=0,armTo=null){
      const c=COL[lvl]; const hy=y-25*s;      // hip origin
      let arm = armTo ? `<path d="M${x} ${hy-40*s} L${armTo[0]} ${armTo[1]}" />`
                      : `<path d="M${x} ${hy-40*s} L${x-20*s} ${hy-20*s}"/>`;
      return `<g stroke="${c}" stroke-width="${4*s}" fill="none" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="${x}" cy="${hy-60*s}" r="${10*s}" fill="${c}"/>
        <path d="M${x} ${hy-48*s} V${hy-10*s} M${x} ${hy-10*s} L${x-12*s} ${y} M${x} ${hy-10*s} L${x+12*s} ${y} M${x} ${hy-40*s} L${x+20*s} ${hy-20*s}"/>${arm}</g>`;
    },
    ground(x1,x2,y,h=60){
      let hatch=''; for(let x=x1;x<x2;x+=14) hatch+=`<path d="M${x} ${y} l-8 10" stroke="#8d6e63" stroke-width="1.5"/>`;
      return `<rect x="${x1}" y="${y}" width="${x2-x1}" height="${h}" fill="#e7d9c9"/><path d="M${x1} ${y}H${x2}" stroke="#5d4037" stroke-width="3"/>${hatch}`;
    },
    rod(x,y,len=50){ return `<path d="M${x} ${y} v${len}" stroke="#555" stroke-width="6"/><path d="M${x-9} ${y+len} h18 M${x-5} ${y+len+5} h10" stroke="#555" stroke-width="3"/>`; },
    text(x,y,t,o={}){ return `<text x="${x}" y="${y}" text-anchor="${o.a||'middle'}" font-size="${o.s||14}" fill="${o.c||'#222'}" font-weight="${o.w||400}">${t}</text>`; },
    bolt(x,y,s=1){ return `<path class="flash" transform="translate(${x},${y}) scale(${s})" d="M0 0 L-10 22 L0 22 L-6 44 L12 16 L2 16 L8 0 Z" fill="#fbc02d" stroke="#e65100"/>`; },
    cross(x,y,r=12){ return `<path d="M${x-r} ${y-r} L${x+r} ${y+r} M${x+r} ${y-r} L${x-r} ${y+r}" stroke="#c62828" stroke-width="5"/>`; }
  };

  /* ---- quiz ---- */
  function quiz(containerId, items, modId){
    const box=$(containerId); let answered=0, correct=0;
    box.classList.add('quiz');
    box.innerHTML = '<h2>בוחנים את עצמנו</h2>' + items.map((it,i)=>`
      <div class="q" data-i="${i}"><b>${i+1}. ${it.q}</b>
      ${it.o.map((o,j)=>`<button class="opt" data-j="${j}">${o}</button>`).join('')}
      <div class="why"></div></div>`).join('') + '<div class="score" id="score"></div>';
    box.querySelectorAll('.q').forEach(q=>{
      const it=items[+q.dataset.i];
      q.querySelectorAll('.opt').forEach(b=>b.addEventListener('click',()=>{
        if(q.classList.contains('answered')) return;
        q.classList.add('answered'); answered++;
        const j=+b.dataset.j; const ok=j===it.a; if(ok) correct++;
        b.classList.add(ok?'right':'wrong');
        if(!ok) q.querySelectorAll('.opt')[it.a].classList.add('right');
        q.querySelector('.why').innerHTML=(ok?'✅ נכון. ':'❌ לא מדויק. ')+it.w;
        if(answered===items.length){
          $('score').innerHTML=`ציון: ${correct} מתוך ${items.length}`+(correct>=Math.ceil(items.length*0.75)?' 🎉 כל הכבוד – המודול הושלם!':' – כדאי לחזור על החומר ולנסות שוב (רענון הדף).');
          if(correct>=Math.ceil(items.length*0.75) && modId){ const s=store.get(); s[modId]=Math.max(s[modId]||0,correct); store.set(s); renderNav(modId); }
        }
      }));
    });
  }

  /* ---- navigation ---- */
  function renderNav(active){
    active=active||null;
    const s=store.get(); const r=root(); const mp = r===''?'modules/':'';
    const h=$('top'); if(!h) return;
    h.className='top';
    h.innerHTML=`<div class="bar"><a class="logo" href="${r}index.html">⚡ הגנה בפני חשמול</a><nav>`+
      MODULES.map((m,i)=>`<a href="${r}${mp}${m.file}" class="${m.id===active?'active ':''}${s[m.id]?'done':''}" title="${m.title}">${i+1}. ${m.title}</a>`).join('')+`</nav></div>`;
  }
  function pager(active){
    const i=MODULES.findIndex(m=>m.id===active); const el=$('pager'); if(!el) return;
    const prev=MODULES[i-1], next=MODULES[i+1];
    el.className='pager';
    el.innerHTML=(next?`<a href="${next.file}">← ${next.title}</a>`:`<span></span>`)+(prev?`<a href="${prev.file}">${prev.title} →</a>`:`<a href="../index.html">לדף הבית →</a>`);
    // RTL: first item sits on the right => put "prev" first visually
    el.innerHTML=(prev?`<a href="${prev.file}">→ ${prev.title}</a>`:`<a href="../index.html">→ דף הבית</a>`)+(next?`<a href="${next.file}">${next.title} ←</a>`:`<a href="../index.html">סיום – דף הבית ←</a>`);
  }
  function init(active){ renderNav(active); if(active) pager(active); }

  return {MODULES,$,fmt,bodyCurrent,zone,meterHTML,setMeter,val,on,set,verdict,svg,quiz,init,store,renderNav,COL};
})();
