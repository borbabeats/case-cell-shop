# Cell Shop Frontend

Frontend da aplicação Cell Shop - E-commerce de capas de celular desenvolvido com Next.js e Material-UI.

## Tecnologias

- **Next.js 16.2.6** - Framework React
- **React 19.2.4** - Biblioteca UI
- **Material-UI (MUI)** - Componentes de interface
- **Axios** - Cliente HTTP
- **Tailwind CSS 4** - Estilização
- **TypeScript** - Tipagem

## Estrutura do Projeto

```
frontend/
├── app/
│   ├── services/            # Serviços de API
│   │   ├── productService.ts # Serviço de produtos
│   │   └── checkoutService.ts # Serviço de checkout
│   ├── types/              # Tipos TypeScript
│   │   ├── product.ts      # Tipos de produto e filtros
│   │   └── checkout.ts     # Tipos de checkout
│   ├── lib/
│   │   └── api.js          # Configuração do Axios
│   ├── page.tsx            # Página principal (redireciona para produtos)
│   ├── produtos/
│   │   ├── page.tsx        # Listagem de produtos com filtros
│   │   └── [id]/
│   │       └── page.tsx    # Detalhes do produto
│   └── checkout/
│       └── page.tsx        # Página de checkout
└── package.json
```

## Funcionalidades

- **Listagem de Produtos**: Grid responsivo de produtos com paginação (10 por página)
- **Filtros via Backend**:
  - Busca por nome
  - Filtro por categoria (silicone, plástico, couro, metal, bambu)
  - Filtro por cor (12 opções: preto, branco, azul, vermelho, verde, rosa, cinza, laranja, roxo, dourado, titânio, mint)
  - Filtro por preço mínimo e máximo
  - Paginação com controles Anterior/Próxima
- **Detalhes do Produto**: Página individual com:
  - Imagem do produto
  - Nome, categoria, cor, preço, descrição
  - Informações de estoque
  - Seleção de quantidade
  - Seleção de método de pagamento (cartão de crédito, débito, PIX)
- **Checkout**: Formulário com:
  - Resumo do produto e valor total
  - Campo para ID do cliente
  - Endereço de entrega (rua, cidade, estado, CEP)
  - Processamento via API com feedback de sucesso/erro
  - Redirecionamento automático para produtos após sucesso

## Getting Started

### Pré-requisitos

- Backend rodando em `http://localhost:3000`
- Node.js instalado

### Instalação

```bash
cd frontend
npm install
```

### Executar o Servidor de Desenvolvimento

```bash
npm run dev
```

Acesse [http://localhost:3001](http://localhost:3001) no navegador.

### Build para Produção

```bash
npm run build
npm start
```

## API Integration

O frontend se conecta ao backend NestJS através dos serviços em `app/services/`:

- **productService.ts**: Gerencia produtos, filtros e paginação
- **checkoutService.ts**: Gerencia processamento de checkout

URL base da API: `http://localhost:3000`

## Páginas e Componentes

### `/produtos` (Listagem)
Página principal com grid de produtos, filtros backend e paginação. Inclui:
- Header com logo e carrinho
- Hero section com banner
- Barra de filtros (busca, categoria, cor, preço)
- Grid responsivo de cards de produtos
- Controles de paginação

### `/produtos/[id]` (Detalhes)
Página individual do produto com:
- Imagem em destaque
- Informações completas (nome, categoria, cor, preço, descrição, estoque)
- Seleção de quantidade
- Seleção de método de pagamento (checkboxes)
- Botão para prosseguir ao checkout

### `/checkout` (Finalização)
Página de checkout com:
- Resumo do produto e valor total
- Formulário de endereço de entrega
- Processamento via API
- Feedback de sucesso com redirecionamento automático