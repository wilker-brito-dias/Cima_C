// Calcula toda a paleta do site a partir de 5 valores (matiz, intensidade, fundo, destaque, brilho).
function aplicarTema(t, el) {
  t = t || {}; el = el || document.documentElement;
  const n = (v, d, a, b) => { v = parseFloat(v); return isNaN(v) ? d : Math.min(b, Math.max(a, v)); };
  const h = n(t.matiz, 354, 0, 360), s = n(t.intensidade, 46, 0, 100), L = n(t.fundo, 9, 3, 24), ah = n(t.destaque, 40, 0, 360), al = n(t.brilho, 66, 40, 85);
  const as = Math.round(Math.max(35, Math.min(85, s + 25))), R = Math.round, S = (k, v) => el.style.setProperty(k, v);
  S('--d0', `${h} ${R(s * .85)}% ${Math.max(2, L - 4)}%`);   // fundo mais escuro
  S('--d1', `${h} ${R(s * .8)}% ${L}%`);                      // fundo base
  S('--d2', `${h} ${R(s * .75)}% ${L + 7}%`);                 // fundo mais claro (degradê)
  S('--gl', `${h} ${Math.min(100, s + 15)}% ${Math.min(52, L + 30)}%`); // brilho dos degradês
  S('--i', `${h} ${R(s * .6)}% ${Math.max(6, L + 2)}%`);      // texto escuro
  S('--c', `${h} ${R(s * .2)}% 96%`);                         // fundo claro
  S('--p', `${h} ${s}% 34%`);                                 // cor principal (preços, ilustrações)
  S('--a', `${ah} ${as}% ${al}%`);                            // botões e detalhes
  S('--a2', `${ah} ${as}% 38%`);                              // detalhes sobre fundo claro
  S('--oa', al >= 58 ? `hsl(${h} ${R(s * .6)}% ${Math.max(6, L + 2)}%)` : '#fff'); // texto dos botões
  if (el === document.documentElement) {
    const hx = (H, s2, l2) => { s2 /= 100; l2 /= 100; const k = x => (x + H / 30) % 12, a = s2 * Math.min(l2, 1 - l2), f = x => l2 - a * Math.max(-1, Math.min(k(x) - 3, Math.min(9 - k(x), 1))); return '#' + [f(0), f(8), f(4)].map(x => Math.round(x * 255).toString(16).padStart(2, '0')).join(''); };
    const m = document.querySelector('meta[name=theme-color]'); if (m) m.content = hx(h, R(s * .8), L);
  }
}
