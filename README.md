# הגנה בפני חשמול · Protection Against Electric Shock

An interactive course in Hebrew and English on the seven methods of protection against electric shock under the Israeli Electricity Law and its regulations. The Hebrew interface is RTL.

Live: https://protect-edu.haviv.pro

## Modules

| Code | Module | Contents |
|---|---|---|
| A | Basics | Body impedance versus voltage, IEC 60479 effect zones, direct and indirect contact, earthing systems TN-C-S/TT/IT, fault loop and disconnection |
| B | הארקת הגנה – Protective earthing (TT) | TT fault simulator with earthing, RCD and MCB; potential funnel; Ra·IΔn practice |
| C | איפוס – Neutralization (TN) | Fault-loop simulator, broken PEN, Zs·Ia practice |
| D | פחת – RCD | What an RCD sees and what it misses (L–N touch, overload), trip staircase |
| E | הפרד מגן – Protective separation | Single touch, first fault, cable capacitance, two appliances with and without bonding |
| F | בידוד כפול – Class II | Insulation layers for class 0, I and II |
| G | מתח נמוך מאוד – SELV/PELV | Voltage, location and source; the risk of a non-isolated adapter |
| H | זינה צפה – Floating supply (IT) | First fault (alarm only), second fault (disconnection), insulation monitoring; 3D operating theatre |
| J | Compare and choose | A comparison card of all seven methods, the third location exercise, layered protection, and complementary measures (equipotential bonding and non-conducting location, with a 3D bathroom) |
| K | Final check | Basic and advanced bands drawn at random from a pool of 41 items; pass mark 80%; printable completion record (not a licence) |
| L | Glossary | Searchable terms in Hebrew and English, with abbreviations, linked to lessons |
| M | References | The law, the regulations (with links) and the IEC standards |

Three modules include rotatable **3D scenes** built with three.js: the potential funnel (B3), inside an RCD (D3), an operating theatre on a floating supply (H3) and a bathroom with bonding (J5). Each scene has an HTML parts list, keyboard controls and a 2D fallback.

**Presenter mode** is turned on with the ▣ button or `?present=1`. It shows the content full width with the light theme. The prediction stays locked until the teacher presses Space or "Reveal", and Esc leaves the mode.

The course is part of [Haviv Academy](https://academy.haviv.pro), alongside [AGL](https://agl-edu.haviv.pro) and [GENSET](https://genset-edu.haviv.pro).

Every simulator asks the learner to **predict** an outcome before showing it. Every statement carries a label: *principle*, *typical practice*, *illustrative* or *regulation – verify*. Each method ends with a quiz built on common misconceptions, plus review questions from earlier modules. Three location exercises ask which protection fits a given place.

Deep links set the lesson, language and simulator state, for example `#C2?pen=broken&lang=en`. Learners' progress is stored only in their browser.

## Running

There is no build step. Open `index.html` directly (this also works from `file://`), or serve the folder:

```bash
python3 -m http.server 8765
```

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
- `vendor/` – pinned d3 7.9.0 and three.js r147. Sources and hashes are in `vendor/README.md`.
- `modules/` – redirects from the old v1 pages.
- `docs/designs/` – the design, written with the Elephant-Goldfish Model. Start with `SITEMAP.md`.

v1 is kept on the `backup/v1-simple` branch.

## Regulations

Regulatory figures are labelled with their source. `docs/designs/reviews/regulation_check.md` records which items were checked and how. In this build, items quoted from the Israeli regulations come from secondary sources, because the primary text (Nevo, Wikisource) could not be reached from the development environment. These items keep the "regulation – verify" label.

## Disclaimer

This is educational software. The values are for teaching and the models are simplified. Regulatory figures are as commonly taught and must be checked against the current official text of the law, the regulations and the standards. Electrical work must be done by a suitably licensed electrician.
