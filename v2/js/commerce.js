import {variant,STORE} from './catalog.js';
export function cleanCart(cart) {
  if(!Array.isArray(cart)) return [];
  const valid = new Map();
  for(const line of cart) { try {
    const v=variant(line.id,line.flavor,line.size);
    if(Number.isInteger(line.qty)&&line.qty>0) valid.set(v.key,{id:line.id,flavor:line.flavor,size:line.size,qty:Math.min(10,(valid.get(v.key)?.qty||0)+line.qty)});
  } catch {} }
  return [...valid.values()];
}
export function cartLines(cart) { return cleanCart(cart).map(line=>({...variant(line.id,line.flavor,line.size),qty:line.qty})); }
// Única fonte de cálculo para carrinho, checkout, histórico e mensagem do WhatsApp.
export function quote(cart,method='pickup',cep='') {
  const lines=cartLines(cart);
  const full=lines.reduce((sum,line)=>sum+line.full*line.qty,0);
  const pix=lines.reduce((sum,line)=>sum+line.pix*line.qty,0);
  const trio=['whey','creatina','pretreino'].map(id=>lines.filter(l=>l.id===id).sort((a,b)=>a.pix-b.pix)[0]);
  const combo=trio.every(Boolean)?Math.round(trio.reduce((sum,l)=>sum+l.pix,0)*STORE.comboDiscount):0;
  const subtotal=pix-combo;
  const code=String(cep).replace(/\D/g,'');
  let freight=0, available=true, estimate='Retirada após confirmação da loja';
  if(method==='delivery') {
    if(!/^8585\d{4}$/.test(code)) {available=false;freight=null;estimate='CEP fora da simulação local. Escolha retirada ou consulte a loja.';}
    else {freight=subtotal>=STORE.freeShipping?0:code.startsWith('85851')?800:1200;estimate='Simulação: até 1 dia útil após confirmação';}
  }
  return {lines,full,pix,combo,subtotal,freight,available,estimate,total:available?subtotal+freight:null,quantity:lines.reduce((s,l)=>s+l.qty,0),points:Math.floor(subtotal/100)};
}
export function validateCPF(input) {
  const c=String(input).replace(/\D/g,''); if(!c) return true;
  if(c.length!==11||/^(\d)\1{10}$/.test(c)) return false;
  return [9,10].every(len=>{const sum=[...c.slice(0,len)].reduce((s,n,i)=>s+Number(n)*(len+1-i),0);return (sum*10%11%10)===Number(c[len]);});
}
export function validateProfile(p,delivery=false) {
  if(!p.name?.trim()||p.name.trim().length<2) throw new Error('Informe seu nome completo.');
  if(!/^\d{10,11}$/.test((p.phone||'').replace(/\D/g,''))) throw new Error('Informe um telefone com DDD (10 ou 11 dígitos).');
  if(!validateCPF(p.cpf)) throw new Error('Confira os dígitos do CPF, ou deixe o campo opcional vazio.');
  if(delivery&&(!/^\d{8}$/.test((p.cep||'').replace(/\D/g,''))||!p.street?.trim()||!p.number?.trim()||!p.neighborhood?.trim())) throw new Error('Complete CEP, rua, número e bairro para entrega.');
}
export function whatsappMessage(order,money) {
  const p=order.profile;
  return [`Olá! Meu nome é ${p.name}. Preparei o pedido ${order.id} pelo site:`,...order.items.map(i=>`- ${i.qty}x ${i.name} (${i.flavor}, ${i.size}) — ${money(i.pix*i.qty)}`),`Produtos no Pix: ${money(order.pix)}`,order.combo?`Desconto combo: -${money(order.combo)}`:'',`Frete: ${money(order.freight)}`,`Total estimado no Pix: ${money(order.total)}`,order.method==='delivery'?`Entrega: ${p.street}, ${p.number}${p.complement?', '+p.complement:''} — ${p.neighborhood}, Foz do Iguaçu/PR. CEP ${p.cep}`:'Retirada na loja.',`Contato: ${p.phone}`,order.note?`Observação: ${order.note}`:'','Valores demonstrativos sujeitos à confirmação. Como faço para confirmar disponibilidade e prosseguir com o pagamento?'].filter(Boolean).join('\n');
}
