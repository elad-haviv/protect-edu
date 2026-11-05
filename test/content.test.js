const assert = require("assert");
const { load, indexScripts } = require("./load");
const ctx = load(indexScripts().filter(f => !f.includes("core/app.js")));
const PE = ctx.PE;
const plain = x => JSON.parse(JSON.stringify(x));
const LABELS = ["principle", "practice", "illustrative", "regulation"];
const KINDS = ["intro", "sim", "scene", "practice", "check", "location", "card", "ref"];
const CODES = { A: ["A1", "A2", "A3", "A4", "A5"], B: ["B1", "B2", "B3", "B4", "B5"], C: ["C1", "C2", "C3", "C4"], D: ["D1", "D2", "D3", "D4", "D5", "D6"], E: ["E1", "E2", "E3", "E4"], F: ["F1", "F2", "F3"], G: ["G1", "G2", "G3", "G4", "G5"], H: ["H1", "H2", "H3", "H4", "H5"], J: ["J1", "J2", "J3", "J4", "J5"], K: ["K1"], L: ["L1"], M: ["M1"] };
const strip = s => String(s).replace(/<[^>]+>/g, "").replace(/\{\{|\}\}/g, "").replace(/\b3D\b/g, "");
const digits = s => (strip(s).match(/\d+(?:[.,]\d+)*/g) || []).map(x => x.replace(/,/g, "")).sort().join(" ");
// Walk every {he, en} pair in the content
function pairs(o, at, out) {
  if (!o || typeof o !== "object") return out;
  if (Array.isArray(o)) { o.forEach((x, i) => pairs(x, `${at}[${i}]`, out)); return out; }
  if ("he" in o || "en" in o) out.push({ at, he: o.he, en: o.en });
  for (const k in o) if (k !== "he" && k !== "en") pairs(o[k], `${at}.${k}`, out);
  return out;
}
module.exports = {
  "course has modules A–M in order"() { assert.deepStrictEqual(plain(PE.course.map(m => m.code)), ["A", "B", "C", "D", "E", "F", "G", "H", "J", "K", "L", "M"]); },
  "lesson codes match design R-2 and ids are unique"() {
    const ids = new Set();
    PE.course.forEach(m => {
      if (CODES[m.code]) assert.deepStrictEqual(plain(m.lessons.map(l => l.code)), CODES[m.code], m.code);
      m.lessons.forEach(l => { assert.ok(!ids.has(l.id), "dup id " + l.id); ids.add(l.id); assert.ok(KINDS.includes(l.kind), l.code + " kind " + l.kind); });
    });
  },
  "every bilingual text has both languages and the same numbers"() {
    const bad = [];
    pairs(PE.course, "course", []).concat(pairs(PE.ui, "ui", []), pairs(PE.content.locations, "loc", []), pairs(PE.content.kpool, "kpool", []), pairs(PE.content.glossary.map(g => g.def), "gloss", [])).forEach(p => {
      if (p.he == null || p.he === "" || p.en == null || p.en === "") { if (!(p.he === "" && p.en === "")) bad.push("missing: " + p.at); return; }
      if (typeof p.he === "string" && digits(p.he) !== digits(p.en)) bad.push(`digits ${p.at}: he[${digits(p.he)}] en[${digits(p.en)}]`);
    });
    assert.deepStrictEqual(bad, []);
  },
  "claim labels valid; answers in range; sims and figures exist"() {
    PE.course.forEach(m => m.lessons.forEach(l => l.blocks.forEach((b, i) => {
      const at = `${l.code}#${i}`;
      if (b.label) assert.ok(LABELS.includes(b.label), at);
      (b.items || []).forEach(it => { if (it.label) assert.ok(LABELS.includes(it.label), at); if (it.o) assert.ok(it.a >= 0 && it.a < it.o.length, at + " answer"); if (b.type === "practice") assert.ok(Number.isFinite(it.answer) && it.steps.length, at); });
      if (b.type === "sim") { assert.ok(PE.sims[b.id], at + " sim " + b.id); if (b.predict) assert.ok(b.predict.answer < b.predict.options.length, at); if (b.predict && b.predict.state) Object.keys(b.predict.state).forEach(k => assert.ok(PE.sims[b.id].params.some(p => p.key === k), `${at} predict key ${k}`)); }
      if (b.type === "figure" || b.type === "scene") assert.ok(PE.figures[b.id], at + " figure " + b.id);
      if (b.type === "scene") assert.ok(PE.scenes[b.id], at + " scene " + b.id);
      if (b.type === "location") b.set.forEach(s => assert.ok(PE.content.locations.some(x => x.set === s), at));
    })));
  },
  "each method module has intro, sim and check"() {
    "BCDEFGH".split("").forEach(c => { const kinds = PE.content[c].lessons.map(l => l.kind); ["intro", "sim", "check"].forEach(k => assert.ok(kinds.includes(k), c + " " + k)); });
  },
  "practice answers are consistent with stated steps (spot checks)"() {
    const f = code => PE.course.flatMap(m => m.lessons).find(l => l.code === code);
    const prac = f("C3").blocks.find(b => b.type === "practice").items[2];
    assert.ok(Math.abs(prac.answer - (230 / 160 - 0.3) / (2 * 0.0225 / 2.5)) < 0.1);
  }
};

module.exports["final-check pool: size, tags, answers, lesson links"] = () => {
  const pool = PE.content.kpool, codes = new Set(PE.course.flatMap(m => m.lessons.map(l => l.code)));
  assert.ok(pool.length >= 40, "pool " + pool.length);
  pool.forEach((it, i) => { assert.ok([1, 2, 3].includes(it.goal) && ["basic", "advanced"].includes(it.level), "tags " + i); assert.ok(codes.has(it.lesson), "lesson " + it.lesson); assert.ok(it.a >= 0 && it.a < it.o.length, "answer " + i); });
  const basic = pool.filter(it => it.level === "basic"), adv = pool.filter(it => it.level === "advanced");
  assert.ok(basic.length >= 12, "basic band has " + basic.length); assert.ok(adv.length >= 6, "advanced items " + adv.length);
  ["A", "B", "C", "D", "E", "F", "G", "H"].forEach(m => assert.ok(pool.some(it => it.method === m), "no item for " + m));
};
module.exports["glossary entries complete and linked"] = () => {
  const codes = new Set(PE.course.flatMap(m => m.lessons.map(l => l.code)));
  PE.content.glossary.forEach(g => { assert.ok(g.he && g.en && g.def.he && g.def.en, g.en); assert.ok(codes.has(g.code), g.code); });
};
