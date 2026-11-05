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
  await sim("#H2?bond=1&rsb=0.02", { verdict: "safe" }, "H2 bond");
  await sim("#H2?bond=0", { verdict: "danger" }, "H2 no bond");
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
  // v1 stubs
  await page.goto(BASE + "modules/m3-rcd.html"); await page.waitForTimeout(400);
  check(page.url().endsWith("#D1"), "v1 stub redirect: " + page.url());
  if (OUT) for (const [hash, w, h, scheme, name] of [["#B2?lang=he", 1366, 900, "light", "b2-he-desktop"], ["#C2?lang=en", 1366, 900, "dark", "c2-en-dark"], ["#D2?lang=he", 390, 844, "light", "d2-he-phone"], ["#A2?lang=he", 1366, 900, "dark", "a2-he-dark"]]) {
    const p = await browser.newPage({ viewport: { width: w, height: h }, colorScheme: scheme }); await p.goto(BASE + hash); await p.waitForTimeout(400);
    await p.screenshot({ path: `${OUT}/${name}.png`, fullPage: true }); await p.close();
  }
  check(errs.length === 0, "console errors: " + errs.slice(0, 5).join(" | "));
  await browser.close();
  console.log(fails.length ? "FAIL\n - " + fails.join("\n - ") : `OK – ${codes.length} lessons × 2 languages, simulator checks, quiz, practice, redirect`);
  process.exit(fails.length ? 1 : 0);
})();
