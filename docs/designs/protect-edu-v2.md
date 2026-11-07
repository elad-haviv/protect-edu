# Protect-Edu v2: Design Document

Status: approved; implemented (R1–R3). Amendments R-1 to R-11 at the end are authoritative.
Owner: Elad Haviv
Source brief: [concepts_brief.md](concepts_brief.md)

## Overview

Protect-Edu v2 is a static, bilingual (Hebrew-first, English) web course. It
teaches the seven methods of protection against electric shock defined by the
Israeli Electricity Law and its 1991 regulations on earthing and protection
methods up to 1000 V.

It replaces v1, a set of seven pages with simple SVG simulations, kept in branch
`backup/v1-simple`. v2 keeps the same hosting:
- Coolify static app `itwbjmtncghdlcmlgnrngklq`;
- nginx;
- https://protect-edu.haviv.pro;
- branch `claude/zealous-pascal-z8mbpa`.

The course has:
- short lessons addressed by sign codes;
- d3 circuit simulators that ask the learner to predict before revealing;
- three three.js 3D scenes;
- misconception-based questions;
- exam-style calculation practice;
- a teacher presenter mode;
- a final check.

## The Problem

v1 has four problems:

1. **It teaches wrong things.**
   - It says an RCD does not trip when a person touches an unearthed live case.
   - It explains איפוס as "case to neutral".
   - It classifies danger by current only, ignoring time.
   - It uses a fixed body resistance, so 12 V looks dangerous.
   - It merges a non-conducting location with earth-free bonding.
   - It blurs the RCD's own trip time with the installation's maximum
     disconnection time.
2. **It does not teach how to decide.** There are no predictions, no named
   misconceptions, no calculations and no comparison between methods.
3. **It is hard to use in class.** There is no presenter mode, no deep links to a
   state, and Hebrew only.
4. **It is hard to maintain.** There are seven ad-hoc simulator files, no tests,
   and content mixed into the markup.

## Goals

1. **Fault decisions.** Given a fault scenario (system type, Ra or Zs, device
   rating), the learner decides whether disconnection is in time and whether the
   touch voltage stays ≤ 50 V. Measured by the calculation items in modules A, B,
   C, D and K.
2. **Failure modes and misconceptions.** For each method, the learner names its
   failure mode and rejects at least 2 named misconceptions. Measured by the
   predict prompts and distractor items.
3. **Choosing protection.** The learner chooses suitable protection for a
   described location and gives a reason. Measured by the location exercise,
   which appears 3 times.
4. **Teaching in class.** A teacher opens any simulator in presenter mode from a
   link that sets its state, and runs predict → vote → reveal.
5. **Reach.** The course works:
   - on a phone (360 px) and on a desktop;
   - in Hebrew (RTL) and English (LTR);
   - in light and dark themes;
   - online, offline from a local folder (`file://`), and on a projector.
6. **Correct figures.** No figure contradicts IEC 60364-4-41, IEC 60479-1 or the
   1991 regulations as commonly taught. Every regulatory figure is labelled
   "verify against the official text".

## Non-Goals

- A substitute for the regulations, the standards or a licensed course.
- Accounts, server, analytics or tracking.
- Instructions for live work, or design-grade calculations.
- 3D for methods that read just as well in 2D (C, E, F, G).
- A large exam question bank.

## Open Questions

1. The exact Hebrew title of each method as it appears in the current regulation
   text. The owner should verify; the draft uses the terms below.
2. Whether the regulation section numbers should be cited. The draft cites
   regulations by name only, to avoid wrong numbers.

## Terminology (Hebrew master terms)

| Code | Hebrew (UI) | English (UI) |
|---|---|---|
| B | הארקת הגנה | Protective earthing |
| C | איפוס (TN) | Protective neutralization (TN system) |
| D | מפסק מגן לזרם דלף (פחת) | Residual current device (RCD) |
| E | הפרד מגן | Protective separation |
| F | בידוד מגן / בידוד כפול | Double / reinforced insulation (class II) |
| G | מתח נמוך מאוד (SELV / PELV) | Extra-low voltage (SELV / PELV) |
| H | זינה צפה | Floating supply (IT) |

Other fixed terms:
- מוליך הגנה (PE)
- מוליך PEN
- פס השוואת פוטנציאלים ראשי (MET)
- זרם דלף / זרם פחת (IΔn)
- עכבת לולאת התקלה (Zs)
- מתח מגע
- מתח צעד
- הגנה בסיסית (מגע ישיר)
- הגנה בעת תקלה (מגע עקיף)
- שנאי בטיחות
- מחלקה I / II / III

## Critical User Journeys (CUJs)

### CUJ 1: Student learns a method

1. The student opens https://protect-edu.haviv.pro and the course resumes at the
   last lesson.
2. In D1, a scenario hook appears: "Two people touch a faulty kettle. One is
   shocked, one is not. Why?"
3. A short animated principle diagram and a 2-question check follow.
4. In D2 (simulator), the prompt asks: "The person touches L and N at the same
   time. Will the RCD trip?"
   - The student picks an answer.
   - The simulator runs. The current-flow animation and the meters show that it
     does not trip.
   - An explanation names the misconception.
5. In D3 (3D), the student rotates the RCD cut-away and taps the toroid. An HTML
   label explains it.
6. In D4, the student does three faded calculations (choose IΔn so that
   Ra·IΔn ≤ 50 V).
7. In D5, 6 questions follow, 2 of them from B and C. The score is saved and the
   comparison card gains the "RCD" row.

### CUJ 2: Teacher presents

1. The teacher opens `…/#C2?present=1&pen=broken&lang=he`.
2. The simulator fills the screen: light theme, large type, the broken-PEN state
   preset, and the reveal hidden.
3. The class votes. The teacher presses "Reveal" (or Space), and every class I
   case on the circuit lights as live.
4. The teacher presses → to move to C3.

### CUJ 3: Practising electrician reviews

1. The electrician opens module K, the final check.
2. The check draws 12 questions from the pool, at the "advanced" band.
3. Each wrong answer links back to its lesson code.
4. Scoring ≥ 80% allows printing a "completion record". The record states that
   it is not a licence.

### CUJ 4: Old link

1. A handout links to `/modules/m3-rcd.html`.
2. The stub page redirects to `/#D1` and keeps `?lang` if present.
3. v1 progress is migrated once.

## Technical Plan (Architecture)

### Constraints

- No build step. Plain `<script>` files share one global namespace `PE`. No ES
  modules, so the site runs from `file://`.
- Libraries are vendored and pinned:
  - `vendor/d3@7.9.0/d3.min.js`, loaded on every page (about 280 KB, cached).
  - `vendor/three@0.147.0/three.min.js` and
    `vendor/three@0.147.0/OrbitControls.js`. r147 is the last release with the
    UMD build and `examples/js`. three.js is injected only when a 3D lesson opens.
  - Each library has its LICENSE file, and `vendor/README.md` lists the source URL
    and SHA-256 of each file.
- App files are referenced with `?v=<version>` for cache busting.

### Layers

```
index.html               shell: header, rail, lesson area, pager, footer (no lesson content)
css/app.css              tokens (light/dark), layout, RTL via logical properties, print, presenter
js/core/ns.js            window.PE = {}; tiny helpers (esc, el, clamp, fmt, bdi)
js/core/store.js         versioned localStorage (protectEdu.v2) + v1 migration
js/core/i18n.js          PE.lang, PE.t(key), PE.L(obj{he,en}); sets <html lang dir>; onLang hooks
js/core/router.js        hash parsing "#D2?k=v&…" → {code, params}; deep-link state
js/core/app.js           course outline from PE.course; rail, breadcrumb, pager, progress, theme, presenter
js/core/render.js        renders a lesson's block list to DOM (p, list, formula, claim, figure, sim, scene, quiz, practice, predict, card)
js/core/quiz.js          quiz + misconception feedback + spaced items; final-check engine
js/model.js              pure electrical model (also exported for Node)
js/sims/symbols.js       IEC 60617 symbol library for d3 + IEC 60445 conductor palette
js/sims/kit.js           simulator wrapper: layout, controls (buttons/sliders), meters, predict→reveal, aria-live, URL state, flow animation
js/sims/*.js             one file per simulator, registers PE.sims[id] = {init(host, state), update(state)}
js/three/kit.js          lazy loader, renderer, camera, OrbitControls, interact toggle, HTML label overlay, parts list, fallback
js/three/b-earth.js      scene: earth electrode and potential funnel
js/three/d-rcd.js        scene: RCD cut-away
js/three/h-bath.js       scene: bathroom bonding
js/content/*.js          course data, one file per module (bilingual)
modules/m1-…m7-*.html    v1 redirect stubs
test/*.js                Node tests (no dependencies) + optional Playwright e2e
```

### Content model

`PE.course` is an ordered list of modules: `{code, icon, title:{he,en}, lessons:[…]}`.

A lesson is `{id, kind, title:{he,en}, blocks:[…]}`.
- The lesson code (`B2`) is derived from its position.
- `id` is stable (for example `b-sim`) and is the key for progress.

Each block has a `type` and bilingual fields. Some blocks also carry `label` (the
claim label). Types:

| Block type | Fields |
|---|---|
| `p` | `label?`, `he`, `en` (HTML allowed: `<b>`, `<bdi>`, `<sub>`) |
| `list` | `items: [{he, en}]` |
| `formula` | `tex`: plain text, always LTR |
| `callout` | `tone` (`info`, `warn`, `danger`, `ok`) plus `he`, `en` |
| `claim` | `label` plus `he`, `en` |
| `sim` | `id`, `defaults{}`, `predict{q, options[], answer, explain}` |
| `scene` | `id`, `fallback` (an SVG simulator or a static figure id) |
| `practice` | `items[]`: calculation items with `given`, `ask`, `answer`, `tolerance`, `steps[]` (faded hints) |
| `quiz` | `items[]`: `{q, options[], answer, why, misconception?, from?}` |
| `location` | id of the shared location-exercise set |
| `card` | marks a completed comparison-card row for this method |

`label` takes one of four values, each with a short bilingual tag:

| `label` | Hebrew tag | English tag | Meaning |
|---|---|---|---|
| `principle` | עיקרון | Principle | Physics; always true |
| `practice` | נוהג מקובל | Typical practice | Common professional practice |
| `illustrative` | ערך להמחשה | Illustrative | Simulator or example number |
| `regulation` | תקנה – לאמת | Regulation – verify | A figure from the regulations or standards; check the official text |

Numbers in content are written with `<bdi dir="ltr">`, generated by a
`PE.u(value, unit)` helper in render. Formulas are LTR blocks.

### Electrical model (`js/model.js`)

All functions are pure and in SI units. Labels note where values are approximate.

**Body impedance**

- `bodyImpedance(U, cond)`: total body impedance, hand-to-hand / hand-to-feet,
  large contact area, 50th-percentile population.
- Interpolated (log-linear) from a table after IEC 60479-1:
  - dry: 25 V → 3250 Ω, 50 V → 2500, 100 V → 1725, 200 V → 1275, 230 V → about
    1225 (taken from the 225 V entry), 400 V → 950, 1000 V → 775.
  - water-wet: dry × factor 0.8 at 25 V, tending to 1.0 at ≥ 400 V.
  - salt-water-wet: about 0.4 at 25 V, tending to 0.9.
- Label: `illustrative`.

**Body current and IEC 60479 zones**

- `bodyCurrent(U, Zbody, Rextra = 0)` returns A.
- `zone60479(I_mA, t_ms)` returns `AC-1` to `AC-4`, using curve breakpoint tables
  for lines a, b and c1 (approximate digitization of IEC 60479-1 Fig. 20,
  log-log interpolation):
  - a = 0.5 mA vertical;
  - b: (10 ms, 200 mA) → (10 000 ms, 10 mA);
  - c1: (10 ms, 500 mA) → (100 ms, 400 mA) → (1000 ms, 50 mA) → (10 000 ms,
    40 mA).
- `zoneCurves()` returns polylines for the A2 chart.

**TT system**

`tt({U0 = 230, Ra, Rb, Rfault = 0, rcd: IΔn|null, mcb: {type, In}|null})` returns:
- `If = U0 / (Ra + Rb + Rfault)`;
- `Ut = If · Ra`;
- `trips`: RCD if `If ≥ IΔn`, MCB if `If ≥ mult · In`;
- `t_device`, from `rcdTripTime` / `mcbInstant`;
- `required = 0.2 s` (`regulation`);
- `ok = Ut ≤ UL or (trips and t ≤ required)`.

**TN system**

`tn({U0 = 230, Zsrc, L, A_ph, A_pe, rho = 0.0225, mcb: {type, In}, rcd})` returns:
- `Zs = Zsrc + rho·L·(1/A_ph + 1/A_pe)`;
- `If = U0 / Zs`;
- `Ut = If · rho·L / A_pe`;
- `trips`;
- `t`;
- `required = 0.4 s`.

ρ = 0.0225 Ω·mm²/m is conductor resistivity at operating temperature, labelled
`practice`.

**Breaker instantaneous trip**

`mcbInstant(type)` gives the band B [3, 5], C [5, 10], D [10, 20] × In. The check
uses the upper bound, and the UI says why.

**RCD trip time**

`rcdTripTime(I, IΔn)` gives `null` below 0.5·IΔn, "may or may not trip" between
0.5 and 1 × IΔn, and these maximum times (IEC 61008, `regulation`):

| Residual current | Max trip time |
|---|---|
| ≥ IΔn | 300 ms |
| 2·IΔn | 150 ms |
| ≥ 5·IΔn | 40 ms |

Interpolated log-log between those points.

**Broken PEN**

`brokenPEN({U0, loads: [{Z}], classI_count})` returns the case voltage of every
class I appliance downstream, which approaches U0 through the load impedance.

**Separation**

`separation({U0, Riso, Ccable_per_m, len, f = 50, firstFault: bool})` returns the
body current through the insulation and capacitive leakage. With `firstFault`, it
becomes earthed-system behaviour.

**Equipotential bonding**

`bonding({If, R_pe, R_sb|null, R_pipe})` returns `{V_case, V_pipe, Ut}`. The
supplementary bonding conductor sits in parallel with the PE path:

- V_case = If · (R_pe ∥ (R_sb + R_pipe))
- I_sb = V_case / (R_sb + R_pipe)
- Ut = I_sb · R_sb (the voltage across the bond)

Without the bond, Ut = V_case and the pipe is at 0.

**Non-conducting location**

`nonConducting({U0, Rfloor})` returns the body current through the floor. The
requirement is Rfloor ≥ 50 kΩ (≥ 100 kΩ above 500 V), labelled `regulation`.

**ELV limits**

`elvLimits()` returns:
- 50 V AC / 120 V DC ripple-free;
- 25 V AC / 60 V DC without basic protection, dry conditions;
- 12 V AC / 30 V DC in pool zone 0.

All labelled `regulation`.

**Touch-voltage limits**

`UL`: 50 V normally, 25 V in special locations, labelled `regulation`. The UI
shows these as conventional touch-voltage limits, not as "safe voltage".

### Simulator kit (`js/sims/kit.js`) and graphics standard

**Layout**

- An SVG with `viewBox` 960 × 540, always LTR and never mirrored.
- Controls (`<button aria-pressed>` toggles, labelled range inputs) sit beside the
  SVG on wide screens and below it at ≤ 720 px.
- Meters are HTML cards with `<bdi>` values.

**Symbols**

`symbols.js` draws IEC 60617 symbols as reusable d3 functions:

| Symbol | IEC reference |
|---|---|
| earth | 02-15-01 |
| protective earth | 02-15-03 |
| equipotential | 02-15-05 |
| switch | 07-02 |
| circuit breaker (MCB) | 07-13-05 |
| RCD: switch + toroid sensor + mechanical link | 07-13-… family |
| fuse | 07-21-01 |
| transformer (two coupled windings) | 06-09-01 |
| safety isolating transformer marking | IEC 60417-5222 |
| resistor | 04-01-02 |
| lamp/load | 08-10-01 |
| class II mark | IEC 60417-5172 |
| class III mark | IEC 60417-5180 |
| junction dot | |
| terminal | |

- Conductor colours follow IEC 60445:
  - L brown, with L2 black and L3 grey where needed;
  - N blue;
  - PE green-yellow stripes (SVG pattern);
  - PEN green-yellow with blue end markers.
- Each conductor also has a text tag (L, N, PE, PEN), so colour is never the only
  cue.

**Current flow**

- Animated dashes along the path. Speed scales with log(current), and stroke
  width with the current band.
- The fault current path is orange with chevrons.
- The person's body path is drawn red, with a dashed pattern and a text state
  ("זרם דרך הגוף" / "Body current").

**People and objects**

- Simple, clean, flat illustrations (person, appliance case, floor, soil layers)
  in a consistent style.
- The person's colour state is always paired with an icon and a word: safe,
  perceptible, dangerous, lethal zone.

**States and verdicts**

- A verdict panel has an icon, a text and a zone tag (`AC-1`…`AC-4`).
- An `aria-live="polite"` summary updates at most once every 500 ms.

**Predict → reveal**

- When a `sim` block has `predict`, the result layer (meters, verdict, flow) is
  hidden until the learner picks an option and presses "Reveal".
- In presenter mode only the teacher's button reveals, with Space as the shortcut.
- "Skip prediction" is always available.

**State**

- Each simulator declares a param schema `{key, type, min, max, default}`.
- The kit reads initial values from the URL (`#C2?pen=0`) and can copy a
  share-link for the current state.

**Language and theme**

- A language or theme change only re-renders labels and colours.
- State, the prediction and animations persist.

**Reduced motion**

With `prefers-reduced-motion`, flow is shown as static arrows.

### Simulators (one per lesson where `kind = sim`)

| Lesson | Simulator | Controls | Teaches / misconception targeted |
|---|---|---|---|
| A1 | Body impedance vs voltage | U, skin condition, current path | "Resistance is fixed"; "voltage kills" vs current |
| A2 | IEC 60479 chart (d3, log-log) | Current, time; plotted point; RCD 30 mA/40 ms marker | Time matters; why 30 mA |
| A4 | Earthing systems TN-C-S / TT / IT | System selector, fault on/off | Fault path differs per system |
| A5 | Fault loop worked example | L, A, MCB type/In | Zs, If, disconnection time |
| B2 | TT fault | Ra, Rb, MCB, RCD on/off, earth connected, person touching | "Earthing alone makes it safe"; the RCD *does* detect a body on an unearthed case |
| C2 | TN fault + broken PEN | L, A, MCB type/In, PEN intact/broken, 3 class I appliances | Case connects to PE, not N; broken PEN makes every case live |
| D2 | RCD | Scenario (leak, L–earth body, L–N body, overload), IΔn, residual current | RCD blind to L–N touch and overload; trip-time curve |
| E2 | Separation | Isolated on/off, touch one/both poles, Riso, cable length, first fault to earth, 2 appliances with/without bonding | Do not earth the secondary; first fault converts the system |
| F2 | Class II layers | Class 0/I/II, damage basic/supplementary, PE connected | No PE on class II; class I relies on PE plus disconnection |
| G2 | ELV | U, AC/DC, skin, location (dry / wet / pool zone 0), source type (safety transformer / ordinary adapter fault) | Voltage-dependent impedance; "12 V is always safe" is false underwater; the source must be separated |
| H2 | Bonding | If, R_pe, supplementary bond on/off, R_sb; mode: non-conducting location (Rfloor) | Danger is the difference between parts; non-conducting location is supervised only |

### 3D scenes (three.js r147)

Common kit:
- Lazy-loaded on the lesson's first open.
- `WebGLRenderer`, with `antialias` and devicePixelRatio ≤ 2.
- Soft lighting, flat-shaded materials, colours from CSS tokens.
- Rotation and zoom with OrbitControls, only after an "Interact" toggle on touch
  devices, so the page scrolls otherwise.
- Keyboard: arrows rotate, +/− zoom, R resets.
- Labels are HTML elements positioned by projecting the anchor points.
- An HTML parts list of buttons focuses each part and shows its description in
  an `aria-live` panel.
- Fallback: if WebGL or the script is unavailable, a static SVG figure with the
  same parts list.
- Render-on-demand, not a continuous loop, except while an animation runs.

**B3: earth electrode and potential funnel**
- House wall, appliance case, PE down to an earth rod in layered soil.
- A surface mesh coloured by potential V(r) ≈ If·ρ/(2πr) (hemispherical
  electrode, illustrative).
- A person standing at distance d shows touch voltage (hand on case, feet on soil)
  and step voltage (feet 1 m apart). Sliders: d, If.

**D3: RCD cut-away**
- Housing, toroidal core, L and N passing through, sense winding, relay or trip
  mechanism, test button with its resistor, contacts.
- Toggle "balanced / leakage": field lines appear in the core and the trip latch
  animates.

**H3: bathroom bonding**
- Bath, pipes, metal frame, local supplementary bonding conductors to the
  bonding bar, link to the MET.
- Toggle the bond on/off. The potentials of the parts are shown as coloured tags.
  Tapping two parts shows the voltage between them.

### Lesson plan (codes are fixed; see Amendment R-2)

**A. Start here**

1. A1: Current, not voltage, harms — body impedance (sim)
2. A2: Time and current: IEC 60479 zones (sim)
3. A3: Basic protection vs fault protection (direct / indirect contact), and an
   overview of the 7 methods
4. A4: Earthing systems TN-C-S, TT, IT (sim; IT marked optional)
5. A5: Fault loop and disconnection time — worked example plus practice (sim,
   practice)

**B–H. One module per method**

- **Lesson 1: Hook and principle.** A scenario hook, an animated principle
  figure, and a 2-item check.
- **Lesson 2: Simulator.** Predict → reveal, then a failure case built into the
  scenario list.
- **Lesson 3: 3D** (B, D, H only).
- **Next lesson: In practice and in the regulations.** Claim-labelled text, and
  practice items for B, C, D, E and G.
- **Last lesson: Check yourself.** 5–6 items: misconception distractors plus 1–2
  items from earlier methods. The comparison card gains a row.
- **Location exercise.** Inserted after D and after G as an extra lesson,
  "Which protection here? (1/3, 2/3)".

**J. Compare and choose**

1. J1: Comparison card (the full table)
2. J2: Location exercise 3/3
3. J3: Layered protection

**K. Final check**

- A pool of ≥ 40 items, each tagged `{goal, level, method}`.
- Basic band: 12 items. Advanced band: 12 items (more calculations).
- Pass mark: ≥ 80%.
- Each wrong item links to its lesson.
- Passing allows a printable completion record (print CSS) with a name field and
  the date, saying "educational, not a licence".

**L. Glossary**

Searchable; he / en / abbreviation.

**M. References**

The law and regulations by name; IEC 60364-4-41, 60364-7-701/702, 60479-1,
61008/61009, 60898-1, 61140, 61558, 60617, 60445. Each carries a "verify the
current edition" note.

### Navigation, presenter mode and progress

**Header**
- Course title.
- Language toggle (עברית / English).
- Theme toggle (auto / light / dark).
- Presenter button.

**Rail**
- Modules with a progress dot.
- The current module expands to show its lessons.

**Breadcrumb and pager**
- A sign-style breadcrumb showing module and lesson.
- A pager with previous and next. Keyboard: ← and → move between lessons, mirrored
  in RTL.

**Presenter mode**
- Turned on with `?present=1` or the header button.
- Hides the rail and footer, scales type to 125%, forces the light theme, and
  disables auto-reveal.
- Esc leaves presenter mode.

**Progress**
- Stored in `localStorage["protectEdu.v2"]`:
  `{v:2, lang, theme, last, visited:[ids], quiz:{lessonId:{score,of}}, cards:[B…H], final:{band,best,date}}`.
- Every read and write is wrapped in try/catch.
- On first load, if `protectEdu` (v1) exists:
  - map m1…m7 scores to `quiz["b-check"…"h-check"]` and mark those lessons
    visited;
  - remove the v1 key.

**Deep links**
- `#<code>[?lang=he|en&present=1&<simParams>]`.
- An unknown code goes to A1.
- The language in the URL overrides the stored language for this visit only.

## Alternatives Considered

### Alternative A: d3-projected pseudo-3D, as in agl-edu `detail3d.js`

- Lighter, and works everywhere.
- Needs a hand-written engine of about 700 lines, with painter's-sort artefacts.
- Rejected: the owner asked for three.js for 3D, and r147 UMD meets the `file://`
  constraint.

### Alternative B: Hebrew only

- Halves the content work.
- Rejected: the owner chose he + en. The cost is controlled by the parity test.

### Alternative C: agl-edu's English-markup-plus-Hebrew-mapping i18n

- Rejected: it keys translations on the English HTML text, which breaks silently
  when the markup is edited. Content-as-data with ids is used instead.

### Alternative D: CDN libraries

- Rejected: classrooms are often offline, and `file://` must work.

### Alternative E: a fixed six-lesson template for every method

- Rejected: it pads the thin methods. The 3D lesson is included only where space
  matters, and practice only where calculations exist.

## Non-Functional Requirements

**Performance**
- First load (shell, CSS, d3, core and content) ≤ about 450 KB uncompressed.
- three.js (about 600 KB) loads only in B3, D3 and H3.
- A simulator update stays under 16 ms on a mid-range phone.

**Accessibility**
- Every control is reachable by keyboard, with a visible focus ring.
- Colour is never the only cue.
- Contrast ≥ 4.5:1 in both themes.
- `aria-live` summaries for simulators and 3D.
- Reduced-motion support.
- `lang` and `dir` are set on `<html>`.

**RTL and LTR**
- Logical CSS properties.
- Diagrams are not mirrored.
- Numbers, units and formulas are wrapped in `bdi`.

**Offline**
- Works from `file://` and from a static server, with no network requests.
- Fonts: the system stack (Heebo or Assistant if installed, else Arial). No web
  fonts are required.

**Print**
- A completion-record page.
- Any lesson prints cleanly, without the rail or controls.

**Security and privacy**
- No external requests, no cookies, no analytics.
- Content HTML is author-controlled; user input (the name on the record) is
  escaped.

**Browsers**
- The last 2 versions of Chrome, Edge, Firefox and Safari.
- iOS Safari 16+.

### Additional Resources

- Reference apps: `elad-haviv/agl-edu` (navigation, i18n, simulators),
  `elad-haviv/genset-edu` (diagrams, claim labels, assessment).
- EGM: https://github.com/google/elephant-goldfish-model

### Future Improvements

- 3D for C (broken PEN in a building).
- More practice items.
- An Arabic translation.
- A service worker for an installable offline app.

## Detailed Implementation Plan

Stages, each ending with tests passing and a commit:

1. **Foundation**: vendor libraries, `ns`, `store`, `i18n`, `router`, `app`,
   `render`, CSS tokens, `model.js` and its tests, content schema and its tests,
   v1 redirect stubs.
2. **Module A** with the A1, A2, A4 and A5 simulators, `symbols.js` and `kit.js`.
3. **Modules B–H**: content, simulators, practice and quizzes, comparison card,
   location exercise.
4. **3D scenes** B3, D3, H3, with the 3D kit and fallbacks.
5. **Modules J, K, L, M**, presenter mode, print.
6. **Verification, README, deploy, drift check.**

### Target Files to Create/Modify

#### 1. `index.html` (rewrite)

The shell only. It contains:
- the skip link;
- the header (title, language, theme, presenter);
- `<nav class="rail">`;
- `<main id="lesson">`;
- the pager;
- the footer disclaimer;
- script tags in order: vendor d3, then core, model, sims, content, then app
  boot.

#### 2. `css/app.css` (create; delete `css/style.css`)

- Tokens on `:root`, with dark values under `[data-theme=dark]` and
  `@media (prefers-color-scheme: dark)` when the theme is auto.
- Layout grid: rail plus content; the rail becomes a drawer at ≤ 900 px.
- Components: sign codes, breadcrumb, pager, cards, claim tags, callouts, meters,
  verdict, quiz, practice, predict panel, 3D overlay labels, parts list,
  presenter, print.

#### 3. `js/core/*.js` (create)

As in the Layers section. `app.js` boots from `PE.course` and handles:
- hashchange;
- keyboard;
- progress;
- comparison card;
- v1 migration via `store.js`.

#### 4. `js/model.js` (create; replaces the v1 `js/common.js` model)

The functions listed in the Electrical model section. At the bottom it ends with
`if (typeof module !== "undefined") module.exports = Model; else PE.model = Model;`.

#### 5. `js/sims/symbols.js`, `js/sims/kit.js`, and one file per simulator (create)

- One file per simulator: `a1-impedance.js`, `a2-zones.js`, `a4-systems.js`,
  `a5-loop.js`, `b-tt.js`, `c-tn.js`, `d-rcd.js`, `e-sep.js`, `f-class.js`,
  `g-elv.js`, `h-bond.js`.
- Each simulator calls only `PE.model` and the kit.

#### 6. `js/three/kit.js`, `b-earth.js`, `d-rcd.js`, `h-bath.js` (create)

#### 7. `js/content/` (create)

Files:
- `ui.js` (interface strings);
- `course.js` (module order and assembly);
- `a.js` … `h.js`, `j.js`;
- `k-pool.js`;
- `glossary.js`;
- `refs.js`;
- `locations.js`.

#### 8. `vendor/` (create)

- `d3@7.9.0/d3.min.js` with its LICENSE.
- `three@0.147.0/three.min.js`, `OrbitControls.js` and LICENSE.
- `README.md` listing sources and hashes.

#### 9. `modules/m1-earthing.html` … `m7-equipotential.html` (rewrite as stubs)

- A meta refresh plus `location.replace('../#B1' + preserved ?lang)` and
  `<link rel=canonical>`.
- Mapping m1→B, m2→C, m3→D, m4→E, m5→F, m6→G, m7→H.

#### 10. Delete

- `js/common.js`
- `js/sim-m*.js`
- `css/style.css`

#### 11. `test/` (create)

- `run.js`, which runs every `*.test.js` with Node `assert` and has no
  dependencies.
- `model.test.js`:
  - The body impedance table is monotonic decreasing.
  - `zone60479(30, 40)` = AC-2.
  - `zone60479(100, 1000)` = AC-4.
  - TT: Ra = 10, Rb = 2, no RCD gives Ut > 50 and no trip; with RCD 30 mA it
    trips within 40 ms.
  - TT, unearthed case, person, RCD: it trips.
  - TN: L = 30 m, 2.5 mm², C16 gives a trip.
  - TN: L = 300 m, 1.5 mm², C16 gives no instantaneous trip.
  - RCD with an L–N body current: no trip.
  - Broken PEN: every class I case is ≈ U0.
  - Separation, single touch: current < 1 mA. With a first fault: dangerous.
  - Bonding with R_sb = 0.02 Ω reduces Ut by more than 90%.
  - 12 V dry gives AC-1 or AC-2, not dangerous (see R-4).
- `content.test.js`:
  - Every bilingual field is non-empty in both languages.
  - Each pair has the same digit sequences.
  - The claim labels are valid.
  - Lesson ids are unique.
  - Quiz and predict answer indexes are in range.
  - Every module B–H has the required lesson kinds.
  - Every `sim` or `scene` id exists in `PE.sims` / `PE.scenes`.
  - K items carry goal, level and method.
- `e2e.js` (Playwright, run manually): see the Verification Plan.

#### 12. `README.md` (rewrite)

Run instructions, structure, how to add content, the tests, the EGM docs link,
and the disclaimer.

#### 13. `docs/designs/SITEMAP.md` (create)

Index of the design documents.

### Verification Plan

1. **Unit and content tests.** `node test/run.js` passes.
2. **End-to-end** (`node test/e2e.js` against `python3 -m http.server`, with the
   preinstalled Chromium):
   - Every lesson code in he and en loads with no console errors; `<html dir>`
     flips with the language.
   - Simulator verdicts:
     - B2: unearthed case plus RCD trips.
     - C2: a broken PEN makes all 3 cases live.
     - D2: an L–N touch does not trip.
     - E2: single touch is safe; a first fault is not.
     - H2: the bond reduces Ut.
     - G2: 12 V dry is not dangerous.
   - Predict → reveal hides the verdict until the reveal.
   - Switching language mid-simulation keeps the state.
   - A deep link `#C2?pen=broken&lang=en&present=1` sets the state, language and
     presenter mode.
   - The 3D lessons render a canvas. With WebGL disabled, the fallback SVG
     appears.
   - The v1 stubs redirect to the right codes; the v1 localStorage key is deleted (R-6).
   - The final check: the pass flow shows the printable record.
   - Screenshots at 360 × 780 and 1366 × 900, light and dark.
3. **`file://` smoke test.** Open `index.html` via `file://` in Chromium; A1, B2
   and B3 work.
4. **Deploy.** Push to `claude/zealous-pascal-z8mbpa`, then Coolify deploy app
   `itwbjmtncghdlcmlgnrngklq`; the domain returns 200 and serves the v2 shell.
5. **EGM drift report.** A Goldfish compares this document with the code; any
   drift is fixed in the code or the document.

---

## Amendments after Goldfish review (authoritative; supersede earlier sections where they conflict)

Source: [reviews/consolidated_review_report.md](reviews/consolidated_review_report.md),
approved by the owner on 2026-11-05.

### R-1. Releases

| Release | Contents | Deployed |
|---|---|---|
| **R1** | Foundation, module A, methods B–H (simulators, practice, checks, location exercises). Scene lessons show a static SVG figure. | Yes |
| **R2** | three.js scenes B3, D3, H3, replacing the static figures. | Yes |
| **R3** | Modules J, K, L, M, presenter mode, print record. | Yes |

### R-2. Fixed lesson codes and kinds

Codes are written explicitly in the content files; they are not derived from
position.

`kind` is one of: `intro`, `sim`, `scene`, `practice`, `check`, `location`, `card`, `ref`.

| Module | Lessons |
|---|---|
| A | A1 sim (body impedance) · A2 sim (IEC 60479 zones) · A3 intro (basic vs fault protection; the 7 methods) · A4 sim (TN-C-S / TT / IT) · A5 practice (fault loop and disconnection) |
| B | B1 intro · B2 sim · B3 scene · B4 practice · B5 check |
| C | C1 intro · C2 sim · C3 practice · C4 check |
| D | D1 intro · D2 sim · D3 scene · D4 practice · D5 check · D6 location (1/3) |
| E | E1 intro · E2 sim · E3 practice · E4 check |
| F | F1 intro · F2 sim · F3 check |
| G | G1 intro · G2 sim · G3 practice · G4 check · G5 location (2/3) |
| H | H1 intro · H2 sim · H3 scene · H4 practice · H5 check |
| J | J1 card · J2 location (3/3) · J3 intro (layered protection) |
| K | K1 check (final) |
| L | L1 ref (glossary) |
| M | M1 ref (references) |

Modules go from H to J; the letter I is skipped to avoid confusion with the IT
system.

### R-3. Model API (`js/model.js`)

Every function returns plain objects. All currents are in **A** unless the name
ends in `_mA`; all times are in **ms**.

Common inputs:
- `skin` ∈ `dry` | `wet` | `submerged`
- `path` ∈ `hh` (hand–hand) | `hf` (hand–feet) | `hhf` (both hands–feet)
- `Rfoot` in Ω (footwear and floor)

Common return field:
- `body = {I_mA, t_ms, zone}`, where `t_ms` is the trip time if a device trips,
  else 5000 (labelled "continuous", illustrative).

**Body impedance**
- `bodyZ(U, skin = 'dry', path = 'hh')`. Interpolates log-linearly in a 50th
  percentile table after IEC 60479-1:
  - dry: 25 V → 3250 Ω, 230 V → about 1225 Ω;
  - wet: a separate table;
  - `submerged`: 1000 Ω.
- Between 10 V and 25 V the value is interpolated (log-linear) from a 10 V entry
  (dry 4500, wet 3000). Below 10 V it is held at the 10 V entry.
- Path factors: hh 1.0, hf 0.75, hhf 0.5.
- All of this is labelled illustrative.

**IEC 60479 zones**
- `zone(I_mA, t_ms)` returns `AC-1` … `AC-4`.
- Curve b: (10 ms, 200 mA) → (2000 ms, 10 mA) → flat.
- Curve c1: (10 ms, 500) → (100 ms, 400) → (1000 ms, 50) → (10000 ms, 40).
- Interpolated log-log.

**Protective devices**
- `rcdTrip(I_res_mA, IdN_mA)` returns `{status: 'no' | 'maybe' | 'yes', t_ms}`,
  as a staircase:

  | Residual current | Result |
  |---|---|
  | < 0.5·IΔn | no |
  | 0.5–1·IΔn | maybe |
  | ≥ IΔn | yes, 300 ms |
  | ≥ 2·IΔn | yes, 150 ms |
  | ≥ 5·IΔn | yes, 40 ms |

  These are the maximum times for a general-type RCD under IEC 61008/61009,
  labelled "regulation – verify".
- `mcbTrip(I, type, In)` returns `{mode: 'instant', t_ms: 10}` if `I ≥ hi·In`,
  `{mode: 'thermal', t_ms: null}` if `I ≥ 1.45·In`, else `null`.
  - Bands: B [3, 5], C [5, 10], D [10, 20].
  - `hi` is the upper bound of the band, and the UI says so.

**TT**

`tt({U0 = 230, Ra = 10, Rb = 2, earthed = true, rcd_mA = null, mcb = 'C16', person = true, skin, path, Rfoot = 1000, circuit = 'final', UL = 50})`:
- Earthed: `If = U0 / (Ra + Rb)` and `Vcase = If · Ra`.
- Unearthed: `Vcase = U0`. The residual current is the body current
  `U0 / (Z + Rfoot + Rb)`.
- Returns `{If, Vcase, residual_mA, trip: {by: 'rcd' | 'mcb', t_ms, status} | null, required_ms, cond: {key: 'RaIdn', value, limit, ok}, ok, body}`.
- `required_ms` is 200 for a final circuit and 1000 for a distribution circuit.

**TN**

`tn({U0 = 230, Zsrc = 0.3, L = 30, A_ph = 2.5, A_pe = 2.5, rho = 0.0225, mcb = 'C16', rcd_mA = null, circuit = 'final', pen = 'ok' | 'broken', Zload = 23, Ra = null, n = 3, fault = true, …person})`:
- `Rpe = rho · L / A_pe` and `Zs = Zsrc + rho · L · (1/A_ph + 1/A_pe)`.
- `If = U0 / Zs` and `Vcase = If · Rpe`.
- Condition: `Zs · Ia ≤ U0`.
- Broken PEN: every one of the `n` cases sits at `U0 · Ra / (Zload + Ra + Rb)`.
  Without a local earth (`Ra = null`) this is `U0` (worst case).
- `required_ms` is 400 for a final circuit and 5000 for a distribution circuit.

**RCD scenarios**

`rcdScenario({scenario: 'leak' | 'LE' | 'LN' | 'overload', IdN_mA = 30, leak_mA, Iload = 8, …person})` returns `{I_L, I_N, residual_mA, trip, body}`:
- `LE` (person between L and earth): residual = body current.
- `LN` (person between L and N): residual = 0, so no trip.
- `overload`: residual = 0, so no trip.

**Separation**

`separation({U0 = 230, isolated = true, touch: 'one' | 'two', Riso_k = 500, len = 20, C_pF_m = 100, firstFault = false, dual = false, bond = true, …person})`:
- Single touch: the current returns through `Riso ∥ Xc` (insulation resistance in
  parallel with the cable capacitance).
- `firstFault`: `U0 / (Z + Rfoot)`.
- `dual`: faults on different poles of two appliances. With the bond, the
  overcurrent device trips and the touch voltage is 0. Without the bond, the
  person between the two cases sees U0 hand–hand.
- Warnings: `U0 · len > 100000` or `len > 500` ("regulation – verify").

**Class protection**

`classProtection({cls: 0 | 1 | 2, basic = false, supp = false, pe = true})` returns
`{live, Vcase, disconnect, layer}`.

**Extra-low voltage**

`elv({U, ac = true, skin, location: 'dry' | 'wet' | 'pool0', source: 'safety' | 'adapterFault', path})` returns `{Ueff, limit, within, body}`:
- An adapter fault makes `Ueff = 230`.
- Exposure is 1000 ms (illustrative).
- Limits, AC / DC:

  | Location | AC | DC |
  |---|---|---|
  | dry | 50 V | 120 V |
  | wet | 25 V | 60 V |
  | pool zone 0 | 12 V | 30 V |

**Bonding**

`bonding({If = 300, R_pe = 0.2, bond = false, R_sb = 0.05, R_pipe = 0.1})` returns
`{Vcase, Vpipe, Ut}`. `R_pipe` is the resistance from the pipe to the MET through
the main bonding.

**Non-conducting location**

`nonConducting({U0 = 230, Rfloor_k = 50, …person})` returns
`{body, limit_k: 50, ok}`.

**IT system**

`it({U0 = 230, C_uF = 1})` returns the capacitive first-fault current `body`.

### R-4. Tests

- `test/load.js` loads browser scripts into a Node `vm` context with stub `window`,
  `document` and `d3`. A script may only register definitions at load time.
- `model.test.js` uses the concrete calls in R-3 with these expected results:

| Call | Expected |
|---|---|
| `tt({Ra: 10})` | Vcase ≈ 192 V, trip `null` (C16 needs 160 A) |
| `tt({Ra: 10, rcd_mA: 30})` | trip by rcd at 40 ms |
| `tt({earthed: false, rcd_mA: 30})` | trip by rcd |
| `tn({})` | instant trip |
| `tn({L: 300, A_ph: 1.5, A_pe: 1.5})` | no instant trip |
| `tn({pen: 'broken', fault: false})` | 3 cases ≈ 230 V |
| `rcdScenario({scenario: 'LN'})` | no trip, body AC-4 |
| `separation({})` | I < 1 mA |
| `separation({firstFault: true})` | body AC-3 or worse |
| `bonding({bond: true, R_sb: 0.02})` | Ut < 10% of the unbonded value |
| `elv({U: 12, skin: 'dry'})` | AC-1 or AC-2 |
| `zone(30, 40)` | AC-2 |
| `zone(100, 1000)` | AC-4 |

- `content.test.js`:
  - both languages are present for every text;
  - each he/en pair has the same digit sequence;
  - codes are unique and match R-2;
  - answer indexes are in range;
  - every `sim` id is registered.

### R-5. Simulator and scene contracts

**Simulators**

`PE.sims[id] = {params: [...], draw(svg, s, ctx), update(svg, s, ctx) → {meters, verdict, summary}, destroy?}`.
- `params` entries: `{key, type: 'bool' | 'range' | 'enum', min, max, step, def, values, unit, label}`.
- The id is the file basename.
- The kit:
  - builds the controls;
  - locks the controls while a prediction is open;
  - validates URL params against `params`;
  - re-runs `draw` and `update` on a language or theme change, keeping the state.
- Result-only SVG elements carry class `res`, which is hidden while locked.

**Scenes**

`PE.scenes[id] = {init(host, ctx), destroy()}` is lazy-loaded together with
three.js (R2). The fallback is `PE.figures[id](svg, ctx)`.

**Test hooks**

- `[data-verdict="safe | warn | danger"]`
- `[data-zone]`
- `[data-trip="yes | no"]`

### R-6. Other decisions

- v1 progress is **not** migrated; the old key is deleted. Stubs map
  m1→`#B1` … m7→`#H1`.
- `claim` is merged into `p.label`. Each regulatory value carries `source`
  (`IEC 60364-4-41` or `IL-1991`), and the UI shows "per IEC; Israeli regulation –
  verify".
- Navigation logic is ported from agl-edu `js/app.js`.
- The share-link button is dropped; the URL updates as state changes.
- Final check: one pool, with a basic or advanced band chosen by the learner.
- Vendor sources are the npm tarballs (`npm pack d3@7.9.0`, `three@0.147.0`).
- Theme: `<html data-theme="auto | light | dark">`.
- Exit path from r147: an ES-module build plus a local server or service worker
  (Future Improvements).

### R-7. Stage 8 (zoom-out) follow-ups

- When there is no RCD, the TT condition is `Ra · Ia ≤ UL` (Ia = the MCB
  instantaneous current). The `tt({Ra: 10})` test asserts `ok === false`.
- A thermal (slow) MCB trip counts as "not in time". Tests assert
  `trip.mode !== 'instant'` for the long-cable TN case.
- `it()` defaults to 0.1 µF of system capacitance (a small installation), which
  gives a first-fault body current of about 6 mA (AC-2).
- The submerged impedance stays at 1000 Ω (illustrative). The lesson shows 12 V
  as the zone 0 *limit* (a perceptible current), and 50 V submerged as AC-4. It
  does not claim that 12 V is unsafe.
- R-1 to R-7 override earlier sections. Names in older sections (`zone60479`,
  `bodyImpedance`) refer to `zone` and `bodyZ`.

### R-8. Implementation notes (R1)

- The simulator contract is `render(svg, state, ctx) → {meters, verdict, note}`. It redraws the whole scene on each change and replaces the separate `draw`/`update` pair. Sims may also set `fmt` on a range param to format its display value.
- The four module A simulators share `js/sims/a-sims.js`; shared drawing helpers are in `js/sims/common.js`. Sim ids stay as listed in R-2/R-5.
- While a prediction is open, `PE.sym.locked` makes symbols draw in their neutral state: closed breakers, no live cases, a grey person. This stops the diagram from giving the answer away.

### R-9. 3D scenes (R2)

- `js/three/kit.js` defines `PE.scene3d(host, block, key)`. On first use it loads `vendor/three@0.147.0/three.min.js` and then `OrbitControls.js` by script injection. If WebGL or the scripts are unavailable, it falls back to `PE.sceneFallback` (static SVG figure + parts list).
- A scene registers `PE.scenes[id] = { params, camera: {pos, target}, build(THREE, scene, ctx) → { parts: [{key, name, desc, object, anchor}], update(state, ctx) → {labels: [{pos, text, tone}], status, animate?} } }`. `params` uses the simulator schema; the kit builds the same controls.
- Rendering is on demand: it happens on control changes, camera moves and while `animate` is true.
- Labels are HTML elements projected over the canvas. No text is ever drawn inside WebGL, so labels stay accessible and RTL-correct.
- The parts list is a set of HTML buttons. Selecting a part highlights it, moves the orbit target to it and announces its description in an `aria-live` region.
- Keyboard: the arrow keys rotate, + and − zoom, R resets. On coarse-pointer (touch) devices the canvas only takes gestures after the "Interact" toggle is on, so the page still scrolls.
- Model additions: `electrodeTT({rho, a, Rb})` returns the hemispherical-equivalent earth electrode values `{Re, If, Ve}`, and `potentialAt(r, If, rho)` gives the surface potential (illustrative).
- Scenes:
  - **B3 `b-earth`:** the potential funnel. Touch voltage for a person 1 m from the electrode, and step voltage at distance d.
  - **D3 `d-rcd`:** an RCD cut-away with balanced, leakage and test-button modes, and an animated latch.
  - **H3 `h-bath`:** a bathroom. The bond toggle feeds `bonding()`, and the labels show part potentials and ΔU.

### R-10. R3 implementation (J, K, L, M, presenter, print, branding)

- **Releases.** The owner chose one deployment once R1–R3 are complete (2026-11-05). This replaces the per-release deployment in R-1.
- **J1 card.** `PE.card` renders a 7-row comparison table with columns: protects against, how, when it fails, typical use. A row is marked ✓ when `PE.moduleDone(code)` is true, i.e. that module's check is passed (≥ 70%).
- **J2.** Location exercise, set 3.
- **J3.** Layered protection table plus the `h-bond` simulator with `defaults: {bond: true}`.
- **K1 final check.** The block `{type: "final", n: 12, pass: 0.8}` runs `PE.finalCheck`. The pool is `PE.content.kpool`: 41 items, each tagged `{method, lesson, goal, level}`.
  - The learner picks a band. The basic band excludes advanced calculation items (goal 1); the advanced band uses the whole pool.
  - 12 items are drawn at random. Each wrong item links to its lesson.
  - A passing score shows a name field and "Print completion record". The record uses print CSS on `body.printing-record` and contains the escaped name, date, band, score and a "not a licence" note.
  - Scores are stored as `quiz["k-final-<band>"]` and `final`.
- **L1 glossary.** `PE.glossary`: a searchable table over `PE.content.glossary` with he, en, abbreviation, definition and a lesson link.
- **M1 references.** The law, the regulations with Nevo and Wikisource links, the OSH collection, the IEC standards table and links to sibling courses.
- **Presenter mode.** `PE.setPresent(on)` is driven by the header button ▣, `?present=1` (via the router) or Esc to exit.
  - Turning it on forces the light theme; turning it off restores the previous theme.
  - A presenter deep link re-locks a simulator's prediction, so a class can go predict → vote → reveal.
  - Space reveals the prediction.
- **Print.** Check, practice and location lessons show a Print button. Print CSS hides navigation and interactive controls.
- **Branding.** Haviv Academy tokens are a 3 px gradient strip and a gradient dot. The header links to https://academy.haviv.pro; the footer links to the academy, AGL and GENSET. The document title ends with "· Haviv Academy". The course keeps its own yellow safety-sign identity.
- **Regulations.** The verification pass is recorded in `reviews/regulation_check.md`. The primary text could not be reached, so items from secondary sources carry `source: "IL-1991 · מקור משני"` and keep the `regulation` label.

### R-11. Drift report follow-ups (Goldfish, 2026-11-05)

Code and content changes made:
- D1–H1 each gain a 2-item quick check. B1 and C1 already had one, so every lesson 1 now has a hook, a principle and a check. Figures are still only in B1, D1 and F1.
- Regulation claims that come only from secondary sources are tagged `IL-1991 · מקור משני`: D4 (RCD on domestic circuits), A3, H4, and a new G1 note on the 50 V limit. In English the tag reads "secondary source".
- The final-check item about earthing in ELV installations now links to G3.

Doc corrections; the code is authoritative for each of these:
- **Protective devices.**
  - `mcbTrip(I, "C16")` takes the breaker as a string and returns `{by, mode, t_ms, status: "yes" | "slow"}` or `null`.
  - `rcdTrip` can also return `status: "none"` when there is no RCD.
- **Model defaults.**
  - `it()` defaults to `C_uF = 0.1`.
  - `nonConducting` returns `limit_k` 50, or 100 above 500 V.
  - `tt` accepts `fault`; `tn` accepts `Rb` (default 2).
- **ELV.**
  - `elv().within` also requires `source = "safety"`.
  - For DC, a reading under 2 mA is shown as AC-1; zones are AC-based, as the UI states.
- **Content field names.**
  - Quiz items use `{q, o, a, why, mis?, from?}`.
  - Practice items use `{given, ask, answer, tol?, unit, steps, fade?}`.
  - Location blocks use `{set: [n]}`.
  - Scene blocks use `{id, title, parts}`; the fallback is always `PE.figures[id]`.
- **Block types in use:** `p`, `h`, `list`, `formula`, `callout` (tones info, warn, danger, ok, hook), `table`, `figure`, `sim`, `scene`, `practice`, `quiz`, `location`, `card`, `final`, `glossary`, `html`. A content claim is a `p` with `label` (and optional `source`).
- **Progress store.** `{v, lang, theme, last, visited, quiz, final: {band, score, of, date}}`. There is no `cards` field: comparison-card ticks come from `moduleDone` (that module's check passed at 70% or more).
- **Scenes.** `PE.scene3d(host, block)` caches scene state per scene id. Scene state is not put in the URL.
- **Layers.** Module A sims live in `js/sims/a-sims.js` and shared helpers in `js/sims/common.js`. Static figures and 3D fallbacks are in `js/sims/figures.js`. The simulator contract is `render()` (R-8). The `{{…}}` markup in content renders as `<bdi dir="ltr">`.
- **Source tag.** The UI shows "Regulation – verify · <source>".
- **Tests.** `test/run.js` runs the fixed list `model.test.js` and `content.test.js`.
- **Covered elsewhere, not by `test/e2e.js`.** The `file://` smoke test is run separately (A1, B2, B3 pass). Phone screenshots use 390 × 844, not 360 × 780. Deletion of the v1 key is covered by code review only.
- **Phone layout.** Simulator diagrams keep a minimum width of 640 px and scroll sideways inside their frame, so symbols stay legible. The controls stack below the diagram.

### R-12. Method list corrected by the owner (2026-11-05)

The owner corrected two of the seven methods to match the regulation's terms:

- **E: "הפרד מגן"** (protective separation). This is the only name used in titles. "שנאי הפרדה" now means only the transformer device.
- **H: "זינה צפה"** (floating supply, IT): an unearthed source, earthed exposed parts and insulation monitoring.
  - The previous H, equipotential bonding and non-conducting location, is **not** one of the regulation's seven methods.
  - It moves to module J as a *complementary measure*: J4 holds the text and the `h-bond` simulator; J5 holds the 3D bathroom `h-bath`.

Corrected list: B הארקת הגנה · C איפוס · D מפסק מגן (פחת) · E הפרד מגן · F בידוד מגן/כפול · G מתח נמוך מאוד · H זינה צפה.

New and changed codes:
- **H1** intro (hook, principle, Ra·Id ≤ 50 V, comparison with E, quick check).
- **H2** sim `h-it`.
- **H3** scene `h-or` (operating theatre; fallback figure `h-or`).
- **H4** practice (first-fault current through system capacitance, Ra limit).
- **H5** check.
- **J4** complementary measures (sim).
- **J5** 3D bathroom.

Model: `itSupply({U0, C_uF, Ra, Rf_k, fault1, fault2, imd, imd_k, mcb, Zloop2, Rpe, touch})` returns `{Riso_k, alarm, Id_mA, If, Ut, cond: Ra·Id ≤ UL, trip, body, stage}`.
- With a first fault, current returns only through the system capacitance. There is no trip, and the IMD alarms when `Riso < imd_k`.
- Touching the healthy conductor after a first fault is dangerous.
- A second fault on the other conductor is a short through the PE, and the MCB trips.

Other updates:
- A4 now points to H rather than describing IT as background only.
- Location exercise set 3: the supervised lab is replaced by an operating theatre (needs H).
- The bathroom needs C and D, with bonding as a complementary measure.
- The final-check pool has 5 H items on floating supply; the bonding items are re-tagged J4.
- The glossary adds floating supply, IMD, and first/second fault.
- The comparison card gains a "complementary" note row.
- The v1 stub `m7-equipotential.html` now redirects to `#J4`.

### R-13. v3: own identity, numbered modules, three-phase, LaTeX (owner request, 2026-11-07)

**Why.** v2 copied agl-edu's visual language without its reason. agl-edu imitates airfield signs: black/yellow location signs, and the letter I skipped as in aviation lettering. None of that relates to protection against electric shock. The owner chose:
- an identity based on an **electrical distribution board and an engineering drawing sheet**;
- **numbered modules**;
- **three-phase** drawings and simulations (Israeli LV is 230/400 V TN-C-S);
- **LaTeX** for every mathematical expression.

**Numbering.**

| Code | Module |
|---|---|
| 0 | Basics |
| 1–7 | The seven methods: 1 protective earthing, 2 neutralization (TN), 3 RCD, 4 protective separation, 5 class II insulation, 6 extra-low voltage, 7 floating supply |
| 8 | Compare & complementary measures |
| 9 | Final check |
| 10 | Appendix א׳: glossary |
| 11 | Appendix ב׳: references |

- Lessons are `m.n`, for example 3.2.
- Lesson ids are unchanged, so stored progress survives.
- The router maps legacy letter codes (A→0 … H→7, J→8, K→9, L→10, M→11, same lesson index) and replaces the hash.

**Identity.**
- **Header:** a panel-door bar with a rating-plate nameplate, followed by a conductor-colour stripe (L1 brown, L2 black, L3 grey, N blue, PE green-yellow).
- **Rail:** a distribution board on a DIN rail. Each module is a breaker labelled Q0…Q9; its handle is ON once the module's check is passed. The current module's lessons appear as outgoing circuits.
- **Lessons:** each is a drawing sheet with a grid background, a frame and a title block (course, module, sheet, revision, Haviv Academy).
- **Pager:** "previous/next sheet".
- **Removed:** sign chips and the yellow/black taxiway styling.

**Three-phase.** Every simulator draws a three-phase supply (Dyn11 transformer, L1–L3 + N/PEN) and board, using IEC 60617 symbols: 3-pole MCB, 4-pole RCD, M 3~ motor. Model additions:

- **Phasor helpers.**
- **`brokenPEN3({U0, Z: [Z1, Z2, Z3], Ra, Rb})`**: Millman neutral displacement.
  - Returns the neutral-point voltage, each load's voltage, and the case voltage to earth: `VN·Ra/(Ra+Rb)`.
- **`rcdScenario`**:
  - new scenarios `LL` (person between two phases, 400 V; not detected) and `unbalanced` (3-phase load with neutral current; no trip);
  - the residual current is the vector sum of IL1, IL2, IL3 and IN.
- **`itSupply`, now three-phase IT**:
  - first-fault current `Id = 3ωC·U0`;
  - touching another phase after a first fault puts √3·U0 = 400 V across the body;
  - a second fault on another phase is a line-to-line short, checked with `2·Ia·Zs ≤ √3·U0`.
- **`tt`, `tn`, `separation`:** electrically unchanged, since their fault loops are phase-to-earth.
- **Separation (4) and ELV (6):** the supply is three-phase, the secondary single-phase.

**LaTeX.** KaTeX 0.16.11 is vendored and works offline.
- Inline math is written `$…$`. `formula.tex` holds pure LaTeX, rendered in display mode.
- `{{…}}` is kept only for plain values and units.
- `PE.rich` renders math inside `<bdi dir="ltr">`.
- SVG formula labels use `<foreignObject>` with KaTeX HTML.
- Tests render every expression with `throwOnError`, and check that Hebrew and English contain the same set of math segments.
