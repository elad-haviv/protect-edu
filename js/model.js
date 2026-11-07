/* Protect-Edu electrical model. Pure functions, SI units (A, V, Ω), times in ms.
   Values are approximate teaching values: see the labels in the course content.
   Loaded in the browser as PE.model and in Node via require(). */
(function (root) {
  "use strict";
  const U0_DEFAULT = 230;

  // ---------- helpers ----------
  function interpLogLin(table, x) {           // table [[x, y]...] ascending x, log(x) vs linear y
    if (x <= table[0][0]) return table[0][1];
    const last = table[table.length - 1];
    if (x >= last[0]) return last[1];
    for (let i = 1; i < table.length; i++) {
      const [x1, y1] = table[i - 1], [x2, y2] = table[i];
      if (x <= x2) { const f = (Math.log(x) - Math.log(x1)) / (Math.log(x2) - Math.log(x1)); return y1 + f * (y2 - y1); }
    }
    return last[1];
  }
  function interpLogLog(pts, x) {             // pts [[x, y]...] ascending x, log-log
    if (x <= pts[0][0]) return pts[0][1];
    const last = pts[pts.length - 1];
    if (x >= last[0]) return last[1];
    for (let i = 1; i < pts.length; i++) {
      const [x1, y1] = pts[i - 1], [x2, y2] = pts[i];
      if (x <= x2) { const f = (Math.log(x) - Math.log(x1)) / (Math.log(x2) - Math.log(x1)); return Math.exp(Math.log(y1) + f * (Math.log(y2) - Math.log(y1))); }
    }
    return last[1];
  }
  const par = (a, b) => (a * b) / (a + b);

  // ---------- body impedance (after IEC 60479-1, 50th percentile, large contact areas) ----------
  const Z_DRY = [[10, 4500], [25, 3250], [50, 2500], [75, 2000], [100, 1725], [125, 1550], [150, 1400], [175, 1325], [200, 1275], [225, 1225], [400, 950], [500, 850], [700, 775], [1000, 775]];
  const Z_WET = [[10, 3000], [25, 2175], [50, 1875], [75, 1625], [100, 1475], [125, 1350], [150, 1275], [175, 1225], [200, 1150], [225, 1100], [400, 875], [500, 800], [700, 750], [1000, 750]];
  const Z_SUBMERGED = 1000;
  const PATH = { hh: 1.0, hf: 0.75, hhf: 0.5 };
  function bodyZ(U, skin = "dry", path = "hh") {
    const u = Math.max(Math.abs(U), 10);
    const base = skin === "submerged" ? Z_SUBMERGED : interpLogLin(skin === "wet" ? Z_WET : Z_DRY, u);
    return base * (PATH[path] || 1);
  }

  // ---------- IEC 60479-1 time/current zones (AC 15–100 Hz), approximate digitisation ----------
  const CURVE_B = [[10, 200], [2000, 10], [10000, 10]];
  const CURVE_C1 = [[10, 500], [100, 400], [1000, 50], [10000, 40]];
  function curveB(t) { return interpLogLog(CURVE_B, t); }
  function curveC1(t) { return interpLogLog(CURVE_C1, t); }
  function zone(I_mA, t_ms) {
    const t = Math.max(10, Math.min(10000, t_ms || 10000));
    if (I_mA < 0.5) return "AC-1";
    if (I_mA < curveB(t)) return "AC-2";
    if (I_mA < curveC1(t)) return "AC-3";
    return "AC-4";
  }
  const ZONE_LEVEL = { "AC-1": 0, "AC-2": 1, "AC-3": 2, "AC-4": 3 };
  function zoneCurves() {
    const ts = []; for (let e = 1; e <= 4.0001; e += 0.05) ts.push(Math.pow(10, e));
    return { a: ts.map(t => [0.5, t]), b: ts.map(t => [curveB(t), t]), c1: ts.map(t => [curveC1(t), t]) };
  }

  // ---------- protective devices ----------
  const MCB_BAND = { B: [3, 5], C: [5, 10], D: [10, 20] };
  function parseMcb(m) {
    if (!m) return null;
    if (typeof m === "object") return m;
    const r = /^([BCD])(\d+)$/.exec(m); return r ? { type: r[1], In: +r[2] } : null;
  }
  function mcbInstant(m) { const b = parseMcb(m); return b ? MCB_BAND[b.type][1] * b.In : Infinity; }
  function mcbTrip(I, m) {
    const b = parseMcb(m); if (!b) return null;
    if (I >= MCB_BAND[b.type][1] * b.In) return { by: "mcb", mode: "instant", t_ms: 10, status: "yes" };
    if (I >= 1.45 * b.In) return { by: "mcb", mode: "thermal", t_ms: null, status: "slow" };
    return null;
  }
  function rcdTrip(Ires_mA, IdN_mA) {
    if (!IdN_mA) return { status: "none", t_ms: null };
    const r = Ires_mA / IdN_mA;
    if (r < 0.5) return { status: "no", t_ms: null };
    if (r < 1) return { status: "maybe", t_ms: null };
    if (r >= 5) return { status: "yes", t_ms: 40 };
    if (r >= 2) return { status: "yes", t_ms: 150 };
    return { status: "yes", t_ms: 300 };
  }
  // Pick the fastest device that trips with a definite time.
  function firstTrip(rcd, mcb) {
    const c = [];
    if (rcd && rcd.status === "yes") c.push({ by: "rcd", t_ms: rcd.t_ms, status: "yes" });
    if (mcb && mcb.status === "yes") c.push(mcb);
    if (!c.length) return mcb && mcb.status === "slow" ? mcb : null;
    return c.sort((a, b) => a.t_ms - b.t_ms)[0];
  }

  function body(Ubody, opt = {}, t_ms = 5000) {
    const Z = bodyZ(Ubody, opt.skin, opt.path);
    const R = Z + (opt.Rfoot || 0);
    const I_mA = (Ubody / R) * 1000;
    return { I_mA, t_ms, zone: zone(I_mA, t_ms), Z };
  }
  function exposure(trip) { return trip && trip.status === "yes" && trip.t_ms ? trip.t_ms : 5000; }

  // ---------- TT: protective earthing ----------
  function tt(o = {}) {
    const p = Object.assign({ U0: U0_DEFAULT, Ra: 10, Rb: 2, earthed: true, rcd_mA: null, mcb: "C16", person: true, skin: "dry", path: "hf", Rfoot: 1000, circuit: "final", UL: 50, fault: true }, o);
    const required_ms = p.circuit === "final" ? 200 : 1000;
    if (!p.fault) return { If: 0, Vcase: 0, residual_mA: 0, trip: null, required_ms, cond: null, ok: true, body: { I_mA: 0, t_ms: 0, zone: "AC-1" } };
    let If = 0, Vcase, residual_mA;
    if (p.earthed) { If = p.U0 / (p.Ra + p.Rb); Vcase = If * p.Ra; residual_mA = If * 1000; }
    else {
      Vcase = p.U0;
      const Z = bodyZ(p.U0, p.skin, p.path);
      residual_mA = p.person ? (p.U0 / (Z + p.Rfoot + p.Rb)) * 1000 : 0;
    }
    const trip = firstTrip(rcdTrip(residual_mA, p.rcd_mA), mcbTrip(If, p.mcb));
    const b = p.person ? body(Vcase, p, exposure(trip)) : { I_mA: 0, t_ms: 0, zone: "AC-1" };
    const cond = p.rcd_mA ? { key: "RaIdn", value: p.earthed ? p.Ra * p.rcd_mA / 1000 : Infinity, limit: p.UL } : { key: "RaIa", value: p.earthed ? p.Ra * mcbInstant(p.mcb) : Infinity, limit: p.UL };
    cond.ok = cond.value <= cond.limit;
    const intime = !!(trip && trip.status === "yes" && trip.t_ms <= required_ms);
    return { If, Vcase, residual_mA, trip, required_ms, cond, ok: intime || Vcase <= p.UL, body: b };
  }

  // ---------- TN: protective neutralization (איפוס) ----------
  function tn(o = {}) {
    const p = Object.assign({ U0: U0_DEFAULT, Zsrc: 0.3, L: 30, A_ph: 2.5, A_pe: 2.5, rho: 0.0225, mcb: "C16", rcd_mA: null, circuit: "final", pen: "ok", Zload: 23, Ra: null, Rb: 2, n: 3, fault: true, person: true, skin: "dry", path: "hf", Rfoot: 1000, UL: 50 }, o);
    const required_ms = p.circuit === "final" ? 400 : 5000;
    const Rph = p.rho * p.L / p.A_ph, Rpe = p.rho * p.L / p.A_pe;
    const Zs = p.Zsrc + Rph + Rpe;
    const Ia = mcbInstant(p.mcb);
    const cond = { key: "ZsIa", value: Zs * Ia, limit: p.U0 }; cond.ok = cond.value <= cond.limit;
    if (p.pen === "broken") {
      const Vcase = p.Ra ? p.U0 * p.Ra / (p.Zload + p.Ra + p.Rb) : p.U0;   // divider: load → local earth Ra → source earth Rb
      // A fault can no longer return; the breaker cannot see it. Every class I case sits at Vcase.
      const cases = Array.from({ length: p.n }, () => Vcase);
      const b = p.person ? body(Vcase, p, 5000) : { I_mA: 0, t_ms: 0, zone: "AC-1" };
      return { Zs: Infinity, If: 0, Rpe, Vcase, cases, trip: null, required_ms, cond: { key: "ZsIa", value: Infinity, limit: p.U0, ok: false }, ok: Vcase <= p.UL, body: b };
    }
    if (!p.fault) return { Zs, If: 0, Rpe, Vcase: 0, cases: Array(p.n).fill(0), trip: null, required_ms, cond, ok: true, body: { I_mA: 0, t_ms: 0, zone: "AC-1" } };
    const If = p.U0 / Zs, Vcase = If * Rpe;
    const trip = firstTrip(rcdTrip(If * 1000, p.rcd_mA), mcbTrip(If, p.mcb));
    const b = p.person ? body(Vcase, p, exposure(trip)) : { I_mA: 0, t_ms: 0, zone: "AC-1" };
    const intime = !!(trip && trip.status === "yes" && trip.t_ms <= required_ms);
    const cases = Array(p.n).fill(Vcase);      // all class I cases on this PE rise together
    return { Zs, If, Rpe, Vcase, cases, trip, required_ms, cond, ok: intime, body: b };
  }

  // ---------- phasors (three-phase) ----------
  const cx = (re, im = 0) => ({ re, im });
  const pol = (m, deg) => cx(m * Math.cos(deg * Math.PI / 180), m * Math.sin(deg * Math.PI / 180));
  const cadd = (a, b) => cx(a.re + b.re, a.im + b.im), csub = (a, b) => cx(a.re - b.re, a.im - b.im);
  const cscale = (a, k) => cx(a.re * k, a.im * k), cabs = a => Math.hypot(a.re, a.im);
  const cmul = (a, b) => cx(a.re * b.re - a.im * b.im, a.re * b.im + a.im * b.re);
  const cdiv = (a, b) => { const d = b.re * b.re + b.im * b.im; return cx((a.re * b.re + a.im * b.im) / d, (a.im * b.re - a.re * b.im) / d); };
  const PHASE_DEG = [0, -120, 120];
  const phaseV = (U0 = U0_DEFAULT) => PHASE_DEG.map(d => pol(U0, d));
  const ULL = U0 => Math.sqrt(3) * U0;

  // Broken PEN on a three-phase supply: neutral-point displacement (Millman). Loads are resistive, given as currents at U0.
  function brokenPEN3(o = {}) {
    const p = Object.assign({ U0: U0_DEFAULT, I: [10, 2, 2], Ra: 10, Rb: 2, person: true, skin: "dry", path: "hf", Rfoot: 1000 }, o);
    const V = phaseV(p.U0), Y = p.I.map(i => i / p.U0);              // admittance of each phase load
    const Ye = p.Ra ? 1 / (p.Ra + p.Rb) : 0;
    const Ysum = Y.reduce((a, b) => a + b, 0) + Ye;
    const VN = Ysum > 0 ? cscale(V.reduce((acc, v, k) => cadd(acc, cscale(v, Y[k])), cx(0)), 1 / Ysum) : cx(0);
    const loads = V.map(v => cabs(csub(v, VN)));
    const vn = cabs(VN), Vcase = p.Ra ? vn * p.Ra / (p.Ra + p.Rb) : vn;
    const b = p.person ? body(Vcase, p, 5000) : { I_mA: 0, t_ms: 0, zone: "AC-1" };
    return { VN: vn, VNdeg: Math.atan2(VN.im, VN.re) * 180 / Math.PI, loads, Vcase, body: b, ok: Vcase <= 50 };
  }

  // ---------- RCD scenarios ----------
  function rcdScenario(o = {}) {
    const p = Object.assign({ U0: U0_DEFAULT, scenario: "LE", IdN_mA: 30, leak_mA: 20, Iload: 8, Rb: 2, skin: "dry", path: "hf", Rfoot: 1000 }, o);
    // phasor currents (A): a single-phase appliance on L1 by default; IN = −(IL1+IL2+IL3) for current that returns in the circuit
    let I = [pol(p.Iload, 0), cx(0), cx(0)], residual_mA = 0, Ubody = 0, path = p.path, Rfoot = p.Rfoot, Ib = 0;
    const sc = p.scenario;
    if (sc === "leak") { residual_mA = p.leak_mA; I[0] = cadd(I[0], pol(p.leak_mA / 1000, 0)); }
    else if (sc === "LE") { const Z = bodyZ(p.U0, p.skin, p.path); Ib = p.U0 / (Z + p.Rfoot + p.Rb); residual_mA = Ib * 1000; I[0] = cadd(I[0], pol(Ib, 0)); Ubody = p.U0; }
    else if (sc === "LN") { path = "hh"; Rfoot = 0; Ib = p.U0 / bodyZ(p.U0, p.skin, "hh"); I[0] = cadd(I[0], pol(Ib, 0)); Ubody = p.U0; }
    else if (sc === "LL") { path = "hh"; Rfoot = 0; Ubody = ULL(p.U0); Ib = Ubody / bodyZ(Ubody, p.skin, "hh"); I[0] = cadd(I[0], pol(Ib, 30)); I[1] = pol(Ib, 210); }
    else if (sc === "overload") I = [pol(25, 0), cx(0), cx(0)];
    else if (sc === "unbalanced") I = [pol(16, 0), pol(6, -120), pol(2, 120)];
    // neutral carries what the phases do not cancel; leakage / body-to-earth current does not come back
    let sum = I.reduce(cadd, cx(0));
    if (sc === "leak") sum = csub(sum, pol(p.leak_mA / 1000, 0));
    if (sc === "LE") sum = csub(sum, pol(Ib, 0));
    const IN = cabs(sum);
    const r = rcdTrip(residual_mA, p.IdN_mA);
    const trip = r.status === "yes" ? { by: "rcd", t_ms: r.t_ms, status: "yes" } : null;
    const b = Ubody ? body(Ubody, { skin: p.skin, path, Rfoot }, exposure(trip)) : { I_mA: 0, t_ms: 0, zone: "AC-1" };
    const I3 = I.map(cabs);
    return { I3, Iph: I, IN, INph: cscale(sum, -1), I_L: I3[0], I_N: IN, residual_mA, rcd: r, trip, body: b, Ubody };
  }

  // ---------- electrical separation ----------
  function separation(o = {}) {
    const p = Object.assign({ U0: U0_DEFAULT, isolated: true, touch: "one", Riso_k: 500, len: 20, C_pF_m: 100, f: 50, firstFault: false, dual: false, bond: true, Rb: 2, skin: "dry", path: "hf", Rfoot: 1000 }, o);
    const warnings = [];
    if (p.U0 * p.len > 100000) warnings.push("Vm");
    if (p.len > 500) warnings.push("len");
    let b, trip = null, Ut = 0;
    if (p.touch === "two") { Ut = p.U0; b = body(p.U0, { skin: p.skin, path: "hh" }); }
    else if (p.dual) {
      if (p.bond) { trip = { by: "mcb", t_ms: 10, status: "yes" }; Ut = 0; b = { I_mA: 0, t_ms: 0, zone: "AC-1" }; }
      else { Ut = p.U0; b = body(p.U0, { skin: p.skin, path: "hh" }); }
    } else if (!p.isolated) { Ut = p.U0; const Z = bodyZ(p.U0, p.skin, p.path); const I = p.U0 / (Z + p.Rfoot + p.Rb) * 1000; b = { I_mA: I, t_ms: 5000, zone: zone(I, 5000), Z }; }
    else if (p.firstFault) { Ut = p.U0; b = body(p.U0, p); }
    else {
      const R = p.Riso_k * 1000, C = p.C_pF_m * 1e-12 * p.len, Xc = 1 / (2 * Math.PI * p.f * C);
      const Zleak = (R * Xc) / Math.sqrt(R * R + Xc * Xc);        // |R ∥ jXc|
      const Z = bodyZ(p.U0, p.skin, p.path);
      const I = p.U0 / (Z + p.Rfoot + Zleak) * 1000;
      Ut = I / 1000 * Z;
      b = { I_mA: I, t_ms: 5000, zone: zone(I, 5000), Z, Zleak };
    }
    return { body: b, trip, Ut, warnings, Vm: p.U0 * p.len };
  }

  // ---------- class 0 / I / II ----------
  function classProtection(o = {}) {
    const p = Object.assign({ U0: U0_DEFAULT, cls: 2, basic: false, supp: false, pe: true }, o);
    let live = false, disconnect = false, layer = "ok";
    if (p.cls === 0) { live = p.basic; layer = p.basic ? "basic-only" : "ok"; }
    else if (p.cls === 1) { if (p.basic) { if (p.pe) { disconnect = true; layer = "pe"; } else { live = true; layer = "no-pe"; } } }
    else { if (p.basic && p.supp) { live = true; layer = "both"; } else if (p.basic || p.supp) layer = "one"; }
    return { live, disconnect, layer, Vcase: live ? p.U0 : 0 };
  }

  // ---------- extra-low voltage ----------
  const ELV_LIMITS = { dry: { ac: 50, dc: 120 }, wet: { ac: 25, dc: 60 }, pool0: { ac: 12, dc: 30 } };
  function elv(o = {}) {
    const p = Object.assign({ U: 12, ac: true, skin: "dry", location: "dry", source: "safety", path: "hh" }, o);
    const Ueff = p.source === "adapterFault" ? 230 : p.U;
    const skin = p.location === "pool0" ? "submerged" : p.skin;
    const limit = ELV_LIMITS[p.location][p.ac ? "ac" : "dc"];
    const b = body(Ueff, { skin, path: p.path }, 1000);
    if (!p.ac) b.zone = b.I_mA < 2 ? "AC-1" : b.zone;   // DC is less dangerous; zones shown are AC (stated in UI)
    return { Ueff, limit, within: Ueff <= limit && p.source === "safety", body: b };
  }

  // ---------- equipotential bonding ----------
  function bonding(o = {}) {
    const p = Object.assign({ If: 300, R_pe: 0.2, bond: false, R_sb: 0.05, R_pipe: 0.1 }, o);
    if (!p.bond) { const Vcase = p.If * p.R_pe; return { Vcase, Vpipe: 0, Ut: Vcase }; }
    const Vcase = p.If * par(p.R_pe, p.R_sb + p.R_pipe);
    const Isb = Vcase / (p.R_sb + p.R_pipe);
    return { Vcase, Vpipe: Isb * p.R_pipe, Ut: Isb * p.R_sb };
  }

  function nonConducting(o = {}) {
    const p = Object.assign({ U0: U0_DEFAULT, Rfloor_k: 50, skin: "dry", path: "hf" }, o);
    const b = body(p.U0, { skin: p.skin, path: p.path, Rfoot: p.Rfloor_k * 1000 });
    return { body: b, limit_k: p.U0 > 500 ? 100 : 50, ok: p.Rfloor_k >= (p.U0 > 500 ? 100 : 50) };
  }

  function it(o = {}) {
    const p = Object.assign({ U0: U0_DEFAULT, C_uF: 0.1, f: 50, skin: "dry", path: "hf", Rfoot: 1000 }, o);
    const Xc = 1 / (2 * Math.PI * p.f * p.C_uF * 1e-6);
    const Z = bodyZ(p.U0, p.skin, p.path);
    const I = p.U0 / Math.hypot(Z + p.Rfoot, Xc) * 1000;
    return { body: { I_mA: I, t_ms: 5000, zone: zone(I, 5000), Z }, Xc };
  }

  // ---------- earth electrode (hemispherical equivalent, illustrative) ----------
  function electrodeTT(o = {}) {
    const p = Object.assign({ U0: U0_DEFAULT, rho: 100, a: 0.3, Rb: 2 }, o);
    const Re = p.rho / (2 * Math.PI * p.a), If = p.U0 / (Re + p.Rb);
    return { Re, If, Ve: If * Re, a: p.a, rho: p.rho };
  }
  function potentialAt(r, If, rho, a = 0.3) { return If * rho / (2 * Math.PI * Math.max(Math.abs(r), a)); }

  // Person touching L3 on a three-phase IT network: solve the earth node (Millman) with each phase's capacitance,
  // the first fault (L1, through Rf + Ra) and the body (L3, through Zb + Rfoot). Zb is iterated on the body voltage.
  function itTouch(p, Xc, Rfault) {
    const V = phaseV(p.U0), yC = cx(0, 1 / Xc);
    let Zb = bodyZ(p.U0, p.skin, p.path), I = 0, Ub = p.U0;
    for (let n = 0; n < 6; n++) {
      const Y = [cadd(yC, cx(Number.isFinite(Rfault) ? 1 / Rfault : 0)), yC, cadd(yC, cx(1 / (Zb + p.Rfoot)))];
      const UE = cdiv(Y.reduce((a, y, k) => cadd(a, cmul(y, V[k])), cx(0)), Y.reduce(cadd, cx(0)));
      I = cabs(csub(V[2], UE)) / (Zb + p.Rfoot); Ub = I * Zb; Zb = bodyZ(Math.max(Ub, 10), p.skin, p.path);
    }
    return { I_mA: I * 1000, t_ms: 5000, zone: zone(I * 1000, 5000), Z: Zb, U: Ub };
  }

  // ---------- floating supply (זינה צפה, IT), three-phase, neutral not distributed ----------
  function itSupply(o = {}) {
    const p = Object.assign({ U0: U0_DEFAULT, C_uF: 0.1, f: 50, Ra: 10, Rf_k: 0, fault1: false, fault2: false, imd: true, imd_k: 50, mcb: "C16", Zloop2: 1.2, Rpe: 0.27, touch: "case", skin: "dry", path: "hf", Rfoot: 1000, UL: 50 }, o);
    const Xc = 1 / (2 * Math.PI * p.f * p.C_uF * 1e-6), Xeq = Xc / 3;   // C per phase; first-fault current returns through the other phases' capacitance
    const U = ULL(p.U0);
    const Riso_k = p.fault1 ? Math.max(0.01, p.Rf_k) : 1000;
    const alarm = !!(p.imd && Riso_k < p.imd_k);
    const none = { I_mA: 0, t_ms: 0, zone: "AC-1" };
    if (p.fault1 && p.fault2) {                       // second fault on another phase: line-to-line short through the PE
      const If = U / p.Zloop2, trip = mcbTrip(If, p.mcb), Vcase = If * p.Rpe;
      const b = p.touch === "case" ? body(Vcase, p, exposure(trip)) : body(1.5 * p.U0, p, exposure(trip));   // L1, L2 at earth: L3 sits ≈ 1.5·U0 above it
      const Ia = mcbInstant(p.mcb);
      return { Riso_k, alarm, Id_mA: If * 1000, If, Ut: Vcase, U, cond: { key: "2IaZs", value: Ia * p.Zloop2, limit: U, ok: Ia * p.Zloop2 <= U }, trip, body: b, stage: 2 };
    }
    if (p.fault1) {
      const Rf = Riso_k * 1000, Id = p.U0 / Math.hypot(Rf + p.Ra, Xeq), Ut = Id * p.Ra;
      const IdBolted = p.U0 / Math.hypot(p.Ra, Xeq);                     // §411.6.2: Id ≈ 3ωC·U0 for a fault of negligible impedance
      let b = none;
      b = p.touch === "case" ? body(Ut, p, 5000) : itTouch(p, Xc, Rf + p.Ra);
      return { Riso_k, alarm, Id_mA: Id * 1000, If: Id, Ut, U, cond: { key: "RaId", value: p.Ra * IdBolted, limit: p.UL, ok: p.Ra * IdBolted <= p.UL }, trip: null, body: b, stage: 1 };
    }
    let b = none;                                    // healthy: touching a phase drives current through the system capacitance
    if (p.touch === "phase") b = itTouch(p, Xc, Infinity);
    return { Riso_k, alarm, Id_mA: 0, If: 0, Ut: 0, U, cond: { key: "RaId", value: 0, limit: p.UL, ok: true }, trip: null, body: b, stage: 0 };
  }

  const Model = { U0: U0_DEFAULT, bodyZ, zone, ZONE_LEVEL, zoneCurves, curveB, curveC1, MCB_BAND, parseMcb, mcbInstant, mcbTrip, rcdTrip, tt, tn, rcdScenario, separation, classProtection, ELV_LIMITS, elv, bonding, nonConducting, it, body, electrodeTT, potentialAt, itSupply, brokenPEN3, phaseV, pol, cabs, cadd, ULL, PHASE_DEG };
  if (typeof module !== "undefined" && module.exports) module.exports = Model;
  else { root.PE = root.PE || {}; root.PE.model = Model; }
})(typeof window !== "undefined" ? window : this);
