### Prompt 1 - Backend

A listagem de produtos deve retornar todos os produtos com seus respectivos dados com paginação de 10 em 10 produtos. no formato para API REST (data, total, page, limit).

A listagem de produtos deve retornar apenas produtos com stock maior que 0.

A listagem deve ser feita por ordem de criação, sendo o mais recente primeiro. Tambem deve ter parametros para filtro por nome, preco, categoria e cor.

Para efetuar a compra do produto, deve ser feito um endpoint que receba o id do produto e exiba todos os detalhes do mesmo.

O endpoint do checkout deve receber os dados do cliente (nome, endereco) e do produto (id, quantidade) e retornar um status de sucesso ou erro.

Exemplo de payload que o checkout espera: 

```json
{
	"customerId": "123",
	"items": [
		{
			"productId": "234",
			"quantity": 2
		}
	],
	"shippingAddress": {
		"street": "Rua x",
		"city": "Porto Alegre"
	},
	"paymentMethod": "credit_card",
	"totalAmount": 299.90
}
```

Caso o produto não tenha estoque suficiente, deve retornar um erro 400 com a mensagem "Produto sem estoque suficiente".

Caso o produto não exista, deve retornar um erro 404 com a mensagem "Produto não encontrado".

Caso o payload enviado esteja incompleto, deve retornar um erro 400 com a mensagem "Dados incompletos".

Caso o produto exista mas o estoque seja insuficiente com o pedido, deve retornar um erro 400 com a mensagem "Produto sem estoque suficiente".

Caso o pagamento seja realizado com sucesso, deve retornar um status 200 com a mensagem "Pagamento realizado com sucesso".


Para tratamento de erros, deve ser usado o padrão de erro global da aplicação, que é o seguinte:

```json
{
	"error": {
		"code": "PRODUCT_NOT_FOUND",
		"message": "Produto não encontrado",
		"details": {
			"productId": "123"
		}
	}
}
```

Com tratamento try/catch para capturar erros e retornar o erro no formato acima e evitar timeouts.

Para tratamento de mensagens de log, deve ser usado o padrao com WINSTON.

Para testar os endpoints, vamos usar swagger


### Prompt 2 - Frontend

A pagina que exibe todos os produtos deve ter um grid de 3 colunas e 3 linhas, com paginação de 10 em 10 produtos.

Para os componentes, vamos usar Material-UI com tailwindcss.

A pagina que exibe todos os produtos deve ter um filtro por nome, preco, categoria e cor, que deve ser aplicado em tempo real. Para esse exemplo vamos usar esses valores em hardcode no frontend, sem necessidade de buscar os valores para filtro no backend.

O endpoint que lista todos os produtos deve ser algo assim com filtros e paginacao:
http://localhost:3000/products?page=4&limit=5&name=iPhone&minPrice=10&maxPrice=80&category=silicone&color=preto

Para consumo da API, vamos usar o axios, e construir services para cada endpoint.

O endpoint /products deve retornar um array de produtos com o seguinte formato:
```json
{
    "data": [],
    "total": 0,
    "page": 1,
    "limit": 10
}

Cada produto deve ter o seguinte formato:
```json
{
    "id": "123",
    "name": "Produto 1",
    "color": "preto",
    "category": "silicone",
    "price": 299.90,
    "stock": 10,
    "description": "Descrição do produto 1",
    "image": "https://example.com/image.jpg",
    "created_at": "2025-10-15T10:00:00.000Z"
}
```

O endpoint para mostrar os detalhes do produto deve ser algo assim:
http://localhost:3000/products/57f15421-ca34-4646-bb55-c7b0ce931570

O endpoint para efetuar a compra do produto deve ser um post para:
http://localhost:3000/checkout

O payload do post deve ser algo assim:
```json
{
  "customerId": "cliente-123",
  "items": [
    {
      "productId": "57f15421-ca34-4646-bb55-c7b0ce931570",
      "quantity": 1
    }
  ],
  "shippingAddress": {
		"street": "Rua dos bobos",
		"city": "Porto Alegre",
		"state": "RS",
    "zipCode": "90120-000"
  },
  "paymentMethod": "credit_card",
  "totalAmount": 88.00
}
```
Para fazer os dropdowns de categoria e cor, vamos usar os enums do backend, que são:
- Categoria: silicone, plastico, couro, metal, bambu
- Cor: preto, branco, azul, vermelho, verde, rosa, cinza, laranja, roxo, dourado, titânio, mint

Na pagina individual do produto, vamos exibir os detalhes do produto, como nome, preco, categoria, cor, descricao, imagem, checkboxes para selecionar o metodo de pagamento (credit_card, debito, pix) e dropdown para selecionar a quantidade.

Para mensagens de sucesso, erro e alerta, vamos usar o padrao de notificacoes do Material-UI (snackbars).

O formato de erro da api deve ser algo assim:
```json
{
	"error": {
		"code": "Bad Request",
		"message": "estado do endereço é obrigatório, estado deve ser uma string"
	}
}
```

O formato de compra com sucesso deve ser algo assim:
```json
{
	"statusCode": 200,
	"orderId": "c989f025-e776-4393-b445-bdc86544e0c0",
	"orderNumber": "ORD-274810",
	"status": "processing",
	"message": "Pagamento realizado com sucesso",
	"totalAmount": 88
}
```

Onde vamos nao vamos redirecionar o usuario para a pagina de sucesso, mas sim mostrar uma mensagem de sucesso na pagina de checkout, e depois redirecionar para a pagina de produtos.