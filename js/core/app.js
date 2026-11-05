/* App shell: course outline, rail, breadcrumb, pager, theme, language, deep links.
   Navigation logic ported from agl-edu js/app.js (sign codes, rail sub-lessons, pager, visited/last). */
(function () {
  "use strict";
  const { esc } = PE;
  let modules, flat, current = null, cleanup = null, params = {};

  function build() {
    modules = PE.course;
    flat = modules.flatMap(m => m.lessons.map((l, i) => Object.assign(l, { m, i })));
  }
  const byCode = code => flat.find(l => l.code === code);
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
      <a class="brand" href="#A1"><span class="brand-ic" aria-hidden="true">⚡</span><span class="brand-text"><b>${esc(PE.t("appTitle"))}</b><small>${esc(PE.t("appSub"))}</small></span></a>
      <div class="tools">
        <button type="button" class="tool lang-btn" lang="${PE.lang === "he" ? "en" : "he"}" aria-label="${esc(PE.t("langSwitchLabel"))}">${esc(PE.t("langSwitch"))}</button>
        <button type="button" class="tool theme-btn" aria-label="${esc(PE.t("theme"))}: ${esc(PE.t("theme" + th[0].toUpperCase() + th.slice(1)))}" title="${esc(PE.t("theme"))}">${th === "dark" ? "☾" : th === "light" ? "☀" : "🌓"} <span class="tool-l">${esc(PE.t("theme" + th[0].toUpperCase() + th.slice(1)))}</span></button>
      </div></div>`;
    h.querySelector(".lang-btn").addEventListener("click", () => { PE.setLang(PE.lang === "he" ? "en" : "he"); });
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
  PE.isDark = () => {
    const t = document.documentElement.dataset.theme;
    return t === "dark" || (t !== "light" && window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches);
  };

  // ---------- rail ----------
  function moduleDone(m) {
    const chk = m.lessons.find(l => l.kind === "check");
    if (!chk) return m.lessons.every(l => PE.store.visited(l.id));
    const r = PE.store.quizResult(chk.id); return !!(r && r.score / r.of >= 0.7);
  }
  function renderRail(l) {
    const rail = document.getElementById("rail");
    rail.innerHTML = `<h2 class="sr">${esc(PE.t("course"))}</h2><ol class="mods">${modules.map(m => {
      const cur = m === l.m;
      return `<li class="${cur ? "cur" : ""}"><a href="#${m.lessons[0].code}" class="mod"${cur ? ' aria-current="true"' : ""}>
        <span class="sign">${m.code}</span><span class="label">${esc(PE.L(m.title))}</span>${moduleDone(m) ? '<span class="done" aria-label="✓">✓</span>' : ""}</a>
        ${cur && m.lessons.length > 1 ? `<ol class="subs">${m.lessons.map(x => `<li><a href="#${x.code}" class="${PE.store.visited(x.id) ? "seen" : ""}"${x === l ? ' aria-current="page"' : ""}><span class="subchip">${x.code}</span><span>${esc(PE.L(x.title))}</span></a></li>`).join("")}</ol>` : ""}
      </li>`; }).join("")}</ol>`;
  }

  function crumbHtml(l) {
    const n = l.m.lessons.length;
    return `<nav class="crumb" aria-label="${esc(PE.t("youAreHere"))}">
      <a class="sign big" href="#${l.m.lessons[0].code}">${l.m.code}</a>
      <span class="crumb-text"><span class="crumb-module">${esc(PE.L(l.m.title))}</span>${n > 1 ? `<span class="crumb-count">${esc(PE.t("lessonOf", { i: l.i + 1, n }))}</span>` : ""}</span>
    </nav>${n > 1 ? `<div class="crumb-bar" aria-hidden="true"><i style="width:${(l.i + 1) / n * 100}%"></i></div>` : ""}`;
  }
  function pagerHtml(l) {
    const k = flat.indexOf(l), prev = flat[k - 1], next = flat[k + 1];
    const link = (x, cls, label) => x ? `<a class="pg ${cls}" href="#${x.code}" rel="${cls}">
      <span class="arr" aria-hidden="true"></span><span class="pg-text"><span class="pg-label">${esc(label)}</span><span class="pg-title"><b>${x.code}</b> ${esc(PE.L(x.title))}</span></span></a>` : "<span></span>";
    return `<nav class="pager" aria-label="${esc(PE.t("lessons"))}">${link(prev, "prev", PE.t("prev"))}${link(next, "next", PE.t("next"))}</nav>`;
  }

  // ---------- show a lesson ----------
  function show(code, opts = {}) {
    const l = resolve(code);
    if (cleanup) { try { cleanup(); } catch (e) { console.error(e); } cleanup = null; }
    current = l;
    const main = document.getElementById("main");
    main.innerHTML = crumbHtml(l) + `<article class="lesson" id="lesson" data-code="${l.code}" data-kind="${l.kind}"></article>` + pagerHtml(l);
    cleanup = PE.renderLesson(l, main.querySelector("#lesson"), opts.params || {});
    PE.store.visit(l.id); PE.store.set("last", l.code);
    renderRail(l);
    document.title = `${l.code} · ${PE.L(l.title)} – ${PE.t("appTitle")}`;
    document.body.classList.remove("rail-open");
    if (opts.scroll) window.scrollTo(0, 0);
    if (opts.focus) main.focus({ preventScroll: true });
  }
  PE.currentLesson = () => current;
  PE.refresh = () => current && show(current.code, { params: {} });

  function chrome() {
    document.querySelector(".skip").textContent = PE.t("skip");
    const f = document.getElementById("foot");
    f.innerHTML = `<p>${esc(PE.t("footer"))}</p><button type="button" class="linkish reset">${esc(PE.t("resetProgress"))}</button>`;
    f.querySelector(".reset").addEventListener("click", () => { PE.store.reset(); PE.cache = {}; PE.refresh(); });
    document.getElementById("rail").setAttribute("aria-label", PE.t("course"));
  }
  function route(hash, scroll) {
    const { code, params: p } = PE.parseHash(hash);
    params = p;
    if (p.lang && p.lang !== PE.lang) { PE.setLang(p.lang, { transient: true, silent: true }); chrome(); }
    if (p.present) document.body.classList.add("present");
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
      route(h, true);
      if (e.detail === 0) document.getElementById("main").focus({ preventScroll: true });
    });
    window.addEventListener("popstate", () => route(location.hash, true));
    window.addEventListener("hashchange", () => route(location.hash, true));
    document.addEventListener("keydown", e => {
      if (e.key === "Escape") document.body.classList.remove("present");
      if (e.target.closest("input, select, textarea, [contenteditable]") || e.altKey || e.ctrlKey || e.metaKey) return;
      if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
      if (e.target.closest(".sim, .scene3d")) return;      // simulators and 3D use arrows themselves
      const k = flat.indexOf(current);
      const forward = (e.key === "ArrowLeft") === (PE.lang === "he");
      const to = flat[k + (forward ? 1 : -1)];
      if (to) { e.preventDefault(); try { history.pushState(null, "", "#" + to.code); } catch (err) { /**/ } route("#" + to.code, true); }
    });
    route(location.hash, false);
  };
})();
