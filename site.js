const $ = s => document.querySelector(s);
const get = u => fetch(u).then(r => r.ok ? r.json() : null).catch(() => null);

// ---- contador de visitas (sem cookies, sem dados pessoais) ----
const nt = () => { try { return localStorage.cimaNT; } catch { return ''; } };
const track = e => {
  if (nt()) return; // navegador do painel não conta
  let r = ''; try { const h = new URL(document.referrer).hostname; if (h && h !== location.hostname) r = h; } catch {}
  const b = JSON.stringify({ e, r, u: new URLSearchParams(location.search).get('utm_source') || '' });
  try { if (navigator.sendBeacon && navigator.sendBeacon('/api/e', new Blob([b], { type: 'application/json' }))) return; } catch {}
  fetch('/api/e', { method: 'POST', body: b, keepalive: true, headers: { 'content-type': 'application/json' } }).catch(() => {});
};

(async () => {
  const app = document.getElementById('app'), pre = document.getElementById('__d'), ssr = !!(pre && app.dataset.ssr);
  let c, rv;
  if (ssr) { const j = JSON.parse(pre.textContent); c = j.c; rv = j.rv; get('/api/reviews'); }
  else { const [d, s, r] = await Promise.all([get('content.json'), get('/api/content'), get('/api/reviews')]); c = mg(d, s); rv = r; }
  const L = c.links, R = num(L.reservas), G = num(L.whatsapp), now = BR();
  aplicarTema(c.tema);
  const menuUrl = String(L.cardapio).replace(/\/view.*$/, '/preview');
  if (!ssr) { document.title = `${c.nome} - ${c.slogan}`; app.innerHTML = renderSite(c, rv); }
  else document.querySelectorAll('.st').forEach(e => { e.outerHTML = statHtml(c); });
  track('v');
  const hostOf = u => { try { return new URL(u).hostname; } catch { return 'x.invalid'; } };
  document.addEventListener('click', e => {
    const t = e.target.closest && e.target.closest('a,button'); if (!t) return;
    const h = t.getAttribute('href') || '';
    if (t.hasAttribute('data-menu')) track('cardapio');
    else if (/wa\.me/.test(h)) track('wa');
    else if (h.includes(hostOf(L.delivery))) track('delivery');
    else if (/maps\.app\.goo\.gl|google\.com\/maps|waze\.com/.test(h)) track('mapa');
    else if (/instagram\.com/.test(h)) track('insta');
    else if (h === '#reservas') track('reservar');
  }, true);


  const dlg=$('#mn'),h0=$('#h'),mb=$('.mb');
  mb.onclick=()=>{const o=h0.classList.toggle('open');mb.setAttribute('aria-expanded',o)};
  document.querySelectorAll('nav a,nav .lk').forEach(x=>x.addEventListener('click',()=>h0.classList.remove('open')));
  const pages=(c.cardapioPaginas||[]).filter(x=>/^(data:image\/|https:|\/api\/img\/|media\/)/.test(x)), mc=$('#mc'), embed=!/Android/i.test(navigator.userAgent);
  const openMenu=()=>{mc.innerHTML=pages.length?`<div class="mp">${pages.map((x,i)=>`<img src="${E(x)}" alt="Cardápio, página ${i+1}">`).join('')}</div>`:embed?`<iframe title="Cardápio" src="${E(menuUrl)}"></iframe>`:`<div class="mz"><p>Toque abaixo para abrir o cardápio completo em PDF.</p><a class="btn k" href="${U(L.cardapio)}" target="_blank" rel="noopener">Abrir cardápio em PDF</a></div>`;dlg.showModal();dlg.setAttribute('tabindex','-1');dlg.focus()};
  dlg.addEventListener('close',()=>{mc.innerHTML=''});
  document.querySelectorAll('[data-menu]').forEach(b=>b.onclick=openMenu);
  $('#mx').onclick=()=>dlg.close();
  dlg.onclick=e=>{if(e.target===dlg)dlg.close()};
  document.querySelectorAll('[data-s]').forEach(b=>b.onclick=()=>{const i=b.parentNode.querySelector('input');i.value=Math.max(1,Math.min(60,+i.value+ +b.dataset.s))});
  const today=new Date(Date.now()-new Date().getTimezoneOffset()*6e4).toISOString().slice(0,10);
  document.querySelectorAll('input[type=date]').forEach(i=>i.min=today);
  const plus=n=>new Date(Date.now()-new Date().getTimezoneOffset()*6e4+n*864e5).toISOString().slice(0,10);
  $('#rf [name=data]').value=plus(0);$('#rf [name=hora]').value='20:00';$('#ef [name=data]').value=plus(30);
  const fab=$('.fab'),seen=new Set();
  if(fab){const io=new IntersectionObserver(es=>{es.forEach(e=>e.isIntersecting?seen.add(e.target):seen.delete(e.target));fab.classList.toggle('hide',seen.size>0)});io.observe($('.two'));io.observe($('.hero'))}
  const go=(n,t)=>window.open(wa(n,t),'_blank','noopener');
  const fd=f=>Object.fromEntries(new FormData(f));
  const dt=x=>x.split('-').reverse().join('/');
  $('#rf').onsubmit=e=>{e.preventDefault();const f=fd(e.target);track('reserva');go(R,`Olá! Gostaria de reservar uma mesa no ${c.nome}.\n\nNome: ${f.nome}\nData: ${dt(f.data)}\nHorário: ${f.hora}\nPessoas: ${f.pessoas}${f.obs?`\nObservação: ${f.obs}`:''}`)};
  $('#ef').onsubmit=e=>{e.preventDefault();const f=fd(e.target);track('evento');go(R,`Olá! Gostaria de um orçamento para um evento no ${c.nome}.\n\nNome: ${f.nome}\nTipo de evento: ${f.tipo}\nData prevista: ${dt(f.data)}\nConvidados: ${f.conv}${f.obs?`\nMensagem: ${f.obs}`:''}`)};
  document.querySelectorAll('#lg,[data-top]').forEach(a=>a.onclick=e=>{e.preventDefault();h0.classList.remove('open');scrollTo({top:0,behavior:'smooth'});history.replaceState(null,'',location.pathname+location.search)});
  const rm=matchMedia('(prefers-reduced-motion: reduce)').matches, v=$('#hv');
  if(v){
    let on=true;
    const mute=()=>{v.muted=true;v.play().catch(()=>{})};
    const go=()=>{if(on&&!document.hidden)v.play().catch(mute)};
    v.muted=false;go(); // tenta tocar com som; se o navegador bloquear, começa mudo e liga o som no primeiro toque ou clique
    const unmute=()=>{v.muted=false;if(v.paused&&on)v.play().catch(mute)};
    ['pointerup','touchend','keydown','click'].forEach(ev=>addEventListener(ev,unmute,{once:true,passive:true}));
    new IntersectionObserver(([x])=>{on=x.isIntersecting;on?go():v.pause()}).observe(v);
    document.addEventListener('visibilitychange',()=>document.hidden?v.pause():go());
  }
  const qs=[...document.querySelectorAll('.rq')],ds=[...document.querySelectorAll('.dots button')];
  if(qs.length>1){let i=0,t;const go=n=>{i=(n+qs.length)%qs.length;qs.forEach((e,k)=>e.classList.toggle('on',k===i));ds.forEach((d,k)=>d.setAttribute('aria-current',k===i))};
    const run=()=>{clearInterval(t);if(!rm)t=setInterval(()=>go(i+1),7000)};
    ds.forEach((d,k)=>d.onclick=()=>{go(k);run()});const r=$('#rot');r.onmouseenter=()=>clearInterval(t);r.onmouseleave=run;run()}
  const h=$('#h');const sc=()=>h.classList.toggle('s',scrollY>40);sc();addEventListener('scroll',sc,{passive:true});
})();
