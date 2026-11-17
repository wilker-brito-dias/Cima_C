// Monta a página inicial no servidor: o Google e o WhatsApp recebem o HTML já pronto, com título, descrição,
// imagem de compartilhamento e dados estruturados do restaurante, sempre com o conteúdo mais recente do painel.
import { getStore } from '@netlify/blobs';
import '../../tema.js';
import '../../render.js';

const store = () => getStore('cima');
const esc = globalThis.E;
const json = x => JSON.stringify(x).replace(/</g, '\\u003c').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');
const DIAS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const SEC = {
  'x-content-type-options': 'nosniff', 'x-frame-options': 'DENY', 'referrer-policy': 'strict-origin-when-cross-origin',
  'permissions-policy': 'camera=(), microphone=(), geolocation=()', 'strict-transport-security': 'max-age=31536000; includeSubDomains',
  'content-security-policy': "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; img-src 'self' data: https:; frame-src https://www.google.com https://drive.google.com https://docs.google.com; connect-src 'self'; media-src 'self' blob: https:; base-uri 'none'; form-action 'none'; object-src 'none'; frame-ancestors 'none'"
};

export default async req => {
  const u = new URL(req.url);
  try {
    // ícone da aba do navegador: usa a logo enviada no painel ou o ícone padrão
    if (/favicon|apple-touch/.test(u.pathname)) {
      const sc = await store().get('content', { type: 'json' }), m = /^\/api\/img\/([a-f0-9]{16})$/.exec(sc?.fotoLogo || '');
      if (m) { const f = await store().getWithMetadata('img/' + m[1], { type: 'arrayBuffer' }); if (f) return new Response(f.data, { headers: { 'content-type': f.metadata?.type || 'image/png', 'cache-control': 'public, max-age=3600', 'x-content-type-options': 'nosniff' } }); }
      const ap = /apple/.test(u.pathname), r = await fetch(u.origin + (ap ? '/icone-192.png' : '/icone.ico'));
      return new Response(r.body, { status: r.status, headers: { 'content-type': ap ? 'image/png' : 'image/x-icon', 'cache-control': 'public, max-age=3600' } });
    }
    const [d, s] = await Promise.all([fetch(u.origin + '/content.json').then(r => r.json()), store().get('content', { type: 'json' })]);
    const c = globalThis.mg(d, s);
    const base = (/^https:\/\/[A-Za-z0-9.-]+\/?$/.test(c.siteUrl || '') ? c.siteUrl : u.origin).replace(/\/+$/, '');

    if (/robots/.test(u.pathname)) return new Response(`User-agent: *\nAllow: /\nDisallow: /admin/\nDisallow: /api/\n\nSitemap: ${base}/sitemap.xml\n`, { headers: { 'content-type': 'text/plain; charset=utf-8', 'cache-control': 'public, max-age=3600' } });
    if (/sitemap/.test(u.pathname)) return new Response(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${base}/</loc></url></urlset>\n`, { headers: { 'content-type': 'application/xml; charset=utf-8', 'cache-control': 'public, max-age=3600' } });

    const [tpl, rvc] = await Promise.all([fetch(u.origin + '/index.html').then(r => r.text()), store().get('reviews', { type: 'json' })]);
    const rv = rvc?.d || null, L = c.links, R = globalThis.num(L.reservas);
    const loc = /,\s*([^,]+?)\s*-\s*([A-Z]{2})\b/.exec(c.endereco || '') || [];
    const title = c.seoTitulo || `${c.nome} - ${c.slogan}${loc[1] ? ' em ' + loc[1] : ''}`;
    const desc = c.seoDescricao || `${c.nome}, ${String(c.slogan).toLowerCase()}${loc[1] ? ' em ' + loc[1] + ', ' + loc[2] : ''}. Veja o cardápio, reserve sua mesa pelo WhatsApp, combine seu evento e saiba como chegar.`;
    const abs = x => /^https:/.test(x) ? x : base + '/' + String(x).replace(/^\//, '');
    const raw = c.fotoCompartilhar || c.videoCapa || 'media/poster.jpg';
    const img = /^(data:|http:)/.test(raw) ? base + '/media/poster.jpg' : abs(raw);
    const lg = /^(\/api\/img\/[a-f0-9]{16}|https:\/\/\S+)$/.test(c.fotoLogo || '') ? abs(c.fotoLogo) : base + '/icone-192.png';
    const hours = (c.horarios || []).map(h => {
      const [a, b = a] = String(h.d).split('-').map(Number); if (isNaN(a) || isNaN(b)) return null;
      const days = []; for (let i = a, k = 0; k < 7; i = (i + 1) % 7, k++) { days.push(DIAS[i]); if (i === b) break; }
      return { '@type': 'OpeningHoursSpecification', dayOfWeek: days, opens: h.abre, closes: h.fecha };
    }).filter(Boolean);
    const ld = {
      '@context': 'https://schema.org', '@type': 'Restaurant', name: c.nome, description: desc, url: base + '/', image: [img], logo: lg,
      telephone: R ? '+' + R : undefined, acceptsReservations: true, hasMenu: L.cardapio, sameAs: [L.instagram].filter(Boolean),
      address: { '@type': 'PostalAddress', streetAddress: c.endereco, addressLocality: loc[1], addressRegion: loc[2], postalCode: (/\d{5}-?\d{3}/.exec(c.endereco || '') || [])[0], addressCountry: 'BR' },
      openingHoursSpecification: hours
    };
    const vars = Object.entries(globalThis.temaVars(c.tema)).map(([k, v]) => `${k}:${v}`).join(';');
    const vid = /^(media\/|\/api\/media\/|https:\/\/)/.test(c.video || '');
    const head = `<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${esc(base)}/">
<meta property="og:type" content="website"><meta property="og:locale" content="pt_BR"><meta property="og:site_name" content="${esc(c.nome)}">
<meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(desc)}"><meta property="og:url" content="${esc(base)}/"><meta property="og:image" content="${esc(img)}">
<meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${esc(title)}"><meta name="twitter:description" content="${esc(desc)}"><meta name="twitter:image" content="${esc(img)}">
<link rel="icon" href="${esc(lg)}" type="image/png"><link rel="apple-touch-icon" href="${esc(lg)}">
<style id="tv">:root{${vars}}</style>${vid && c.videoCapa ? `\n<link rel="preload" as="image" href="${esc(abs(c.videoCapa))}">` : ''}
<script type="application/ld+json">${json(ld)}</script>`;
    const html = tpl
      .replace(/<title>[\s\S]*?<\/title>/, '').replace(/<meta name="description"[^>]*>/, '').replace(/<link rel="(?:icon|apple-touch-icon)"[^>]*>/g, '').replace(/<meta name="theme-color"[^>]*>/, `<meta name="theme-color" content="${globalThis.temaHex(c.tema)}">`)
      .replace('<!--SEO-->', () => head)
      .replace('<div id="app"></div>', () => `<div id="app" data-ssr="1">${globalThis.renderSite(c, rv)}</div>\n<script id="__d" type="application/json">${json({ c, rv })}</script>`);
    return new Response(html, { headers: { ...SEC, 'content-type': 'text/html; charset=utf-8', 'cache-control': 'public, max-age=0, must-revalidate', 'netlify-cdn-cache-control': 'public, max-age=60, stale-while-revalidate=600' } });
  } catch {
    // se algo falhar, entrega a versão normal do site (o navegador monta a página)
    if (/robots|sitemap/.test(u.pathname)) return new Response('', { status: 404 });
    return fetch(u.origin + '/index.html');
  }
};
