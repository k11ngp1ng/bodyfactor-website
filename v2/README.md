# Body Factor — V2 E-commerce local

Aplicação completa de demonstração em HTML5, Tailwind CSS e JavaScript ES Modules. A V1 permanece intacta em `../dist/`, em `../versions/v1/` e no ZIP original.

## Iniciar

Requer Node.js 20 ou superior. Não é necessário instalar pacotes.

```sh
cd v2
node server.cjs
```

Acesse http://127.0.0.1:4174 . O servidor V1 usa a porta 4173; as duas versões podem executar juntas. **Use localhost ou HTTPS:** módulos ES e Web Crypto não devem ser executados abrindo `index.html` via `file://`.

O botão “Experimentar com conta de demonstração” cria um perfil fictício pronto para testar. Também é possível cadastrar e acessar uma conta local com e-mail e senha. Contas e pedidos não são compartilhados entre portas, navegadores ou aparelhos.

## Funcionalidades integradas

- Cadastro com e-mail e senha, login, logout e atalho para conta demo.
- Perfil com nome, telefone, CPF opcional e endereço. CPF com validação de dígitos verificadores.
- Favoritos por conta. Favoritos de visitante são associados à conta ao entrar.
- Pesquisa instantânea sem distinção de acentos, filtros e ordenação por preço.
- Sabores e tamanhos com preço e imagem de variação; tabela nutricional ilustrativa.
- Carrinho por variação, quantidades, remoção, subtotal, desconto e frete.
- Combo configurável de Whey + Creatina + Pré-treino com desconto automático.
- Simulador de frete por CEP, retirada e progresso para frete grátis.
- Checkout de visitante ou com dados preenchidos da conta.
- Pedido pendente local, resumo codificado para WhatsApp e reabertura pelo histórico.
- Histórico com simulador explícito de Pendente, Em Separação e Entregue.
- Pontos derivados dos pedidos entregues, sem duplicação de crédito.
- Layout responsivo, diálogos nativos, foco, Escape e movimento reduzido.
- Tailwind browser v4 incluído localmente. Nenhuma dependência de CDN em execução.

## Estrutura

| Arquivo | Responsabilidade |
| --- | --- |
| `index.html` | Estrutura, navegação, formulários e diálogos |
| `styles.css` | Identidade, componentes, estados e responsividade |
| `js/catalog.js` | Catálogo, variações, preços e configuração comercial |
| `js/commerce.js` | Cálculo centralizado, validação e mensagem de checkout |
| `js/storage.js` | Persistência, credenciais locais, sessão e pontos |
| `js/app.js` | Interface, eventos e integração dos componentes |
| `assets/` | Imagens locais e Tailwind browser |
| `server.cjs` | Servidor HTTP somente para desenvolvimento local |
| `tests/commerce.test.js` | Testes de regras críticas |

## Configuração e regras demonstrativas

Edite `STORE` e `PRODUCTS` em `js/catalog.js`. Dinheiro é representado em **centavos inteiros**, com arredondamento por unidade. O preço no Pix possui 5% de desconto. O parcelamento dos cards é uma estimativa em três parcelas; o último centavo pode ser ajustado pela loja.

O combo aplica 10% extra a **uma unidade de cada um dos três produtos**. Se houver múltiplas variações, usa a unidade elegível de menor preço de cada produto. Quantidades adicionais não recebem esse desconto extra. A regra fica centralizada em `quote()` para evitar divergência entre vitrine, carrinho e WhatsApp.

Frete simulado:

- Retirada: R$ 0.
- CEP iniciando em 85851: R$ 8.
- Outros CEPs no formato 8585xxxx: R$ 12.
- Produtos totalizando R$ 249 ou mais **após descontos**: frete simulado gratuito nas faixas atendidas.
- CEP fora da faixa: entrega indisponível no simulador; retirada continua possível.

Essas faixas não foram validadas como cobertura real da loja. A interface deixa claro que taxas e prazos precisam de confirmação. Se o CEP for alterado no checkout, o total é recalculado e exige nova revisão antes de salvar.

1 ponto por R$ 1 em produtos após descontos, arredondado para baixo, excluindo frete. Somente pedidos marcados Entregue pontuam. Reverter o status remove os pontos; renderizações e recarregamentos não duplicam crédito. Não existe resgate nem valor financeiro real.

## Persistência e limites do protótipo

A chave `bodyfactor:v2` no localStorage contém contas locais, perfis, favoritos, carrinho e histórico. Senhas não ficam em texto puro: são derivadas com PBKDF2/SHA-256, 210.000 iterações e salt aleatório por conta.

**Isso é simulação de autenticação, não um mecanismo de segurança de produção.** O usuário controla o navegador e pode alterar o armazenamento, sessão e pedidos. Não use dados ou senhas reais. Não há backend, recuperação de senha, envio de e-mail, validação fiscal, estoque real, pagamento ou sincronização com a loja. O CPF é opcional e não entra no link do WhatsApp.

O checkout salva um pedido pendente e esvazia o carrinho. Em seguida apresenta um botão para abrir o resumo no WhatsApp. A pessoa revisa e envia a mensagem. Salvar o pedido ou abrir o aplicativo **não significa que a mensagem foi enviada, que houve pagamento ou que a loja recebeu/aceitou a compra**.

O carrinho é compartilhado pelo dispositivo. Favoritos, dados e pedidos ficam separados por conta local. “Simular status” é somente um controle didático, claramente identificado dentro de cada pedido.

## Para evoluir a produção

Substitua `storage.js` por serviços autenticados em backend; mantenha autorização por usuário no servidor, sessão segura e cálculo de preço/frete/estoque autoritativo. O servidor deve criar identificadores idempotentes de pedido e controlar status e pontos. Publique termos e política de privacidade adequados à operação real.

Substitua todos os preços, avaliações, tabelas nutricionais e embalagens ilustrativas por dados aprovados pela loja. Use laudos verdadeiros por produto; este protótipo apenas permite solicitar a documentação por WhatsApp. Compile o Tailwind para CSS estático na implantação comercial, em vez do runtime browser de desenvolvimento.

Para hospedar o protótipo estático, sirva por HTTPS `index.html`, `styles.css`, `js/` e `assets/`. Não é necessário publicar o servidor local, os testes ou este README. A V2 não foi publicada em um serviço externo nesta entrega.

## Identidade e fontes

Mantida a paleta preto, amarelo e branco baseada no logotipo real da Body Factor. Instagram: https://www.instagram.com/bodyfactorfoz/ . O acesso automatizado direto ao Instagram e à referência Growth foi bloqueado; a arquitetura segue as funcionalidades especificadas no pedido, sem afirmar que é uma reprodução visual auditada desses sites.

Logo e contato vieram do catálogo https://meucomercio.com.br/bodyfactorfoz . As fontes completas das imagens e contato estão preservadas no README da V1 em `../versions/v1/README.md`. Fotografias de suplementos são ilustrativas, não estoque confirmado. Variações adicionais usam placeholders textuais para não representar embalagens incorretas.

## Testar

```sh
node --test tests/commerce.test.js
```

Testes automatizados: variações, saneamento do carrinho, desconto sem duplicação, frete por faixa e limite, CEP não atendido, validação de CPF/perfil, pontos, resumo sem CPF e verificação de senha.

Fluxos verificados no navegador: cadastro, senha incorreta/correta, logout, perfil salvo, favoritos, troca de variação, persistência após reload, frete, checkout com endereço automático, resumo WhatsApp, histórico, status Entregue/pontos, busca vazia, menu mobile e combo. Nenhuma mensagem ou compra real foi enviada.

Há um WebMCP opcional `search_supplements` para consultar somente o catálogo público; não expõe contas ou dados pessoais.
