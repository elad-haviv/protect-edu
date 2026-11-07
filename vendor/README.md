# Vendored libraries

These files are copied unmodified from the npm package tarballs (`npm pack <name>@<version>`). They are pinned so the course works offline and from `file://`.

| File | Package | Source path in tarball | SHA-256 |
|---|---|---|---|
| `d3@7.9.0/d3.min.js` | d3 7.9.0 (ISC) | `package/dist/d3.min.js` | `f2094bbf6141b359722c4fe454eb6c4b0f0e42cc10cc7af921fc158fceb86539` |
| `three@0.147.0/three.min.js` | three 0.147.0 (MIT) | `package/build/three.min.js` | `f34446bf875b5fb0dcd93819ffe1d9e182d46634ee855f5d904c6c4ac7cdbc95` |
| `katex@0.16.11/katex.min.js` | katex 0.16.11 (MIT) | `package/dist/katex.min.js` | `e6bfe5deebd4c7ccd272055bab63bd3ab2c73b907b6e6a22d352740a81381fd4` |
| `katex@0.16.11/katex.min.css` + `fonts/*.woff2` | katex 0.16.11 (MIT) | `package/dist/` (woff2 fonts only; browsers that need woff/ttf are not supported) | `717bc9ae7853b61f0f76455dddf0ecd4f527a783f42de2ac24684899c1c46258` (css) |
| `three@0.147.0/OrbitControls.js` | three 0.147.0 (MIT) | `package/examples/js/controls/OrbitControls.js` | `b4c6e53f98538535b11fd6655627d47fb5877b3ad972568bff0a7026c4b6d5c4` |

We use three r147 because it is the last release that has both the UMD `build/three.min.js` and `examples/js`. Later releases are ES modules only, and browsers block those over `file://`.
