const T = localStorage.cimaT, $ = s => document.querySelector(s);
const E = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
try { localStorage.cimaNT = '1'; } catch {}
const api = async p => { const r = await fetch('/api/' + p, { headers: { authorization: 'Bearer ' + T } }); if (r.status === 401) { location.href = '/admin/'; throw Error('login'); } const j = await r.json(); if (!r.ok) throw Error(j.erro); return j; };
const hoje = () => new Date().toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' }).slice(0, 7);
const ant = m => { const [y, n] = m.split('-').map(Number), d = new Date(y, n - 2, 1); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0'); };
const NOMES = { v: 'Visitas ao site', reservar: 'Cliques em "Reservar"', reserva: 'Pedidos de reserva enviados', evento: 'Pedidos de evento enviados', wa: 'Cliques no WhatsApp', cardapio: 'Aberturas do cardápio', delivery: 'Cliques no delivery', mapa: 'Cliques em "Como chegar"', insta: 'Cliques no Instagram' };
const soma = dias => { const t = { v: 0, u: 0, e: {}, src: {}, dev: { m: 0, d: 0 } }; for (const d of dias) { t.v += d.v || 0; t.u += d.u || 0; for (const k in d.e || {}) t.e[k] = (t.e[k] || 0) + d.e[k]; for (const k in d.src || {}) t.src[k] = (t.src[k] || 0) + d.src[k]; t.dev.m += d.dev?.m || 0; t.dev.d += d.dev?.d || 0; } return t; };
const contatos = t => (t.e.reserva || 0) + (t.e.evento || 0) + (t.e.wa || 0);
let REF = 'ao mês anterior';
const delta = (a, b) => !b ? '<small>sem dados para comparar</small>' : `<small class="${a >= b ? 'up' : 'dn'}">${a >= b ? '▲' : '▼'} ${Math.abs(Math.round((a - b) / b * 100))}% em relação ${REF}</small>`;
const pct = (a, b) => b ? Math.round(a / b * 100) + '%' : '-';

function grafico(dias, mes) {
  const [y, m] = mes.split('-').map(Number), n = new Date(y, m, 0).getDate(), by = {};
  dias.forEach(d => { by[+d.d.slice(8)] = d.v || 0; });
  const max = Math.max(1, ...Object.values(by)), W = 720, H = 190, bw = W / n;
  const bars = Array.from({ length: n }, (_, i) => { const v = by[i + 1] || 0, h = Math.round(v / max * (H - 30)); return `<g><title>Dia ${i + 1}: ${v} visitas</title><rect x="${i * bw + 2}" y="${H - 22 - h}" width="${Math.max(1, bw - 4)}" height="${h}" rx="2" fill="#1B3FA0"/>${(i + 1) % 5 === 0 || i === 0 ? `<text x="${i * bw + bw / 2}" y="${H - 6}" text-anchor="middle" font-size="11" fill="#555">${i + 1}</text>` : ''}</g>`; }).join('');
  return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Visitas por dia">${bars}</svg>`;
}

async function carregar(mes) {
  const [a, b, c] = await Promise.all([api('stats?mes=' + mes), api('stats?mes=' + ant(mes)), fetch('/content.json').then(r => r.json()).catch(() => ({}))]);
  // mês em andamento: compara com os mesmos dias do mês anterior, para a comparação ser justa
  const emAndamento = mes === hoje(), diaHoje = +new Date().toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' }).slice(8);
  REF = emAndamento ? 'ao mesmo período do mês anterior' : 'ao mês anterior';
  if (emAndamento) b.dias = b.dias.filter(d => +d.d.slice(8) <= diaHoje);
  const t = soma(a.dias), p = soma(b.dias), [y, n] = mes.split('-').map(Number);
  const nomeMes = new Date(y, n - 1, 1).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  const melhor = a.dias.slice().sort((x, z) => (z.v || 0) - (x.v || 0))[0];
  const origem = Object.entries(t.src).sort((x, z) => z[1] - x[1]);
  const acoes = Object.keys(NOMES).filter(k => k !== 'v');
  const dev = t.dev.m + t.dev.d;
  $('#r').innerHTML = `
  <div class="bar noprint"><label>Mês <input type="month" id="mes" value="${mes}" max="${hoje()}"></label></div>
  <div><h1>Relatório de desempenho do site</h1><p class="sub">${E(c.nome || 'Restaurante')}, ${E(nomeMes)}</p></div>
  <div class="kp">
    <div class="k"><span>Visitas</span><b>${t.v}</b>${delta(t.v, p.v)}</div>
    <div class="k"><span>Visitantes (soma dos dias)</span><b>${t.u}</b>${delta(t.u, p.u)}</div>
    <div class="k"><span>Contatos gerados</span><b>${contatos(t)}</b>${delta(contatos(t), contatos(p))}<small>reservas + eventos + WhatsApp</small></div>
    <div class="k"><span>Pedidos de reserva</span><b>${t.e.reserva || 0}</b>${delta(t.e.reserva || 0, p.e.reserva || 0)}</div>
    <div class="k"><span>Pedidos de evento</span><b>${t.e.evento || 0}</b>${delta(t.e.evento || 0, p.e.evento || 0)}</div>
    <div class="k"><span>Cardápio aberto</span><b>${t.e.cardapio || 0}</b>${delta(t.e.cardapio || 0, p.e.cardapio || 0)}</div>
  </div>
  <div class="card"><h2>Visitas por dia</h2>${grafico(a.dias, mes)}${melhor ? `<p class="note">Dia com mais visitas: ${melhor.d.split('-').reverse().join('/')} (${melhor.v} visitas).</p>` : '<p class="note">Ainda não há visitas neste mês.</p>'}</div>
  <div class="two">
    <div class="card"><h2>O que os visitantes fizeram</h2><table><tr><th>Ação</th><th>Total</th></tr>${acoes.map(k => `<tr><td>${E(NOMES[k])}</td><td>${t.e[k] || 0}</td></tr>`).join('')}</table></div>
    <div class="card"><h2>De onde vieram</h2><table><tr><th>Origem</th><th>Visitas</th></tr>${origem.map(([k, v]) => `<tr><td>${E(k)}</td><td>${v} (${pct(v, t.v)})</td></tr>`).join('') || '<tr><td>Sem dados</td><td></td></tr>'}</table>
      <h2 style="margin-top:18px">Aparelho</h2><table><tr><td>Celular</td><td>${pct(t.dev.m, dev)}</td></tr><tr><td>Computador e tablet</td><td>${pct(t.dev.d, dev)}</td></tr></table></div>
  </div>
  <div class="card"><h2>Comentários do mês</h2><textarea placeholder="Escreva aqui o que foi feito no mês e as recomendações. Este texto sai na impressão."></textarea></div>
  <p class="note">Como ler: as visitas contam cada vez que alguém abre o site. "Visitantes" soma as pessoas diferentes de cada dia (sem cookies e sem guardar dados pessoais). O navegador usado no painel não entra na contagem. Para saber quantas pessoas vêm do Instagram, use o endereço do site com ?utm_source=instagram no link da bio.</p>`;
  $('#mes').onchange = e => e.target.value && carregar(e.target.value).catch(erro);
}
const erro = e => { if (e.message !== 'login') $('#r').innerHTML = `<p>Não foi possível carregar o relatório: ${E(e.message)}</p>`; };
$('#pr').onclick = () => print();
carregar(hoje()).catch(erro);
