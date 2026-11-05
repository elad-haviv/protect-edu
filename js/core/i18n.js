/* Language: Hebrew (default, RTL) and English (LTR). Content is {he, en} objects; interface strings live in PE.ui. */
(function () {
  "use strict";
  PE.lang = "he";
  PE.L = o => (o == null ? "" : typeof o === "string" ? o : (o[PE.lang] != null ? o[PE.lang] : o.he));
  PE.t = (key, vars) => {
    const e = PE.ui && PE.ui[key];
    let s = e ? PE.L(e) : key;
    if (vars) for (const k in vars) s = s.split("{" + k + "}").join(vars[k]);
    return s;
  };
  PE.setLang = (lang, opts = {}) => {
    if (lang !== "he" && lang !== "en") lang = "he";
    PE.lang = lang;
    const h = document.documentElement;
    h.lang = lang; h.dir = lang === "he" ? "rtl" : "ltr";
    if (!opts.transient) PE.store.set("lang", lang);
    if (!opts.silent) PE.emit("lang", lang);
  };
  PE.initialLang = () => {
    const stored = PE.store.get("lang");
    if (stored) return stored;
    const nav = (navigator.language || "he").toLowerCase();
    return nav.startsWith("en") ? "en" : "he";
  };
})();
