const assert = require("assert");
const M = require("../js/model.js");
const near = (a, b, tol) => assert.ok(Math.abs(a - b) <= tol, `${a} ≉ ${b}`);
module.exports = {
  "bodyZ falls with voltage, wet below dry, path factors"() {
    let prev = Infinity; for (const u of [10, 25, 50, 100, 230, 400, 1000]) { const z = M.bodyZ(u); assert.ok(z <= prev); prev = z; }
    assert.ok(M.bodyZ(230, "wet") < M.bodyZ(230, "dry"));
    near(M.bodyZ(230, "dry", "hf") / M.bodyZ(230, "dry", "hh"), 0.75, 1e-9);
  },
  "zone boundaries"() {
    assert.strictEqual(M.zone(0.3, 5000), "AC-1");
    assert.strictEqual(M.zone(30, 40), "AC-2");
    assert.strictEqual(M.zone(100, 1000), "AC-4");
    assert.strictEqual(M.zone(60, 300), "AC-3");
  },
  "rcd staircase"() {
    assert.strictEqual(M.rcdTrip(10, 30).status, "no");
    assert.strictEqual(M.rcdTrip(20, 30).status, "maybe");
    assert.strictEqual(M.rcdTrip(30, 30).t_ms, 300);
    assert.strictEqual(M.rcdTrip(60, 30).t_ms, 150);
    assert.strictEqual(M.rcdTrip(150, 30).t_ms, 40);
  },
  "TT without RCD: high touch voltage, no trip, not ok"() {
    const r = M.tt({ Ra: 10 }); near(r.Vcase, 191.7, 0.5); assert.strictEqual(r.trip, null); assert.strictEqual(r.ok, false);
  },
  "TT with 30 mA RCD trips in 40 ms"() { const r = M.tt({ Ra: 10, rcd_mA: 30 }); assert.strictEqual(r.trip.by, "rcd"); assert.strictEqual(r.trip.t_ms, 40); assert.ok(r.ok); assert.ok(r.cond.ok); },
  "TT unearthed case + person + RCD: trips (v1 bug fixed)"() { const r = M.tt({ earthed: false, rcd_mA: 30 }); assert.strictEqual(r.trip.by, "rcd"); assert.ok(r.ok); },
  "TN defaults: instant trip"() { const r = M.tn({}); near(r.Zs, 0.84, 0.001); assert.strictEqual(r.trip.mode, "instant"); assert.ok(r.cond.ok); },
  "TN long thin cable: no instant trip"() { const r = M.tn({ L: 300, A_ph: 1.5, A_pe: 1.5 }); assert.notStrictEqual(r.trip && r.trip.mode, "instant"); assert.strictEqual(r.ok, false); },
  "TN broken PEN: every case ≈ U0"() { const r = M.tn({ pen: "broken", fault: false }); assert.strictEqual(r.cases.length, 3); r.cases.forEach(v => near(v, 230, 0.01)); },
  "TN broken PEN with local earth: divider, still > 50 V"() { const r = M.tn({ pen: "broken", fault: false, Ra: 10 }); assert.ok(r.Vcase < 230 && r.Vcase > 50); },
  "RCD: L–N body current not detected"() { const r = M.rcdScenario({ scenario: "LN" }); assert.strictEqual(r.trip, null); assert.strictEqual(r.body.zone, "AC-4"); },
  "RCD: L–E body current detected"() { const r = M.rcdScenario({ scenario: "LE" }); assert.ok(r.trip); },
  "RCD: overload not detected"() { assert.strictEqual(M.rcdScenario({ scenario: "overload" }).trip, null); },
  "separation: single touch < 1 mA; first fault dangerous"() {
    assert.ok(M.separation({}).body.I_mA < 1);
    assert.ok(["AC-3", "AC-4"].includes(M.separation({ firstFault: true }).body.zone));
    assert.deepStrictEqual(M.separation({ len: 600 }).warnings, ["Vm", "len"]);
  },
  "separation: two appliances, bond trips, no bond dangerous"() { assert.ok(M.separation({ dual: true, bond: true }).trip); assert.strictEqual(M.separation({ dual: true, bond: false }).body.zone, "AC-4"); },
  "bonding reduces Ut by > 90 %"() { const a = M.bonding({}), b = M.bonding({ bond: true, R_sb: 0.02 }); near(a.Ut, 60, 1e-9); assert.ok(b.Ut < 0.1 * a.Ut); },
  "ELV 12 V dry not dangerous; adapter fault dangerous"() {
    assert.ok(["AC-1", "AC-2"].includes(M.elv({ U: 12 }).body.zone));
    assert.strictEqual(M.elv({ U: 12, source: "adapterFault" }).within, false);
    assert.strictEqual(M.elv({ U: 50, location: "pool0" }).body.zone, "AC-4");
  },
  "class protection"() { assert.ok(M.classProtection({ cls: 2, basic: true }).live === false); assert.ok(M.classProtection({ cls: 2, basic: true, supp: true }).live); assert.ok(M.classProtection({ cls: 1, basic: true, pe: false }).live); assert.ok(M.classProtection({ cls: 1, basic: true }).disconnect); },
  "non-conducting location and IT"() { assert.ok(M.nonConducting({}).ok); assert.ok(!M.nonConducting({ Rfloor_k: 10 }).ok); assert.strictEqual(M.it({}).body.zone, "AC-2"); }
};
