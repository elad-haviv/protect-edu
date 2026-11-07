/* 3D scene kit (three.js r147, lazy-loaded). Labels and parts list are HTML; nothing textual is drawn in WebGL. */
(function () {
  "use strict";
  const { esc, rich } = PE;
  const txt = o => rich(PE.L(o));
  let loading = null;

  let glOk = null;
  function webglOk() {
    if (glOk !== null) return glOk;
    try {
      const c = document.createElement("canvas"), gl = window.WebGLRenderingContext && (c.getContext("webgl") || c.getContext("experimental-webgl"));
      glOk = !!gl; if (gl) { const ext = gl.getExtension("WEBGL_lose_context"); if (ext) ext.loseContext(); }
    } catch (e) { glOk = false; }
    return glOk;
  }
  function loadScript(src) {
    return new Promise((res, rej) => { const s = document.createElement("script"); s.src = src; s.onload = res; s.onerror = () => rej(new Error("load " + src)); document.head.appendChild(s); });
  }
  PE.loadThree = () => {
    if (window.THREE && THREE.OrbitControls) return Promise.resolve(window.THREE);
    if (!loading) loading = loadScript("vendor/three@0.147.0/three.min.js").then(() => loadScript("vendor/three@0.147.0/OrbitControls.js")).then(() => window.THREE);
    return loading;
  };
  const css = name => getComputedStyle(document.documentElement).getPropertyValue(name).trim() || "#888";
  PE.css = css;

  function controlsHtml(params, s, key) {
    return params.filter(p => !p.show || p.show(s)).map(p => {
      const lab = PE.rich(esc(PE.L(p.label)));
      if (p.type === "bool") return `<div class="ctl"><button type="button" class="tog" data-k="${p.key}" aria-pressed="${!!s[p.key]}"><span>${lab}</span></button></div>`;
      if (p.type === "range") return `<div class="ctl"><label class="ctl-label" for="${key}-${p.key}"><span>${lab}</span><output dir="ltr">${PE.fmt(s[p.key])}${p.unit ? " " + esc(p.unit) : ""}</output></label><input id="${key}-${p.key}" type="range" data-k="${p.key}" min="${p.min}" max="${p.max}" step="${p.step || 1}" value="${s[p.key]}" dir="ltr"></div>`;
      return `<div class="ctl"><span class="ctl-label">${lab}</span><div class="seg" role="radiogroup">${p.values.map(v => `<button type="button" role="radio" data-k="${p.key}" data-v="${esc(v.v)}" aria-checked="${s[p.key] === v.v}"><bdi>${esc(PE.L(v.label))}</bdi></button>`).join("")}</div></div>`;
    }).join("");
  }

  PE.scene3d = (host, block) => {
    const def = PE.scenes[block.id];
    if (!def || !webglOk()) return PE.sceneFallback(host, block);
    const key = "scene:" + block.id;
    const c = PE.cache[key] || (PE.cache[key] = { s: Object.fromEntries(def.params.map(p => [p.key, p.def])) });
    const s = c.s;
    const coarse = window.matchMedia && window.matchMedia("(pointer: coarse)").matches;
    host.innerHTML = `<div class="scene3d" data-scene="${esc(block.id)}">
      <div class="s3-stage" tabindex="0" role="application" aria-label="${esc(PE.L(block.title))} – ${esc(PE.t("keys3d"))}">
        <div class="s3-canvas"></div><div class="s3-labels" aria-hidden="true"></div>
        <div class="s3-tools">${coarse ? `<button type="button" class="tool3d interact" aria-pressed="false">${esc(PE.t("interact"))}</button>` : ""}<button type="button" class="tool3d reset">${esc(PE.t("reset3d"))}</button></div>
        <p class="s3-loading">${esc(PE.t("loading3d"))}</p>
      </div>
      <div class="sim-side">
        <div class="panel ctls"><h4>${esc(PE.t("simControls"))}</h4><div class="ctl-list"></div></div>
        <div class="panel parts3d"><h4>${esc(PE.t("parts"))}</h4><div class="part-btns"></div><p class="part-desc" aria-live="polite"></p></div>
        <div class="verdict" data-verdict="safe"><span class="v-ic" aria-hidden="true">i</span><div class="s3-status"></div></div><p class="sr" role="status" aria-live="polite"></p>
      </div></div>`;
    const root = host.querySelector(".scene3d"), stage = root.querySelector(".s3-stage"), labelsEl = root.querySelector(".s3-labels");
    let alive = true, renderer, scene, camera, controls, built, raf = null, ro = null, selected = null;

    function fallback(err) { console.warn("3D fallback:", err && err.message); if (!alive) return; host.innerHTML = ""; PE.sceneFallback(host, block); }

    PE.loadThree().then(T => {
      if (!alive) return;
      root.querySelector(".s3-loading").remove();
      renderer = new T.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
      root.querySelector(".s3-canvas").appendChild(renderer.domElement);
      scene = new T.Scene();
      camera = new T.PerspectiveCamera(40, 16 / 9, 0.1, 200);
      scene.add(new T.HemisphereLight(0xffffff, 0x445566, 0.7));
      const dl = new T.DirectionalLight(0xffffff, 0.75); dl.position.set(6, 12, 8); scene.add(dl);
      const ctx = { L: PE.L, model: PE.model, css, dark: PE.isDark(), T };
      built = def.build(T, scene, ctx);
      controls = new T.OrbitControls(camera, renderer.domElement);
      controls.enableDamping = false; controls.enabled = !coarse; controls.maxDistance = 30; controls.minDistance = 1.5;
      renderer.domElement.style.touchAction = coarse ? "pan-y" : "none";
      controls.addEventListener("change", render);
      reset();
      buildControls(); buildParts();
      ro = new ResizeObserver(resize); ro.observe(stage); resize();
      update();
    }).catch(fallback);

    function reset() {
      camera.position.set(...def.camera.pos); controls.target.set(...def.camera.target); controls.update();
      if (selected) { highlight(selected, false); selected = null; }
      root.querySelectorAll(".part-btns button").forEach(x => x.setAttribute("aria-pressed", "false"));
      const pd = root.querySelector(".part-desc"); if (pd) pd.textContent = "";
      render();
    }
    function resize() {
      if (!renderer) return;
      const w = stage.clientWidth, h = Math.round(Math.min(w * 9 / 16, window.innerHeight * 0.62));
      renderer.setSize(w, h); camera.aspect = w / h; camera.updateProjectionMatrix(); render();
    }
    let labels = [];
    function render() {
      if (!renderer) return;
      renderer.render(scene, camera);
      const w = renderer.domElement.clientWidth, h = renderer.domElement.clientHeight, v = new THREE.Vector3();
      labelsEl.innerHTML = labels.map(l => {
        v.set(...l.pos).project(camera);
        if (v.z > 1) return "";
        return `<span class="lbl3d ${l.tone || ""}" style="left:${((v.x + 1) / 2 * w).toFixed(1)}px;top:${((1 - v.y) / 2 * h).toFixed(1)}px"><bdi>${rich(typeof l.text === "string" ? l.text : PE.L(l.text))}</bdi></span>`;
      }).join("");
    }
    let liveT = null;
    function update() {
      const out = built.update(s, { L: PE.L, model: PE.model, T: THREE }) || {};
      labels = out.labels || [];
      root.querySelector(".s3-status").innerHTML = out.status ? txt(out.status) : "";
      root.querySelector(".verdict").dataset.verdict = out.tone || "safe";
      root.querySelector(".v-ic").textContent = { safe: "✓", warn: "!", danger: "⚡" }[out.tone || "safe"];
      clearTimeout(liveT); liveT = setTimeout(() => { const lv = root.querySelector('[aria-live]'); if (lv) lv.textContent = root.querySelector(".s3-status").textContent; }, 500);
      if (out.animate) animate(out.animate); else render();
    }
    function animate(stepFn) {
      cancelAnimationFrame(raf);
      const t0 = performance.now();
      const loop = now => { if (!alive) return; const more = stepFn((now - t0) / 1000); render(); if (more) raf = requestAnimationFrame(loop); };
      raf = requestAnimationFrame(loop);
    }
    function buildControls() {
      const list = root.querySelector(".ctl-list");
      list.innerHTML = controlsHtml(def.params, s, key);
      list.querySelectorAll(".tog").forEach(b => b.addEventListener("click", () => { s[b.dataset.k] = !s[b.dataset.k]; buildControls(); update(); }));
      list.querySelectorAll("input[type=range]").forEach(inp => inp.addEventListener("input", () => {
        const p = def.params.find(x => x.key === inp.dataset.k); s[p.key] = parseFloat(inp.value);
        inp.closest(".ctl").querySelector("output").textContent = PE.fmt(s[p.key]) + (p.unit ? " " + p.unit : ""); update();
      }));
      list.querySelectorAll(".seg button").forEach(b => b.addEventListener("click", () => {
        const p = def.params.find(x => x.key === b.dataset.k); s[p.key] = p.values.find(v => String(v.v) === b.dataset.v).v; buildControls(); update();
      }));
    }
    const emOrig = new Map();
    function highlight(part, on) {
      const mats = new Set(); part.object.traverse(o => { if (o.material && o.material.emissive) mats.add(o.material); });
      mats.forEach(m => { if (!emOrig.has(m)) emOrig.set(m, m.emissive.getHex()); m.emissive.setHex(on ? 0x553300 : emOrig.get(m)); });
    }
    function buildParts() {
      const box = root.querySelector(".part-btns");
      box.innerHTML = built.parts.map((p, i) => `<button type="button" class="chip" data-i="${i}" aria-pressed="false">${esc(PE.L(p.name))}</button>`).join("");
      box.querySelectorAll("button").forEach(b => b.addEventListener("click", () => {
        const p = built.parts[+b.dataset.i];
        if (selected) highlight(selected, false);
        selected = p; highlight(p, true);
        box.querySelectorAll("button").forEach(x => x.setAttribute("aria-pressed", x === b));
        controls.target.set(...p.anchor); controls.update();
        root.querySelector(".part-desc").innerHTML = `<b>${txt(p.name)}</b> – ${txt(p.desc)}`;
        render();
      }));
    }
    // keyboard: arrows rotate, +/- zoom, R reset
    stage.addEventListener("keydown", e => {
      if (!camera) return;
      const off = camera.position.clone().sub(controls.target), sph = new THREE.Spherical().setFromVector3(off);
      const k = e.key;
      if (k === "ArrowLeft") sph.theta -= 0.12; else if (k === "ArrowRight") sph.theta += 0.12;
      else if (k === "ArrowUp") sph.phi = Math.max(0.15, sph.phi - 0.1); else if (k === "ArrowDown") sph.phi = Math.min(Math.PI / 2 - 0.02, sph.phi + 0.1);
      else if (k === "+" || k === "=") sph.radius = Math.max(controls.minDistance || 1, sph.radius * 0.88); else if (k === "-") sph.radius = Math.min(controls.maxDistance || 30, sph.radius * 1.12);
      else if (k === "r" || k === "R") { reset(); e.preventDefault(); return; } else return;
      e.preventDefault(); off.setFromSpherical(sph); camera.position.copy(controls.target).add(off); camera.lookAt(controls.target); render();
    });
    root.querySelector(".reset").addEventListener("click", () => reset());
    const ib = root.querySelector(".interact");
    if (ib) ib.addEventListener("click", () => { const on = ib.getAttribute("aria-pressed") !== "true"; ib.setAttribute("aria-pressed", on); controls.enabled = on; stage.classList.toggle("touch-on", on); if (renderer) renderer.domElement.style.touchAction = on ? "none" : "pan-y"; });

    return { destroy() {
      alive = false; cancelAnimationFrame(raf); if (ro) ro.disconnect();
      clearTimeout(liveT);
      if (renderer) { renderer.dispose(); renderer.forceContextLoss(); renderer.domElement.remove(); scene.traverse(o => { if (o.geometry) o.geometry.dispose(); if (o.material) [].concat(o.material).forEach(m => m.dispose()); }); }
      if (controls) controls.dispose();
    } };
  };

  // helpers for scenes
  PE.s3 = {
    mat: (T, color, extra) => new T.MeshStandardMaterial(Object.assign({ color, roughness: 0.6, metalness: 0.1 }, extra || {})),
    box: (T, w, h, d, m, x, y, z) => { const o = new T.Mesh(new T.BoxGeometry(w, h, d), m); o.position.set(x, y, z); return o; },
    cyl: (T, r, h, m, x, y, z, seg = 24) => { const o = new T.Mesh(new T.CylinderGeometry(r, r, h, seg), m); o.position.set(x, y, z); return o; },
    tube: (T, pts, r, m) => new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(pts.map(p => new T.Vector3(...p)), false, "catmullrom", 0.01), Math.max(8, pts.length * 12), r, 8, false), m),
    person: (T, m) => {
      const g = new T.Group();
      const add = (geo, x, y, z, rx = 0, rz = 0) => { const o = new T.Mesh(geo, m); o.position.set(x, y, z); o.rotation.x = rx; o.rotation.z = rz; g.add(o); return o; };
      add(new T.SphereGeometry(0.13, 20, 16), 0, 1.68, 0);
      add(new T.CylinderGeometry(0.16, 0.13, 0.62, 16), 0, 1.22, 0);
      add(new T.CylinderGeometry(0.06, 0.06, 0.82, 10), -0.1, 0.42, 0); add(new T.CylinderGeometry(0.06, 0.06, 0.82, 10), 0.1, 0.42, 0);
      return g;
    },
    arm: (T, m, from, to) => { const a = new T.Vector3(...from), b = new T.Vector3(...to); const len = a.distanceTo(b); const o = new T.Mesh(new T.CylinderGeometry(0.045, 0.045, len, 10), m); o.position.copy(a).add(b).multiplyScalar(0.5); o.quaternion.setFromUnitVectors(new T.Vector3(0, 1, 0), b.clone().sub(a).normalize()); return o; }
  };
})();
