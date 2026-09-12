import {PRODUCTS,STORE,productById,variant,variantImage,variantKey,money} from './catalog.js';
import {cleanCart,quote,validateProfile,whatsappMessage} from './commerce.js';
import {readState,writeState,currentUser,blankProfile,credential,checkPassword,points} from './storage.js';

const $=selector=>document.querySelector(selector);
const $$=selector=>[...document.querySelectorAll(selector)];
const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let state=readState(); state.cart=cleanCart(state.cart);
let category='todos',search='',sort='featured',authMode='login',accountTab='profile',toastTimer;
const selections=Object.fromEntries(PRODUCTS.map(p=>[p.id,{flavor:0,size:0}]));
let shipping={method:'pickup',cep:''};
let receipt=null;
const user=()=>currentUser(state);
const favorites=()=>user()?.favorites||state.guestFavorites;
function toast(message) {clearTimeout(toastTimer);$('#toast').textContent=message;$('#toast').hidden=false;toastTimer=setTimeout(()=>$('#toast').hidden=true,4200);}
function save() {
  try {writeState(state);} catch {state=readState();throw new Error('Não foi possível salvar neste navegador. Libere o armazenamento local e tente novamente.');}
}
function showDialog(id) {const d=$(id),heading=d.querySelector('h2');if(heading){heading.id=heading.id||`${d.id}-title`;d.setAttribute('aria-labelledby',heading.id);}if(!d.open)d.showModal();}
function closeDialogs() {$$('dialog[open]').forEach(d=>d.close());}
const wa=message=>`https://wa.me/${STORE.phone}?text=${encodeURIComponent(message)}`;
function safely(action) {return async event=>{try {await action(event);} catch(error){toast(error.message||'Não foi possível concluir. Tente novamente.');}};}
function renderHeader() {
  const u=user();
  $('#user-label').innerHTML=u?`Olá, ${esc(u.profile.name.split(' ')[0])}<small>Minha conta ▾</small>`:'Minha conta<small>Entrar / Cadastrar</small>';
  $('#account-button').setAttribute('aria-label',u?'Abrir menu da minha conta':'Entrar ou cadastrar');
  $('#account-button').setAttribute('aria-expanded',String(!$('#account-dropdown').hidden));
  $('#cart-count').textContent=state.cart.reduce((s,l)=>s+l.qty,0);
  $('#wishlist-count').textContent=favorites().length;
  $('#dropdown-name').textContent=u?.profile.name||'';
}
function productCard(p) {
  const s=selections[p.id],v=variant(p.id,s.flavor,s.size),liked=favorites().includes(p.id);
  return `<article class="product-card" data-product="${p.id}"><div class="product-picture"><span class="product-badge">${p.badge}</span><button class="favorite" data-favorite="${p.id}" aria-pressed="${liked}" aria-label="${liked?'Remover':'Salvar'} ${esc(p.name)} nos favoritos">${liked?'♥':'♡'}</button><img src="${variantImage(v)}" width="300" height="300" loading="lazy" alt="Imagem ilustrativa: ${esc(v.name)}, ${esc(v.flavor)}, ${esc(v.size)}"></div><div class="product-details"><div class="product-meta"><span>${p.brand}</span><span class="rating" aria-label="Avaliação fictícia ${p.rating} de 5">★ ${p.rating} <small>demo</small></span></div><h3>${p.name}</h3><div class="product-variants"><label>Sabor<select data-flavor="${p.id}" aria-label="Sabor de ${p.name}">${p.flavors.map((f,i)=>`<option value="${i}" ${s.flavor===i?'selected':''}>${f}</option>`).join('')}</select></label><label>Tamanho<select data-size="${p.id}" aria-label="Tamanho de ${p.name}">${p.sizes.map((z,i)=>`<option value="${i}" ${s.size===i?'selected':''}>${z.label}</option>`).join('')}</select></label></div><button class="nutrition-button" data-nutrition="${p.id}">Ver tabela nutricional ↗</button><p class="old-price"><s>${money(v.full)}</s> <span>−5% no Pix</span></p><div class="price"><strong>${money(v.pix)}</strong><span>no Pix</span></div><p class="installments">ou 3x de ${money(Math.ceil(v.full/3))} no cartão*</p><button class="btn primary full" data-add="${p.id}">Adicionar ao carrinho <span>＋</span></button><button class="buy-now" data-buy="${p.id}">Comprar agora</button></div></article>`;
}
function renderProducts() {
  let list=PRODUCTS.filter(p=>(category==='todos'||p.category===category)&&`${p.name} ${p.brand} ${p.flavors.join(' ')}`.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().includes(search.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase()));
  if(sort!=='featured') list.sort((a,b)=>{const x=selections[a.id],y=selections[b.id];return (variant(a.id,x.flavor,x.size).pix-variant(b.id,y.flavor,y.size).pix)*(sort==='low'?1:-1);});
  $('#products').innerHTML=list.length?list.map(productCard).join(''):'<div class="empty"><h3>Nenhum suplemento encontrado.</h3><p>Tente outro termo ou veja todas as categorias.</p><button class="btn line-btn" data-reset-search>Limpar busca e filtros</button></div>';
  $('#result-count').textContent=`${list.length} ${list.length===1?'produto encontrado':'produtos encontrados'}`;
  $$('[data-filter]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.filter===category)));
}
function toggleFavorite(id) {
  if(!productById(id)) return;
  const list=favorites(),index=list.indexOf(id);if(index<0)list.push(id);else list.splice(index,1);
  save();renderHeader();renderProducts();if($('#account-dialog').open&&accountTab==='favorites')renderAccount();
  toast(index<0?'Salvo nos favoritos deste navegador.':'Produto removido dos favoritos.');
}
function add(id,flavor=selections[id].flavor,size=selections[id].size,announce=true) {
  const v=variant(id,flavor,size),line=state.cart.find(l=>variantKey(l.id,l.flavor,l.size)===v.key);
  if(line?.qty>=10) throw new Error('Limite demonstrativo: 10 unidades por variação.');
  if(line) line.qty++;else state.cart.push({id,flavor,size,qty:1});
  save();renderHeader();if(announce)toast(`${v.name} adicionado ao carrinho.`);
}
function totalsHtml(q) {return `<div class="totals"><div><span>Produtos no Pix</span><span>${money(q.pix)}</span></div>${q.combo?`<div class="discount"><span>Desconto do trio (10%)</span><span>− ${money(q.combo)}</span></div>`:''}<div><span>${shipping.method==='pickup'?'Retirada':'Frete simulado'}</span><span>${q.freight===null?'A calcular':q.freight===0?'Grátis':money(q.freight)}</span></div><div class="total"><span>Total no Pix</span><span>${q.total===null?'A calcular':money(q.total)}</span></div><div><span>Pontos após entrega simulada</span><span>${q.points} pts</span></div></div>`;}
function updateTotals() {
  const q=quote(state.cart,shipping.method,shipping.cep);
  $('#cart-totals').innerHTML=totalsHtml(q);
  $('#progress').value=Math.min(q.subtotal,STORE.freeShipping);
  $('#progress-text').textContent=q.subtotal>=STORE.freeShipping?'Frete grátis simulado liberado para os CEPs atendidos!':`Faltam ${money(STORE.freeShipping-q.subtotal)} para frete grátis simulado na entrega local.`;
  $('#shipping-result').textContent=shipping.method==='pickup'?q.estimate:`${q.estimate}${q.available?' · '+money(q.freight):''}`;
  $('#checkout-button').disabled=!q.quantity||!q.available;
}
function renderCart() {
  const q=quote(state.cart,shipping.method,shipping.cep);
  $('#drawer-count').textContent=`(${q.quantity})`;
  $('#cart-items').innerHTML=q.lines.length?q.lines.map(l=>`<article class="cart-line"><img src="${variantImage(l)}" alt="${esc(l.name)}" width="65" height="78"><div><h3>${l.name}</h3><p>${esc(l.flavor)} · ${esc(l.size)}</p><div class="cart-line-bottom"><div class="quantity"><button data-quantity="${l.key}" data-step="-1" aria-label="Diminuir quantidade de ${l.name}">−</button><span>${l.qty}</span><button data-quantity="${l.key}" data-step="1" aria-label="Aumentar quantidade de ${l.name}" ${l.qty>=10?'disabled':''}>＋</button></div><strong>${money(l.pix*l.qty)}</strong></div><button class="remove-item" data-remove="${l.key}">Remover</button></div></article>`).join(''):'<div class="empty"><h3>Seu carrinho está esperando.</h3><p>Explore o catálogo e escolha seus favoritos.</p><button class="btn line-btn" data-close>Continuar comprando</button></div>';
  const form=$('#shipping-form');form.elements.method.value=shipping.method;form.elements.cep.value=shipping.cep;form.hidden=!q.quantity;
  $('.shipping-progress').hidden=!q.quantity;$('#cart-totals').hidden=!q.quantity;
  updateTotals();
}
function openCart() {closeDialogs();if(!shipping.cep&&user()?.profile.cep)shipping.cep=user().profile.cep;renderCart();showDialog('#cart-dialog');}
function changeQuantity(key,step) {
  const index=state.cart.findIndex(l=>variantKey(l.id,l.flavor,l.size)===key);if(index<0)return;
  state.cart[index].qty+=step;if(state.cart[index].qty<=0)state.cart.splice(index,1);
  state.cart=cleanCart(state.cart);save();renderHeader();renderCart();
}
function profileFields(profile,delivery=false,checkout=false) {
  const field=(name,label,extra='',wide=false)=>`<label class="${wide?'wide':''}">${label}<input name="${name}" value="${esc(profile[name])}" ${extra}></label>`;
  return `<div class="profile-grid">${field('name','Nome completo','required minlength="2" maxlength="80" autocomplete="name"')}${field('phone','Telefone / WhatsApp','required inputmode="tel" maxlength="20" autocomplete="tel"')}${!checkout?field('cpf','CPF (opcional)','inputmode="numeric" maxlength="14"') :''}${!checkout||delivery?`${field('cep','CEP',`${delivery?'required':''} inputmode="numeric" maxlength="9" autocomplete="postal-code"`)}${field('street','Rua',`${delivery?'required':''} maxlength="120" autocomplete="address-line1"`,true)}${field('number','Número',`${delivery?'required':''} maxlength="12"`)}${field('neighborhood','Bairro',`${delivery?'required':''} maxlength="80"`)}${field('complement','Complemento (opcional)','maxlength="100" autocomplete="address-line2"',true)}<p class="account-note wide">Cidade da simulação: Foz do Iguaçu / PR. Os CEPs 85850–85859 são usados apenas para demonstrar regras de entrega.</p>`:''}</div>`;
}
function profileFrom(form,base=blankProfile()) {const p={...base};for(const key of Object.keys(p)){const input=form.elements.namedItem(key);if(input)p[key]=input.value.trim();}return p;}
function orderMarkup(o) {
  return `<article class="order"><header><div><strong>${esc(o.id)}</strong><small>${new Date(o.createdAt).toLocaleString('pt-BR')}</small></div><span class="status ${o.status==='Entregue'?'delivered':''}">${esc(o.status)}</span></header><ul>${o.items.map(i=>`<li>${i.qty}× ${esc(i.name)} · ${esc(i.flavor)} · ${esc(i.size)}</li>`).join('')}</ul><div class="order-total">${money(o.total)} no Pix</div><p class="account-note">${o.method==='pickup'?'Retirada na loja':`Entrega: ${esc(o.profile.street)}, ${esc(o.profile.number)} — ${esc(o.profile.neighborhood)}`}</p><div class="order-actions"><a class="btn line-btn" href="${esc(wa(whatsappMessage(o,money)))}" target="_blank" rel="noopener noreferrer">Reabrir resumo no WhatsApp ↗</a></div><details><summary>Simular status deste pedido</summary><p>Controle de demonstração local. Não altera o atendimento da loja nem confirma uma compra. Pontos aparecem apenas no status Entregue.</p><label>Status simulado<select data-order-status="${esc(o.id)}">${['Pendente','Em Separação','Entregue'].map(s=>`<option ${s===o.status?'selected':''}>${s}</option>`).join('')}</select></label></details></article>`;
}
function renderAccount() {
  const u=user();
  $('#account-title').textContent=u?`Olá, ${u.profile.name.split(' ')[0]}.`:'Seus favoritos.';
  $$('[data-account-tab]').forEach(b=>{b.setAttribute('aria-pressed',String(b.dataset.accountTab===accountTab));b.hidden=!u&&b.dataset.accountTab!=='favorites';});
  const target=$('#account-content');
  if(accountTab==='favorites') {
    const list=PRODUCTS.filter(p=>favorites().includes(p.id));
    target.innerHTML=(!u?'<p class="local-notice">Seus favoritos estão salvos neste navegador. Entre em uma conta local para associá-los ao seu perfil.</p>':'')+(list.length?list.map(p=>`<article class="favorite-row"><img src="assets/${p.image}" alt="${esc(p.name)}"><div><h3>${p.name}</h3><p>A partir de ${money(variant(p.id).pix)} no Pix</p></div><button class="btn line-btn" data-add="${p.id}">Adicionar</button><button data-favorite="${p.id}" aria-label="Remover ${p.name} dos favoritos">×</button></article>`).join(''):'<div class="empty"><h3>Sua próxima escolha começa aqui.</h3><p>Toque no coração de um produto para encontrá-lo nesta lista.</p></div>');return;
  }
  if(!u)return;
  if(accountTab==='profile')target.innerHTML=`<p class="local-notice">Dados salvos somente neste navegador. Use informações fictícias durante os testes. CPF não é enviado ao WhatsApp.</p><form id="profile-form">${profileFields(u.profile)}<p class="account-note">E-mail da conta: ${esc(u.email)}</p><p class="form-error" id="profile-error" role="alert"></p><button type="submit" class="btn dark-btn">Salvar meus dados ↗</button></form>`;
  if(accountTab==='orders')target.innerHTML='<p class="local-notice">Histórico local de pedidos preparados. Status simulados não refletem pagamento ou confirmação da loja.</p>'+(u.orders.length?[...u.orders].reverse().map(orderMarkup).join(''):'<div class="empty"><h3>Seu primeiro pedido vem aí.</h3><p>Os pedidos preparados no checkout aparecerão aqui.</p></div>');
  if(accountTab==='points')target.innerHTML=`<div class="points-card"><span>SEU SALDO DEMONSTRATIVO</span><strong>${points(u)} <span style="font-size:22px;letter-spacing:0">pts</span></strong><small>${u.orders.filter(o=>o.status==='Entregue').length} pedido(s) com entrega simulada</small></div><h3>Uma rotina que soma.</h3><p class="points-rules">A cada R$ 1 em produtos, após os descontos e sem frete, você acumula 1 ponto quando o pedido é marcado como entregue no simulador.</p><p class="local-notice">Pontos não têm valor financeiro, não são cashback real e não podem ser resgatados neste protótipo. Mudar um pedido de volta para pendente remove seus pontos. Nenhum pedido pontua duas vezes.</p>`;
}
function openAccount(tab='profile') {accountTab=tab;$('#account-dropdown').hidden=true;renderHeader();closeDialogs();if(!user()&&tab!=='favorites'){setAuth('login');showDialog('#auth-dialog');return;}renderAccount();showDialog('#account-dialog');}
function setAuth(mode) {
  authMode=mode;$$('[data-auth]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.auth===mode)));
  $('#register-name').hidden=mode!=='register';$('#auth-form').elements.name.required=mode==='register';$('#auth-form').elements.password.autocomplete=mode==='register'?'new-password':'current-password';
  $('#auth-submit').textContent=mode==='register'?'Criar minha conta local ↗':'Entrar na minha conta ↗';$('#auth-error').textContent='';
}
function completeLogin(u) {
  state.session=u.id;shipping.cep=u.profile.cep||'';u.favorites=[...new Set([...u.favorites,...state.guestFavorites])];state.guestFavorites=[];
  save();$('#auth-form').reset();renderHeader();renderProducts();closeDialogs();toast(`Bem-vindo, ${u.profile.name.split(' ')[0]}!`);
}
async function authSubmit(event) {
  event.preventDefault();const f=event.target;const email=f.elements.email.value.trim().toLowerCase(),password=f.elements.password.value,name=f.elements.name.value.trim();
  $('#auth-error').textContent='';const button=$('#auth-submit');button.disabled=true;$('#demo-login').disabled=true;
  try {
    if(authMode==='register') {
      if(name.length<2)throw new Error('Informe seu nome.');
      if(state.users.some(u=>u.email===email))throw new Error('Este e-mail já está cadastrado neste navegador.');
      const auth=await credential(password);
      const u={id:crypto.randomUUID(),email,auth,profile:{...blankProfile(),name},favorites:[],orders:[]};state.users.push(u);completeLogin(u);
    } else {
      const u=state.users.find(u=>u.email===email);if(!u||!await checkPassword(password,u.auth))throw new Error('E-mail ou senha não conferem. As contas existem somente neste navegador.');completeLogin(u);
    }
  } catch(error){$('#auth-error').textContent=error.message;} finally {button.disabled=false;$('#demo-login').disabled=false;}
}
function prepareCheckout() {
  const q=quote(state.cart,shipping.method,shipping.cep);if(!q.quantity||!q.available)throw new Error('Adicione produtos e escolha uma entrega disponível.');
  const p={...(user()?.profile||blankProfile()),cep:shipping.cep||user()?.profile.cep||''};
  $('#checkout-fields').innerHTML=profileFields(p,shipping.method==='delivery',true);
  $('#checkout-summary').innerHTML=`<ul class="checkout-items">${q.lines.map(l=>`<li>${l.qty}× ${l.name} · ${l.flavor} · ${l.size}</li>`).join('')}</ul>${totalsHtml(q)}<p class="account-note">${user()?'Seu endereço será atualizado na conta ao preparar este pedido.':'Pedido como visitante: faça login antes para guardar o histórico na sua conta local.'}</p>`;
  $('#checkout-error').textContent='';$('#checkout-form').elements.note.value='';closeDialogs();showDialog('#checkout-dialog');
}
function receiptView(order) {
  receipt=order;
  $('#receipt-content').innerHTML=`<div class="receipt-id"><strong>${esc(order.id)}</strong><p>Pendente · ${money(order.total)} no Pix</p></div><p class="account-note">${user()?'O pedido está no seu histórico local.':'Pedido de visitante: salve o resumo no WhatsApp para consultá-lo depois.'}</p>`;
  $('#receipt-whatsapp').href=wa(whatsappMessage(order,money));closeDialogs();showDialog('#receipt-dialog');
}
function checkoutSubmit(event) {
  event.preventDefault();const form=event.target;
  try {
    const p=profileFrom(form,user()?.profile||blankProfile());validateProfile(p,shipping.method==='delivery');
    const q=quote(state.cart,shipping.method,p.cep);if(!q.quantity)throw new Error('O carrinho está vazio. Este pedido já pode ter sido preparado.');
    if(!q.available)throw new Error('CEP fora da simulação local. Volte ao carrinho e selecione retirada.');
    if(shipping.method==='delivery'&&p.cep.replace(/\D/g,'')!==shipping.cep.replace(/\D/g,'')) {
      shipping.cep=p.cep;$('#checkout-summary').innerHTML=`<p class="local-notice">CEP atualizado. Revise o novo total e clique novamente para preparar o pedido.</p>${totalsHtml(q)}`;return;
    }
    const order={id:'BF-'+crypto.randomUUID().slice(0,8).toUpperCase(),createdAt:new Date().toISOString(),status:'Pendente',method:shipping.method,profile:{...p,cpf:''},items:q.lines.map(l=>({id:l.id,name:l.name,flavor:l.flavor,size:l.size,qty:l.qty,pix:l.pix})),pix:q.pix,combo:q.combo,freight:q.freight,total:q.total,points:q.points,note:form.elements.note.value.trim()};
    if(user()){user().profile=p;user().orders.push(order);}state.cart=[];save();renderHeader();receiptView(order);
  } catch(error){$('#checkout-error').textContent=error.message;}
}
function renderCombo() {
  $('#combo-options').innerHTML=['whey','creatina','pretreino'].map(id=>{const p=productById(id);return `<div class="combo-item"><img src="assets/${p.image}" alt="${p.name}"><label>${p.name}<select name="${id}" aria-label="Variação de ${p.name} no combo">${p.sizes.flatMap((s,si)=>p.flavors.map((f,fi)=>`<option value="${fi}:${si}">${f} · ${s.label}</option>`)).join('')}</select></label></div>`;}).join('');updateCombo();
}
function comboLines() {return ['whey','creatina','pretreino'].map(id=>{const [flavor,size]=$('#combo-form').elements[id].value.split(':').map(Number);return {id,flavor,size,qty:1};});}
function updateCombo() {$('#combo-price').textContent=money(quote(comboLines()).subtotal);}
function nutrition(id) {
  const p=productById(id);
  $('#nutrition-content').innerHTML=`<p class="eyebrow dark">INFORMAÇÃO NUTRICIONAL · EXEMPLO</p><h2>${p.name}</h2><p class="local-notice">Esta tabela é fictícia e serve para demonstrar a interface. Não corresponde necessariamente à embalagem mostrada. Consulte o rótulo real antes de consumir.</p><p class="account-note">Porção ilustrativa: ${p.portion}</p><table class="nutrition-table"><thead><tr><th scope="col">Componente</th><th scope="col">Por porção</th></tr></thead><tbody>${p.nutrition.map(([k,v])=>`<tr><th scope="row">${k}</th><td>${v}</td></tr>`).join('')}</tbody></table><p class="account-note">${p.description}</p>`;showDialog('#nutrition-dialog');
}

// Eventos delegados mantêm os componentes dinâmicos independentes de re-renderização.
document.addEventListener('click',safely(event=>{
  const b=event.target.closest('button,a');if(!b)return;
  if(b.hasAttribute('data-close')){b.closest('dialog')?.close();return;}
  if(b.dataset.filter){category=b.dataset.filter;renderProducts();}
  if(b.dataset.category){category=b.dataset.category;renderProducts();$('#category-nav').classList.remove('open');$('#menu-button').setAttribute('aria-expanded','false');}
  if(b.hasAttribute('data-reset-search')){category='todos';search='';$('#search').value='';renderProducts();}
  if(b.dataset.favorite)toggleFavorite(b.dataset.favorite);
  if(b.dataset.add)add(b.dataset.add);
  if(b.dataset.buy){add(b.dataset.buy,undefined,undefined,false);openCart();}
  if(b.dataset.nutrition)nutrition(b.dataset.nutrition);
  if(b.dataset.quantity)changeQuantity(b.dataset.quantity,Number(b.dataset.step));
  if(b.dataset.remove){state.cart=state.cart.filter(l=>variantKey(l.id,l.flavor,l.size)!==b.dataset.remove);save();renderHeader();renderCart();}
  if(b.dataset.auth)setAuth(b.dataset.auth);
  if(b.dataset.account)openAccount(b.dataset.account);
  if(b.dataset.accountTab){accountTab=b.dataset.accountTab;renderAccount();}
}));
document.addEventListener('change',safely(event=>{
  const el=event.target;
  if(el.dataset.flavor||el.dataset.size){const id=el.dataset.flavor||el.dataset.size;selections[id][el.dataset.flavor?'flavor':'size']=Number(el.value);const role=el.dataset.flavor?'flavor':'size';renderProducts();$(`[data-${role}="${id}"]`)?.focus();}
  if(el.dataset.orderStatus){const order=user()?.orders.find(o=>o.id===el.dataset.orderStatus);if(order&&['Pendente','Em Separação','Entregue'].includes(el.value)){order.status=el.value;save();renderAccount();toast('Status atualizado apenas no simulador local.');}}
}));
$('#search').addEventListener('input',event=>{search=event.target.value;renderProducts();});
$('#search').addEventListener('keydown',event=>{if(event.key==='Enter')$('#catalogo').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});});
$('#sort').addEventListener('change',event=>{sort=event.target.value;renderProducts();});
$('#menu-button').addEventListener('click',()=>{const open=$('#category-nav').classList.toggle('open');$('#menu-button').setAttribute('aria-expanded',String(open));});
$('#category-nav').addEventListener('click',event=>{if(event.target.closest('a')){$('#category-nav').classList.remove('open');$('#menu-button').setAttribute('aria-expanded','false');}});
$('#account-button').addEventListener('click',()=>{if(user()){$('#account-dropdown').hidden=!$('#account-dropdown').hidden;renderHeader();}else{setAuth('login');showDialog('#auth-dialog');}});
document.addEventListener('click',event=>{if(!event.target.closest('#account-dropdown,#account-button')){$('#account-dropdown').hidden=true;renderHeader();}});
document.addEventListener('keydown',event=>{if(event.key==='Escape'){$('#account-dropdown').hidden=true;$('#category-nav').classList.remove('open');$('#menu-button').setAttribute('aria-expanded','false');renderHeader();}});
$('#logout').addEventListener('click',safely(()=>{state.session=null;shipping={method:'pickup',cep:''};save();$('#account-dropdown').hidden=true;renderHeader();renderProducts();closeDialogs();toast('Você saiu da conta local.');}));
$('#wishlist-button').addEventListener('click',()=>openAccount('favorites'));
$('#cart-button').addEventListener('click',openCart);
$('#privacy-button').addEventListener('click',()=>showDialog('#privacy-dialog'));
$('#auth-form').addEventListener('submit',authSubmit);
$('#demo-login').addEventListener('click',safely(()=>{let demo=state.users.find(u=>u.demo);if(!demo){demo={id:crypto.randomUUID(),email:'cliente@bodyfactor.example',demo:true,auth:null,profile:{...blankProfile(),name:'Cliente Demo',phone:'45999990000',cep:'85851-000',street:'Rua de Exemplo',number:'100',neighborhood:'Centro'},favorites:[],orders:[]};state.users.push(demo);}completeLogin(demo);}));
document.addEventListener('submit',event=>{if(event.target.id==='profile-form'){event.preventDefault();try{const p=profileFrom(event.target);validateProfile(p);user().profile=p;save();renderHeader();toast('Dados salvos neste navegador.');}catch(error){$('#profile-error').textContent=error.message;}}});
$('#shipping-form').addEventListener('change',event=>{if(event.target.name==='method'){shipping.method=event.target.value;updateTotals();}});
$('#shipping-form').elements.cep.addEventListener('input',event=>{shipping.cep=event.target.value;updateTotals();});
$('#shipping-form').addEventListener('submit',event=>{event.preventDefault();shipping.cep=event.target.elements.cep.value;shipping.method='delivery';event.target.elements.method.value='delivery';updateTotals();});
$('#checkout-button').addEventListener('click',safely(prepareCheckout));
$('#checkout-form').addEventListener('submit',checkoutSubmit);
$('#combo-form').addEventListener('change',updateCombo);
$('#combo-form').addEventListener('submit',safely(event=>{event.preventDefault();const additions=comboLines();for(const a of additions){if(state.cart.some(l=>variantKey(l.id,l.flavor,l.size)===variantKey(a.id,a.flavor,a.size)&&l.qty>=10))throw new Error('Uma variação do combo já atingiu 10 unidades. Ajuste o carrinho.');}const combined=cleanCart([...state.cart,...additions]);state.cart=combined;save();renderHeader();openCart();toast('Trio adicionado. Desconto aplicado automaticamente.');}));
$$('dialog').forEach(d=>d.addEventListener('click',event=>{if(event.target===d){const r=d.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)d.close();}}));
document.addEventListener('error',event=>{if(event.target instanceof HTMLImageElement&&!event.target.src.endsWith('placeholder.svg'))event.target.src='assets/placeholder.svg';},true);
window.addEventListener('storage',event=>{if(event.key==='bodyfactor:v2'){state=readState();state.cart=cleanCart(state.cart);renderHeader();renderProducts();if($('#cart-dialog').open)renderCart();if($('#account-dialog').open){if(user()||accountTab==='favorites')renderAccount();else closeDialogs();}if($('#checkout-dialog').open){closeDialogs();toast('Dados alterados em outra aba. Revise o carrinho antes de continuar.');}}});

$('#store-address').textContent=STORE.address;$('#store-hours').textContent=STORE.hours;
$('#maps-link').href=`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(STORE.name+', '+STORE.address)}`;
$('#contact-link').href=wa('Olá! Gostaria de falar com a equipe da Body Factor.');$('#reports-link').href=wa('Olá! Gostaria de consultar procedência e laudos disponíveis dos suplementos.');$('#instagram-link').href=STORE.instagram;$('#year').textContent=new Date().getFullYear();
renderHeader();renderProducts();renderCombo();
// Nome acessível de cada diálogo reutiliza o título visível.
$$('dialog').forEach(d=>{const heading=d.querySelector('h2');if(heading){heading.id=heading.id||`${d.id}-title`;d.setAttribute('aria-labelledby',heading.id);}});

// WebMCP opcional, somente consulta do catálogo público (não expõe contas ou dados pessoais).
if(document.modelContext?.registerTool){try{Promise.resolve(document.modelContext.registerTool({name:'search_supplements',description:'Consulta o catálogo demonstrativo público por nome. Não cria pedido nem altera o carrinho.',inputSchema:{type:'object',properties:{query:{type:'string',maxLength:100}},required:['query'],additionalProperties:false},annotations:{readOnlyHint:true,untrustedContentHint:false},execute(input){if(!input||typeof input.query!=='string'||input.query.length>100)throw new Error('Consulta inválida.');return PRODUCTS.filter(p=>p.name.toLowerCase().includes(input.query.toLowerCase())).map(p=>({id:p.id,name:p.name,illustrativePixPrice:money(variant(p.id).pix)}));}})).catch(()=>{});}catch{}}
