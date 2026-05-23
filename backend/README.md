# Cell Shop API - Backend

## 📋 Descrição da API

A Cell Shop API é uma aplicação backend desenvolvida com NestJS para gerenciar uma loja de capas de celular. A API permite listar produtos com paginação e filtros avançados, além de processar pedidos de compra com validação de estoque, tratamento de erros robusto e logging completo.

## 🏗️ Arquitetura

### Padrão Arquitetural
- **Clean Architecture**: Separação clara de responsabilidades entre controllers, services, DTOs e exceções
- **Modularização**: Código organizado em módulos (ProductsModule, CheckoutModule)
- **Injeção de Dependência**: Uso do sistema de DI do NestJS para gerenciar dependências
- **DTOs (Data Transfer Objects)**: Validação de entrada de dados com class-validator
- **Repository Pattern**: Acesso a dados através do Drizzle ORM com SQLite

### Estrutura de Diretórios
```
backend/src/
├── common/
│   ├── exceptions/          # Exceções customizadas
│   ├── filters/            # Filtros globais de exceção
│   └── logger/             # Configuração de logging com Winston
├── checkout/
│   ├── checkout.controller.ts    # Controller de checkout
│   ├── checkout.service.ts       # Service de lógica de negócio
│   ├── checkout.module.ts        # Módulo de checkout
│   └── dto/                     # DTOs de entrada/saída
├── drizzle/
│   ├── schema.ts                  # Schema do banco de dados
│   ├── index.ts                   # Configuração do Drizzle ORM
│   └── enums.ts                   # Enums usados no sistema
├── products/
│   ├── products.controller.ts      # Controller de produtos
│   ├── products.service.ts         # Service de lógica de negócio
│   ├── products.module.ts         # Módulo de produtos
│   └── dto/                      # DTOs de filtros e paginação
└── database/
    └── database.init.ts           # Script de inicialização do banco
```

## 🔌 Plugins e Dependências Principais

### Core Framework
- **@nestjs/core**: Framework principal
- **@nestjs/common**: Decoradores e funcionalidades comuns
- **@nestjs/swagger**: Documentação de API com Swagger/OpenAPI
- **reflect-metadata**: Reflexão para decorators

### Banco de Dados
- **drizzle-orm**: ORM tipo-safe para consultas ao banco
- **better-sqlite3**: Driver SQLite com suporte a WAL
- **drizzle-kit**: Toolkit para migrações do Drizzle

### Validação
- **class-validator**: Validação de DTOs com decorators
- **class-transformer**: Transformação de dados

### Logging
- **winston**: Logger robusto com múltiplos transports
- **winston-daily-rotate-file**: Rotação automática de logs por data

## ✅ Validação de Dados

### Validação de Entrada (DTOs)
Todos os dados de entrada são validados usando `class-validator`:

#### DTO de Produtos (`FindProductsDto`)
- **page**: Número, mínimo 1, padrão 1
- **limit**: Número, mínimo 1, máximo 100, padrão 10
- **name**: String opcional para busca por nome
- **minPrice**: Número opcional, mínimo 0
- **maxPrice**: Número opcional, mínimo 0
- **category**: Enum opcional (silicone, plástico, couro, metal, bambu)
- **color**: Enum opcional (preto, branco, azul, etc.)

#### DTO de Checkout (`CreateCheckoutDto`)
- **customerId**: String opcional (validação removida para permitir compras sem cliente)
- **items**: Array obrigatório de itens
  - **productId**: UUID válido
  - **quantity**: Número positivo, mínimo 1
- **shippingAddress**: Objeto obrigatório
  - **street**: String não vazia (obrigatório)
  - **city**: String não vazia (obrigatório)
  - **state**: String opcional
  - **zipCode**: String opcional
- **paymentMethod**: Enum obrigatório (credit_card, pix, debito)
- **totalAmount**: Número positivo obrigatório

### Validação de Negócio
- Verificação de estoque disponível antes da venda
- Validação do valor total informado vs calculado
- Verificação de existência de produtos
- Transações atômicas para evitar inconsistências de estoque

## 📦 Tratamento de Payloads

### Pipeline de Validação Global
Configurado no `main.ts`:
```typescript
app.useGlobalPipes(new ValidationPipe({
  transform: true,      // Transforma tipos automaticamente
  whitelist: true,       // Remove propriedades não decoradas
}));
```

### Fluxo de Tratamento de Payload
1. **Recebe HTTP Request** → Validação automática dos DTOs
2. **Transformação** → Conversão de tipos (string → number, etc)
3. **Whitelisting** → Remove campos não especificados no DTO
4. **Validação de Negócio** → Regras específicas do service
5. **Tratamento de Erros** → Formatação padronizada de exceções

## 🚨 Tratamento de Erros

### Padrão Global de Erro
Todos os erros seguem o formato padronizado:
```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Mensagem amigável em português",
    "details": {
      "informações adicionais": "opcionais"
    }
  }
}
```

### Exceções Customizadas
- **ProductNotFoundException** (404): Produto não encontrado
- **InsufficientStockException** (400): Estoque insuficiente
- **InvalidPayloadException** (400): Dados incompletos
- **InvalidTotalAmountException** (400): Valor total incorreto (menor ou maior que o calculado)

### Códigos HTTP Utilizados
- **200**: Sucesso na operação
- **400**: Erro de validação ou negócio
- **404**: Recurso não encontrado
- **500**: Erro interno do servidor

### Exception Filter Global
Captura todas as exceções HTTP e as formata de maneira consistente, traduzindo mensagens de validação do class-validator para português e removendo prefixos técnicos.

## 📝 Uso de Logs

### Configuração Winston
**Transports configurados:**
- **Console**: Output colorido e legível para desenvolvimento
- **Arquivo Geral**: Logs diários com rotação automática (máx 14 dias)
- **Arquivo de Erros**: Logs de erro separados (máx 30 dias)

**Níveis de Log:**
- **error**: Erros críticos que impedem operação
- **warn**: Situações anormais mas não críticas
- **info**: Informações gerais de operação
- **debug**: Detalhes de execução

### Logging nos Services
- **ProductsService**: Loga buscas, filtros aplicados, produtos encontrados
- **CheckoutService**: Loga início de checkout, validações, criação de pedidos, transações
- **HttpExceptionFilter**: Loga todas as exceções HTTP com stack trace

### Exemplo de Logs
```typescript
logger.log(`Encontrados ${total} produtos na página ${page}`, 'ProductsService.getAllProducts');
logger.warn(`Estoque insuficiente para produto ${productId}`, 'CheckoutService.createCheckout');
logger.error(`Erro no checkout: ${error.message}`, error.stack, 'CheckoutService.createCheckout');
```

## 🔍 Uso do Swagger para Testar API

### Acesso ao Swagger UI
Ao iniciar a aplicação, a documentação estará disponível em:
```
http://localhost:3000/api
```

### Funcionalidades do Swagger
- **Documentação Interativa**: Teste endpoints diretamente da interface
- **Exemplos de Payload**: Cada campo dos DTOs tem exemplos preenchidos
- **Validação em Tempo Real**: Veja erros de validação instantaneamente
- **Tags Organizadas**: Endpoints agrupados por funcionalidade (products, checkout)
- **Respostas Documentadas**: Cada código HTTP tem sua descrição

### Usando o Swagger para Testar
1. **Listar Produtos**: 
   - GET `/products`
   - Teste filtros clicando em "Try it out"
   - Modifique query parameters e execute

2. **Comprar Produtos**:
   - POST `/checkout`
   - Use o exemplo de payload preenchido
   - Modifique productId, quantidade, etc.
   - Veja a resposta e códigos HTTP

## 🛒 Endpoints Disponíveis

### GET `/products` - Listar Produtos
**Descrição**: Retorna lista de produtos com paginação e filtros

**Query Parameters:**
- `page`: Número da página (padrão: 1)
- `limit`: Itens por página (padrão: 10, máximo: 100)
- `name`: Filtro por nome do produto (busca parcial)
- `minPrice`: Preço mínimo
- `maxPrice`: Preço máximo
- `category`: Filtro por categoria (silicone, plástico, couro, metal, bambu)
- `color`: Filtro por cor (preto, branco, azul, etc.)

**Resposta no formato REST:**
```json
{
  "data": [
    {
      "id": "uuid-do-produto",
      "name": "iPhone 15 Pro",
      "color": "preto",
      "category": "silicone",
      "price": 25.00,
      "description": "Capa de silicone premium...",
      "stock": 30,
      "image": "https://...",
      "created_at": "2024-01-15T10:30:00.000Z"
    }
  ],
  "total": 20,
  "page": 1,
  "limit": 10
}
```

**Comportamento:**
- Apenas produtos com `stock > 0` são retornados
- Ordenação por `created_at` descendente (mais recentes primeiro)
- Aplica todos os filtros fornecidos de forma conjunta

### GET `/products/:id` - Buscar Produto por ID
**Descrição**: Retorna detalhes de um produto específico

**Parâmetros:**
- `id`: UUID do produto

**Resposta de Sucesso (200):**
```json
{
  "id": "uuid-do-produto",
  "name": "iPhone 15 Pro",
  "color": "preto",
  "category": "silicone",
  "price": 25.00,
  "description": "Capa de silicone premium...",
  "stock": 30,
  "image": "https://...",
  "created_at": "2024-01-15T10:30:00.000Z"
}
```

**Resposta de Erro (404):**
```json
{
  "error": {
    "code": "PRODUCT_NOT_FOUND",
    "message": "Produto não encontrado",
    "details": {
      "productId": "uuid-do-produto"
    }
  }
}
```

### POST `/checkout` - Processar Compra
**Descrição**: Cria um novo pedido de compra com validação de estoque

**Payload Esperado:**
```json
{
  "customerId": "cliente-123",
  "items": [
    {
      "productId": "57f15421-ca34-4646-bb55-c7b0ce931570",
      "quantity": 2
    }
  ],
  "shippingAddress": {
    "street": "Rua das Flores, 123",
    "city": "Porto Alegre",
    "state": "RS",
    "zipCode": "90120-000"
  },
  "paymentMethod": "credit_card",
  "totalAmount": 50.00
}
```

**Campos do Payload:**
- **customerId** (opcional): ID do cliente
- **items** (obrigatório): Array de itens
  - **productId** (obrigatório): UUID do produto
  - **quantity** (obrigatório): Quantidade desejada (mínimo 1)
- **shippingAddress** (obrigatório): Endereço de entrega
  - **street** (obrigatório): Rua
  - **city** (obrigatório): Cidade
  - **state** (opcional): Estado
  - **zipCode** (opcional): CEP
- **paymentMethod** (obrigatório): credit_card | pix | debito
- **totalAmount** (obrigatório): Valor total da compra

**Resposta de Sucesso (200):**
```json
{
  "statusCode": 200,
  "orderId": "uuid-do-pedido",
  "orderNumber": "ORD-123456",
  "status": "processing",
  "message": "Pagamento realizado com sucesso",
  "totalAmount": 50.00
}
```

**Tratamento de Erros:**

**Estoque Insuficiente (400):**
```json
{
  "error": {
    "code": "INSUFFICIENT_STOCK",
    "message": "Produto sem estoque suficiente",
    "details": {
      "productId": "uuid-do-produto",
      "productName": "iPhone 15 Pro",
      "availableStock": 2
    }
  }
}
```

**Produto Não Encontrado (404):**
```json
{
  "error": {
    "code": "PRODUCT_NOT_FOUND",
    "message": "Produto não encontrado",
    "details": {
      "productId": "uuid-inexistente"
    }
  }
}
```

**Dados Incompletos (400):**
```json
{
  "error": {
    "code": "INVALID_PAYLOAD",
    "message": "Dados incompletos"
  }
}
```

**Valor Total Incorreto (400):**
```json
{
  "error": {
    "code": "INVALID_TOTAL_AMOUNT",
    "message": "Valor do pagamento informado é menor que o valor total do pedido",
    "details": {
      "calculatedTotal": 50.00,
      "providedTotal": 45.00
    }
  }
}
```

**Endereço Incompleto (400):**
```json
{
  "error": {
    "code": "BAD_REQUEST",
    "message": "A cidade do endereço é obrigatória"
  }
}
```

## 🔒 Transações e Consistência

O checkout utiliza transações SQL para garantir consistência:
1. **BEGIN TRANSACTION**: Inicia transação
2. **INSERT order**: Cria o pedido
3. **INSERT order_items**: Cria itens do pedido
4. **UPDATE stock**: Atualiza estoque
5. **COMMIT**: Confirma transação
6. **ROLLBACK**: Reverte em caso de erro

Isso evita venda sem estoque e garante integridade dos dados.

## 🎯 Melhores Práticas Implementadas

- **Validação em múltiplas camadas**: DTOs + Service
- **Mensagens de erro amigáveis**: Tradução para português
- **Logging completo**: Operações rastreáveis para debug
- **Documentação automática**: Swagger gera docs atualizados
- **Type Safety**: TypeScript + Drizzle ORM
- **Separação de responsabilidades**: Arquitetura limpa
- **Tratamento de exceções centralizado**: Filtro global uniforme
- **Observabilidade**: Logs estruturados com Winston
