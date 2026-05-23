### 01 | Performance da vitrine

A vitrine demora muitos segundos para carregar produtos, frustrando clientes logo no início da jornada.

- **Causa raiz:** Creio que o problema raiz seja a integração direta entre a loja virtual e o ERP. Qualquer lentidão no ERP ou no banco reflete no carregamento de produtos. Além disso, alguns endpoints podem estar trazendo mais informações que o necessário, ausência de cache e não ter uma paginação adequada.

- **Impacto:** O impacto para os negócios é alto e gera perda de leads. Grande parte dos acessos são feitos por dispositivos móveis como smartphones e tablets, e precisam ter suporte para redes mais lentas como 4G-slow e 3G, que pioram muito a experiência do usuário caso a plataforma não estiver com otimizações de dados e Web Core Vitals.

- **Solução:** Eu revisaria o tempo de resposta de cada um dos endpoints que mais impactam na demora da exibição dos produtos, para ver se ao fazer uma busca, o tempo é compatível com a demora no frontend. Se o retorno do endpoint for rápido (menos de 1s), posso partir para investigação do frontend com as melhorias citadas anteriormente.

### 02 | Consistência de estoque

Vários clientes conseguem comprar o mesmo produto quando o estoque acaba. A empresa está vendendo itens que não possui.

- **Causa raiz:** A base de dados ou ERP não está notificando que, ao último produto ser vendido, o mesmo se torna indisponível para a controladora da API que lista os produtos.

- **Impacto:** Nesses cenários temos impacto negativo para empresa e cliente. Para a empresa vemos o cenário que alto número de reclamações e pedidos de reembolso, e principalmente a sua confiabilidade sendo prejudicada. Para os clientes, a frustração de não receber o produto e precisar verificar como conseguir o estorno e procurar uma forma de ter o produto, às vezes comprando na concorrência.

- **Solução:** Eu começaria investigando os logs do sistema de monitoramento, conferindo se o alerta crítico avisando que o estoque está no fim foi disparado. Após isso, eu investigaria se a API tem Websocket ou algo similar para informar em tempo real quando a flag de produto acabando no estoque está disparando alguma mensagem. O endpoint da venda precisa fazer uma validação se existe produto no estoque antes de vender. E o endpoint que lista os produtos deve listar apenas os produtos que a quantidade for maior que zero. Com essas validações conseguimos descobrir a raiz do problema.

### 03 | Resiliência do checkout

Ao finalizar a compra, a API do ERP demora para processar o pedido e gerar faturamento. A requisição sofre timeout e o cliente perde a compra.

- **Causa raiz:** Acredito que o problema seja causado pela dependência síncrona do ERP durante o fluxo de checkout. O ERP provavelmente executa operações mais pesadas de faturamento, estoque e financeiro antes de responder a requisição, aumentando o tempo de processamento e gerando timeout.

- **Impacto:** Semelhante ao problema de consistência de estoque, timeout no checkout frustra o cliente que além de poder desistir da compra, fica na dúvida se o pagamento foi faturado antes do erro, o que pode gerar um transtorno ao precisar entrar em contato para conferir (dependendo do conhecimento do cliente em saber conferir transações efetuadas no APP de seu banco).

- **Solução:** Minha primeira linha de investigação seria analisar métricas de tempo de resposta do endpoint de checkout, identificar em qual etapa ocorre a lentidão e verificar comportamento em horários de pico. Também avaliaria mecanismos de retry, filas assíncronas e desacoplamento do processamento do ERP em relação à experiência do usuário.
---

## Pergunta 2 - Infraestrutura e serviços de apoio

De forma geral, o que você faria em relação à infraestrutura atual para suportar muitos acessos futuros sem depender diretamente do ERP em cada requisição?

- **Arquitetura:** Infraestrutura própria costuma dar mais confiabilidade para alto tráfego, mesmo com máquinas mais modestas. Mas para não depender diretamente do ERP para cada requisição, tanto da parte dos clientes como das ferramentas administrativas internas, eu trabalharia com uma camada intermediária entre o e-commerce e o ERP. O ERP continua sendo a fonte dos dados, mas não o responsável por todas as requisições da loja virtual.

- **Serviço de cache:** Um serviço que poderia ajudar seria uma camada de cache usando Redis. Armazenando informações de produtos e estoque mais acessados, sem que a listagem de produtos precisasse usar o ERP para isso.

- **Observabilidade:** Melhorar a observabilidade com Grafana ou Prometheus para acompanhar o tempo de resposta das requisições, falhas e comportamento em certos horários. Assim seria possível identificar potenciais problemas antes de chegarem nos clientes.

---
## Pergunta 3 - SDD: Spec-driven Development

Imagine que você precisa implementar o endpoint POST /checkout que finaliza a compra. Antes de codificar:

- **Que informações esse endpoint precisa receber?**

Produto selecionado e suas informações como variação e quantidade, forma de pagamento e endereço e valor. Algo como:

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

- **O que ele deve devolver em caso de sucesso?**

Além do status 200 OK, precisamos garantir que esse status só apareça para compras concluídas com sucesso, além de retornar um resumo das informações da compra (nome do produto, forma de pagamento, endereço de entrega):

```json
{
	"orderId": "ORD-001",
	"status": "processing",
	"message": "Order was received successful"
}
```

- **O que ele deve devolver em caso de erro?**

Precisamos lidar com cada tipo de erro, desde timeout, produto não encontrado, falha no pagamento. Com mensagem amigável para o cliente:

```json
{
	"error": "OUT_OF_STOCK",
	"message": "Product unavailable"
}
```

- **Por que é importante definir esse contrato antes de escrever código?**

É importante porque reduz dúvidas entre os times, facilita integração entre sistemas, ajuda na criação antecipada de testes e documentação. Além disso, evita que a programação assistida por IA vá por alucinações, o que reduz o retrabalho durante o desenvolvimento.
---

## Pergunta 4 - TDD: Test-Driven Development

Sobre testes do mesmo endpoint POST /checkout:

- **Que testes você escreveria para garantir que ele funciona corretamente? Liste pelo menos 3 cenários:**

1. Primeiro teste seria para verificar se o endpoint rejeita transações com dados inválidos no payload, retornando o código HTTP correto.
2. Validar se o endpoint bloqueia a compra se o estoque estiver indisponível com retorno HTTP apropriado.
3. Simular lentidão ou falha do ERP para validar se o sistema trata timeout da forma certa.

- **Há vantagem em escrever os testes antes de implementar a rota? Por quê?**

Sim, várias vantagens como: validar regras de negócio, melhora documentação, reduz falta de clareza da funcionalidade.

---
## Pergunta 5 - Uso de IA no desenvolvimento
Se você fosse implementar a solução para o Problema 2 (Furo de Estoque) usando IA: 
- **Que perguntas ou instruções você daria à IA?** 
Eu daria diversas instruções pois se trata de um sistema complexo, mas eu começaria com essas:

- “Como implementar uma reserva de estoque transacional para evitar overselling em um e-commerce com múltiplos checkouts simultâneos?”
- “Quais estratégias são mais utilizadas para garantir consistência de estoque em sistemas distribuídos?”
- “Como desacoplar estoque do ERP utilizando cache e sincronização assíncrona?”
- “Gere um exemplo de endpoint POST /checkout validando estoque antes da confirmação do pedido.”
- “Como estruturar tratamento de erro para estoque insuficiente?”
- “Como implementar idempotência para evitar pedidos duplicados?”
- “Quais métricas devo monitorar para detectar problemas de inconsistência de estoque?”
- “Como criar alertas para divergência entre estoque do ERP e estoque da loja?”