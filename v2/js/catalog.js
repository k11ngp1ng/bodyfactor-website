// Catálogo DEMONSTRATIVO. Valores em centavos; imagens não representam estoque confirmado.
export const STORE = Object.freeze({ name: 'Body Factor Foz', phone: '5545998625618', instagram: 'https://www.instagram.com/bodyfactorfoz/', address: 'Av. Juscelino Kubitscheck, 1006 — Centro, Foz do Iguaçu — PR', hours: 'Seg–Sex: 9h às 18h · Sábado: 9h às 13h', freeShipping: 24900, pixDiscount: .05, comboDiscount: .10 });
export const PRODUCTS = [
  { id: 'whey', name: 'Whey Protein Concentrado', brand: 'PROTEÍNAS', category: 'massa', image: 'whey.webp', badge: 'DESTAQUE', rating: '4,9', flavors: ['Chocolate','Baunilha'], sizes: [{label:'900 g',price:15990},{label:'1,8 kg',price:28990}], nutrition: [['Valor energético','120 kcal'],['Proteínas','21 g'],['Carboidratos','5 g'],['Gorduras totais','2 g']], portion:'30 g', description:'Uma opção prática de proteína para complementar sua rotina alimentar.' },
  { id: 'creatina', name: 'Creatina Monohidratada', brand: 'CREATINAS', category: 'massa', image: 'creatina.webp', badge: 'ESSENCIAL', rating: '4,9', flavors: ['Sem sabor'], sizes: [{label:'300 g',price:9990},{label:'600 g',price:17990}], nutrition: [['Valor energético','0 kcal'],['Creatina','3 g']], portion:'3 g', description:'Versatilidade para acompanhar sua rotina de treinos, conforme orientação profissional.' },
  { id: 'pretreino', name: 'Pré-treino Performance', brand: 'PRÉ-TREINOS', category: 'energia', image: 'pretreino.webp', badge: 'SEU PRÓXIMO NÍVEL', rating:'4,8', flavors:['Citrus','Frutas vermelhas'],sizes:[{label:'300 g',price:12990},{label:'600 g',price:23990}],nutrition:[['Valor energético','20 kcal'],['Carboidratos','5 g'],['Cafeína','150 mg']],portion:'10 g',description:'Compare as opções de pré-treino e confira as recomendações do fabricante.' },
  { id: 'omega', name: 'Ômega 3', brand:'SAÚDE & BEM-ESTAR',category:'saude',image:'omega.webp',badge:'ROTINA EM DIA',rating:'4,9',flavors:['Neutro'],sizes:[{label:'120 cápsulas',price:6990},{label:'240 cápsulas',price:12990}],nutrition:[['Valor energético','18 kcal'],['Gorduras totais','2 g'],['EPA','360 mg'],['DHA','240 mg']],portion:'2 cápsulas',description:'Um complemento para a rotina de cuidado. Consulte composição e orientações no rótulo.' },
  { id:'carnitina',name:'L-Carnitina',brand:'DEFINIÇÃO',category:'definicao',image:'carnitina.webp',badge:'CONHEÇA',rating:'4,7',flavors:['Neutro'],sizes:[{label:'60 cápsulas',price:7990},{label:'120 cápsulas',price:14990}],nutrition:[['L-Carnitina','500 mg']],portion:'1 cápsula',description:'Conheça a composição e converse com seu profissional de saúde sobre a indicação.' },
  { id:'vitaminas',name:'Multivitamínico',brand:'VITAMINAS',category:'saude',image:'vitaminas.webp',badge:'CUIDADO DIÁRIO',rating:'4,8',flavors:['Neutro'],sizes:[{label:'60 cápsulas',price:5990},{label:'120 cápsulas',price:10990}],nutrition:[['Vitamina C','45 mg'],['Vitamina D','5 µg'],['Zinco','7 mg']],portion:'1 cápsula',description:'Vitaminas e minerais para complementar a alimentação, conforme suas necessidades.' }
];
export const productById = id => PRODUCTS.find(p => p.id === id);
export const money = cents => (cents / 100).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
export const variantKey = (id,flavor=0,size=0) => `${id}:${flavor}:${size}`;
export function variant(id,flavor=0,size=0) {
  const p = productById(id);
  if (!p || !Number.isInteger(flavor) || !Number.isInteger(size) || !p.flavors[flavor] || !p.sizes[size]) throw new Error('Variação indisponível.');
  return {...p, key:variantKey(id,flavor,size), flavor:p.flavors[flavor],size:p.sizes[size].label,full:p.sizes[size].price,pix:Math.round(p.sizes[size].price*(1-STORE.pixDiscount)),flavorIndex:flavor,sizeIndex:size};
}
// Segunda variação recebe uma imagem textual local, para não representar uma embalagem real incorreta.
export function variantImage(v) {
  if(v.flavorIndex===0 && v.sizeIndex===0) return `assets/${v.image}`;
  const escape = value => value.replace(/[<>&"']/g,'');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400"><rect width="400" height="400" fill="#f3f4ee"/><rect x="30" y="30" width="340" height="8" fill="#e8e52b"/><text x="200" y="150" text-anchor="middle" font-family="Arial" font-size="18" font-weight="bold">${escape(v.name)}</text><text x="200" y="192" text-anchor="middle" font-family="Arial" font-size="20">${escape(v.flavor)}</text><text x="200" y="225" text-anchor="middle" font-family="Arial" font-size="18">${escape(v.size)}</text><text x="200" y="310" text-anchor="middle" font-family="Arial" font-size="12" fill="#74786a">IMAGEM ILUSTRATIVA DA VARIAÇÃO</text></svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}
