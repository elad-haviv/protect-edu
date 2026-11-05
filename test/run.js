/* Minimal test runner: node test/run.js */
const files = ["model.test.js", "content.test.js"];
let pass = 0, fail = 0;
for (const f of files) {
  let suite; try { suite = require("./" + f); } catch (e) { console.log(`✗ ${f} failed to load: ${e.stack}`); fail++; continue; }
  for (const [name, fn] of Object.entries(suite)) {
    try { fn(); pass++; console.log(`✓ ${f} › ${name}`); } catch (e) { fail++; console.log(`✗ ${f} › ${name}\n   ${e.message.split("\n").join("\n   ")}`); }
  }
}
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
