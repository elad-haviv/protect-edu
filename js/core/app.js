/* App shell: course outline, rail, breadcrumb, pager, theme, language, deep links.
   Navigation logic adapted from agl-edu js/app.js (rail sub-lessons, pager, visited/last).
   Visual language: the course menu is a distribution board, each lesson a drawing sheet (design R-13). */
(function () {
  "use strict";
  const { esc } = PE;
  let modules, flat, current = null, cleanup = null, params = {};

  function build() {
    modules = PE.course;
    flat = modules.flatMap(m => m.lessons.map((l, i) => Object.assign(l, { m, i })));
  }
  const byCode = code => flat.find(l => l.code === code);
  // Q0…Q9 are the board's breakers; modules 10–11 are appendices
  // Title text: escaped, with a right-to-left mark in Hebrew so a trailing "(SELV / PELV)" keeps its place
  const T = o => esc(PE.L(o)) + (PE.lang === "he" ? "&rlm;" : "");
  PE.modLabel = m => (+m.code >= 10 ? PE.t(m.code === "10" ? "appendixA" : "appendixB") : "Q" + m.code);
  function resolve(code) {
    if (!code) return byCode(PE.store.get("last")) || flat[0];
    return byCode(code) || (modules.find(m => m.code === code) || {}).lessons?.[0] || flat[0];
  }

  // ---------- header ----------
  function renderHeader() {
    const h = document.getElementById("top");
    const th = document.documentElement.dataset.theme || "auto";
    h.innerHTML = `<div class="bar">
      <button type="button" class="icon-btn menu-btn" aria-controls="rail" aria-expanded="false" aria-label="${esc(PE.t("menu"))}">☰</button>
      <a class="plate" href="#0.1"><span class="screw" aria-hidden="true"></span><span class="plate-text"><b>${esc(PE.t("appTitle"))}</b><small dir="ltr">230/400 V · 50 Hz · TN-C-S · IEC 60364-4-41</small></span><span class="screw" aria-hidden="true"></span></a>
      <div class="tools">
        <a class="hv" href="https://academy.haviv.pro" rel="noopener" title="Haviv Academy"><span class="hv-mark" aria-hidden="true"></span><span class="hv-txt">Haviv Academy</span></a>
        <button type="button" class="tool present-btn" aria-pressed="${document.body.classList.contains("present")}" title="${esc(PE.t("present"))}">▣ <span class="tool-l">${esc(PE.t("present"))}</span></button>
        <button type="button" class="tool lang-btn" lang="${PE.lang === "he" ? "en" : "he"}" aria-label="${esc(PE.t("langSwitchLabel"))}">${esc(PE.t("langSwitch"))}</button>
        <button type="button" class="tool theme-btn" aria-label="${esc(PE.t("theme"))}: ${esc(PE.t("theme" + th[0].toUpperCase() + th.slice(1)))}" title="${esc(PE.t("theme"))}">${th === "dark" ? "☾" : th === "light" ? "☀" : "◐"} <span class="tool-l">${esc(PE.t("theme" + th[0].toUpperCase() + th.slice(1)))}</span></button>
      </div></div>
      <div class="phase-stripe" aria-hidden="true"><i class="l1"></i><i class="l2"></i><i class="l3"></i><i class="n"></i><i class="pe"></i></div>`;
    h.querySelector(".lang-btn").addEventListener("click", () => { PE.setLang(PE.lang === "he" ? "en" : "he"); });
    h.querySelector(".present-btn").addEventListener("click", () => setPresent(!document.body.classList.contains("present")));
    h.querySelector(".theme-btn").addEventListener("click", () => {
      const order = ["auto", "light", "dark"]; const next = order[(order.indexOf(th) + 1) % 3];
      setTheme(next, true);
    });
    h.querySelector(".menu-btn").addEventListener("click", e => {
      const open = document.body.classList.toggle("rail-open");
      e.currentTarget.setAttribute("aria-expanded", open);
    });
  }
  function setTheme(t, persist) {
    document.documentElement.dataset.theme = t;
    if (persist) PE.store.set("theme", t);
    renderHeader();
    PE.emit("theme", t);
  }
  let themeBeforePresent = null;
  function setPresent(on, fromRoute) {
    const was = document.body.classList.contains("present");
    if (on === was) return;
    document.body.classList.toggle("present", on);
    if (on) { themeBeforePresent = document.documentElement.dataset.theme; document.documentElement.dataset.theme = "light"; }
    else if (themeBeforePresent) document.documentElement.dataset.theme = themeBeforePresent;
    renderHeader();
    if (current && !fromRoute) { const p = PE.parseHash(location.hash).params; if (on) p.present = "1"; else delete p.present; PE.replaceHash(current.code, p); show(current.code, { params: {} }); }
  }
  PE.setPresent = setPresent;
  PE.isDark = () => {
    const t = document.documentElement.dataset.theme;
    return t === "dark" || (t !== "light" && window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches);
  };

  // ---------- rail ----------
  function moduleDone(m) {
    if (m.code === "9") return !!PE.store.get("final");
    const chk = m.lessons.find(l => l.kind === "check");
    if (!chk) return m.lessons.every(l => PE.store.visited(l.id));
    const r = PE.store.quizResult(chk.id); return !!(r && r.score / r.of >= 0.7);
  }
  PE.moduleDone = code => { const m = (modules || PE.course).find(x => x.code === code); return !!m && moduleDone(m); };
  function renderRail(l) {
    const rail = document.getElementById("rail");
    rail.innerHTML = `<div class="board"><h2 class="board-title">${esc(PE.t("board"))}</h2><ol class="mods">${modules.map(m => {
      const cur = m === l.m, on = moduleDone(m), app = +m.code >= 10;
      return `<li class="${cur ? "cur" : ""}${app ? " app" : ""}"><a href="#${m.lessons[0].code}" class="mod"${cur ? ' aria-current="true"' : ""}>
        ${app ? `<span class="tab">${esc(PE.modLabel(m))}</span>` : `<span class="brk${on ? " on" : ""}" aria-hidden="true"><span class="lever"></span></span><span class="qn">${esc(PE.modLabel(m))}</span>`}
        <span class="label">${T(m.title)}</span>${app ? "" : `<span class="sr">, ${esc(PE.t(on ? "brkOn" : "brkOff"))}</span>`}${cur ? '<span class="led" aria-hidden="true"></span>' : ""}</a>
        ${cur && m.lessons.length > 1 ? `<ol class="subs">${m.lessons.map(x => `<li><a href="#${x.code}" class="${PE.store.visited(x.id) ? "seen" : ""}"${x === l ? ' aria-current="page"' : ""}><span class="subchip" dir="ltr">${x.code}</span><span>${T(x.title)}</span></a></li>`).join("")}</ol>` : ""}
      </li>`; }).join("")}</ol></div>`;
  }

  function crumbHtml(l) {
    const n = l.m.lessons.length;
    return `<nav class="crumb" aria-label="${esc(PE.t("youAreHere"))}">
      <span class="crumb-text"><a href="#0.1">${esc(PE.t("board"))}</a> › <a href="#${l.m.lessons[0].code}">${esc(PE.modLabel(l.m))} · ${T(l.m.title)}</a> › <span>${esc(PE.t("sheet"))} <bdi dir="ltr">${l.code}</bdi>${n > 1 ? ` (${esc(PE.t("lessonOf", { i: l.i + 1, n }))})` : ""}</span></span>
    </nav>${n > 1 ? `<div class="crumb-bar" aria-hidden="true"><i style="width:${(l.i + 1) / n * 100}%"></i></div>` : ""}`;
  }
  function titleBlock(l) {
    const n = l.m.lessons.length;
    return `<table class="tblock" aria-label="${esc(PE.t("titleBlock"))}"><tr>
      <td class="tb-org" rowspan="2"><span class="hv-mark" aria-hidden="true"></span> Haviv Academy</td>
      <td class="tb-title" colspan="3"><small>${esc(PE.t("tbCourse"))}</small>${esc(PE.t("appTitle"))}</td></tr>
      <tr><td><small>${esc(PE.t("tbModule"))}</small>${esc(PE.modLabel(l.m))} · ${esc(PE.L(l.m.short || l.m.title))}</td>
      <td><small>${esc(PE.t("sheet"))}</small><bdi dir="ltr">${l.code}</bdi> (${esc(PE.t("lessonOf", { i: l.i + 1, n }))})</td>
      <td><small>${esc(PE.t("tbRev"))}</small><bdi dir="ltr">${PE.version}</bdi></td></tr></table>`;
  }
  function pagerHtml(l) {
    const k = flat.indexOf(l), prev = flat[k - 1], next = flat[k + 1];
    const link = (x, cls, label) => x ? `<a class="pg ${cls}" href="#${x.code}" rel="${cls}">
      <span class="arr" aria-hidden="true"></span><span class="pg-text"><span class="pg-label">${esc(label)}</span><span class="pg-title"><b dir="ltr">${x.code}</b> ${T(x.title)}</span></span></a>` : "<span></span>";
    return `<nav class="pager" aria-label="${esc(PE.t("lessons"))}">${link(prev, "prev", PE.t("prevSheet"))}${link(next, "next", PE.t("nextSheet"))}</nav>`;
  }

  // ---------- show a lesson ----------
  function show(code, opts = {}) {
    const l = resolve(code);
    if (cleanup) { try { cleanup(); } catch (e) { console.error(e); } cleanup = null; }
    current = l;
    const main = document.getElementById("main");
    main.innerHTML = crumbHtml(l) + `<article class="lesson sheet" id="lesson" data-code="${l.code}" data-kind="${l.kind}"></article>` + titleBlock(l) + pagerHtml(l);
    cleanup = PE.renderLesson(l, main.querySelector("#lesson"), opts.params || {});
    if (["check", "practice", "location"].includes(l.kind) && l.id !== "k-final") {
      const b = PE.el("button", { type: "button", class: "btn sec print-btn" }, "🖨 " + esc(PE.t("print")));
      b.addEventListener("click", () => window.print());
      main.querySelector(".lesson-title").appendChild(b);
    }
    PE.store.visit(l.id); PE.store.set("last", l.code);
    renderRail(l);
    document.title = `${l.code} · ${PE.L(l.title)} – ${PE.t("appTitle")} · Haviv Academy`;
    document.body.classList.remove("rail-open");
    if (opts.scroll) window.scrollTo(0, 0);
    if (opts.focus) main.focus({ preventScroll: true });
  }
  PE.currentLesson = () => current;
  PE.refresh = () => current && show(current.code, { params: {} });

  function chrome() {
    document.querySelector(".skip").textContent = PE.t("skip");
    const f = document.getElementById("foot");
    f.innerHTML = `<p>${esc(PE.t("footer"))}</p>
      <p class="hv-links"><a href="https://academy.haviv.pro" rel="noopener"><span class="hv-mark" aria-hidden="true"></span> Haviv Academy</a> · ${esc(PE.t("moreCourses"))}: <a href="https://agl-edu.haviv.pro" rel="noopener">AGL</a> · <a href="https://genset-edu.haviv.pro" rel="noopener">GENSET</a></p>
      <button type="button" class="linkish reset">${esc(PE.t("resetProgress"))}</button>`;
    f.querySelector(".reset").addEventListener("click", () => { PE.store.reset(); PE.cache = {}; PE.refresh(); });
    document.getElementById("rail").setAttribute("aria-label", PE.t("course"));
  }
  function route(hash, scroll) {
    const { code, params: p } = PE.parseHash(hash);
    params = p;
    if (p.lang && p.lang !== PE.lang) { PE.setLang(p.lang, { transient: true, silent: true }); chrome(); }
    if (p.present && !document.body.classList.contains("present")) setPresent(true, true);
    show(code, { scroll, params: p });
    renderHeader();
  }

  // ---------- boot ----------
  PE.boot = () => {
    build();
    document.documentElement.dataset.theme = PE.store.get("theme") || "auto";
    PE.setLang(PE.initialLang(), { silent: true });
    renderHeader();
    chrome();
    PE.on("lang", () => {
      renderHeader();
      chrome();
      if (current) show(current.code, { params: {} });
    });
    PE.on("theme", () => { if (current) show(current.code, { params: {} }); });
    PE.on("lesson", () => current && renderRail(current));
    if (window.matchMedia) window.matchMedia("(prefers-color-scheme: dark)").addEventListener?.("change", () => PE.emit("theme"));
    document.addEventListener("click", e => {
      const a = e.target.closest('a[href^="#"]'); if (!a) return;
      const h = a.getAttribute("href"); if (h === "#main") return;
      e.preventDefault();
      try { history.pushState(null, "", h); } catch (err) { /* sandbox */ }
      lastRouted = location.hash; route(h, true);
      if (e.detail === 0) document.getElementById("main").focus({ preventScroll: true });
    });
    let lastRouted = null;
    const onNav = () => { if (location.hash === lastRouted) return; lastRouted = location.hash; route(location.hash, true); };
    window.addEventListener("popstate", onNav);
    window.addEventListener("hashchange", onNav);
    document.addEventListener("keydown", e => {
      if (e.key === "Escape" && document.body.classList.contains("present") && !e.target.closest("input, textarea, select")) setPresent(false);
      if (e.target.closest("input, select, textarea, [contenteditable]") || e.altKey || e.ctrlKey || e.metaKey) return;
      if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
      if (e.target.closest(".sim, .scene3d")) return;      // simulators and 3D use arrows themselves
      const k = flat.indexOf(current);
      const forward = (e.key === "ArrowLeft") === (PE.lang === "he");
      const to = flat[k + (forward ? 1 : -1)];
      if (to) { e.preventDefault(); try { history.pushState(null, "", "#" + to.code); } catch (err) { /**/ } route("#" + to.code, true); }
    });
    lastRouted = location.hash; route(location.hash, false);
  };
})();
