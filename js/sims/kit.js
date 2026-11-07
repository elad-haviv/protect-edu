/* Simulator wrapper: controls from a param schema, predict → reveal, meters, verdict, aria-live, URL state.
   A simulator registers PE.sims[id] = { title, viewBox, params: [...], render(svg, state, ctx) → {meters, verdict, note} }. */
(function () {
  "use strict";
  const { esc, rich } = PE;
  const txt = o => rich(PE.L(o));
  const K = PE.kit = {};

  K.zoneKey = z => "zoneAC" + String(z || "AC-1").slice(-1);
  K.zoneBadge = z => `<span class="zbadge z${String(z || "AC-1").slice(-1)}">${esc(z)}</span>`;
  K.bodyMeter = b => ({ label: "bodyCurrent", value: b.I_mA, unit: "mA", tone: ["ok", "warn", "bad", "bad"][PE.model.ZONE_LEVEL[b.zone]] });
  K.timeMeter = b => ({ label: "exposure", value: b.t_ms >= 5000 ? PE.t("continuous") : b.t_ms, unit: b.t_ms >= 5000 ? "" : "ms" });

  function parseParam(p, raw) {
    if (raw == null) return undefined;
    if (p.type === "bool") return raw === "1" || raw === "true" ? true : raw === "0" || raw === "false" ? false : undefined;
    if (p.type === "range") { const v = parseFloat(raw); return Number.isFinite(v) ? PE.clamp(v, p.min, p.max) : undefined; }
    if (p.type === "enum") return p.values.some(v => String(v.v) === raw) ? p.values.find(v => String(v.v) === raw).v : undefined;
    return undefined;
  }
  const visible = (p, s) => !p.show || p.show(s);

  K.mount = (host, block, key, urlParams) => {
    const def = PE.sims[block.id];
    if (!def) throw new Error("unknown simulator " + block.id);
    const lesson = PE.currentLesson();
    let c = PE.cache[key];
    if (!c) {
      const s = {};
      def.params.forEach(p => { s[p.key] = p.def; });
      Object.assign(s, block.defaults || {});
      if (block.predict && block.predict.state) Object.assign(s, block.predict.state);
      c = PE.cache[key] = { s, revealed: !block.predict, pick: null };
    }
    // A presenter deep link always starts with the prediction closed, for predict → vote → reveal
    if (block.predict && urlParams && urlParams.present && !c.presentLocked) { c.revealed = false; c.pick = null; c.presentLocked = true; }
    // Deep-link state (validated against the schema); never carries the reveal
    let fromUrl = false;
    def.params.forEach(p => { const v = parseParam(p, urlParams && urlParams[p.key]); if (v !== undefined) { c.s[p.key] = v; fromUrl = true; } });
    const s = c.s;
    const present = document.body.classList.contains("present");

    host.innerHTML = `<div class="sim" data-sim="${esc(block.id)}">
      <div class="sim-stage"><svg class="sim-svg" viewBox="${def.viewBox || "0 0 960 540"}" role="img" aria-label="${esc(PE.L(def.title))}"></svg><p class="sim-note"></p></div>
      <div class="sim-side">
        <div class="predict-slot"></div>
        <div class="panel ctls"><h4>${esc(PE.t("simControls"))}</h4><div class="ctl-list"></div></div>
        <div class="results"><div class="meters"></div>
        <div class="verdict" data-verdict="safe"></div></div>
        <p class="sr" aria-live="polite" role="status"></p>
      </div></div>`;
    const root = host.querySelector(".sim");
    const svgNode = root.querySelector("svg"), svg = d3.select(svgNode);
    const live = root.querySelector('[aria-live]');
    let liveTimer = null;

    function ctx() { return { L: PE.L, t: PE.t, lang: PE.lang, sym: PE.sym, fmt: PE.fmt, u: PE.u, model: PE.model, dark: PE.isDark() }; }

    function buildControls() {
      const list = root.querySelector(".ctl-list");
      list.innerHTML = def.params.filter(p => visible(p, s)).map(p => {
        const lab = rich(esc(PE.L(p.label)));
        if (p.type === "bool") return `<div class="ctl"><button type="button" class="tog" data-k="${p.key}" aria-pressed="${!!s[p.key]}"><span>${lab}</span></button></div>`;
        if (p.type === "range") return `<div class="ctl"><label class="ctl-label" for="${key}-${p.key}"><span>${lab}</span><output dir="ltr">${p.fmt ? p.fmt(s[p.key]) : PE.fmt(s[p.key]) + (p.unit ? " " + esc(p.unit) : "")}</output></label>
          <input id="${key}-${p.key}" type="range" data-k="${p.key}" min="${p.min}" max="${p.max}" step="${p.step || 1}" value="${s[p.key]}" dir="ltr"></div>`;
        return `<div class="ctl"><span class="ctl-label" id="${key}-${p.key}-l">${lab}</span><div class="seg" role="radiogroup" aria-labelledby="${key}-${p.key}-l">${p.values.map(v =>
          `<button type="button" role="radio" data-k="${p.key}" data-v="${esc(v.v)}" aria-checked="${s[p.key] === v.v}"><bdi>${esc(PE.L(v.label))}</bdi></button>`).join("")}</div></div>`;
      }).join("");
      const locked = !c.revealed;
      list.querySelectorAll("button, input").forEach(el => { el.disabled = locked; });
      list.querySelectorAll(".tog").forEach(b => b.addEventListener("click", () => set(b.dataset.k, !s[b.dataset.k])));
      list.querySelectorAll("input[type=range]").forEach(inp => inp.addEventListener("input", () => {
        const p = def.params.find(x => x.key === inp.dataset.k);
        s[p.key] = parseFloat(inp.value);
        inp.closest(".ctl").querySelector("output").textContent = p.fmt ? p.fmt(s[p.key]) : PE.fmt(s[p.key]) + (p.unit ? " " + p.unit : "");
        update(); syncUrl();
      }));
      list.querySelectorAll(".seg button").forEach(b => b.addEventListener("click", () => {
        const p = def.params.find(x => x.key === b.dataset.k);
        set(p.key, p.values.find(v => String(v.v) === b.dataset.v).v);
      }));
    }
    function set(k, v) { s[k] = v; buildControls(); update(); syncUrl(); const el = root.querySelector(`[data-k="${k}"]${typeof v === "boolean" ? "" : `[data-v="${CSS.escape(String(v))}"]`}`); if (el) el.focus(); }

    function syncUrl() {
      if (!lesson || !c.revealed) return;
      const cur = PE.parseHash(location.hash).params, out = {};
      ["lang", "present"].forEach(k => { if (cur[k]) out[k] = cur[k]; });
      def.params.forEach(p => { if (s[p.key] !== p.def) out[p.key] = typeof s[p.key] === "boolean" ? (s[p.key] ? 1 : 0) : s[p.key]; });
      PE.replaceHash(lesson.code, out);
    }

    function buildPredict() {
      const slot = root.querySelector(".predict-slot");
      const pr = block.predict;
      if (!pr) { slot.innerHTML = ""; return; }
      if (c.revealed && c.pick == null) { slot.innerHTML = ""; return; }
      const done = c.revealed;
      slot.innerHTML = `<div class="predict"><h4>🔮 ${esc(PE.t("predictTitle"))}</h4><p>${txt(pr.q)}</p>
        <div role="group">${pr.options.map((o, j) => {
          let cls = "opt"; if (done && j === pr.answer) cls += " right"; if (done && j === c.pick && j !== pr.answer) cls += " wrong";
          return `<button type="button" class="${cls}" data-j="${j}" aria-pressed="${c.pick === j}"${done ? " disabled" : ""}>${txt(o)}</button>`; }).join("")}</div>
        ${done ? `<div class="fb" role="status"><b>${esc(PE.t(c.pick === pr.answer ? "predictRight" : "predictWrong"))}</b> ${txt(pr.explain)}</div>`
          : `<p class="sim-note">${esc(PE.t(present ? "locked" : "predictPick"))}</p><div class="acts"><button type="button" class="btn reveal"${c.pick == null && !present ? " disabled" : ""}>${esc(PE.t("reveal"))}</button><button type="button" class="btn sec skip-p">${esc(PE.t("skipPredict"))}</button></div>`}</div>`;
      slot.querySelectorAll(".opt").forEach(b => b.addEventListener("click", () => { c.pick = +b.dataset.j; buildPredict(); slot.querySelector(".reveal")?.focus(); }));
      const rv = slot.querySelector(".reveal"); if (rv) rv.addEventListener("click", reveal);
      const sk = slot.querySelector(".skip-p"); if (sk) sk.addEventListener("click", () => { c.pick = null; reveal(); });
    }
    function reveal() {
      c.revealed = true; root.classList.remove("locked");
      buildPredict(); buildControls(); update();
    }
    const myReveal = () => { if (!c.revealed) reveal(); };
    K.revealCurrent = myReveal;

    function update() {
      svg.selectAll("*").remove();
      PE.sym.defs(svg);
      PE.sym.locked = !c.revealed;
      let out = {};
      try { out = def.render(svg, s, ctx()) || {}; } catch (e) { console.error(e); }
      PE.sym.locked = false;
      root.querySelector(".meters").innerHTML = (out.meters || []).map(m => `<div class="meter ${m.tone || ""}"><span>${rich(typeof m.label === "string" ? PE.t(m.label) : PE.L(m.label))}</span><b dir="ltr">${typeof m.value === "number" ? PE.fmt(m.value) : esc(m.value)}${m.unit ? `<small> ${esc(m.unit)}</small>` : ""}</b></div>`).join("");
      const v = out.verdict || { tone: "safe", text: "" };
      const vEl = root.querySelector(".verdict");
      vEl.dataset.verdict = v.tone;
      if (v.zone) vEl.dataset.zone = v.zone; else delete vEl.dataset.zone;
      if (v.trip != null) vEl.dataset.trip = v.trip ? "yes" : "no"; else delete vEl.dataset.trip;
      const ic = { safe: "✓", warn: "!", danger: "⚡" }[v.tone];
      vEl.innerHTML = `<span class="v-ic" aria-hidden="true">${ic}</span><div><span class="sr">${esc(PE.t({ safe: "verdictSafe", warn: "verdictWarn", danger: "verdictDanger" }[v.tone]))}: </span>${v.zone ? K.zoneBadge(v.zone) : ""}${txt(v.text)}${v.sub ? `<small>${txt(v.sub)}</small>` : ""}</div>`;
      root.querySelector(".sim-note").innerHTML = out.note ? txt(out.note) : "";
      if (c.revealed) { clearTimeout(liveTimer); liveTimer = setTimeout(() => { live.textContent = vEl.textContent; }, 500); }
    }

    if (!c.revealed) root.classList.add("locked");
    buildPredict(); buildControls(); update();
    if (fromUrl) syncUrl();
    return { destroy() { clearTimeout(liveTimer); if (K.revealCurrent === myReveal) K.revealCurrent = null; } };
  };

  // Keyboard: Space reveals in presenter mode
  document.addEventListener("keydown", e => {
    if (e.key === " " && document.body.classList.contains("present") && !e.target.closest("button, input, select, textarea") && K.revealCurrent) { e.preventDefault(); K.revealCurrent(); }
  });
})();
