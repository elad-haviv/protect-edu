/* Quizzes (misconception-aware), faded calculation practice and the location exercise. */
(function () {
  "use strict";
  const { esc, rich } = PE;
  const txt = o => rich(PE.L(o));

  // ---------- quiz ----------
  PE.quiz = (host, block, key, lesson) => {
    const st = PE.cache[key] || (PE.cache[key] = { picks: {} });
    const items = block.items;
    const pass = block.pass || 0.7;
    function draw() {
      host.innerHTML = `<ol class="quiz">${items.map((it, i) => {
        const pick = st.picks[i];
        const done = pick != null;
        return `<li class="q${done ? " answered" : ""}" data-i="${i}">
          <p class="q-text">${it.from ? `<span class="from">${esc(PE.t("fromLesson", { c: it.from }))}</span> ` : ""}${txt(it.q)}</p>
          <div class="opts" role="group">${it.o.map((o, j) => {
            let cls = "opt";
            if (done && j === it.a) cls += " right";
            if (done && j === pick && j !== it.a) cls += " wrong";
            return `<button type="button" class="${cls}" data-j="${j}"${done ? " disabled" : ""} aria-pressed="${done && j === pick}">${txt(o)}</button>`;
          }).join("")}</div>
          ${done ? `<div class="why" role="status">${pick === it.a ? `<b>✓ ${esc(PE.t("correct"))}.</b> ` : `<b>✗</b> `}${txt(it.why)}
            ${it.mis && pick !== it.a ? `<div class="mis"><span class="mis-tag">${esc(PE.t("misconception"))}</span> ${txt(it.mis)}</div>` : ""}</div>` : ""}
        </li>`; }).join("")}</ol><div class="quiz-score" aria-live="polite"></div>`;
      host.querySelectorAll(".q .opt").forEach(btn => btn.addEventListener("click", () => {
        const i = +btn.closest(".q").dataset.i; st.picks[i] = +btn.dataset.j; draw();
        const q = host.querySelector(`.q[data-i="${i}"] .why`); if (q) q.focus && q.setAttribute("tabindex", "-1");
      }));
      const n = Object.keys(st.picks).length;
      if (n === items.length) {
        const s = items.reduce((a, it, i) => a + (st.picks[i] === it.a ? 1 : 0), 0);
        const ok = s / items.length >= pass;
        PE.store.quiz(lesson.id, s, items.length);
        PE.emit("lesson", lesson);
        host.querySelector(".quiz-score").innerHTML = `<p class="score ${ok ? "ok" : "bad"}" data-score="${s}">${esc(PE.t("score", { s, n: items.length }))} – ${esc(PE.t(ok ? "passed" : "tryAgain"))}</p>
          <button type="button" class="btn sec retry">${esc(PE.t("retry"))}</button>`;
        host.querySelector(".retry").addEventListener("click", () => { st.picks = {}; draw(); });
      }
    }
    draw();
    return null;
  };

  // ---------- faded practice ----------
  PE.practice = (host, block, key) => {
    const st = PE.cache[key] || (PE.cache[key] = { shown: {}, val: {}, res: {}, tries: {} });
    function draw() {
      host.innerHTML = block.items.map((it, i) => {
        const fade = it.fade != null ? it.fade : (i === 0 ? it.steps.length : i === 1 ? 1 : 0);
        const shown = Math.max(fade, st.shown[i] || 0);
        const r = st.res[i];
        const solved = r === true || (st.tries[i] || 0) >= 2;
        return `<div class="prac" data-i="${i}">
          <h4>${esc(PE.t(i === 0 ? "workedExample" : "yourTurn"))} ${i + 1}</h4>
          <p><b>${esc(PE.t("given"))}:</b> ${txt(it.given)}</p>
          <p class="ask">${txt(it.ask)}</p>
          <ol class="steps">${it.steps.slice(0, solved ? it.steps.length : shown).map(s => `<li>${txt(s)}</li>`).join("")}</ol>
          <div class="prac-row">
            <label><span class="sr">${esc(PE.t("answer"))}</span>
              <input type="number" inputmode="decimal" step="any" value="${st.val[i] != null ? esc(st.val[i]) : ""}" aria-label="${esc(PE.t("answer"))}" dir="ltr"></label>
            <bdi dir="ltr" class="unit">${esc(it.unit || "")}</bdi>
            <button type="button" class="btn chk">${esc(PE.t("check"))}</button>
            ${shown < it.steps.length && !solved ? `<button type="button" class="btn sec step">${esc(PE.t("showStep"))}</button>` : ""}
          </div>
          <p class="prac-res" role="status">${r === true ? `✓ ${esc(PE.t("correct"))} – ${PE.u(it.answer, it.unit)}` : r === false ? (solved ? `${esc(PE.t("answer"))}: ${PE.u(it.answer, it.unit)}` : esc(PE.t("incorrect"))) : ""}</p>
        </div>`; }).join("");
      host.querySelectorAll(".prac").forEach(div => {
        const i = +div.dataset.i, it = block.items[i];
        const inp = div.querySelector("input");
        const check = () => {
          st.val[i] = inp.value;
          const v = parseFloat(inp.value);
          const tol = it.tol != null ? it.tol : 0.05;
          const ok = Number.isFinite(v) && Math.abs(v - it.answer) <= Math.abs(it.answer) * tol + 1e-9;
          st.res[i] = ok; if (!ok) st.tries[i] = (st.tries[i] || 0) + 1;
          draw(); host.querySelector(`.prac[data-i="${i}"] .prac-res`).focus?.();
        };
        div.querySelector(".chk").addEventListener("click", check);
        inp.addEventListener("keydown", e => { if (e.key === "Enter") check(); });
        const s = div.querySelector(".step");
        if (s) s.addEventListener("click", () => { const fade = it.fade != null ? it.fade : (i === 0 ? it.steps.length : i === 1 ? 1 : 0); st.shown[i] = Math.max(fade, st.shown[i] || 0) + 1; draw(); });
      });
    }
    draw();
    return null;
  };

  // ---------- location exercise ----------
  const METHODS = ["1", "2", "3", "4", "5", "6", "7"];
  PE.location = (host, block, key) => {
    const st = PE.cache[key] || (PE.cache[key] = { sel: {}, checked: {} });
    const set = (PE.content.locations || []).filter(l => block.set.includes(l.set));
    function title(code) { const m = PE.course.find(x => x.code === code); return m ? PE.L(m.short || m.title) : code; }
    function draw() {
      host.innerHTML = `<p class="muted">${esc(PE.t("locPick"))}</p>` + set.map((l, i) => {
        const sel = st.sel[i] || [];
        const chk = st.checked[i];
        return `<div class="loc" data-i="${i}"><h4>${l.icon || ""} ${txt(l.title)}</h4><p>${txt(l.desc)}</p>
          <div class="chips">${METHODS.map(c => {
            let cls = "chip"; const on = sel.includes(c);
            if (chk) { if (l.need.includes(c) && on) cls += " right"; else if (on && !l.ok.includes(c)) cls += " wrong"; else if (l.need.includes(c)) cls += " missed"; }
            return `<button type="button" class="${cls}" data-c="${c}" aria-pressed="${on}"><b>${c}</b> ${esc(title(c))}</button>`; }).join("")}</div>
          <button type="button" class="btn chk">${esc(PE.t("check"))}</button>
          ${chk ? `<div class="why" role="status">${txt(l.why)}</div>` : ""}</div>`; }).join("");
      host.querySelectorAll(".loc").forEach(div => {
        const i = +div.dataset.i;
        div.querySelectorAll(".chip").forEach(b => b.addEventListener("click", () => {
          const s = st.sel[i] = st.sel[i] || []; const c = b.dataset.c;
          const k = s.indexOf(c); if (k >= 0) s.splice(k, 1); else s.push(c);
          st.checked[i] = false; draw();
        }));
        div.querySelector(".chk").addEventListener("click", () => { st.checked[i] = true; draw(); });
      });
    }
    draw();
    return null;
  };

  // ---------- J1 comparison card ----------
  const CARD = [
    ["1", { he: "מגע עקיף", en: "Indirect contact" }, { he: "מסלול לזרם התקלה דרך האדמה + פחת", en: "Fault path through the soil + RCD" }, { he: "Ra גבוה, PE מנותק, אין פחת", en: "High Ra, PE disconnected, no RCD" }, { he: "מתקנים בלי PEN אמין (TT)", en: "Installations without a reliable PEN (TT)" }],
    ["2", { he: "מגע עקיף", en: "Indirect contact" }, { he: "התקלה הופכת לקצר; המאמ\"ת מנתק", en: "The fault becomes a short; the MCB trips" }, { he: "PEN קטוע; Zs גבוהה מדי", en: "Broken PEN; Zs too high" }, { he: "רוב המבנים ברשת TN-C-S", en: "Most buildings on a TN-C-S network" }],
    ["3", { he: "מגע עקיף + הגנה נוספת במגע ישיר", en: "Indirect + additional direct-contact protection" }, { he: "ניתוק כשזרם \"בורח\" לאדמה", en: "Disconnects when current \"escapes\" to earth" }, { he: "מגע בין פאזה לאפס; מנגנון תקול", en: "Line–neutral touch; faulty mechanism" }, { he: "שקעים, חדרי רחצה, אתרי בנייה", en: "Sockets, bathrooms, construction sites" }],
    ["4", { he: "מגע עקיף (וגם ישיר בקוטב אחד)", en: "Indirect (and one-pole direct) contact" }, { he: "אין מסלול חזרה דרך האדמה", en: "No return path through earth" }, { he: "תקלה ראשונה לאדמה; כבל ארוך; נגיעה בשני קטבים", en: "First fault to earth; long cable; touching both poles" }, { he: "מכונות גילוח, כלים במקומות מוליכים מוגבלים", en: "Shaver sockets, tools in confined conductive spaces" }],
    ["5", { he: "מגע עקיף", en: "Indirect contact" }, { he: "שתי שכבות בידוד בלתי תלויות", en: "Two independent insulation layers" }, { he: "מעטפת סדוקה או רטובה", en: "Cracked or wet enclosure" }, { he: "כלים ומכשירים ביתיים", en: "Hand tools and household appliances" }],
    ["6", { he: "מגע ישיר ועקיף", en: "Direct and indirect contact" }, { he: "המתח נמוך מכדי להזרים זרם מסוכן", en: "The voltage is too low to drive a dangerous current" }, { he: "מקור לא מופרד; מתח מעל הגבול", en: "Non-separated source; voltage above the limit" }, { he: "בריכות, צעצועים, תאורה, פיקוד", en: "Pools, toys, lighting, control circuits" }],
    ["7", { he: "מגע עקיף", en: "Indirect contact" }, { he: "מקור לא מוארק: תקלה ראשונה קטנה, השגחה על הבידוד מתריעה", en: "Unearthed source: a first fault is small, insulation monitoring alarms" }, { he: "תקלה ראשונה שלא אותרה ואחריה תקלה שנייה; רשת ארוכה מדי", en: "An unlocated first fault followed by a second; a network that is too large" }, { he: "חדרי ניתוח, טיפול נמרץ, תעשייה רציפה", en: "Operating theatres, intensive care, continuous industry" }]];
  PE.card = (host) => {
    host.innerHTML = `<div class="tablewrap"><table class="t card-t"><thead><tr>${[{ he: "שיטה", en: "Method" }, { he: "מגן מפני", en: "Protects against" }, { he: "איך", en: "How" }, { he: "מתי היא נכשלת", en: "When it fails" }, { he: "שימוש אופייני", en: "Typical use" }].map(h => `<th scope="col">${esc(PE.L(h))}</th>`).join("")}</tr></thead><tbody>${CARD.map(([c, ...cols]) => {
      const m = PE.course.find(x => x.code === c), done = PE.moduleDone(c);
      return `<tr class="${done ? "done" : ""}"><th scope="row"><a href="#${c}.1" class="qref">Q${c}</a> ${esc(PE.L(m.title))} ${done ? `<span class="done-mark" aria-hidden="true">✓</span><span class="sr">${esc(PE.t("completed"))}</span>` : ""}</th>${cols.map(x => `<td>${txt(x)}</td>`).join("")}</tr>`; }).join("")}<tr class="note"><th scope="row">${esc(PE.L({ he: "אמצעי משלים", en: "Complementary" }))}</th><td colspan="4">${txt({ he: "השוואת פוטנציאלים ומקום מבודד אינם אחת משבע השיטות; הם מקטינים מתח מגע בין חלקים (<a href=\"#8.4\">8.4</a>).", en: "Equipotential bonding and non-conducting locations are not among the seven methods; they reduce touch voltage between parts (<a href=\"#8.4\">8.4</a>)." })}</td></tr></tbody></table></div>`;
    return null;
  };

  // ---------- K1 final check ----------
  PE.finalCheck = (host, block, key) => {
    const st = PE.cache[key] || (PE.cache[key] = { band: null, items: null, picks: {}, name: "" });
    const pool = PE.content.kpool;
    function start(band) {
      const n = block.n || 12, shuffle = a => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
      const idx = pool.map((x, i) => i);
      // basic: only basic items; advanced: at least half advanced items, rest basic, stratified by goal
      let pick;
      if (band === "basic") pick = shuffle(idx.filter(i => pool[i].level === "basic")).slice(0, n);
      else { const adv = shuffle(idx.filter(i => pool[i].level === "advanced")), bas = shuffle(idx.filter(i => pool[i].level === "basic")); pick = adv.slice(0, Math.max(Math.ceil(n / 2), n - bas.length)).concat(bas).slice(0, n); }
      st.band = band; st.items = shuffle(pick); st.picks = {}; st.focus = null; draw();
    }
    function draw() {
      if (!st.items) {
        host.innerHTML = `<div class="band-pick"><button type="button" class="btn" data-b="basic">${esc(PE.t("bandBasic"))}</button><button type="button" class="btn sec" data-b="advanced">${esc(PE.t("bandAdvanced"))}</button></div>`;
        host.querySelectorAll("[data-b]").forEach(b => b.addEventListener("click", () => start(b.dataset.b)));
        return;
      }
      const items = st.items.map(i => pool[i]);
      host.innerHTML = `<p class="muted">${esc(PE.t(st.band === "basic" ? "bandBasic" : "bandAdvanced"))}</p><ol class="quiz">${items.map((it, i) => {
        const pick = st.picks[i], done = pick != null;
        return `<li class="q${done ? " answered" : ""}" data-i="${i}"><p class="q-text">${txt(it.q)}</p><div class="opts" role="group">${it.o.map((o, j) => {
          let cls = "opt"; if (done && j === it.a) cls += " right"; if (done && j === pick && j !== it.a) cls += " wrong";
          return `<button type="button" class="${cls}" data-j="${j}" aria-pressed="${done && j === pick}"${done ? " disabled" : ""}>${txt(o)}</button>`; }).join("")}</div>
          ${done ? `<p class="sr fb" tabindex="-1">${esc(PE.t(pick === it.a ? "correct" : "incorrect"))}</p>` : ""}
          ${done && pick !== it.a ? `<p class="why">${esc(PE.t("reviewLesson"))} <a href="#${it.lesson}" class="qref" dir="ltr">${it.lesson}</a></p>` : ""}</li>`; }).join("")}</ol><div class="final-res" aria-live="polite"></div>`;
      host.querySelectorAll(".q .opt").forEach(b => b.addEventListener("click", () => { const i = +b.closest(".q").dataset.i; st.picks[i] = +b.dataset.j; st.focus = i; draw(); }));
      if (st.focus != null) { const nxt = host.querySelector(`.q[data-i="${st.focus + 1}"] .opt`) || host.querySelector(".final-res"); const fb = host.querySelector(`.q[data-i="${st.focus}"] .fb`); (nxt || fb).focus && (nxt || fb).focus(); }
      if (Object.keys(st.picks).length === items.length) {
        const s = items.reduce((a, it, i) => a + (st.picks[i] === it.a ? 1 : 0), 0), ok = s / items.length >= (block.pass || 0.8);
        PE.store.quiz("k-final-" + st.band, s, items.length);
        if (ok) { PE.store.set("final", { band: st.band, score: s, of: items.length, date: new Date().toISOString().slice(0, 10) }); PE.store.quiz("k-final", s, items.length); PE.emit("lesson", PE.currentLesson()); }
        const res = host.querySelector(".final-res");
        res.innerHTML = `<p class="score ${ok ? "ok" : "bad"}" data-score="${s}" data-pass="${ok}">${esc(PE.t("score", { s, n: items.length }))} – ${esc(PE.t(ok ? "finalPass" : "tryAgain"))}</p>
          ${ok ? `<div class="record-form"><label>${esc(PE.t("yourName"))} <input type="text" maxlength="60" value="${esc(st.name)}"></label> <button type="button" class="btn print-rec">${esc(PE.t("printRecord"))}</button></div>` : ""}
          <button type="button" class="btn sec again">${esc(PE.t("newAttempt"))}</button>`;
        res.querySelector(".again").addEventListener("click", () => { st.items = null; draw(); });
        const pr = res.querySelector(".print-rec");
        if (pr) pr.addEventListener("click", () => {
          st.name = res.querySelector("input").value.trim();
          let rec = document.getElementById("record"); if (!rec) { rec = PE.el("div", { id: "record" }); document.body.appendChild(rec); }
          rec.setAttribute("dir", PE.lang === "he" ? "rtl" : "ltr");
          rec.innerHTML = `<div class="rec-box"><div class="rec-mark">⚡</div><h1>${esc(PE.t("recordTitle"))}</h1><p class="rec-name"><bdi>${esc(st.name || "—")}</bdi></p>
            <p>${esc(PE.t("recordBody", { band: PE.t(st.band === "basic" ? "bandBasicShort" : "bandAdvancedShort"), s, n: items.length }))}</p>
            <p class="rec-date"><bdi>${new Date().toLocaleDateString(PE.lang === "he" ? "he-IL" : "en-GB")}</bdi></p><p class="rec-note">${esc(PE.t("recordNote"))}</p><p class="rec-brand">Haviv Academy · protect-edu.haviv.pro</p></div>`;
          document.body.classList.add("printing-record");
          const done = () => { document.body.classList.remove("printing-record"); window.removeEventListener("afterprint", done); };
          window.addEventListener("afterprint", done); window.print();
        });
      }
    }
    draw();
    return null;
  };

  // ---------- L1 glossary ----------
  PE.glossary = (host, block, key) => {
    const st = PE.cache[key] || (PE.cache[key] = { q: "" });
    host.innerHTML = `<label class="gloss-search"><span>${esc(PE.t("search"))}</span> <input type="search" value="${esc(st.q)}" aria-controls="gloss-t"></label>
      <div class="tablewrap"><table class="t" id="gloss-t"><thead><tr><th scope="col">עברית</th><th scope="col">English</th><th scope="col">${esc(PE.t("abbr"))}</th><th scope="col">${esc(PE.t("definition"))}</th></tr></thead><tbody></tbody></table></div><p class="muted gloss-count" aria-live="polite"></p>`;
    const tb = host.querySelector("tbody"), inp = host.querySelector("input");
    function fill() {
      const norm = s => String(s).toLowerCase().replace(/["״׳']/g, "");
      const q = norm(st.q.trim());
      const rows = PE.content.glossary.filter(g => !q || norm([g.he, g.en, g.abbr, g.def.he, g.def.en].join(" ")).includes(q));
      tb.innerHTML = rows.map(g => `<tr><th scope="row" lang="he" dir="rtl">${esc(g.he)}</th><td lang="en" dir="ltr">${esc(g.en)}</td><td dir="ltr">${esc(g.abbr)}</td><td>${txt(g.def)} <a href="#${g.code}" class="qref" dir="ltr">${g.code}</a></td></tr>`).join("");
      host.querySelector(".gloss-count").textContent = PE.t("glossCount", { n: rows.length });
    }
    inp.addEventListener("input", () => { st.q = inp.value; fill(); });
    fill();
    return null;
  };
})();
