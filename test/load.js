/* Load browser scripts into a Node vm context with stub globals (design R-4). Scripts may only register at load time. */
const fs = require("fs"), path = require("path"), vm = require("vm");
const ROOT = path.join(__dirname, "..");
function load(files) {
  const noop = () => stub;
  const stub = new Proxy(function () {}, { get: () => stub, apply: () => stub });
  const ctx = { console, Math, JSON, Number, String, Array, Object, Set, Map, Error, CSS: { escape: s => s },
    document: { addEventListener() {}, documentElement: { dataset: {} } }, navigator: { language: "he" }, localStorage: { getItem() { return null; }, setItem() {}, removeItem() {} },
    d3: stub, matchMedia: () => ({ matches: false }), setTimeout, clearTimeout };
  ctx.window = ctx;
  vm.createContext(ctx);
  files.forEach(f => vm.runInContext(fs.readFileSync(path.join(ROOT, f), "utf8"), ctx, { filename: f }));
  return ctx;
}
// The script list is read from index.html so tests follow the real load order.
function indexScripts() {
  const html = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");
  return [...html.matchAll(/<script src="([^"?]+)/g)].map(m => m[1]).filter(f => !f.startsWith("vendor/"));
}
module.exports = { load, indexScripts, ROOT };
