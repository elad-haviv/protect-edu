# Protect-Edu v2: Concept Brief

Status: revised after Goldfish brainstorm (5 lenses: contrarian/YAGNI, electrical accuracy, pedagogy, UX/RTL/accessibility, maintenance/migration)
Elephant: the Claude session that built v1 and holds the project context
Owner: Elad Haviv

## Overview

Protect-Edu is a free, browser-based course that teaches the seven methods of
protection against electric shock used in Israel under the Electricity Law and its
regulations. v1 is live at https://protect-edu.haviv.pro:
- seven separate HTML pages;
- one simple SVG simulator per page;
- a 4-question quiz per page;
- Hebrew only.

v1 is kept in branch `backup/v1-simple`.

v2 rebuilds the course on the deployed branch. It reuses what worked in two sibling
projects by the same author:

- **agl-edu**: plain HTML/JS with no build step.
  - Modules split into short lessons, addressed by sign codes (`#C2`).
  - A rail, a breadcrumb and prev/next "direction signs".
  - Hebrew and English with a runtime switch.
  - Light and dark themes.
  - Interactive simulators, a branching fault-finding game, and 3D cut-away models.
- **genset-edu**: animated SVG safety diagrams (touch voltage, TN systems, RCD,
  isolation, overcurrent curves).
  - Every statement is labelled: principle, recommendation, illustrative example, or
    binding regulation.
  - Scenario decision exercises.
  - Leveled assessment with an 80% pass mark and a printable educational certificate.

## The seven methods (fixed by the owner)

> **Correction (2026-11-05):** The owner corrected two entries. E is "הפרד מגן", and H is "זינה צפה" (floating supply), not bonding. Bonding moves to module J as a complementary measure. See the design doc, R-12.

| Code | Method (he) | Method (en) |
|---|---|---|
| B | הארקת הגנה | Protective earthing (TT) |
| C | איפוס | Protective neutralization, TN (TN-C-S / TN-S) |
| D | מפסק מגן (פחת) | Residual current device (RCD) |
| E | שנאי הפרדה | Separation (isolating) transformer |
| F | בידוד כפול / מוגן | Double / reinforced insulation (class II) |
| G | מתח נמוך במיוחד | Extra-low voltage (SELV / PELV) |
| H | חיבור שוות פוטנציאל / מקום מבודד | Equipotential bonding / non-conducting location |

## Audience

1. **Primary:** students in Israeli electrician courses (חשמלאי מעשי, מוסמך,
   הנדסאי) preparing for exams.
2. **Secondary:**
   - teachers projecting the simulators in class;
   - practising electricians refreshing the material.
3. **Tertiary:** curious non-professionals. The course never tells them to work on
   live installations.

## Proposed course structure

| Code | Module | Lessons |
|---|---|---|
| A | Start here | A1 why protection: current, not voltage, harms the body; A2 body-current effects: an interactive IEC 60479 time/current zone chart (d3); A3 direct vs indirect contact; A4 earthing systems primer: TN-C-S, TT, IT with an animated fault-current path; A5 how to use this course |
| B–H | One per method | 1 the principle (animated diagram); 2 simulator (d3 circuit, live meters, fault switches, animated current flow); 3 3D view (three.js); 4 when it fails: a scenario with a decision; 5 in practice and in the regulations, with claim labels; 6 check yourself: 5–6 questions with explanations |
| J | Compare and choose | J1 the seven methods side by side (what each protects against, failure mode, typical use); J2 "which protection here?" location-based exercise (bathroom, construction site, garden socket, pool light, workshop tool); J3 layered protection (why an RCD plus earthing plus bonding) |
| K | Assessment | Three levels (basic / practitioner / advanced) of 10 questions each. Pass mark 80%. A printable educational certificate that says it is not a licence. |
| L | Glossary | Searchable, bilingual (he/en/abbreviation) |
| M | References | List of the relevant regulations and standards by name, with a "verify against the official text" note |

## 3D scenes (three.js, one per method)

- B: house, earth electrode and soil. A coloured potential "funnel" around the
  electrode shows touch and step voltage.
- C: distribution board cut-away showing the PEN split, with a broken-PEN
  animation.
- D: RCD cut-away, showing the toroidal core, the sense winding and the trip
  mechanism.
- E: workshop with a portable isolation transformer feeding one tool.
- F: class II drill cut-away. Basic and supplementary insulation layers can be
  peeled away one at a time.
- G: pool with a 12 V light and a safety transformer outside the zone.
- H: bathroom showing equipotential bonding of pipes, bath and metal frame to the
  bonding bar.

Each scene can be rotated and has labelled parts with hover/tap descriptions.
Each falls back to a static 2D drawing when WebGL or the library is unavailable.

## Technical direction

- **Stack:** plain HTML/CSS/JS, no build step (owner's choice), like agl-edu.
  - One `index.html` shell; modules and lessons in markup or data.
  - Navigation by hash sign codes.
- **Libraries:** d3 for 2D simulators and charts, three.js for 3D. Pinned versions,
  stored in `vendor/` so a classroom without internet and `file://` still work.
  agl-edu loads d3 from cdnjs instead.
- **Bilingual content:** `{he, en}` data in `js/content/*.js`. This is a cleaner
  version of agl-edu's English-markup-plus-mapping. Hebrew is the default; `dir`
  flips to `ltr` for English.
- **Shared electrical model** (`js/model.js`): pure functions, unit-checked in a
  Node script:
  - body current;
  - IEC 60479 zone;
  - fault loop impedance;
  - touch voltage;
  - breaker instantaneous threshold;
  - RCD trip curve.
- **Progress:** stored in localStorage. Visited lessons, quiz scores and the
  assessment level are kept per browser.
- **Hosting:** same Coolify static app; the domain is unchanged.

## Accuracy policy

Each content block carries one label:
- **Principle**: physics, always true.
- **Typical practice**.
- **Illustrative**: a simulator number.
- **Regulation – verify**: a figure taken from Israeli regulations or IEC standards
  as commonly taught (for example 50 V / 25 V touch voltage, 30 mA / 300 ms RCD,
  50 V AC / 120 V DC ELV), with a pointer to check the current official text.

The course never gives step-by-step live-work instructions.

## Goals

1. A learner can explain, for each of the seven methods, how it prevents a
   dangerous touch voltage or current, and when it fails.
2. A learner can predict the simulator outcome before changing a control. Each
   simulator asks "what will happen?" before it reveals the answer.
3. A learner can choose a suitable protection for a described location.
4. A teacher can project any simulator full-screen and link to it by its sign code.
5. Works on phone and desktop, Hebrew and English, light and dark, online and
   offline.

## Non-goals

- Not a replacement for the official regulations or a licensed course.
- No accounts, server or analytics.
- No exam-prep question bank beyond the course's own checks.
- No guaranteed numeric accuracy for real design. Calculators are illustrative.

## Analysis (Goldfish brainstorm findings)

The five reviewers were independent and converged on the points below.

### 1. v1 teaches some things wrongly (electrical lens, high)

v2 must not inherit these errors:

- An unearthed metal case plus an RCD *does* trip when a person touches it.
  v1 says it does not detect the leak.
- איפוס connects the case to the **PE conductor** fed from the PEN split. v1
  says "to the neutral".
- A broken PEN makes *every* class I case on the circuit live.
- Body-current danger depends on **current and time**: use the IEC 60479 AC-1…AC-4
  curves, not fixed mA bands.
- Body impedance depends on **voltage**. With a fixed 500 Ω, 12 V looked
  dangerous in v1.
- The RCD's own trip time (300 ms / 40 ms) is a different number from the
  installation's maximum disconnection time (0.4 s TN, 0.2 s TT).
- "Earthed so it always trips" contradicts the TT case.
- The bonding model must use the voltage drop on the PE conductor, not a voltage
  divider.
- "מקום מבודד" (non-conducting location) and "earth-free local bonding" are two
  different measures. A non-conducting location is only for supervised
  installations.
- Separation transformer vs safety (SELV) transformer must be told apart. Also
  cover the first-fault-to-earth case and multiple appliances.

Terminology must follow the 1991 regulations, e.g. מתח נמוך מאוד, מפסק מגן לזרם
דלף, השוואת פוטנציאלים, מוליך הגנה/PEN. Every figure is labelled
"regulation – verify".

### 2. Too much uniform content, too little learning activity (pedagogy + YAGNI, high)

- A rigid six-lesson template times seven methods pads thin methods (F, G).
- Practice only at the end of each module makes it a content dump.
- Misconceptions are not named.
- There is no numeric practice, although exam learners need Ra·IΔn ≤ 50 V and
  Zs·Ia ≤ U0 calculations.
- Fault loop impedance and disconnection time are missing prerequisites.

### 3. three.js is the most expensive and riskiest part (all lenses)

- Seven scenes plus seven fallbacks.
- three.js r160+ is ES-module only, so it breaks under `file://`.
- Text inside WebGL breaks RTL and screen readers.
- Agreement: limit 3D to the methods where space really matters:
  - **B**: potential funnel and step voltage;
  - **D**: RCD internals;
  - **H**: bathroom bonding;
  - optionally **C**: broken PEN in a building.
- Labels stay in HTML/SVG on top of the scene. Each scene has an HTML parts list.
- Load three.js only when a 3D lesson opens.

### 4. Bilingual drift and RTL (maintenance + UX, high)

- Store content as `{he, en}` objects with stable ids. Hebrew is the master copy.
- A Node check fails on an empty field, different numbers between languages, or a
  missing label.
- Wrap formulas, units and codes as LTR (`<bdi dir="ltr">` / SVG `direction`).
- Diagrams, charts and 3D are never mirrored.
- Switching language redraws text only and keeps simulator state.

### 5. Access and classroom use (UX + pedagogy, medium)

- Danger is never shown by colour alone: add pattern/dash and a text state.
- Switches are `<button aria-pressed>`.
- Meters have a throttled `aria-live` summary.
- Respect `prefers-reduced-motion`.
- On phones, 3D rotates only with two fingers or behind a toggle.
- Simulators stack vertically on phones.
- Teachers get:
  - a **presenter mode**: full-screen, large type, light theme, teacher-controlled
    reveal;
  - deep links that carry language and state (`#D2?lang=en&fault=1`).

### 6. Engineering hygiene (maintenance, medium)

- No ES modules: plain scripts with a global namespace.
- `model.js` also exports for Node, and `node test/*.test.js` uses `assert`.
- Libraries vendored with pinned versions and their licence files.
- v1 URLs keep working through 7 stub pages that redirect to `#B1`…`#H1`.
- v1 progress is migrated once to a versioned key.

## Goals vs. Non-Goals

**Goals (measurable)**

1. Given a fault scenario (system type, Ra or Zs, device rating), the learner
   decides whether the protection disconnects in time and whether the touch
   voltage stays ≤ 50 V. Tested by the calculation items in each module and in the
   final check.
2. For each method, the learner identifies its failure mode and at least 2 named
   misconceptions. Tested by the predict prompts and distractor-based questions.
3. Given a location (bathroom, construction site, pool, garden socket, workshop),
   the learner chooses suitable protection, with reasons. Tested by the
   location exercise, repeated three times.
4. A teacher can project any simulator in presenter mode, deep-linked to a state,
   and run a predict-vote-reveal cycle.

**Non-goals**

- Not a substitute for the regulations or a licensed course.
- No server, accounts or analytics.
- No guaranteed design accuracy.
- No live-work instructions.
- No 3D for methods that read just as well in 2D.

## Alternatives Weighed

- **Hebrew only (YAGNI lens).** Rejected: the owner chose he + en. Mitigated by
  the content-data plus parity-check design.
- **No 3D at all (YAGNI lens).** Weighed against the owner's request for d3 or
  three.js 3D. Compromise: 3D only for B, D, H (+C optional).
- **d3-projected pseudo-3D (agl-edu `detail3d.js`) instead of three.js.** Lighter
  and works from `file://`, but needs a hand-written engine.
- **three.js r147** (last UMD build with `examples/js/OrbitControls.js`), vendored.
  Real 3D that works from `file://`. **Chosen**, with HTML labels over the canvas.
- **Three assessment levels plus certificate vs one final check.** Chosen:
  - one final check drawn from a randomised pool tagged by goal, with basic and
    advanced bands;
  - a print-CSS "completion record" that is clearly not a credential.

## Key Decisions & Staging for Next Steps

### Lesson template per method (B–H)

Fixed core, optional extras:

1. **Scenario hook and principle**: "this person got a shock / this one didn't —
   why?", then an animated diagram and a 2-question check.
2. **Simulator** with predict-then-reveal, worked calculation, and the failure
   case built in.
3. **3D view**: only B, D, H (+C).
4. **Practice and regulation**: claim-labelled text, faded numeric practice.
5. **Check yourself**: questions built on misconceptions, plus 1–2 questions from
   earlier methods (spacing).

### Module A additions

- A fault loop and disconnection time lesson with a worked example.
- IT is optional background.

### Module J and the comparison card

- Module J (compare and choose) stays.
- A "comparison card" grows by one row as each method is completed.
- The location exercise also appears after D and after G.

### Staging

1. **Engineering foundation:** model, tests, content schema, navigation,
   i18n.
2. **Modules A + B–H** with simulators and assessment.
3. **3D scenes**, lazy-loaded.
4. **Presenter mode and polish.**

## Open questions carried to the design draft

1. Final 3D scope (owner decision): B, D, H, and optionally C.
2. Resolved: predict-then-reveal in every simulator, built once in the shared
   wrapper and skippable for teachers.
3. Resolved: one randomised final check plus a completion record.
4. Resolved: vendor d3 7.9.0 and three r147, pinned, with their licences.
5. Resolved: stub redirects for the v1 URLs, and a one-time migration of
   progress.
