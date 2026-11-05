# Consolidated Goldfish Review: protect-edu-v2.md

**Reviewers:** four fresh-context subagents, each given its EGM persona and nothing else.

| Stage | Reviewer | Verdict |
|---|---|---|
| 5 | Zoom Out | Clear on intent; heavy in scope and delivery |
| 6 | Comprehension | No blockers; structure gaps |
| 7 | Design Critic | 1 blocker, 8 major issues in the electrical model |
| 9 | Implementation Readiness | Not ready: 1 blocker, 6 major issues |

Each finding has a proposed disposition: **Accept** (change the design),
**Partial**, or **Decline** (with reason).

## A. Electrical model correctness (Stage 7)

| # | Finding | Proposed disposition |
|---|---|---|
| A1 | **Blocker:** `tt()` cannot model a person touching an unearthed case, so the main v1 fix cannot be computed. | **Accept.** Add `earthed` and `person: {U-dependent Zbody, Rfoot}`. Residual current = U0/(Zbody+Rfoot+Rb) feeds the RCD. |
| A2 | Disconnection times hard-coded; final vs distribution circuits; `ok` rule mixes the TT and TN criteria. | **Accept.** Add a `circuit` input. TT check: Ra·IΔn ≤ 50 V plus time. TN check: Zs·Ia ≤ U0 plus time. Clause cited. |
| A3 | RCD trip times interpolated but labelled "regulation"; the "30 mA/40 ms" marker is wrong. | **Accept.** Use a staircase: IΔn → 300 ms, 2× → 150 ms, 5× → 40 ms. Anything between is "illustrative". Marker at 5·IΔn. General type only (stated). |
| A4 | Impedance table extrapolated below 25 V; fixed wet factor; no current path; zones are AC only; the model cannot show "12 V is unsafe underwater". | **Partial.** Use separate dry/wet tables (approximate, labelled illustrative). Extend down to 10 V with a stated rule. Add path factors (hand–hand 1.0, hand–feet ≈ 0.75 per IEC 60479-1 Fig. 3, illustrative). Pool zone 0 uses a "submerged body" case: low impedance (≈ 200–500 Ω, illustrative). DC handled by a note plus the 120 V/60 V/30 V limits; no DC zone chart. |
| A5 | `brokenPEN` ignores the local earth (Ra) and three-phase neutral shift. | **Accept.** Add an Ra divider for a single phase. "≈ U0" is the labelled worst case. Three-phase shift is mentioned in text, not simulated. |
| A6 | Separation: no V·m limits; no two-appliance double-fault case. | **Accept.** Add `appliances[2]` with a fault pole, a non-earthed bonding flag, and a warning above 100 000 V·m / 500 m ("regulation – verify"). |
| A7 | No IT model for A4; the simulator contract has no `destroy()`. | **Accept.** A4 shows the fault path animation per system; the IT first fault gives a small capacitive current via `it()`. Add `destroy()` and pause the animation when the simulator is off screen. |
| A8 | Controls stay live during predict; share links can carry a spoiling state. | **Accept.** Controls are locked until reveal; the reveal state is never stored in the URL. |
| A9 | IEC values presented as if they were the Israeli regulation. | **Accept.** Each regulatory value gets a `source` field (`IL-1991` / `IEC 60364-4-41` …). The UI says "per IEC; Israeli regulation – verify". |
| A10–A14 | Flow speed formula; default `Zsrc`; enum params and URL validation; final-check levels; fuse/RCD symbols. | **Accept** all, except A13: keep **one** final check with a basic/advanced band switch chosen by the learner, from one shared pool (the reasons are under C4 below). |

## B. Readiness and structure (Stages 6 and 9)

| # | Finding | Proposed disposition |
|---|---|---|
| B1 | **Blocker:** Node tests cannot load browser-global files. | **Accept.** `test/load.js` creates a `vm` context with stub `window`, `document`, `d3`. Files only register at load time (no DOM or library calls until `init`). |
| B2 | Model functions under-specified; tests not concrete. | **Accept.** The design adds full signatures, return shapes `{If, Ut, trip: {by, t_ms}|null, required_ms, ok, reasons[]}`, defaults (Zsrc = 0.3 Ω), and concrete test calls. |
| B3 | No model for F2 (class layers), the G2 faulty adapter, or two E2 appliances; sim ids undefined. | **Accept.** Add `classProtection()`, `elvSource()`. E2 covered by A6. Sim id = file basename. |
| B4 | Lesson codes derived by position are unstable; lesson `kind` not defined. | **Accept.** Codes are **explicit and fixed** in content. `kind` ∈ {`intro`, `sim`, `scene`, `practice`, `check`, `location`, `card`, `ref`}. A table lists every code. |
| B5 | Missing 3D registration contract and fallback registry. | **Accept.** `PE.scenes[id] = {init(host, state), destroy()}`. The scene file is lazy-loaded with three.js. Fallback = an SVG figure function in `js/figures.js`. |
| B6 | Comparison card, locations, final-check draw rules, "spaced" items undefined. | **Accept.** Define their schemas in the design. |
| B7 | v1 progress migration gives wrong credit (Zoom Out); the stub target is wrong. | **Accept.** Drop migration: delete the v1 key on first load. Stubs point explicitly to `#B1`…`#H1`. |
| B8 | e2e under-specified (WebGL flags, port, selectors). | **Accept.** Use `data-test` hooks (`data-verdict`, `data-state`), port 8765, `--use-gl=swiftshader`, a "no WebGL" run via `--disable-gpu --disable-webgl`, and screenshots in the scratchpad. |
| B9 | Terminology lacks English; undefined terms; script order; theme attribute; domain to check. | **Accept.** Add a glossary section to the design; fix the rest. |
| B10 | The vendor source is the npm tarballs, because the CDN is blocked by the proxy here. | **Accept.** |

## C. Scope and delivery (Stage 5)

| # | Finding | Proposed disposition |
|---|---|---|
| C1 | One big-bang release leaves wrong content live. | **Accept.** Release in stages: **R1** = foundation + A + B–H (simulators, quizzes), deployed. **R2** = 3D B3/D3/H3. **R3** = J, K, L, M, presenter mode, print. Each release is deployed. |
| C2 | d3 on every page is unneeded weight; plain SVG would be enough. | **Decline.** The owner asked for d3. It is used for scales, axes, transitions and data-joins in every simulator, and is about 90 KB gzipped and cached. |
| C3 | Navigation code not reused from agl-edu. | **Accept.** Port agl-edu `js/app.js` logic (resolve, rail, breadcrumb, pager, visited) to read `PE.course` instead of markup; credit it in the README. |
| C4 | Too many surfaces (share-link button, SVG fallbacks, two bands). | **Partial.** Drop the share-link button (the address bar already updates). The 3D fallback is a static SVG figure. Keep two bands in one check from one pool: the brief's three levels are reduced to two, because the audience splits into exam students and practitioners. |
| C5–C8 | Implementation details in the feature section; `claim` vs `p`; unused salt-water factor; r147 exit path. | **Accept.** Merge `claim` into `p.label`; drop salt-water; record the r147 → ES-module exit path under Future Improvements. Implementation details stay but move under the "Detailed" section where practical. |
