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
  const METHODS = ["B", "C", "D", "E", "F", "G", "H"];
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
})();
