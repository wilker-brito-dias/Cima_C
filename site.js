const E=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const U=u=>/^(https?:|tel:|mailto:|#)/.test(u||'')?E(u):'#';
const num=u=>((u||'').match(/wa\.me\/(\d+)/)||[])[1]||'';
const wa=(n,t)=>`https://wa.me/${n}?text=${encodeURIComponent(t)}`;
const fone=n=>{n=String(n).replace(/^55/,'');return n.length>=10?`(${n.slice(0,2)}) ${n.slice(2,n.length-4)}-${n.slice(-4)}`:n};
const hh=t=>String(t).replace(':00','h').replace(':','h');
const $=s=>document.querySelector(s);
const ART=[
`<rect x='-60' y='-60' width='320' height='320' class='b0'/><rect x='28' y='48' width='144' height='104' rx='14' fill='#B07A45'/><circle cx='64' cy='86' r='11' fill='#5E6B2F'/><circle cx='90' cy='74' r='9' fill='#5E6B2F'/><path d='M112 68l32 9-8 30-34-6z' fill='#E8C65A'/><circle cx='68' cy='122' r='14' fill='#D93B25'/><path d='M104 120c10-9 28-9 38 2-10 11-28 11-38-2z' fill='#F4F5F2'/><circle cx='150' cy='132' r='8' fill='#5E6B2F'/>`,
`<rect x='-60' y='-60' width='320' height='320' class='b1'/><circle cx='100' cy='100' r='76' fill='#F4F5F2'/><circle cx='100' cy='100' r='58' fill='#D9622B'/><ellipse cx='96' cy='100' rx='34' ry='15' fill='#F2D9B8' transform='rotate(-25 96 100)'/><circle cx='70' cy='128' r='7' fill='#5E6B2F'/><circle cx='128' cy='72' r='7' fill='#5E6B2F'/><circle cx='132' cy='126' r='6' fill='#E8C65A'/>`,
`<rect x='-60' y='-60' width='320' height='320' class='b2'/><path d='M66 46h68l-8 74q-26 16-52 0z' fill='#F4F5F2' fill-opacity='.9'/><path d='M72 78h56l-4 42q-24 12-48 0z' fill='#E8C65A'/><rect x='96' y='122' width='8' height='38' fill='#F4F5F2'/><ellipse cx='100' cy='162' rx='28' ry='6' fill='#F4F5F2'/><circle cx='134' cy='48' r='15' fill='#5E9E3A'/><circle cx='134' cy='48' r='9' fill='#B6DB7A'/>`,
`<rect x='-60' y='-60' width='320' height='320' class='b3'/><ellipse cx='100' cy='146' rx='68' ry='16' fill='#F4F5F2'/><path d='M58 140q-8-60 42-66 50 6 42 66z' fill='#C9792B'/><path d='M62 118q38 14 76 0 4 16 3 22-41 12-82 0 0-8 3-22z' fill='#8A4A12'/><ellipse cx='100' cy='76' rx='30' ry='7' fill='#8A4A12'/>`];
const art=i=>`<div class="im"><svg viewBox='0 -25 200 250' preserveAspectRatio='xMidYMid slice' role='img' aria-label='Ilustração'>${ART[i%4]}</svg></div>`;
const pic=(s,i,a)=>s&&/^(data:image\/|https:|\/api\/img\/|media\/)/.test(s)?`<div class="im"><img src="${E(s)}" alt="${E(a)}" loading="lazy"></div>`:art(i);
const stars=n=>{n=Math.max(0,Math.min(5,Math.round(+n||0)));return '★'.repeat(n)+'☆'.repeat(5-n)};
const mg=(d,s)=>s==null?d:Array.isArray(d)?(Array.isArray(s)?s.map(x=>d[0]&&typeof d[0]=='object'?mg(d[0],x):x):d):d&&typeof d=='object'?Object.fromEntries(Object.keys(d).map(k=>[k,mg(d[k],s[k])])):s;
const get=u=>fetch(u).then(r=>r.ok?r.json():null).catch(()=>null);

(async()=>{
  const [d,s,rv]=await Promise.all([get('content.json'),get('/api/content'),get('/api/reviews')]);
  const c=mg(d,s), L=c.links, R=num(L.reservas), G=num(L.whatsapp);
  aplicarTema(c.tema);
  document.title=`${c.nome} - ${c.slogan}`;
  // aberto agora (horário de Brasília)
  const now=new Date(new Date().toLocaleString('en-US',{timeZone:'America/Sao_Paulo'}));
  const m=now.getHours()*60+now.getMinutes(), wd=now.getDay();
  const tm=t=>{const[h,i]=String(t).split(':').map(Number);return h*60+i};
  const inD=(x,w)=>{const[a,b=a]=String(x).split('-').map(Number);return a<=b?w>=a&&w<=b:w>=a||w<=b};
  const op=c.horarios.find(h=>inD(h.d,wd)&&m>=tm(h.abre)&&m<tm(h.fecha));
  const st=op?`<span class="st"><i></i>Aberto agora, até ${hh(op.fecha)}</span>`:`<span class="st f"><i></i>Fechado agora</span>`;
  const A=rv&&(rv.nota||(rv.itens||[]).length)?rv:c.avaliacoes, it=(A.itens||[]).filter(x=>x.texto);
  const vid=/^(media\/|\/api\/media\/|https:\/\/)/.test(c.video||'');
  const q=encodeURIComponent(c.mapaBusca||c.endereco);
  const menuUrl=String(L.cardapio).replace(/\/view.*$/,'/preview');
  const wTxt=`Olá! Vim pelo site do ${c.nome} e gostaria de falar com vocês.`;
  document.getElementById('app').innerHTML=`
  <header id="h"><div class="w"><a class="lg" id="lg" href="#topo" aria-label="${E(c.nome)}, voltar ao topo">${E(c.nome)}</a>
    <nav><button class="lk" data-menu>Cardápio</button><a href="#reservas">Reservas</a><a href="#eventos">Eventos</a><a href="#avaliacoes">Avaliações</a><a href="#visite">Como chegar</a></nav>
    <div class="hr"><a class="btn" href="#reservas">Reservar</a><button class="mb" type="button" aria-label="Abrir menu" aria-expanded="false"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 6h18M3 12h18M3 18h18"/></svg></button></div></div></header>
  <div class="hero" id="topo"${!vid&&c.videoCapa?` style="background-image:url('${E(c.videoCapa)}');background-size:cover;background-position:center"`:''}>
    ${vid?`<div class="vw"><video id="hv" class="hv" src="${E(c.video)}" loop playsinline preload="auto" poster="${E(c.videoCapa)}" aria-hidden="true"></video><div class="hs"></div></div>`:''}
    <div class="w hc"><h1>${E(c.titulo)}</h1><p>${E(c.intro)}</p>
      <a class="btn" href="#reservas">Reservar mesa</a><button class="btn o" data-menu>Ver cardápio</button><br>${st}</div>
  </div>
  <section><div class="w about">${pic(c.fotoSobre,0,c.sobreTitulo)}<div><h2>${E(c.sobreTitulo)}</h2><p>${E(c.sobreTexto)}</p></div></div></section>
  <section style="padding-top:0"><div class="w"><h2>${E(c.destaquesTitulo)}</h2>
    <div class="dest">${c.destaques.map((p,i)=>`<div class="cap">${pic(p.foto,i,p.prato)}<h3>${E(p.prato)}</h3><p>${E(p.descricao)}</p><b>${E(p.preco)}</b></div>`).join('')}</div>
    <div style="margin-top:36px"><button class="btn k" data-menu>Abrir cardápio completo</button><a class="btn o" style="color:hsl(var(--i))" href="${U(L.delivery)}" target="_blank" rel="noopener">Pedir no delivery</a></div></div></section>
  <section style="padding-top:0"><div class="w gal">${c.galeria.map((g,i)=>pic(g,i,'Foto do '+c.nome)).join('')}</div></section>
  <div class="dark"><section><div class="w">
    <div class="two"><div id="reservas"><h2>${E(c.reservaTitulo)}</h2><p>${E(c.reservaTexto)}</p>
      <form id="rf"><label>Nome<input name="nome" required maxlength="60" autocomplete="name"></label>
      <div class="f2"><label>Data<input type="date" name="data" required></label><label>Horário<input type="time" name="hora" required></label></div>
      <label>Quantidade de pessoas<div class="step"><button type="button" data-s="-1" aria-label="Menos uma pessoa">−</button><input name="pessoas" type="number" min="1" max="60" value="2" inputmode="numeric"><button type="button" data-s="1" aria-label="Mais uma pessoa">+</button></div></label>
      <label>Observação (opcional)<textarea name="obs" rows="2" maxlength="300" placeholder="Aniversário, cadeirinha de bebê, área externa"></textarea></label>
      <button class="btn">Enviar pelo WhatsApp</button></form></div>
    <div id="eventos"><h2>${E(c.eventosTitulo)}</h2><p>${E(c.eventosTexto)}</p>
      <form id="ef"><label>Nome<input name="nome" required maxlength="60" autocomplete="name"></label>
      <label>Tipo de evento<select name="tipo">${c.tiposEvento.map(t=>`<option>${E(t)}</option>`).join('')}</select></label>
      <div class="f2"><label>Data prevista<input type="date" name="data" required></label><label>Convidados<input name="conv" type="number" min="1" max="1000" value="30" inputmode="numeric"></label></div>
      <label>Mensagem (opcional)<textarea name="obs" rows="2" maxlength="300"></textarea></label>
      <button class="btn">Pedir orçamento pelo WhatsApp</button></form></div></div>
    <div class="chips">${c.atalhos.map(a=>`<a class="btn o" href="${U(wa(G,a.texto))}" target="_blank" rel="noopener">${E(a.rotulo)}</a>`).join('')}</div>
  </div></section></div>
  <section id="avaliacoes"><div class="w"><h2>${E(A.cabecalho||'Avaliações')}</h2>
    <div class="rvw${it.length?'':' n'}"><div>${A.nota?`<p class="nota"><b>${E(A.nota)}</b><span aria-label="Nota ${E(A.nota)} de 5">${stars(A.nota)}</span>${A.total?`<br><small>${E(A.total)} avaliações no Google</small>`:''}</p>`:''}
      ${it.length?'':'<p style="margin-bottom:20px">Já nos visitou? Conte como foi a sua experiência.</p>'}<a class="btn k" href="${U(L.mapa)}" target="_blank" rel="noopener">${it.length?'Ver todas no Google':'Avaliar no Google'}</a></div>
    <div>${it.length?`<div class="rot" id="rot">${it.map((x,i)=>`<blockquote class="rq${i?'':' on'}"><p>${E(x.texto)}</p><footer><span aria-label="${E(x.nota)} de 5">${stars(x.nota)}</span> ${E(x.autor)}${x.quando?`, ${E(x.quando)}`:''}</footer></blockquote>`).join('')}</div>${it.length>1?`<div class="dots">${it.map((_,i)=>`<button type="button" aria-label="Avaliação ${i+1}"${i?'':' aria-current="true"'}></button>`).join('')}</div>`:''}`:''}</div></div></div></section>
  <section id="visite" style="padding-top:0"><div class="w map">
    <div><h2>${E(c.visiteTitulo)}</h2><address>${E(c.endereco)}</address>${st}
      <dl>${c.horarios.map(h=>`<div><dt>${E(h.dias)}</dt><dd>${hh(h.abre)} às ${hh(h.fecha)}</dd></div>`).join('')}</dl>
      <div style="margin-top:28px"><a class="btn k" href="${U(L.mapa)}" target="_blank" rel="noopener">Abrir no Google Maps</a><a class="btn o" style="color:hsl(var(--i))" href="https://waze.com/ul?q=${q}&navigate=yes" target="_blank" rel="noopener">Abrir no Waze</a></div></div>
    <iframe title="Mapa" loading="lazy" referrerpolicy="no-referrer-when-downgrade" src="https://www.google.com/maps?q=${q}&output=embed"></iframe></div></section>
  <div class="dark ft"><div class="w ftg">
    <div><a class="fb" href="#topo" data-top>${E(c.nome)}</a><p>${E(c.rodapeTexto)}</p><a class="btn" href="#reservas">Reservar mesa</a></div>
    <div><h4>Horários</h4>${c.horarios.map(h=>`<p>${E(h.dias)}: ${hh(h.abre)} às ${hh(h.fecha)}</p>`).join('')}</div>
    <div><h4>Endereço</h4><p>${E(c.endereco)}</p><p><a href="${U(L.mapa)}" target="_blank" rel="noopener">Abrir no Google Maps</a></p><p><a href="https://waze.com/ul?q=${q}&navigate=yes" target="_blank" rel="noopener">Abrir no Waze</a></p></div>
    <div><h4>Contato</h4><p><a href="${U(L.reservas)}" target="_blank" rel="noopener">Reservas: ${fone(R)}</a></p><p><a href="${U(L.whatsapp)}" target="_blank" rel="noopener">WhatsApp: ${fone(G)}</a></p><p><a href="${U(L.instagram)}" target="_blank" rel="noopener">Instagram</a></p><p><a href="${U(L.delivery)}" target="_blank" rel="noopener">Delivery</a></p><p><button class="lk" data-menu>Ver cardápio</button></p></div>
  </div><div class="w fb2"><span>© ${now.getFullYear()} ${E(c.nome)}. Todos os direitos reservados.</span>${c.credito?`<span>${E(c.credito)}</span>`:''}</div></div>
  <a class="fab" aria-label="Falar pelo WhatsApp" href="${U(wa(G,wTxt))}" target="_blank" rel="noopener"><svg viewBox="0 0 24 24"><path d="M12 2a10 10 0 0 0-8.6 15L2 22l5.2-1.4A10 10 0 1 0 12 2zm0 2a8 8 0 1 1-4.200 14.800l-.3-.2-2.600.7.700-2.500-.2-.3A8 8 0 0 1 12 4z"/><path d="M8.500 7.500c-.3.300-.8.900-.8 1.800 0 1.700 1.800 3.800 3.400 4.800 1.400.8 2.200.9 2.900.8.600-.1 1.300-.7 1.500-1.300l-1.800-1-.8.800c-.8-.3-2-1.200-2.600-2.400l.7-.8-.9-1.900z"/></svg></a>
  <dialog id="mn" aria-label="Cardápio"><div class="mh"><b>Cardápio</b><span><a href="${U(L.cardapio)}" target="_blank" rel="noopener">Abrir em nova aba</a><button type="button" id="mx">Fechar</button></span></div><iframe id="mf" title="Cardápio"></iframe></dialog>`;

  const dlg=$('#mn'),h0=$('#h'),mb=$('.mb');
  mb.onclick=()=>{const o=h0.classList.toggle('open');mb.setAttribute('aria-expanded',o)};
  document.querySelectorAll('nav a,nav .lk').forEach(x=>x.addEventListener('click',()=>h0.classList.remove('open')));
  document.querySelectorAll('[data-menu]').forEach(b=>b.onclick=()=>{$('#mf').src=menuUrl;dlg.showModal()});
  $('#mx').onclick=()=>dlg.close();
  dlg.onclick=e=>{if(e.target===dlg)dlg.close()};
  document.querySelectorAll('[data-s]').forEach(b=>b.onclick=()=>{const i=b.parentNode.querySelector('input');i.value=Math.max(1,Math.min(60,+i.value+ +b.dataset.s))});
  const today=new Date(Date.now()-new Date().getTimezoneOffset()*6e4).toISOString().slice(0,10);
  document.querySelectorAll('input[type=date]').forEach(i=>i.min=today);
  const go=(n,t)=>window.open(wa(n,t),'_blank','noopener');
  const fd=f=>Object.fromEntries(new FormData(f));
  const dt=x=>x.split('-').reverse().join('/');
  $('#rf').onsubmit=e=>{e.preventDefault();const f=fd(e.target);go(R,`Olá! Gostaria de reservar uma mesa no ${c.nome}.\n\nNome: ${f.nome}\nData: ${dt(f.data)}\nHorário: ${f.hora}\nPessoas: ${f.pessoas}${f.obs?`\nObservação: ${f.obs}`:''}`)};
  $('#ef').onsubmit=e=>{e.preventDefault();const f=fd(e.target);go(R,`Olá! Gostaria de um orçamento para um evento no ${c.nome}.\n\nNome: ${f.nome}\nTipo de evento: ${f.tipo}\nData prevista: ${dt(f.data)}\nConvidados: ${f.conv}${f.obs?`\nMensagem: ${f.obs}`:''}`)};
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
