const A=document.getElementById('a'),E=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
let T=localStorage.cimaT,C;
const N={nome:'Nome do restaurante',slogan:'Frase abaixo do nome',titulo:'Título principal',intro:'Texto de apresentação',fotoPrincipal:'Foto principal (no arco)',sobreTitulo:'Título da seção sobre',sobreTexto:'Texto sobre o restaurante',fotoSobre:'Foto da seção sobre',pratosTitulo:'Título do cardápio',pratos:'Pratos em destaque',prato:'Prato',descricao:'Descrição',preco:'Preço',galeria:'Galeria de fotos (a primeira é a maior)',visiteTitulo:'Título da seção de visita',horarios:'Horários',dia:'Dia(s)',hora:'Horário',endereco:'Endereço',links:'Links dos botões',cardapio:'Cardápio completo (PDF ou página)',delivery:'Delivery',mapa:'Google Maps',reservas:'WhatsApp para reservas',whatsapp:'WhatsApp geral',instagram:'Instagram',foto:'Foto',item:'Item',destaquesTitulo:'Título dos destaques',destaques:'Pratos em destaque',reservaTitulo:'Título da reserva',reservaTexto:'Texto da reserva',eventosTitulo:'Título dos eventos',eventosTexto:'Texto dos eventos',tiposEvento:'Tipos de evento (lista do formulário)',atalhos:'Atalhos de WhatsApp com texto pronto',rotulo:'Texto do botão',texto:'Mensagem que vai pronta no WhatsApp',avaliacoes:'Avaliações do Google (manual, se não houver integração)',cabecalho:'Título da seção',nota:'Nota (ex.: 4.8)',total:'Total de avaliações',itens:'Avaliações',autor:'Nome de quem avaliou',quando:'Quando (ex.: há 2 meses)',mapaBusca:'Busca do mapa (nome + cidade)',dias:'Dias (texto exibido)',d:'Dias da semana para o "aberto agora" (0=dom ... 6=sáb, ex.: 2-5)',abre:'Abre (HH:MM)',fecha:'Fecha (HH:MM)'};
const lab=k=>N[k]||k;
const api=async(p,m,b)=>{const r=await fetch('/api/'+p,{method:m||'GET',headers:{'content-type':'application/json',authorization:'Bearer '+T},body:b&&JSON.stringify(b)}),j=await r.json().catch(()=>({}));if(!r.ok)throw Error(j.erro||'Algo deu errado.');return j};
const toast=t=>{const d=document.getElementById('t');d.textContent=t;d.className='on';setTimeout(()=>d.className='',2600)};
const parent=a=>a.reduce((o,k)=>o[k],C);
const blank=v=>Array.isArray(v)?[]:v&&typeof v=='object'?Object.fromEntries(Object.entries(v).map(([k,x])=>[k,blank(x)])):'';
const isImg=p=>/(^|\.)(foto\w*|galeria\.\d+)$/.test(p);
function ed(v,p,k){
  if(Array.isArray(v))return `<fieldset><legend>${lab(k)}</legend>${v.map((x,i)=>`<div class="row"><div>${ed(x,p+'.'+i,k=='galeria'?'foto':'item')}</div><button type="button" data-del="${p}.${i}">Remover</button></div>`).join('')}<button type="button" data-add="${p}">Adicionar</button></fieldset>`;
  if(v&&typeof v=='object')return `<fieldset><legend>${lab(k)}</legend>${Object.keys(v).map(x=>ed(v[x],p+'.'+x,x)).join('')}</fieldset>`;
  if(isImg(p))return `<label>${lab(k)}${v?`<img class="pv" src="${E(v)}" alt="">`:''}<input type="file" accept="image/*" data-img="${p}"></label>`;
  return `<label>${lab(k)}${v.length>90?`<textarea data-p="${p}">${E(v)}</textarea>`:`<input data-p="${p}" value="${E(v)}">`}</label>`;
}
const pack=f=>new Promise(r=>{const i=new Image;i.onload=()=>{const s=Math.min(1,1400/i.width),c=document.createElement('canvas');c.width=i.width*s;c.height=i.height*s;c.getContext('2d').drawImage(i,0,0,c.width,c.height);r(c.toDataURL('image/jpeg',.8))};i.src=URL.createObjectURL(f)});
function login(msg=''){
  A.innerHTML=`<form class="card" id="f"><h1>Painel do site</h1><label>Usuário<input name="usuario" autocomplete="username" required></label><label>Senha<input name="senha" type="password" autocomplete="current-password" required></label><p class="err">${E(msg)}</p><button>Entrar</button></form>`;
  document.getElementById('f').onsubmit=async e=>{e.preventDefault();try{T=(await api('login','POST',Object.fromEntries(new FormData(e.target)))).token;localStorage.cimaT=T;panel()}catch(x){login(x.message)}};
}
const draw=()=>{A.innerHTML=`<header><b>Painel · ${E(C.nome)}</b><span><a href="/" target="_blank">Ver o site</a><button class="g" id="out">Sair</button></span></header>
<div class="cols"><form id="ed">${Object.keys(C).map(k=>ed(C[k],k,k)).join('')}</form>
<form id="ac"><h2>Usuário e senha</h2><label>Novo usuário (opcional)<input name="usuario" autocomplete="username"></label><label>Nova senha (mínimo 8 caracteres)<input name="novaSenha" type="password" autocomplete="new-password"></label><label>Senha atual<input name="senhaAtual" type="password" autocomplete="current-password" required></label><button>Salvar acesso</button></form></div>
<div class="bar"><button id="pub">Publicar alterações</button></div>`};
const redraw=()=>{const y=scrollY;draw();scrollTo(0,y)};
async function panel(){
  try{await api('me');C=await api('content')||await fetch('/content.json').then(r=>r.json());draw()}catch(e){login()}
}
A.oninput=e=>{const p=e.target.dataset.p;if(!p)return;const a=p.split('.'),l=a.pop();parent(a)[l]=e.target.value};
A.onchange=async e=>{const p=e.target.dataset.img;if(!p||!e.target.files[0])return;const a=p.split('.'),l=a.pop();parent(a)[l]=await pack(e.target.files[0]);redraw()};
A.onclick=async e=>{
  const d=e.target.dataset;
  if(d.add){const a=parent(d.add.split('.'));a.push(a.length?blank(a[0]):/itens$/.test(d.add)?{autor:'',nota:'5',texto:'',quando:''}:'');redraw()}
  if(d.del){const a=d.del.split('.'),i=a.pop();parent(a).splice(i,1);redraw()}
  if(e.target.id=='out'){localStorage.removeItem('cimaT');login()}
  if(e.target.id=='pub'){try{await api('content','PUT',C);toast('Publicado.')}catch(x){toast(x.message)}}
};
A.onsubmit=async e=>{
  if(e.target.id!='ac')return;e.preventDefault();
  try{T=(await api('credentials','POST',Object.fromEntries(new FormData(e.target)))).token;localStorage.cimaT=T;e.target.reset();toast('Acesso atualizado.')}catch(x){toast(x.message)}
};
panel();
