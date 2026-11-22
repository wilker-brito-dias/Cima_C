const A=document.getElementById('a'),E=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
let T=localStorage.cimaT,C;
const N={nome:'Nome do restaurante',slogan:'Frase abaixo do nome',titulo:'Título principal',intro:'Texto de apresentação',fotoPrincipal:'Foto principal (no arco)',sobreTitulo:'Título da seção sobre',sobreTexto:'Texto sobre o restaurante',fotoSobre:'Foto da seção sobre',pratosTitulo:'Título do cardápio',pratos:'Pratos em destaque',prato:'Prato',descricao:'Descrição',preco:'Preço',galeria:'Galeria de fotos (a primeira é a maior)',visiteTitulo:'Título da seção de visita',horarios:'Horários',dia:'Dia(s)',hora:'Horário',endereco:'Endereço',links:'Links dos botões',cardapio:'Cardápio completo (PDF ou página)',delivery:'Delivery',mapa:'Google Maps',reservas:'WhatsApp para reservas',whatsapp:'WhatsApp geral',instagram:'Instagram',foto:'Foto',item:'Item',fotoLogo:'Logo do restaurante (ícone na aba do navegador e ao salvar o site no celular)',siteUrl:'Endereço oficial do site (use depois de comprar o domínio, ex.: https://cimacarrico.com.br)',seoTitulo:'Título que aparece no Google (opcional)',seoDescricao:'Descrição que aparece no Google (opcional, até 155 caracteres)',fotoCompartilhar:'Imagem ao compartilhar o link no WhatsApp e Instagram (ideal 1200x630)',cardapioPaginas:'Cardápio em imagens, uma por página (opcional; funciona em qualquer celular)',tema:'Paleta de cores do site',video:'Vídeo do topo',videoCapa:'Capa do vídeo (imagem mostrada enquanto carrega)',rodapeTexto:'Texto do rodapé',credito:'Crédito no rodapé (opcional)',destaquesTitulo:'Título dos destaques',destaques:'Pratos em destaque',reservaTitulo:'Título da reserva',reservaTexto:'Texto da reserva',eventosTitulo:'Título dos eventos',eventosTexto:'Texto dos eventos',tiposEvento:'Tipos de evento (lista do formulário)',atalhos:'Atalhos de WhatsApp com texto pronto',rotulo:'Texto do botão',texto:'Mensagem que vai pronta no WhatsApp',avaliacoes:'Avaliações do Google (manual, se não houver integração)',cabecalho:'Título da seção',nota:'Nota (ex.: 4.8)',total:'Total de avaliações',itens:'Avaliações',autor:'Nome de quem avaliou',quando:'Quando (ex.: há 2 meses)',mapaBusca:'Busca do mapa (nome + cidade)',dias:'Dias (texto exibido)',d:'Dias da semana para o "aberto agora" (0=dom ... 6=sáb, ex.: 2-5)',abre:'Abre (HH:MM)',fecha:'Fecha (HH:MM)'};
const ab=u=>/^(https?:|data:|\/)/.test(u)?u:'/'+u;
const PRE=[['Vinho','354,46,9,40,66'],['Marrom café','22,44,9,38,66'],['Azul-noite','225,62,12,40,66'],['Verde floresta','150,40,9,40,66'],['Carvão','30,8,7,42,66']];
const themeUI=()=>{const T=C.tema,r=(k,a,b,cl,t,h)=>`<label>${t}<input type="range" class="${cl}" min="${a}" max="${b}" data-p="tema.${k}" value="${E(T[k])}"><small class="hint">${h}</small></label>`;
  return `<fieldset class="tm"><legend>Paleta de cores do site</legend><div class="chips">${PRE.map(([n,v])=>`<button type="button" class="chip" data-pre="${v}">${n}</button>`).join('')}</div>
  ${r('matiz',0,360,'hue','Cor do site','Deslize para escolher qualquer cor. O site inteiro acompanha, mantendo degradês e transparências.')}
  ${r('intensidade',0,100,'sat','Intensidade da cor','Do cinza suave até a cor mais viva.')}
  ${r('fundo',3,24,'dk','Escuridão dos fundos','Esquerda: mais escuro. Direita: mais claro.')}
  ${r('destaque',0,360,'hue','Cor dos botões e detalhes','Pode ser igual à cor do site ou diferente, para dar contraste.')}
  ${r('brilho',40,85,'lum','Brilho dos botões e detalhes','Mais baixo: mais forte. Mais alto: mais claro.')}
  <div class="pvw" id="pvw"><div class="pt"><b>Cimá Carriço</b><span>Um lugar para encontros que merecem boa mesa.</span><i>Reservar mesa</i></div><div class="pl"><b>Da cozinha</b><em>R$ 78</em></div></div></fieldset>`};
const pv=()=>{const e=document.getElementById('pvw');if(!e)return;aplicarTema(C.tema,e);const f=e.closest('fieldset');f.style.setProperty('--ph',C.tema.matiz);f.style.setProperty('--pa',C.tema.destaque)};
const lab=k=>N[k]||k;
const api=async(p,m,b)=>{const r=await fetch('/api/'+p,{method:m||'GET',headers:{'content-type':'application/json',authorization:'Bearer '+T},body:b&&JSON.stringify(b)}),j=await r.json().catch(()=>({}));if(!r.ok)throw Error(j.erro||'Algo deu errado.');return j};
const toast=t=>{const d=document.getElementById('t');d.textContent=t;d.className='on';setTimeout(()=>d.className='',2600)};
const parent=a=>a.reduce((o,k)=>o[k],C);
const mg=(d,s)=>s==null?d:Array.isArray(d)?(Array.isArray(s)?s.map(x=>d[0]&&typeof d[0]=='object'?mg(d[0],x):x):d):d&&typeof d=='object'?Object.fromEntries(Object.keys(d).map(k=>[k,mg(d[k],s[k])])):s;
const blank=v=>Array.isArray(v)?[]:v&&typeof v=='object'?Object.fromEntries(Object.entries(v).map(([k,x])=>[k,blank(x)])):'';
const isImg=p=>/(^|\.)(foto\w*|videoCapa|galeria\.\d+|cardapioPaginas\.\d+)$/.test(p);
function ed(v,p,k){
  if(p==='tema')return themeUI();
  if(Array.isArray(v))return `<fieldset><legend>${lab(k)}</legend>${v.map((x,i)=>`<div class="row"><div>${ed(x,p+'.'+i,k=='galeria'||k=='cardapioPaginas'?'foto':'item')}</div><button type="button" data-del="${p}.${i}">Remover</button></div>`).join('')}<button type="button" data-add="${p}">Adicionar</button></fieldset>`;
  if(v&&typeof v=='object')return `<fieldset><legend>${lab(k)}</legend>${Object.keys(v).map(x=>ed(v[x],p+'.'+x,x)).join('')}</fieldset>`;
  if(isImg(p))return `<div><label>${lab(k)}${v?`<img class="pv" src="${E(ab(v))}" alt="">`:''}<input type="file" accept="image/*" data-img="${p}"></label>${v?`<button type="button" class="x" data-clr="${p}">Remover foto</button>`:''}</div>`;
  if(p==='video')return `<div><label>${lab(k)}${v?`<video class="pv" src="${E(ab(v))}" controls muted preload="metadata"></video>`:'<small>Nenhum vídeo no topo.</small>'}<input type="file" accept="video/mp4,video/webm" data-vid="video"></label><small class="hint">MP4 (H.264) ou WebM, até 25 MB. A capa é gerada sozinha.</small>${v?`<button type="button" class="x" data-clr="video">Remover vídeo</button>`:''}</div>`;
  return `<label>${lab(k)}${v.length>90?`<textarea data-p="${p}">${E(v)}</textarea>`:`<input data-p="${p}" value="${E(v)}">`}</label>`;
}
const readLogo=f=>new Promise((ok,no)=>{const r=new FileReader;r.onload=()=>{const i=new Image;i.onload=()=>{const S=512,c=document.createElement('canvas');c.width=c.height=S;const m=Math.min(i.width,i.height);c.getContext('2d').drawImage(i,(i.width-m)/2,(i.height-m)/2,m,m,0,0,S,S);ok(c.toDataURL('image/png'))};i.onerror=()=>no(Error('Formato não suportado. Use JPG, PNG ou WEBP.'));i.src=r.result};r.onerror=()=>no(Error('Não consegui ler o arquivo.'));r.readAsDataURL(f)});
const readImg=f=>new Promise((ok,no)=>{const r=new FileReader;r.onload=()=>{const i=new Image;i.onload=()=>{const s=Math.min(1,2000/Math.max(i.width,i.height)),c=document.createElement('canvas');c.width=Math.round(i.width*s);c.height=Math.round(i.height*s);c.getContext('2d').drawImage(i,0,0,c.width,c.height);ok(c.toDataURL('image/jpeg',.82))};i.onerror=()=>no(Error('Formato não suportado. Use JPG, PNG ou WEBP.'));i.src=r.result};r.onerror=()=>no(Error('Não consegui ler o arquivo.'));r.readAsDataURL(f)});
function login(msg=''){
  A.innerHTML=`<form class="card" id="f"><h1>Painel do site</h1><label>Usuário<input name="usuario" autocomplete="username" required></label><label>Senha<input name="senha" type="password" autocomplete="current-password" required></label><p class="err">${E(msg)}</p><button>Entrar</button></form>`;
  document.getElementById('f').onsubmit=async e=>{e.preventDefault();try{T=(await api('login','POST',Object.fromEntries(new FormData(e.target)))).token;localStorage.cimaT=T;panel()}catch(x){login(x.message)}};
}
const draw=()=>{A.innerHTML=`<header><b>Painel · ${E(C.nome)}</b><span><a href="/admin/relatorio.html">Relatório de visitas</a><a href="/" target="_blank">Ver o site</a><button class="g" id="out">Sair</button></span></header>
<div class="cols"><form id="ed">${Object.keys(C).map(k=>ed(C[k],k,k)).join('')}</form>
<div class="side"><form id="rb"><h2>Avaliações do Google</h2><p class="hint" id="gs">Verificando...</p>
<p class="hint"><b>Grátis, sem cartão:</b> crie uma conta no <a href="https://serpapi.com/users/sign_up?plan=free" target="_blank" rel="noopener">SerpApi</a>, copie a "Your Private API Key" do painel deles e cole abaixo.</p>
<label>Chave do SerpApi<input name="serp" type="password" autocomplete="off" placeholder="Cole aqui a chave"></label>
<button type="button" data-sk="1">Salvar chave e buscar avaliações</button>
<details><summary>API oficial do Google (exige cartão de crédito)</summary><label>Chave de API do Google<input name="chave" type="password" autocomplete="off" placeholder="Começa com AIza"></label><button type="button" data-gk="1">Salvar chave do Google</button></details>
<details><summary>Adicionar avaliações manualmente (opcional)</summary><p class="hint">Uma por linha: Nome | nota | texto</p><textarea name="t" rows="4" placeholder="Maria Souza | 5 | Atendimento excelente."></textarea><button>Adicionar avaliações</button></details></form><form id="ac"><h2>Usuário e senha</h2><label>Novo usuário (opcional)<input name="usuario" autocomplete="username"></label><label>Nova senha (mínimo 8 caracteres)<input name="novaSenha" type="password" autocomplete="new-password"></label><label>Senha atual<input name="senhaAtual" type="password" autocomplete="current-password" required></label><button>Salvar acesso</button></form></div></div>
<div class="bar"><button id="pub">Publicar alterações</button></div>`;gs();pv()};
const gs=()=>api('status').then(s=>{const g=document.getElementById('gs');if(!g)return;g.textContent=(s.google||s.serp)?(s.erro?`Chave cadastrada, mas: ${s.erro}`:`Conectado (${s.fonte}): ${s.itens} avaliações aparecendo no site automaticamente.`):'Nenhuma chave cadastrada ainda. Use a opção grátis abaixo.'}).catch(()=>{});
const redraw=()=>{const y=scrollY;draw();scrollTo(0,y)};
async function panel(){
  try{await api('me');try{localStorage.cimaNT='1'}catch{}{const d=await fetch('/content.json').then(r=>r.json()),s=await api('content');C=mg(d,s)}draw()}catch(e){login()}
}
A.oninput=e=>{const p=e.target.dataset.p;if(!p)return;const a=p.split('.'),l=a.pop();parent(a)[l]=e.target.value;if(p.startsWith('tema.'))pv()};
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
    else if(e.target.dataset.img){toast('Enviando foto...');const {url}=await api('upload','POST',{data:await (e.target.dataset.img==='fotoLogo'?readLogo:readImg)(f)});const a=e.target.dataset.img.split('.'),l=a.pop();parent(a)[l]=url;redraw();toast('Foto enviada. Clique em Publicar alterações.')}
  }catch(x){toast(x.message)}};
A.onclick=async e=>{
  const d=e.target.dataset;
  if(d.gk||d.sk){const i=document.querySelector('#rb [name='+(d.sk?'serp':'chave')+']');try{await api(d.sk?'skey':'gkey','POST',{chave:i.value});i.value='';toast('Chave salva. Buscando avaliações...');document.getElementById('gs').textContent='Buscando...';gs()}catch(x){toast(x.message)}}
  if(d.pre){const [m,i,f,de,b]=d.pre.split(',');C.tema={matiz:m,intensidade:i,fundo:f,destaque:de,brilho:b};redraw()}
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
