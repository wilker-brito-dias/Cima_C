import { getStore } from '@netlify/blobs';
import { scryptSync, randomBytes, createHmac, timingSafeEqual } from 'node:crypto';

const store = () => getStore('cima');
const J = (d, s = 200) => new Response(JSON.stringify(d), { status: s, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } });
const hash = (p, s) => scryptSync(p, s, 32).toString('hex');
const same = (a, b) => a.length === b.length && timingSafeEqual(Buffer.from(a), Buffer.from(b));

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

export default async req => {
  const p = new URL(req.url).pathname.replace('/api/', '');
  const c = await creds();
  if (p === 'content' && req.method === 'GET') return J(await store().get('content', { type: 'json' }));
  if (p === 'reviews' && req.method === 'GET') {
    const k = process.env.GOOGLE_API_KEY, id = process.env.GOOGLE_PLACE_ID;
    if (!k || !id) return J(null);
    const old = await store().get('reviews', { type: 'json' });
    if (old && Date.now() - old.t < 864e5) return J(old.d);
    try {
      const r = await fetch(`https://places.googleapis.com/v1/places/${id}?languageCode=pt-BR`, { headers: { 'X-Goog-Api-Key': k, 'X-Goog-FieldMask': 'rating,userRatingCount,reviews' } });
      if (!r.ok) return J(old ? old.d : null);
      const g = await r.json();
      const d = { nota: g.rating, total: g.userRatingCount, itens: (g.reviews || []).map(x => ({ autor: x.authorAttributionDisplayName, nota: x.rating, texto: x.text?.text || '', quando: x.relativePublishTimeDescription })) };
      await store().setJSON('reviews', { t: Date.now(), d });
      return J(d);
    } catch { return J(old ? old.d : null); }
  }
  if (p === 'login' && req.method === 'POST') {
    const b = await req.json();
    if (b.usuario === c.user && same(hash(b.senha || '', c.salt), c.hash)) return J({ token: sign(c) });
    await new Promise(r => setTimeout(r, 900));
    return J({ erro: 'Usuário ou senha incorretos.' }, 401);
  }
  if (!valid(c, (req.headers.get('authorization') || '').slice(7))) return J({ erro: 'Sessão expirada. Entre de novo.' }, 401);
  if (p === 'me') return J({ ok: 1 });
  if (p === 'content' && req.method === 'PUT') { const t = await req.text(); if (t.length > 5.5e6) return J({ erro: 'Conteúdo grande demais. Use fotos menores.' }, 413); await store().setJSON('content', JSON.parse(t)); return J({ ok: 1 }); }
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
