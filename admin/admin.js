const A=document.getElementById('a'),E=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
let T=localStorage.cimaT,C;
const N={nome:'Nome do restaurante',slogan:'Frase abaixo do nome',titulo:'Título principal',intro:'Texto de apresentação',fotoPrincipal:'Foto principal (no arco)',sobreTitulo:'Título da seção sobre',sobreTexto:'Texto sobre o restaurante',fotoSobre:'Foto da seção sobre',pratosTitulo:'Título do cardápio',pratos:'Pratos em destaque',prato:'Prato',descricao:'Descrição',preco:'Preço',galeria:'Galeria de fotos (a primeira é a maior)',visiteTitulo:'Título da seção de visita',horarios:'Horários',dia:'Dia(s)',hora:'Horário',endereco:'Endereço',links:'Links dos botões',cardapio:'Cardápio completo (PDF ou página)',delivery:'Delivery',mapa:'Google Maps',reservas:'WhatsApp para reservas',whatsapp:'WhatsApp geral',instagram:'Instagram',foto:'Foto',item:'Item',video:'Vídeo do topo',videoCapa:'Capa do vídeo (imagem mostrada enquanto carrega)',rodapeTexto:'Texto do rodapé',credito:'Crédito no rodapé (opcional)',destaquesTitulo:'Título dos destaques',destaques:'Pratos em destaque',reservaTitulo:'Título da reserva',reservaTexto:'Texto da reserva',eventosTitulo:'Título dos eventos',eventosTexto:'Texto dos eventos',tiposEvento:'Tipos de evento (lista do formulário)',atalhos:'Atalhos de WhatsApp com texto pronto',rotulo:'Texto do botão',texto:'Mensagem que vai pronta no WhatsApp',avaliacoes:'Avaliações do Google (manual, se não houver integração)',cabecalho:'Título da seção',nota:'Nota (ex.: 4.8)',total:'Total de avaliações',itens:'Avaliações',autor:'Nome de quem avaliou',quando:'Quando (ex.: há 2 meses)',mapaBusca:'Busca do mapa (nome + cidade)',dias:'Dias (texto exibido)',d:'Dias da semana para o "aberto agora" (0=dom ... 6=sáb, ex.: 2-5)',abre:'Abre (HH:MM)',fecha:'Fecha (HH:MM)'};
const ab=u=>/^(https?:|data:|\/)/.test(u)?u:'/'+u;
const lab=k=>N[k]||k;
const api=async(p,m,b)=>{const r=await fetch('/api/'+p,{method:m||'GET',headers:{'content-type':'application/json',authorization:'Bearer '+T},body:b&&JSON.stringify(b)}),j=await r.json().catch(()=>({}));if(!r.ok)throw Error(j.erro||'Algo deu errado.');return j};
const toast=t=>{const d=document.getElementById('t');d.textContent=t;d.className='on';setTimeout(()=>d.className='',2600)};
const parent=a=>a.reduce((o,k)=>o[k],C);
const mg=(d,s)=>s==null?d:Array.isArray(d)?(Array.isArray(s)?s.map(x=>d[0]&&typeof d[0]=='object'?mg(d[0],x):x):d):d&&typeof d=='object'?Object.fromEntries(Object.keys(d).map(k=>[k,mg(d[k],s[k])])):s;
const blank=v=>Array.isArray(v)?[]:v&&typeof v=='object'?Object.fromEntries(Object.entries(v).map(([k,x])=>[k,blank(x)])):'';
const isImg=p=>/(^|\.)(foto\w*|videoCapa|galeria\.\d+)$/.test(p);
function ed(v,p,k){
  if(Array.isArray(v))return `<fieldset><legend>${lab(k)}</legend>${v.map((x,i)=>`<div class="row"><div>${ed(x,p+'.'+i,k=='galeria'?'foto':'item')}</div><button type="button" data-del="${p}.${i}">Remover</button></div>`).join('')}<button type="button" data-add="${p}">Adicionar</button></fieldset>`;
  if(v&&typeof v=='object')return `<fieldset><legend>${lab(k)}</legend>${Object.keys(v).map(x=>ed(v[x],p+'.'+x,x)).join('')}</fieldset>`;
  if(isImg(p))return `<div><label>${lab(k)}${v?`<img class="pv" src="${E(ab(v))}" alt="">`:''}<input type="file" accept="image/*" data-img="${p}"></label>${v?`<button type="button" class="x" data-clr="${p}">Remover foto</button>`:''}</div>`;
  if(p==='video')return `<div><label>${lab(k)}${v?`<video class="pv" src="${E(ab(v))}" controls muted preload="metadata"></video>`:'<small>Nenhum vídeo no topo.</small>'}<input type="file" accept="video/mp4,video/webm" data-vid="video"></label><small class="hint">MP4 (H.264) ou WebM, até 25 MB. A capa é gerada sozinha.</small>${v?`<button type="button" class="x" data-clr="video">Remover vídeo</button>`:''}</div>`;
  return `<label>${lab(k)}${v.length>90?`<textarea data-p="${p}">${E(v)}</textarea>`:`<input data-p="${p}" value="${E(v)}">`}</label>`;
}
const readImg=f=>new Promise((ok,no)=>{const r=new FileReader;r.onload=()=>{const i=new Image;i.onload=()=>{const s=Math.min(1,1600/Math.max(i.width,i.height)),c=document.createElement('canvas');c.width=Math.round(i.width*s);c.height=Math.round(i.height*s);c.getContext('2d').drawImage(i,0,0,c.width,c.height);ok(c.toDataURL('image/jpeg',.82))};i.onerror=()=>no(Error('Formato não suportado. Use JPG, PNG ou WEBP.'));i.src=r.result};r.onerror=()=>no(Error('Não consegui ler o arquivo.'));r.readAsDataURL(f)});
function login(msg=''){
  A.innerHTML=`<form class="card" id="f"><h1>Painel do site</h1><label>Usuário<input name="usuario" autocomplete="username" required></label><label>Senha<input name="senha" type="password" autocomplete="current-password" required></label><p class="err">${E(msg)}</p><button>Entrar</button></form>`;
  document.getElementById('f').onsubmit=async e=>{e.preventDefault();try{T=(await api('login','POST',Object.fromEntries(new FormData(e.target)))).token;localStorage.cimaT=T;panel()}catch(x){login(x.message)}};
}
const draw=()=>{A.innerHTML=`<header><b>Painel · ${E(C.nome)}</b><span><a href="/" target="_blank">Ver o site</a><button class="g" id="out">Sair</button></span></header>
<div class="cols"><form id="ed">${Object.keys(C).map(k=>ed(C[k],k,k)).join('')}</form>
<div class="side"><form id="rb"><h2>Avaliações do Google</h2><p class="hint" id="gs">Verificando...</p><p class="hint">Para colar avaliações manualmente, escreva uma por linha: Nome | nota | texto</p><textarea name="t" rows="5" placeholder="Maria Souza | 5 | Atendimento excelente e comida deliciosa."></textarea><button>Adicionar avaliações</button></form><form id="ac"><h2>Usuário e senha</h2><label>Novo usuário (opcional)<input name="usuario" autocomplete="username"></label><label>Nova senha (mínimo 8 caracteres)<input name="novaSenha" type="password" autocomplete="new-password"></label><label>Senha atual<input name="senhaAtual" type="password" autocomplete="current-password" required></label><button>Salvar acesso</button></form></div></div>
<div class="bar"><button id="pub">Publicar alterações</button></div>`;gs()};
const gs=()=>api('status').then(s=>{const g=document.getElementById('gs');if(g)g.textContent=s.google?(s.erro?'Google conectado, mas: '+s.erro:`Google conectado: ${s.itens} avaliações aparecendo no site automaticamente.`):s.erro}).catch(()=>{});
const redraw=()=>{const y=scrollY;draw();scrollTo(0,y)};
async function panel(){
  try{await api('me');{const d=await fetch('/content.json').then(r=>r.json()),s=await api('content');C=mg(d,s)}draw()}catch(e){login()}
}
A.oninput=e=>{const p=e.target.dataset.p;if(!p)return;const a=p.split('.'),l=a.pop();parent(a)[l]=e.target.value};
const frame=f=>new Promise(ok=>{const u=URL.createObjectURL(f),v=document.createElement('video');let done=false;const end=x=>{if(done)return;done=true;URL.revokeObjectURL(u);ok(x)};v.muted=true;v.playsInline=true;v.preload='auto';v.onloadeddata=()=>{v.currentTime=.1};v.onseeked=()=>{try{const s=Math.min(1,1280/v.videoWidth),c=document.createElement('canvas');c.width=Math.round(v.videoWidth*s);c.height=Math.round(v.videoHeight*s);c.getContext('2d').drawImage(v,0,0,c.width,c.height);end(c.toDataURL('image/jpeg',.82))}catch{end(null)}};v.onerror=()=>end(null);v.src=u;setTimeout(()=>end(null),8000)});
async function sendVideo(f){
  const t=/webm/i.test(f.type)?'webm':'mp4',S=3.5e6,n=Math.ceil(f.size/S);
  if(!/^video\/(mp4|webm)$/.test(f.type))throw Error('Use um vídeo MP4 ou WebM.');
  if(f.size>25e6)throw Error('Vídeo grande demais (máximo 25 MB). Comprima antes de enviar.');
  const id=[...crypto.getRandomValues(new Uint8Array(8))].map(b=>b.toString(16).padStart(2,'0')).join('');let url;
  for(let i=0;i<n;i++){toast(`Enviando vídeo: parte ${i+1} de ${n}...`);
    const r=await fetch(`/api/vupload?id=${id}&i=${i}&n=${n}&t=${t}`,{method:'POST',headers:{authorization:'Bearer '+T,'content-type':'application/octet-stream'},body:f.slice(i*S,(i+1)*S)}),j=await r.json().catch(()=>({}));
    if(!r.ok)throw Error(j.erro||'Falha no envio do vídeo.');if(j.url)url=j.url}
  return url}
A.onchange=async e=>{
  const f=e.target.files&&e.target.files[0];if(!f)return;
  try{
    if(e.target.dataset.vid){C.video=await sendVideo(f);const fr=await frame(f);if(fr)C.videoCapa=(await api('upload','POST',{data:fr})).url;redraw();toast('Vídeo enviado. Clique em Publicar alterações.')}
    else if(e.target.dataset.img){toast('Enviando foto...');const {url}=await api('upload','POST',{data:await readImg(f)});const a=e.target.dataset.img.split('.'),l=a.pop();parent(a)[l]=url;redraw();toast('Foto enviada. Clique em Publicar alterações.')}
  }catch(x){toast(x.message)}};
A.onclick=async e=>{
  const d=e.target.dataset;
  if(d.clr){const a=d.clr.split('.'),l=a.pop();parent(a)[l]='';redraw()}
  if(d.add){const a=parent(d.add.split('.'));a.push(a.length?blank(a[0]):/itens$/.test(d.add)?{autor:'',nota:'5',texto:'',quando:''}:'');redraw()}
  if(d.del){const a=d.del.split('.'),i=a.pop();parent(a).splice(i,1);redraw()}
  if(e.target.id=='out'){localStorage.removeItem('cimaT');login()}
  if(e.target.id=='pub'){try{await api('content','PUT',C);toast('Publicado.')}catch(x){toast(x.message)}}
};
A.onsubmit=async e=>{
  if(e.target.id=='rb'){e.preventDefault();const L=String(new FormData(e.target).get('t')).split('\n').map(x=>x.split('|').map(y=>y.trim())).filter(x=>x.length>=3&&x[2]);
    if(!L.length)return toast('Use o formato: Nome | nota | texto');
    L.forEach(([autor,nota,...r])=>C.avaliacoes.itens.push({autor,nota:String(Math.max(1,Math.min(5,parseInt(nota)||5))),texto:r.join('|').trim(),quando:''}));redraw();return toast(`${L.length} avaliação(ões) adicionada(s). Clique em Publicar alterações.`)}

  if(e.target.id!='ac')return;e.preventDefault();
  try{T=(await api('credentials','POST',Object.fromEntries(new FormData(e.target)))).token;localStorage.cimaT=T;e.target.reset();toast('Acesso atualizado.')}catch(x){toast(x.message)}
};
panel();
