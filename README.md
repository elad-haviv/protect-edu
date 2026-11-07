# הגנה בפני חשמול · Protection Against Electric Shock

An interactive course in Hebrew and English on the seven methods of protection against electric shock under the Israeli Electricity Law and its regulations. The Hebrew interface is RTL.

Live: https://protect-edu.haviv.pro

## Modules

The menu is drawn as a distribution board. Each module is a breaker (Q0–Q9), and its lever goes ON when you pass that module's check. Each lesson is a drawing sheet, numbered m.n (for example 3.2), with a title block.

| No. | Module | Contents |
|---|---|---|
| 0 | Basics | Body impedance versus voltage, IEC 60479 effect zones, direct and indirect contact, three-phase earthing systems (TN-C-S, TT, IT), fault loop and disconnection |
| 1 | הארקת הגנה – Protective earthing (TT) | Three-phase pump, 3-pole MCB, optional 4-pole RCD, $R_a I_{\Delta n} \le 50$ V |
| 2 | איפוס – Neutralization (TN-C-S) | Fault loop through the PE; **broken PEN with neutral shift** (Millman), using per-phase loads |
| 3 | מפסק מגן – RCD | 4-pole RCD and the vector sum $I_{L1}+I_{L2}+I_{L3}+I_N$. It does not see a person between L1 and N, a person between two phases (400 V), overload, or unbalanced load |
| 4 | הפרד מגן – Protective separation | A single-phase isolating transformer fed from a three-phase board |
| 5 | בידוד מגן / כפול – Class II | Insulation layers for class 0, I and II |
| 6 | מתח נמוך מאוד – SELV/PELV | Voltage, location and source |
| 7 | זינה צפה – Floating supply (IT) | Three-phase IT without a neutral: first fault (alarm only), touching another phase gives 400 V, second fault trips |
| 8 | Compare and choose | Comparison card, location exercise, layered protection, complementary measures (bonding, non-conducting location) |
| 9 | Final check | Basic/advanced levels, printable completion record |
| Appendix A | Glossary | |
| Appendix B | References | |

Old v2 links that use letters, such as `#B2`, redirect to the numbered sheet (`#1.2`).

All math is rendered with KaTeX, vendored so it works offline. Content writes inline math as `$…$`, formula blocks hold pure LaTeX, and `{{…}}` is used only for plain values with units.

Four lessons include rotatable **3D scenes** built with three.js:

- 1.3: the potential funnel around an earth electrode
- 3.3: inside a 4-pole RCD
- 7.3: an operating theatre on a floating supply
- 8.5: a bathroom with bonding Each scene has an HTML parts list, keyboard controls and a 2D fallback.

**Presenter mode** is turned on with the ▣ button or `?present=1`. It shows the content full width with the light theme. The prediction stays locked until the teacher presses Space or "Reveal", and Esc leaves the mode.

The course is part of [Haviv Academy](https://academy.haviv.pro), alongside [AGL](https://agl-edu.haviv.pro) and [GENSET](https://genset-edu.haviv.pro).

Every simulator asks the learner to **predict** an outcome before showing it. Every statement carries a label: *principle*, *typical practice*, *illustrative* or *regulation – verify*. Each method ends with a quiz built on common misconceptions, plus review questions from earlier modules. Three location exercises ask which protection fits a given place.

Deep links set the lesson, language and simulator state, for example `#C2?pen=broken&lang=en`. Learners' progress is stored only in their browser.

## Running

There is no build step. Open `index.html` directly (this also works from `file://`), or serve the folder:

```bash
python3 -m http.server 8765
```

## Releasing

After changing any CSS or JS file, bump the `?v=` query on every asset in `index.html` (and `PE.version` in `js/core/ns.js`). Cloudflare caches assets for 4 hours by URL, so without a new version visitors keep receiving the old files.

## Tests

```bash
node test/run.js
```

`test/run.js` runs the electrical model tests and the content checks, which compare the Hebrew and English versions for parity. It needs no dependencies.

The end-to-end check needs a running server and Playwright with Chromium:

```bash
node test/e2e.js http://localhost:8765/
```

## Structure

- `index.html` – the page shell.
- `css/app.css` – styles.
- `js/core/` – namespace, store, i18n, router, renderer, quiz and practice, app shell. Navigation is ported from agl-edu.
- `js/model.js` – the electrical model: pure functions, also used by Node.
- `js/sims/` – IEC 60617 symbols, the simulator kit and one file per simulator.
- `js/three/` – the 3D kit (three.js loaded lazily from `vendor/`) and the three scenes.
- `js/content/` – course content, one file per module. Text is stored as `{he, en}`, with Hebrew as the master copy. `{{…}}` marks a left-to-right run.
- `vendor/` – pinned d3 7.9.0, KaTeX 0.16.11 and three.js r147. Sources and hashes are in `vendor/README.md`.
- `modules/` – redirects from the old v1 pages.
- `docs/designs/` – the design, written with the Elephant-Goldfish Model. Start with `SITEMAP.md`.

v1 is kept on the `backup/v1-simple` branch.

## Regulations

Regulatory figures are labelled with their source. `docs/designs/reviews/regulation_check.md` records which items were checked and how. In this build, items quoted from the Israeli regulations come from secondary sources, because the primary text (Nevo, Wikisource) could not be reached from the development environment. These items keep the "regulation – verify" label.

## Disclaimer

This is educational software. The values are for teaching and the models are simplified. Regulatory figures are as commonly taught and must be checked against the current official text of the law, the regulations and the standards. Electrical work must be done by a suitably licensed electrician.
