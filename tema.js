// Calcula toda a paleta do site a partir de 5 valores. Roda no navegador e no servidor.
(function (g) {
  const n = (v, d, a, b) => { v = parseFloat(v); return isNaN(v) ? d : Math.min(b, Math.max(a, v)); };
  const P = t => { t = t || {}; return { h: n(t.matiz, 354, 0, 360), s: n(t.intensidade, 46, 0, 100), L: n(t.fundo, 9, 3, 24), ah: n(t.destaque, 40, 0, 360), al: n(t.brilho, 66, 40, 85) }; };
  function temaVars(t) {
    const { h, s, L, ah, al } = P(t), R = Math.round, as = R(Math.max(35, Math.min(85, s + 25)));
    return {
      '--d0': `${h} ${R(s * .85)}% ${Math.max(2, L - 4)}%`, '--d1': `${h} ${R(s * .8)}% ${L}%`, '--d2': `${h} ${R(s * .75)}% ${L + 7}%`,
      '--gl': `${h} ${Math.min(100, s + 15)}% ${Math.min(52, L + 30)}%`, '--i': `${h} ${R(s * .6)}% ${Math.max(6, L + 2)}%`, '--c': `${h} ${R(s * .2)}% 96%`,
      '--p': `${h} ${s}% 34%`, '--a': `${ah} ${as}% ${al}%`, '--a2': `${ah} ${as}% 38%`,
      '--oa': al >= 58 ? `hsl(${h} ${R(s * .6)}% ${Math.max(6, L + 2)}%)` : '#fff'
    };
  }
  function temaHex(t) {
    const { h, s, L } = P(t); let s2 = Math.round(s * .8) / 100, l2 = L / 100;
    const k = x => (x + h / 30) % 12, a = s2 * Math.min(l2, 1 - l2), f = x => l2 - a * Math.max(-1, Math.min(k(x) - 3, Math.min(9 - k(x), 1)));
    return '#' + [f(0), f(8), f(4)].map(x => Math.round(x * 255).toString(16).padStart(2, '0')).join('');
  }
  g.temaVars = temaVars; g.temaHex = temaHex;
  g.aplicarTema = function (t, el) {
    el = el || document.documentElement; const v = temaVars(t);
    for (const k in v) el.style.setProperty(k, v[k]);
    if (el === document.documentElement) { const m = document.querySelector('meta[name=theme-color]'); if (m) m.content = temaHex(t); }
  };
})(globalThis);
