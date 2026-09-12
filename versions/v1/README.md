# Body Factor Foz

Landing page e catálogo institucional em HTML5, CSS puro com classes organizadas e JavaScript ES6+. Sem frameworks, CDN, instalação de pacotes ou build obrigatório.

## Executar

Abra `dist/index.html` no navegador. Todas as imagens estão incluídas localmente. Para prévia HTTP, execute `node server.cjs` e acesse `http://127.0.0.1:4173`.

## Arquivos

- `dist/index.html`: estrutura semântica, conteúdo, metadados, seções e links de fallback.
- `dist/styles.css`: tokens de identidade, componentes, estados interativos, media queries e movimento reduzido.
- `dist/config.js`: telefone, endereço, horários e lista de produtos.
- `dist/app.js`: renderização segura, filtros por objetivo, links dinâmicos do WhatsApp, menu mobile e animações de entrada.
- `dist/assets/`: logo, fotografia, imagens ilustrativas e fallback.
- `server.cjs`: servidor local opcional, sem dependências.

## Personalizar

Edite `window.STORE` em `dist/config.js`. O WhatsApp usa DDI + DDD + número, somente dígitos. As mensagens são codificadas com `encodeURIComponent`. Clicar abre a conversa; não envia automaticamente a mensagem.

Cada produto possui `id`, `name`, `size`, `category`, `label`, `tag`, `price` (número) e `image` (caminho relativo). Categorias: `massa`, `definicao`, `energia`, `saude`. Uma tag vazia esconde o selo. Para adicionar um produto, inclua outro objeto na lista. O preço é formatado automaticamente em reais.

As variáveis no início de `styles.css` controlam cores e dimensões. A identidade usa preto, amarelo e branco, baseada no logotipo real encontrado no catálogo da loja. Impact/Arial Narrow e Arial são fontes locais de fallback; não há carregamento externo de fontes.

## Implantar

Publique o conteúdo de `dist/` em qualquer hospedagem estática com HTTPS. Não é necessário publicar `server.cjs`, este README ou arquivos internos de configuração. Não há backend, pagamentos, carrinho ou armazenamento de dados pessoais: pedidos são negociados pelo WhatsApp.

## Conteúdo demonstrativo e fontes

O Instagram bloqueou a leitura direta automatizada; portanto, não foi possível avaliar fielmente o feed, campanhas ou catálogo atual. A identidade foi derivada do logotipo real do catálogo vinculado, sem afirmar que a fotografia de academia representa a loja.

- Instagram: https://www.instagram.com/bodyfactorfoz/
- Catálogo vinculado / descrição institucional / telefone e endereço: https://meucomercio.com.br/bodyfactorfoz
- Horários e contato cruzados: https://www.solutudo.com.br/empresas/pr/foz/suplementos-alimentares/body-factor-suplementos-462083
- Logo original: https://s3-sa-east-1.amazonaws.com/assets.meucomercio.com.br/production/logos/b488d662eea05b04bdb1cee80008e1c6.png
- Fotografia genérica: https://images.unsplash.com/photo-1605296867304-46d5465a13f1
- Whey ilustrativo: https://img.drogaraia.com.br/catalog/product/1/0/100-whey-pote-900g-chocolate-v01-496487-1.jpg
- Creatina ilustrativa: https://cdn.awsli.com.br/2500x2500/2498/2498910/produto/251299380/creatina-double-force-bodyaction-300g-bela-cerealista-p03afbmozk.png
- Pré-treino ilustrativo: https://lojamaxtitanium.vtexassets.com/arquivos/ids/160165/Horus-Citrus---Frente.png
- Ômega 3 ilustrativo: https://product-data.raiadrogasil.io/images/11493965.webp
- Placeholders textuais: https://placehold.co/

Preços, imagens de suplementos e seleção são demonstrativos, identificados na página. Não representam estoque ou ofertas confirmadas. Antes do lançamento comercial, substitua pelas fotos autorizadas, produtos e preços reais; confirme contato, horários, endereço, procedência e condições de entrega. Atualize também o texto demonstrativo do HTML e os preços ilustrativos em `app.js` após validar as ofertas. A página não inventa tempo de mercado, avaliações ou resultados clínicos.

## Verificação realizada

- Sintaxe dos dois arquivos JavaScript aprovada por `node --check`.
- Prévia HTTP respondeu 200.
- Imagens carregadas no navegador.
- Layout conferido em 1440 e 390 pixels, sem overflow horizontal.
- Menu mobile abriu e fechou após navegação.
- Filtro Definição retornou L-Carnitina; Todos restaurou os seis produtos.
- Link gerado contém telefone e nome do produto corretamente codificados.
- Navegação por teclado, foco visível, texto alternativo e preferência por movimento reduzido implementados.

Não foi enviado pedido real nem realizada auditoria formal de acessibilidade.
