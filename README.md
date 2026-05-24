# Cell Shop

E-commerce de capas de celular desenvolvido com NestJS (backend) e Next.js (frontend).
As respostas para as perguntas conceituais estao em `answers/parte1A.md`.

## Visão Geral

A aplicação permite aos usuários:
- Navegar por uma lista de produtos com filtros e paginação
- Visualizar detalhes individuais de cada produto
- Realizar compras com validação de estoque e formulário de checkout

## Tecnologias

- **NestJS** - Escolhido pela agilidade de construir APIs e facilidade de expansão
- **SQLite** - Banco de dados leve para exemplos, achei melhor que usar dados hardcoded
- **Next.js** - Padrão da indústria para aplicações React, facilita paginação e rotas
- **Material-UI** - Biblioteca de componentes escolhida por familiaridade
- **Drizzle ORM** - ORM type-safe para SQLite mais leve que usar Prisma ou Sequelize 
- **Tailwind CSS** - Estilização rápida e consistente

## Como Executar

### Pré-requisitos
- Node.js instalado
- npm ou yarn

### Clone do Repositório

```bash
git clone https://github.com/borbabeats/case-cell-shop.git
cd case-cell-shop
```

### Backend

1. Navegue para o diretório do backend:
```bash
cd backend
```

2. Instale as dependências:
```bash
npm install
```

3. Execute o servidor em modo de desenvolvimento:
```bash
npm run start:dev
```

4. Execute os testes:
```bash
npm run test
```

O backend estará rodando em `http://localhost:3000`

A documentação da API Swagger estará disponível em `http://localhost:3000/api`

### Frontend

1. Navegue para o diretório do frontend:
```bash
cd frontend
```

2. Instale as dependências:
```bash
npm install
```

3. Configure a variável de ambiente (já configurada em `.env.local`):
```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

4. Execute o servidor de desenvolvimento:
```bash
npm run dev
```

5. Execute os testes:
```bash
npm run test
```

O frontend estará rodando em `http://localhost:3001`

## Funcionalidades da Aplicação

### Página de Produtos (`/produtos`)
- Grid responsivo de produtos
- Filtros via backend:
  - Busca por nome
  - Filtro por categoria (silicone, plástico, couro, metal, bambu)
  - Filtro por cor (12 opções)
  - Filtro por preço mínimo e máximo
- Paginação (10 produtos por página)
- Controles de navegação (Anterior/Próxima)

### Página de Detalhes do Produto (`/produtos/[id]`)
- Imagem do produto em destaque
- Informações completas (nome, categoria, cor, preço, descrição, estoque)
- Seleção de quantidade (limitada ao estoque)
- Seleção de método de pagamento (cartão de crédito, débito, PIX)
- Botão para prosseguir ao checkout

### Página de Checkout (`/checkout`)
- Resumo do produto e valor total calculado
- Formulário de endereço de entrega (rua, cidade, estado, CEP)
- Campo para ID do cliente
- Processamento via API
- Feedback visual de sucesso/erro
- Redirecionamento automático para produtos após sucesso (5 segundos)

## Checklist de Requisitos

### Back-end ✅

- [x] **Existe uma API para criar uma tentativa de compra**
  - Endpoint: `POST /checkout`
  - Payload: `{ customerId, items, shippingAddress, paymentMethod, totalAmount }`

- [x] **A API valida entradas inválidas**
  - Validação de DTOs com `class-validator`
  - Pipes globais de validação
  - Verificação de estoque suficiente
  - Verificação de existência do produto

- [x] **A API diferencia cenários de sucesso e erro com respostas HTTP adequadas**
  - Sucesso: `200 OK` com mensagem de confirmação
  - Produto não encontrado: `404 Not Found`
  - Estoque insuficiente: `400 Bad Request`
  - Dados incompletos: `400 Bad Request`
  - Formato de erro padronizado com `{ error: { code, message, details } }`

- [x] **Existe alguma representação simples de produtos e estoque**
  - Schema Drizzle com tabela `products`
  - Campos: id, name, color, category, price, description, stock, image, created_at
  - Banco de dados SQLite com seed inicial

### Front-end ✅

- [x] **Existe uma tela simples para iniciar a compra**
  - Página de detalhes do produto (`/produtos/[id]`)
  - Botão "Comprar agora" que redireciona para checkout

- [x] **A interface informa ao usuário quando a compra está em andamento**
  - Estado de loading com `CircularProgress`
  - Botão desabilitado durante processamento
  - Texto "Processando..." no botão

- [x] **A interface evita ações duplicadas durante o processamento**
  - Botão desabilitado enquanto `loading === true`
  - Flag `active` no useEffect para evitar race conditions
  - Cleanup function para cancelar requisições pendentes

- [x] **A interface exibe mensagens compreensíveis em caso de sucesso ou erro**
  - Alertas do Material-UI para sucesso/erro
  - Mensagens específicas do backend exibidas ao usuário
  - Redirecionamento automático com countdown visual após sucesso

### Qualidade e Entrega ✅

- [x] **O projeto possui README explicando como rodar**
  - Instruções detalhadas para backend e frontend
  - Pré-requisitos listados
  - URLs de acesso documentadas

- [x] **O código está organizado de forma compreensível**
  - Separação clara entre backend e frontend
  - Services para abstrair chamadas de API
  - Types centralizados para TypeScript
  - Estrutura de pastas lógica e escalável

- [x] **Desejável: incluir testes automatizados**
  - Backend: testes unitários implementados para checkout.service.ts (compra com sucesso)
  - Frontend: testes unitários implementados para checkoutService.ts (compra com sucesso, estoque insuficiente, API indisponível/timeout)

- [x] **Bônus: registrar decisões, trade-offs ou prompts de IA utilizados**
  - Documentado em `PROMPTS.md` com requisitos detalhados
  - Decisões arquiteturais documentadas no código

## Processo de Desenvolvimento

O projeto foi desenvolvido utilizando **Spec Drive Development** conforme descrito em `PROMPTS.md`. As etapas principais foram:

1. **Layout das páginas**: Criado com **Lovable** pela capacidade de gerar layouts bonitos e consistentes
2. **Páginas de produtos e detalhes**: Desenvolvidas com layout inspirado na página `/products` pela IDE **SWE** (similar ao Claude)
3. **Base do código**: Ambos os códigos (backend e frontend) foram construídos utilizando a **documentação oficial** das tecnologias, pois IAs podem não estar atualizadas nas versões iniciais de projetos

Para mais detalhes sobre a estrutura de cada projeto, consulte:
- `backend/README.md` - Estrutura e detalhes do backend
- `frontend/README.md` - Estrutura e detalhes do frontend

## Endpoints da API

- `GET /products` - Listar produtos com filtros e paginação
- `GET /products/:id` - Buscar produto por ID
- `POST /checkout` - Criar pedido de compra

Para mais detalhes sobre a API, consulte a documentação Swagger em `http://localhost:3000/api` após iniciar o backend.
