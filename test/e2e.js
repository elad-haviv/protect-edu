/* End-to-end check (manual): python3 -m http.server 8765 &  then  node test/e2e.js [baseURL] [screenshotDir]
   Needs Playwright with Chromium (preinstalled in the dev container). */
const { chromium } = require("playwright");
const BASE = process.argv[2] || "http://localhost:8765/";
const OUT = process.argv[3] || null;
const fails = [];
const check = (cond, msg) => { if (!cond) fails.push(msg); };
(async () => {
  const browser = await chromium.launch({ args: ["--use-gl=swiftshader", "--enable-unsafe-swiftshader"] });
  const page = await browser.newPage({ viewport: { width: 1366, height: 900 } });
  const errs = []; page.on("pageerror", e => errs.push(e.message)); page.on("console", m => { if (m.type() === "error") errs.push(m.text()); });
  await page.goto(BASE + "#A1"); await page.waitForTimeout(400);
  const codes = await page.evaluate(() => PE.course.flatMap(m => m.lessons.map(l => l.code)));
  for (const lang of ["he", "en"]) {
    for (const code of codes) {
      await page.goto(`${BASE}#${code}?lang=${lang}`); await page.waitForTimeout(120);
      const st = await page.evaluate(() => ({ dir: document.documentElement.dir, code: document.querySelector("#lesson")?.dataset.code, err: !!document.querySelector(".block-error") }));
      check(st.code === code, `${lang} ${code}: lesson not shown`); check(st.dir === (lang === "he" ? "rtl" : "ltr"), `${lang} ${code}: dir ${st.dir}`); check(!st.err, `${lang} ${code}: block error`);
    }
  }
  // simulator verdicts (deep links skip nothing: predicted sims stay locked until reveal)
  const sim = async (hash, expect, label) => {
    await page.goto(BASE + hash); await page.waitForTimeout(200);
    const locked = await page.$(".sim.locked");
    if (locked) { check(await page.$eval(".verdict", e => getComputedStyle(e).filter.includes("blur")), label + ": verdict visible while locked"); await page.click(".skip-p"); await page.waitForTimeout(100); }
    const v = await page.$eval(".verdict", e => ({ verdict: e.dataset.verdict, trip: e.dataset.trip, zone: e.dataset.zone }));
    for (const k in expect) check(v[k] === expect[k], `${label}: ${k}=${v[k]} expected ${expect[k]}`);
  };
  await sim("#B2?earthed=0&rcd=30", { verdict: "safe", trip: "yes" }, "B2 unearthed+RCD trips");
  await sim("#B2?earthed=1&rcd=0", { verdict: "danger", trip: "no" }, "B2 earthing alone");
  await sim("#C2?pen=broken&fault=0", { verdict: "danger" }, "C2 broken PEN");
  await sim("#C2?pen=ok&fault=1", { verdict: "safe", trip: "yes" }, "C2 TN trips");
  await sim("#D2?scn=LN", { verdict: "danger", trip: "no" }, "D2 L-N not detected");
  await sim("#E2?isolated=1&firstFault=0", { verdict: "safe" }, "E2 single touch safe");
  await sim("#E2?firstFault=1", { verdict: "danger" }, "E2 first fault");
  await sim("#G2?u=12&src=safety", { verdict: "safe" }, "G2 12 V dry");
  await sim("#H2?fault1=1", { verdict: "warn" }, "H2 first fault: alarm, no trip");
  await sim("#H2?fault1=1&touch=L1", { verdict: "danger" }, "H2 touch L1 after first fault");
  await sim("#H2?fault1=1&fault2=1", { verdict: "safe", trip: "yes" }, "H2 second fault trips");
  await sim("#J4?bond=1&rsb=0.02", { verdict: "safe" }, "J4 bond");
  await sim("#J4?bond=0", { verdict: "danger" }, "J4 no bond");
  // language switch keeps simulator state
  await page.goto(BASE + "#D2?lang=he"); await page.waitForTimeout(150);
  if (await page.$(".skip-p")) await page.click(".skip-p");
  await page.click('.seg button[data-v="overload"]'); await page.click(".lang-btn"); await page.waitForTimeout(150);
  check(await page.$eval('.seg button[data-v="overload"]', e => e.getAttribute("aria-checked")) === "true", "lang switch lost sim state");
  check(await page.evaluate(() => document.documentElement.dir) === "ltr", "lang switch dir");
  // quiz records progress
  await page.goto(BASE + "#F3?lang=en"); await page.waitForTimeout(150);
  const items = await page.evaluate(() => PE.currentLesson().blocks.find(b => b.type === "quiz").items.map(i => i.a));
  for (let i = 0; i < items.length; i++) await page.click(`.q[data-i="${i}"] .opt[data-j="${items[i]}"]`);
  check(await page.evaluate(() => !!PE.store.quizResult("f-check")), "quiz score not stored");
  // practice
  await page.goto(BASE + "#B4"); await page.waitForTimeout(150);
  await page.fill('.prac[data-i="0"] input', "184"); await page.click('.prac[data-i="0"] .chk');
  check((await page.textContent('.prac[data-i="0"] .prac-res')).includes("184"), "practice check");
  // legacy letter codes route to numbered sheets
  await page.goto(BASE + "#B2?lang=en"); await page.waitForTimeout(250);
  check(await page.evaluate(() => document.querySelector("#lesson").dataset.code) === "1.2", "legacy #B2 → 1.2");
  // 3D scenes render a canvas (swiftshader)
  for (const c of ["B3", "D3", "H3", "J5"]) {
    await page.goto(BASE + "#" + c); await page.waitForTimeout(1800);
    check(await page.$(".s3-canvas canvas"), c + ": no 3D canvas");
    check((await page.$$(".lbl3d")).length > 0, c + ": no 3D labels");
    const btn = await page.$(".part-btns button"); if (btn) { await btn.click(); check((await page.textContent(".part-desc")).length > 5, c + ": part description"); }
  }
  // presenter mode: deep link, locked prediction, Space reveals, Esc exits
  await page.goto(BASE + "#D2?present=1&lang=he"); await page.waitForTimeout(300);
  check(await page.evaluate(() => document.body.classList.contains("present")), "presenter: not on");
  check(!!(await page.$(".sim.locked")), "presenter: sim not locked");
  await page.click("#lesson h2"); await page.keyboard.press("Space"); await page.waitForTimeout(150);
  check(!(await page.$(".sim.locked")), "presenter: Space did not reveal");
  await page.keyboard.press("Escape"); await page.waitForTimeout(150);
  check(await page.evaluate(() => !document.body.classList.contains("present")), "presenter: Esc did not exit");
  // final check: answer all correctly, see the record form
  await page.goto(BASE + "#K1?lang=en"); await page.waitForTimeout(200);
  await page.click('[data-b="basic"]');
  for (let i = 0; i < 12; i++) {
    const a = await page.evaluate(i => { const st = Object.values(PE.cache).find(x => x && x.items && x.band); return PE.content.kpool[st.items[i]].a; }, i);
    await page.click(`.q[data-i="${i}"] .opt[data-j="${a}"]`);
  }
  check(await page.$eval(".final-res .score", e => e.dataset.pass) === "true", "final check: not passed");
  check(!!(await page.$(".record-form input")), "final check: no record form");
  // glossary search
  await page.goto(BASE + "#L1?lang=en"); await page.waitForTimeout(150);
  await page.fill(".gloss-search input", "RCD");
  check((await page.$$("#gloss-t tbody tr")).length >= 1 && (await page.$$("#gloss-t tbody tr")).length < 6, "glossary search");
  // branding and comparison card
  check(!!(await page.$('#top a[href="https://academy.haviv.pro"]')), "branding: academy link in header");
  check(!!(await page.$('#foot a[href="https://agl-edu.haviv.pro"]')), "branding: AGL link in footer");
  await page.goto(BASE + "#J1"); await page.waitForTimeout(150);
  check((await page.$$(".card-t tbody tr")).length === 8, "comparison card rows");
  // v1 stubs
  await page.goto(BASE + "modules/m3-rcd.html"); await page.waitForTimeout(400);
  check(page.url().endsWith("#3.1"), "v1 stub redirect: " + page.url());
  await page.goto(BASE + "modules/m7-equipotential.html"); await page.waitForTimeout(400);
  check(page.url().endsWith("#8.4"), "v1 stub m7 redirect: " + page.url());
  if (OUT) for (const [hash, w, h, scheme, name] of [["#B2?lang=he", 1366, 900, "light", "b2-he-desktop"], ["#C2?lang=en", 1366, 900, "dark", "c2-en-dark"], ["#D2?lang=he", 390, 844, "light", "d2-he-phone"], ["#A2?lang=he", 1366, 900, "dark", "a2-he-dark"]]) {
    const p = await browser.newPage({ viewport: { width: w, height: h }, colorScheme: scheme }); await p.goto(BASE + hash); await p.waitForTimeout(400);
    await p.screenshot({ path: `${OUT}/${name}.png`, fullPage: true }); await p.close();
  }
  // no-WebGL fallback
  const b2 = await chromium.launch({ args: ["--disable-webgl", "--disable-3d-apis"] }); const p2 = await b2.newPage();
  await p2.goto(BASE + "#D3"); await p2.waitForTimeout(800);
  check(!!(await p2.$(".scene-host .fig-svg")) && !!(await p2.$(".parts dl")), "no-WebGL fallback missing"); await b2.close();
  const real = errs.filter(e => !/GL Driver Message|GPU stall/.test(e));
  check(real.length === 0, "console errors: " + real.slice(0, 5).join(" | "));
  await browser.close();
  console.log(fails.length ? "FAIL\n - " + fails.join("\n - ") : `OK – ${codes.length} lessons × 2 languages, simulators, 3D, presenter, final check, glossary, quiz, practice, branding, redirect, no-WebGL fallback`);
  process.exit(fails.length ? 1 : 0);
})();
