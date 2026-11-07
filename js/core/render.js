/* Renders a lesson's block list. Blocks are bilingual data (see docs/designs/protect-edu-v2.md, content model). */
(function () {
  "use strict";
  const { esc, rich } = PE;
  PE.cache = PE.cache || {};            // per-block state that survives language switches and revisits

  function tag(label, source) {
    if (!label) return "";
    const src = source ? ` · ${esc(PE.lang === "en" ? String(source).replace("מקור משני", "secondary source") : source)}` : "";
    return `<span class="tag tag-${label}" title="${esc(PE.t("tagTip_" + label))}">${esc(PE.t("tag_" + label))}${src}</span>`;
  }
  PE.tag = tag;
  const txt = o => rich(PE.L(o));

  const R = {
    p: b => `<p>${tag(b.label, b.source)}${txt(b)}</p>`,
    h: b => `<h3>${txt(b)}</h3>`,
    list: b => { const t = b.ordered ? "ol" : "ul"; return `${b.label ? `<p class="list-tag">${tag(b.label, b.source)}</p>` : ""}<${t} class="list">${b.items.map(i => `<li>${tag(i.label, i.source)}${txt(i)}</li>`).join("")}</${t}>`; },
    formula: b => `<div class="formula">${PE.math(b.tex, true)}</div>${b.he || b.en ? `<p class="formula-note">${txt(b)}</p>` : ""}`,
    callout: b => `<div class="callout ${b.tone || "info"}">${b.tone === "hook" ? '<span class="hook-ic" aria-hidden="true">?</span>' : ""}<div>${tag(b.label, b.source)}${txt(b)}</div></div>`,
    table: b => `<div class="tablewrap"><table class="t">${b.caption ? `<caption>${txt(b.caption)}</caption>` : ""}<thead><tr>${b.head.map(h => `<th scope="col">${txt(h)}</th>`).join("")}</tr></thead><tbody>${b.rows.map(r => `<tr>${r.map((c, i) => i ? `<td>${txt(c)}</td>` : `<th scope="row">${txt(c)}</th>`).join("")}</tr>`).join("")}</tbody></table></div>`,
    figure: () => `<figure class="fig"><svg class="fig-svg" role="img"></svg><figcaption></figcaption></figure>`,
    sim: () => `<div class="sim-host"></div>`,
    scene: () => `<div class="scene-host"></div>`,
    practice: () => `<div class="practice-host"></div>`,
    quiz: () => `<div class="quiz-host"></div>`,
    location: () => `<div class="loc-host"></div>`,
    card: () => `<div class="card-host"></div>`,
    final: () => `<div class="final-host"></div>`,
    glossary: () => `<div class="gloss-host"></div>`,
    html: b => txt(b)
  };

  // Mount interactive blocks after the static HTML is in place
  const M = {
    figure(node, b) {
      const svg = d3.select(node.querySelector("svg"));
      const f = PE.figures[b.id];
      svg.attr("viewBox", b.viewBox || "0 0 960 400").attr("aria-label", PE.L(b.alt || b.caption || ""));
      if (f) f(svg, PE.figCtx());
      node.querySelector("figcaption").innerHTML = b.caption ? txt(b.caption) : "";
    },
    sim: (node, b, key, params) => PE.kit.mount(node, b, key, params),
    scene: (node, b, key, params) => (PE.scene3d ? PE.scene3d(node, b, key, params) : PE.sceneFallback(node, b)),
    practice: (node, b, key) => PE.practice(node, b, key),
    quiz: (node, b, key, params, lesson) => PE.quiz(node, b, key, lesson),
    location: (node, b, key) => PE.location(node, b, key),
    card: (node, b, key) => PE.card(node, b, key),
    final: (node, b, key) => PE.finalCheck(node, b, key),
    glossary: (node, b, key) => PE.glossary(node, b, key)
  };

  PE.figCtx = () => ({ L: PE.L, t: PE.t, lang: PE.lang, sym: PE.sym, fmt: PE.fmt });

  PE.sceneFallback = (node, b) => {
    const fig = PE.el("figure", { class: "fig" }, `<p class="muted">${esc(PE.t("figure3d"))}</p><svg class="fig-svg" role="img"></svg>`);
    node.appendChild(fig);
    const svg = d3.select(fig.querySelector("svg")).attr("viewBox", "0 0 960 460").attr("aria-label", PE.L(b.title || ""));
    if (PE.figures[b.id]) PE.figures[b.id](svg, PE.figCtx());
    if (b.parts) node.appendChild(PE.el("div", { class: "parts" }, `<h4>${esc(PE.t("parts"))}</h4><dl>${b.parts.map(p => `<dt>${txt(p.name)}</dt><dd>${txt(p.desc)}</dd>`).join("")}</dl>`));
    return null;
  };

  PE.renderLesson = (lesson, host, params) => {
    const html = lesson.blocks.map((b, i) => `<div class="blk blk-${b.type}" data-i="${i}">${(R[b.type] || R.html)(b)}</div>`).join("");
    host.innerHTML = `<h2 class="lesson-title"><span class="dwg-no"><small>${esc(PE.t("sheet"))}</small><bdi dir="ltr">${lesson.code}</bdi></span><span>${PE.lang === "he" ? esc(PE.L(lesson.title)).replace(/\(([A-Za-z0-9 /\-–]+)\)\s*$/, '<bdi dir="ltr" class="nowrap-latin">($1)</bdi>') + "&rlm;" : esc(PE.L(lesson.title))}</span></h2>${html}`;
    const instances = [];
    lesson.blocks.forEach((b, i) => {
      const m = M[b.type]; if (!m) return;
      const node = host.querySelector(`.blk[data-i="${i}"] > *`) || host.querySelector(`.blk[data-i="${i}"]`);
      try { const inst = m(node, b, lesson.id + ":" + i, params, lesson); if (inst) instances.push(inst); }
      catch (e) { console.error("block", lesson.code, i, e); node.innerHTML = `<p class="callout danger block-error">Error: ${esc(e.message)}</p>`; }
    });
    return () => instances.forEach(x => x && x.destroy && x.destroy());
  };
})();
