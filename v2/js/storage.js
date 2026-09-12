const KEY='bodyfactor:v2';
const empty=()=>({version:2,users:[],session:null,cart:[],guestFavorites:[]});
export function readState() {
  try {const s=JSON.parse(localStorage.getItem(KEY)||'null');
    if(s?.version!==2||!Array.isArray(s.users)||!Array.isArray(s.cart)) return empty();
    s.users=s.users.filter(u=>typeof u.id==='string'&&typeof u.email==='string'&&u.profile&&Array.isArray(u.orders)&&Array.isArray(u.favorites));
    s.guestFavorites=Array.isArray(s.guestFavorites)?s.guestFavorites:[];
    if(!s.users.some(u=>u.id===s.session)) s.session=null;
    return s;
  } catch {return empty();}
}
export function writeState(state) {localStorage.setItem(KEY,JSON.stringify(state));}
export function currentUser(state) {return state.users.find(u=>u.id===state.session)||null;}
export const blankProfile=()=>({name:'',phone:'',cpf:'',cep:'',street:'',number:'',complement:'',neighborhood:''});
const hex=buffer=>[...new Uint8Array(buffer)].map(b=>b.toString(16).padStart(2,'0')).join('');
async function hash(password,salt) {
  if(!globalThis.crypto?.subtle) throw new Error('Abra a aplicação por localhost ou HTTPS para usar o cadastro.');
  const key=await crypto.subtle.importKey('raw',new TextEncoder().encode(password),'PBKDF2',false,['deriveBits']);
  return hex(await crypto.subtle.deriveBits({name:'PBKDF2',salt:new TextEncoder().encode(salt),iterations:210000,hash:'SHA-256'},key,256));
}
export async function credential(password) {const salt=hex(crypto.getRandomValues(new Uint8Array(16)));return {salt,hash:await hash(password,salt)};}
export async function checkPassword(password,stored) {return !!stored?.salt&&await hash(password,stored.salt)===stored.hash;}
// O saldo deriva apenas de pedidos locais entregues. Mudar o status de volta remove os pontos.
export const points=user=>user?.orders.filter(o=>o.status==='Entregue').reduce((s,o)=>s+(Number(o.points)||0),0)||0;
