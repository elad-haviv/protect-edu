/* Versioned progress store in localStorage. Every access is guarded (private mode, blocked storage). */
(function () {
  "use strict";
  const KEY = "protectEdu.v2";
  const empty = () => ({ v: 2, lang: null, theme: "auto", last: null, visited: [], quiz: {}, final: null });
  let data = empty();
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) { const d = JSON.parse(raw); if (d && d.v === 2) data = Object.assign(empty(), d); }
    localStorage.removeItem("protectEdu");          // v1 key: progress is not migrated (design R-6)
  } catch (e) { /* storage unavailable */ }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(data)); } catch (e) { /* ignore */ } }
  PE.store = {
    get: k => data[k],
    set(k, v) { data[k] = v; save(); },
    visit(id) { if (!data.visited.includes(id)) { data.visited.push(id); save(); } },
    visited: id => data.visited.includes(id),
    quiz(id, score, of) {
      const prev = data.quiz[id];
      if (!prev || score / of > prev.score / prev.of) { data.quiz[id] = { score, of }; save(); }
    },
    quizResult: id => data.quiz[id] || null,
    reset() { const keep = { lang: data.lang, theme: data.theme }; data = Object.assign(empty(), keep); save(); }
  };
})();
