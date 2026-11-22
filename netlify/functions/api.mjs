import { getStore } from '@netlify/blobs';
import { scryptSync, randomBytes, createHmac, timingSafeEqual } from 'node:crypto';

const store = () => getStore('cima');
const J = (d, s = 200) => new Response(JSON.stringify(d), { status: s, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } });
const hash = (p, s) => scryptSync(p, s, 32).toString('hex');
const same = (a, b) => a.length === b.length && timingSafeEqual(Buffer.from(a), Buffer.from(b));
const BOT = /bot|crawl|spider|slurp|headless|lighthouse|pingdom|monitor|preview|facebookexternalhit|whatsapp|python|curl|wget/i;
const EV = ['v', 'reservar', 'reserva', 'evento', 'wa', 'cardapio', 'delivery', 'mapa', 'insta'];
const brDay = () => new Date().toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' });
const srcName = (r, u) => {
  const x = String(u || r || '').toLowerCase();
  if (!x) return 'Direto';
  if (/insta/.test(x)) return 'Instagram'; if (/google/.test(x)) return 'Google'; if (/facebook|fb\.|meta/.test(x)) return 'Facebook';
  if (/whatsapp|wa\.me/.test(x)) return 'WhatsApp'; if (/^t\.co|twitter|^x\.com/.test(x)) return 'X (Twitter)'; if (/tiktok/.test(x)) return 'TikTok';
  if (/youtube|youtu\.be/.test(x)) return 'YouTube'; if (/bing|duckduckgo|yahoo/.test(x)) return 'Outros buscadores';
  return u ? 'Campanha: ' + String(u).slice(0, 30) : 'Outros sites';
};
const VS = 3.5e6; // tamanho de cada pedaço de vídeo
const gkey = async () => process.env.GOOGLE_API_KEY || (await store().get('gkey')) || '';
const skey = async () => process.env.SERPAPI_KEY || (await store().get('skey')) || '';
const gerr = m => /not been used|disabled|not enabled/i.test(m) ? 'A Places API (New) não está ativada no projeto do Google Cloud.' : /billing/i.test(m) ? 'O faturamento não está ativado no Google Cloud.' : /api key not valid|invalid/i.test(m) ? 'A chave é inválida. Copie a chave inteira.' : /blocked|not authorized|permission/i.test(m) ? 'A chave está bloqueada. Nas restrições da chave, permita a "Places API (New)".' : m;
const serr = m => /invalid api key/i.test(m) ? 'A chave é inválida. Copie a chave inteira do painel do SerpApi.' : /run out|limit|exceed/i.test(m) ? 'O limite gratuito do mês acabou. As avaliações voltam no próximo mês.' : String(m);
const txt = x => { const s = x.extracted_snippet?.original || x.snippet || ''; const p = s.split(/\(Original\)/i); return (p.length > 1 ? p.pop() : s).replace(/^\s*\(Translated by Google\)\s*/i, '').trim(); };

// Opção oficial do Google (exige conta de cobrança no Google Cloud)
async function viaGoogle(k) {
  try {
    let id = process.env.GOOGLE_PLACE_ID || await store().get('placeid');
    if (!id) {
      const ct = await store().get('content', { type: 'json' });
      const r = await fetch('https://places.googleapis.com/v1/places:searchText', { method: 'POST', headers: { 'content-type': 'application/json', 'X-Goog-Api-Key': k, 'X-Goog-FieldMask': 'places.id' }, body: JSON.stringify({ textQuery: ct?.mapaBusca || 'Cimá Carriço Restaurante e Petiscaria Linhares ES', languageCode: 'pt-BR' }) });
      const j = await r.json();
      id = j.places?.[0]?.id;
      if (!id) return { err: 'Google: ' + gerr(j.error?.message || 'local não encontrado.') };
      await store().set('placeid', id);
    }
    const r = await fetch(`https://places.googleapis.com/v1/places/${id}?languageCode=pt-BR`, { headers: { 'X-Goog-Api-Key': k, 'X-Goog-FieldMask': 'rating,userRatingCount,reviews' } });
    const g = await r.json();
    if (!r.ok) return { err: 'Google: ' + gerr(g.error?.message || String(r.status)) };
    return { d: { nota: g.rating, total: g.userRatingCount, itens: (g.reviews || []).map(x => ({ autor: x.authorAttributionDisplayName, nota: x.rating, texto: x.text?.text || '', quando: x.relativePublishTimeDescription })) } };
  } catch { return { err: 'Falha ao consultar o Google.' }; }
}

// Opção grátis, sem cartão: SerpApi (serviço de terceiros que lê o Google Maps)
async function viaSerp(k) {
  try {
    let id = await store().get('dataid');
    if (!id) {
      const ct = await store().get('content', { type: 'json' });
      const q = encodeURIComponent(ct?.mapaBusca || 'Cimá Carriço Restaurante e Petiscaria Linhares ES');
      const r = await fetch(`https://serpapi.com/search.json?engine=google_maps&type=search&q=${q}&hl=pt&api_key=${encodeURIComponent(k)}`);
      const j = await r.json();
      if (!r.ok || j.error) return { err: 'SerpApi: ' + serr(j.error || r.status) };
      id = j.place_results?.data_id || j.local_results?.[0]?.data_id;
      if (!id) return { err: 'SerpApi: não encontrei o restaurante no Google Maps. Confira o campo "Busca do mapa" no painel.' };
      await store().set('dataid', id);
    }
    const r = await fetch(`https://serpapi.com/search.json?engine=google_maps_reviews&data_id=${encodeURIComponent(id)}&hl=pt&api_key=${encodeURIComponent(k)}`);
    const j = await r.json();
    if (!r.ok || j.error) return { err: 'SerpApi: ' + serr(j.error || r.status) };
    const pi = j.place_info || {};
    return { d: { nota: pi.rating ?? '', total: pi.reviews ?? '', itens: (j.reviews || []).map(x => ({ autor: x.user?.name || '', nota: x.rating, texto: txt(x), quando: x.date || '' })) } };
  } catch { return { err: 'Falha ao consultar o SerpApi.' }; }
}

async function reviews() {
  const old = await store().get('reviews', { type: 'json' });
  if (old && Date.now() - old.t < (old.s ? 2592e5 : 864e5)) return { d: old.d }; // SerpApi: renova a cada 3 dias; Google: a cada 1 dia
  const [gk, sk] = [await gkey(), await skey()];
  if (!gk && !sk) return { d: null, err: 'Ainda não há chave cadastrada.' };
  const bad = await store().get('rverr', { type: 'json' });
  if (bad && Date.now() - bad.t < 18e5) return { d: old?.d || null, err: bad.m };
  let r = gk ? await viaGoogle(gk) : { err: '' }, serp = false;
  if (!r.d && sk) { r = await viaSerp(sk); serp = true; }
  if (r.d) { await store().setJSON('reviews', { t: Date.now(), s: serp, d: r.d }); await store().delete('rverr'); return { d: r.d }; }
  await store().setJSON('rverr', { t: Date.now(), m: r.err });
  return { d: old?.d || null, err: r.err };
}
const reset = async () => { for (const k of ['reviews', 'placeid', 'dataid', 'rverr']) await store().delete(k); };
const TYPES = { jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp' };

// Primeiro acesso: usuário "admin" e senha "cima1234" (ou ADMIN_USER / ADMIN_PASS no Netlify). Troque no painel.
async function creds() {
  let c = await store().get('auth', { type: 'json' });
  if (!c) {
    const salt = randomBytes(16).toString('hex');
    c = { user: process.env.ADMIN_USER || 'admin', salt, hash: hash(process.env.ADMIN_PASS || 'cima1234', salt), key: randomBytes(32).toString('hex') };
    await store().setJSON('auth', c);
  }
  return c;
}
const sign = c => {
  const b = Buffer.from(JSON.stringify({ e: Date.now() + 6048e5 })).toString('base64url');
  return b + '.' + createHmac('sha256', c.key).update(b).digest('base64url');
};
const valid = (c, t = '') => {
  const [b, s] = t.split('.');
  if (!b || !s || !same(createHmac('sha256', c.key).update(b).digest('base64url'), s)) return false;
  return JSON.parse(Buffer.from(b, 'base64url')).e > Date.now();
};

export default async (req, context) => {
  const p = new URL(req.url).pathname.replace('/api/', '');

  // ---- rotas públicas ----
  // Contador de visitas: sem cookies e sem dados pessoais. O visitante vira um código que muda todo dia e não pode ser revertido.
  if (req.method === 'POST' && p === 'e') {
    try {
      const ua = req.headers.get('user-agent') || '', sfs = req.headers.get('sec-fetch-site');
      if (!ua || BOT.test(ua) || (sfs && sfs !== 'same-origin')) return new Response(null, { status: 204 });
      const b = JSON.parse((await req.text()).slice(0, 500));
      if (!EV.includes(b.e)) return new Response(null, { status: 204 });
      const day = brDay(), key = 'stats/' + day;
      let sk = await store().get('statkey'); if (!sk) { sk = randomBytes(16).toString('hex'); await store().set('statkey', sk); }
      const ip = context?.ip || (req.headers.get('x-nf-client-connection-ip') || req.headers.get('x-forwarded-for') || '').split(',')[0].trim();
      const code = createHmac('sha256', sk + day).update(ip + '|' + ua).digest('hex').slice(0, 12);
      const s = (await store().get(key, { type: 'json' })) || { v: 0, u: 0, e: {}, src: {}, dev: { m: 0, d: 0 }, h: [] };
      if (b.e === 'v') {
        s.v++; const so = srcName(String(b.r || ''), String(b.u || '')); s.src[so] = (s.src[so] || 0) + 1;
        if (/Mobi|Android|iPhone/i.test(ua)) s.dev.m++; else s.dev.d++;
        if (!s.h.includes(code)) { s.u++; if (s.h.length < 20000) s.h.push(code); }
      } else s.e[b.e] = (s.e[b.e] || 0) + 1;
      await store().setJSON(key, s);
    } catch {}
    return new Response(null, { status: 204 });
  }
  if (req.method === 'GET' && p === 'content') return J(await store().get('content', { type: 'json' }));

  if (req.method === 'GET' && p === 'reviews') return J((await reviews()).d);

  if (req.method === 'GET' && p.startsWith('media/')) {
    const id = p.slice(6), meta = /^[a-f0-9]{16}$/.test(id) && await store().get(`vid/${id}/meta`, { type: 'json' });
    if (!meta) return J({ erro: 'Não encontrado.' }, 404);
    const total = meta.total, bad = () => new Response(null, { status: 416, headers: { 'content-range': `bytes */${total}` } });
    const m = /^bytes=(\d*)-(\d*)$/.exec(req.headers.get('range') || 'bytes=0-');
    if (!m || (m[1] === '' && m[2] === '')) return bad();
    let s, e;
    if (m[1] === '') { s = Math.max(0, total - +m[2]); e = total - 1; } else { s = +m[1]; e = m[2] === '' ? total - 1 : +m[2]; }
    if (s >= total || s > e) return bad();
    const k = Math.floor(s / VS);
    e = Math.min(e, total - 1, (k + 1) * VS - 1);
    const ch = await store().get(`vid/${id}/${k}`, { type: 'arrayBuffer' });
    if (!ch) return J({ erro: 'Não encontrado.' }, 404);
    return new Response(ch.slice(s - k * VS, e - k * VS + 1), { status: 206, headers: { 'content-type': meta.t, 'accept-ranges': 'bytes', 'content-range': `bytes ${s}-${e}/${total}`, 'cache-control': 'public, max-age=31536000, immutable', 'x-content-type-options': 'nosniff' } });
  }

  if (req.method === 'GET' && p.startsWith('img/')) {
    const id = p.slice(4);
    if (!/^[a-f0-9]{16}$/.test(id)) return J({ erro: 'Não encontrado.' }, 404);
    const f = await store().getWithMetadata('img/' + id, { type: 'arrayBuffer' });
    if (!f) return J({ erro: 'Não encontrado.' }, 404);
    return new Response(f.data, { headers: { 'content-type': f.metadata?.type || 'image/jpeg', 'cache-control': 'public, max-age=31536000, immutable', 'x-content-type-options': 'nosniff' } });
  }

  // ---- login ----
  const c = await creds();
  if (p === 'login' && req.method === 'POST') {
    const b = await req.json();
    if (b.usuario === c.user && same(hash(b.senha || '', c.salt), c.hash)) return J({ token: sign(c) });
    await new Promise(r => setTimeout(r, 900));
    return J({ erro: 'Usuário ou senha incorretos.' }, 401);
  }

  // ---- rotas protegidas ----
  if (!valid(c, (req.headers.get('authorization') || '').slice(7))) return J({ erro: 'Sessão expirada. Entre de novo.' }, 401);
  if (p === 'me') return J({ ok: 1 });
  if (p === 'stats' && req.method === 'GET') {
    const q = new URL(req.url).searchParams.get('mes') || '', mes = /^\d{4}-\d{2}$/.test(q) ? q : brDay().slice(0, 7);
    const { blobs } = await store().list({ prefix: 'stats/' + mes }), dias = [];
    for (const b of blobs) { const s = await store().get(b.key, { type: 'json' }); if (s) { const { h, ...r } = s; dias.push({ d: b.key.slice(6), ...r }); } }
    dias.sort((x, y) => x.d.localeCompare(y.d));
    return J({ mes, dias });
  }
  if (p === 'status') { const [g, s] = [await gkey(), await skey()], r = await reviews(), o = await store().get('reviews', { type: 'json' }); return J({ google: !!g, serp: !!s, fonte: o?.s ? 'SerpApi' : 'Google', itens: r.d?.itens?.length || 0, erro: r.err || '' }); }

  if ((p === 'gkey' || p === 'skey') && req.method === 'POST') {
    const k = String((await req.json()).chave || '').trim(), n = p;
    if (k && !/^[A-Za-z0-9_-]{20,100}$/.test(k)) return J({ erro: 'Chave inválida. Copie a chave inteira, sem espaços.' }, 400);
    if (k) await store().set(n, k); else await store().delete(n);
    await reset();
    return J({ ok: 1 });
  }

  if (p === 'vupload' && req.method === 'POST') {
    const q = new URL(req.url).searchParams, id = q.get('id') || '', i = +q.get('i'), n = +q.get('n'), t = q.get('t');
    if (!/^[a-f0-9]{16}$/.test(id) || !Number.isInteger(i) || !Number.isInteger(n) || n < 1 || n > 8 || i < 0 || i >= n || !['mp4', 'webm'].includes(t)) return J({ erro: 'Envio inválido.' }, 400);
    const buf = Buffer.from(await req.arrayBuffer());
    if (!buf.length || buf.length > VS || (i < n - 1 && buf.length !== VS)) return J({ erro: 'Pedaço de vídeo inválido.' }, 400);
    if (i === 0 && !(t === 'mp4' ? buf.subarray(4, 8).toString() === 'ftyp' : buf.subarray(0, 4).equals(Buffer.from([0x1a, 0x45, 0xdf, 0xa3])))) return J({ erro: 'Arquivo de vídeo inválido. Use MP4 (H.264) ou WebM.' }, 400);
    await store().set(`vid/${id}/${i}`, buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength));
    if (i < n - 1) return J({ ok: 1 });
    const { blobs } = await store().list({ prefix: `vid/${id}/` });
    if (blobs.length !== n) return J({ erro: 'Faltou um pedaço do vídeo. Tente de novo.' }, 400);
    await store().setJSON(`vid/${id}/meta`, { t: t === 'mp4' ? 'video/mp4' : 'video/webm', n, total: (n - 1) * VS + buf.length });
    return J({ url: '/api/media/' + id });
  }

  if (p === 'content' && req.method === 'PUT') {
    const t = await req.text();
    if (t.length > 1e6) return J({ erro: 'Conteúdo grande demais.' }, 413);
    await store().setJSON('content', JSON.parse(t));
    return J({ ok: 1 });
  }

  if (p === 'upload' && req.method === 'POST') {
    const { data = '' } = await req.json();
    const m = /^data:image\/(jpeg|png|webp);base64,([A-Za-z0-9+/=]+)$/.exec(data);
    if (!m) return J({ erro: 'Imagem inválida. Use JPG, PNG ou WEBP.' }, 400);
    const buf = Buffer.from(m[2], 'base64');
    if (buf.length > 4e6) return J({ erro: 'Imagem grande demais.' }, 413);
    const id = randomBytes(8).toString('hex');
    await store().set('img/' + id, buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength), { metadata: { type: TYPES[m[1]] } });
    return J({ url: '/api/img/' + id });
  }

  if (p === 'credentials' && req.method === 'POST') {
    const b = await req.json();
    if (!same(hash(b.senhaAtual || '', c.salt), c.hash)) return J({ erro: 'A senha atual não confere.' }, 400);
    if (b.novaSenha && b.novaSenha.length < 8) return J({ erro: 'A nova senha precisa ter 8 caracteres ou mais.' }, 400);
    const salt = b.novaSenha ? randomBytes(16).toString('hex') : c.salt;
    const n = { user: b.usuario || c.user, salt, hash: b.novaSenha ? hash(b.novaSenha, salt) : c.hash, key: randomBytes(32).toString('hex') };
    await store().setJSON('auth', n);
    return J({ token: sign(n) });
  }
  return J({ erro: 'Não encontrado.' }, 404);
};
export const config = { path: '/api/*' };
