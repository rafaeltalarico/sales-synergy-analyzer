// ============================================================
// DADOS MOCKADOS PARA VERSAO DE APRESENTACAO (MOCKUP)
// Nenhuma integracao com backend, banco de dados ou APIs externas.
// ============================================================

import { Product, SalesAnalysis, RelatedProductData } from "@/models/types";
import {
  StockHistoryResponse,
  StockClassificationData,
  StockTotal,
  StockItem,
} from "@/models/stockTypes";

// ---------------------- PRODUTOS ----------------------

export const mockProducts: Product[] = [
  { id_produto: 1, nome_produto: "Arroz Integral 1kg", preco: 8.99 },
  { id_produto: 2, nome_produto: "Feijao Preto 1kg", preco: 7.49 },
  { id_produto: 3, nome_produto: "Macarrao Espaguete 500g", preco: 4.29 },
  { id_produto: 4, nome_produto: "Oleo de Soja 900ml", preco: 6.99 },
  { id_produto: 5, nome_produto: "Acucar Cristal 1kg", preco: 4.59 },
  { id_produto: 6, nome_produto: "Cafe Torrado 500g", preco: 15.9 },
  { id_produto: 7, nome_produto: "Leite Integral 1L", preco: 5.49 },
  { id_produto: 8, nome_produto: "Farinha de Trigo 1kg", preco: 4.99 },
  { id_produto: 9, nome_produto: "Molho de Tomate 340g", preco: 3.29 },
  { id_produto: 10, nome_produto: "Biscoito Cream Cracker 400g", preco: 5.19 },
  { id_produto: 11, nome_produto: "Azeite de Oliva 500ml", preco: 24.9 },
  { id_produto: 12, nome_produto: "Sal Refinado 1kg", preco: 2.49 },
  { id_produto: 13, nome_produto: "Manteiga 200g", preco: 8.79 },
  { id_produto: 14, nome_produto: "Queijo Mussarela 500g", preco: 22.9 },
  { id_produto: 15, nome_produto: "Presunto Fatiado 200g", preco: 9.99 },
  { id_produto: 16, nome_produto: "Pao de Forma 500g", preco: 7.49 },
  { id_produto: 17, nome_produto: "Iogurte Natural 170g", preco: 3.99 },
  { id_produto: 18, nome_produto: "Detergente 500ml", preco: 2.99 },
  { id_produto: 19, nome_produto: "Sabao em Po 1kg", preco: 12.49 },
  { id_produto: 20, nome_produto: "Papel Higienico 12 rolos", preco: 18.9 },
];

// ---------------------- CROSS-SELL (produtos relacionados) ----------------------

const relatedProductsMap: Record<number, RelatedProductData[]> = {
  1: [
    { productName: "Feijao Preto 1kg", occurrences: 87, percentage: 72 },
    { productName: "Oleo de Soja 900ml", occurrences: 65, percentage: 54 },
    { productName: "Molho de Tomate 340g", occurrences: 48, percentage: 40 },
    { productName: "Sal Refinado 1kg", occurrences: 39, percentage: 32 },
    { productName: "Farinha de Trigo 1kg", occurrences: 28, percentage: 23 },
  ],
  2: [
    { productName: "Arroz Integral 1kg", occurrences: 91, percentage: 74 },
    { productName: "Oleo de Soja 900ml", occurrences: 58, percentage: 47 },
    { productName: "Farinha de Trigo 1kg", occurrences: 42, percentage: 34 },
    { productName: "Acucar Cristal 1kg", occurrences: 35, percentage: 28 },
    { productName: "Cafe Torrado 500g", occurrences: 30, percentage: 24 },
  ],
  3: [
    { productName: "Molho de Tomate 340g", occurrences: 95, percentage: 78 },
    { productName: "Queijo Mussarela 500g", occurrences: 60, percentage: 49 },
    { productName: "Oleo de Soja 900ml", occurrences: 45, percentage: 37 },
    { productName: "Presunto Fatiado 200g", occurrences: 33, percentage: 27 },
    { productName: "Sal Refinado 1kg", occurrences: 22, percentage: 18 },
  ],
  4: [
    { productName: "Arroz Integral 1kg", occurrences: 70, percentage: 65 },
    { productName: "Feijao Preto 1kg", occurrences: 62, percentage: 57 },
    { productName: "Farinha de Trigo 1kg", occurrences: 40, percentage: 37 },
    { productName: "Acucar Cristal 1kg", occurrences: 32, percentage: 30 },
    { productName: "Sal Refinado 1kg", occurrences: 25, percentage: 23 },
  ],
  5: [
    { productName: "Cafe Torrado 500g", occurrences: 80, percentage: 68 },
    { productName: "Farinha de Trigo 1kg", occurrences: 55, percentage: 47 },
    { productName: "Leite Integral 1L", occurrences: 48, percentage: 41 },
    { productName: "Manteiga 200g", occurrences: 35, percentage: 30 },
    { productName: "Oleo de Soja 900ml", occurrences: 28, percentage: 24 },
  ],
  6: [
    { productName: "Acucar Cristal 1kg", occurrences: 88, percentage: 75 },
    { productName: "Leite Integral 1L", occurrences: 72, percentage: 61 },
    { productName: "Pao de Forma 500g", occurrences: 50, percentage: 42 },
    { productName: "Manteiga 200g", occurrences: 40, percentage: 34 },
    { productName: "Biscoito Cream Cracker 400g", occurrences: 30, percentage: 25 },
  ],
  7: [
    { productName: "Cafe Torrado 500g", occurrences: 78, percentage: 66 },
    { productName: "Pao de Forma 500g", occurrences: 65, percentage: 55 },
    { productName: "Acucar Cristal 1kg", occurrences: 52, percentage: 44 },
    { productName: "Manteiga 200g", occurrences: 38, percentage: 32 },
    { productName: "Iogurte Natural 170g", occurrences: 30, percentage: 25 },
  ],
  8: [
    { productName: "Acucar Cristal 1kg", occurrences: 65, percentage: 58 },
    { productName: "Oleo de Soja 900ml", occurrences: 52, percentage: 46 },
    { productName: "Leite Integral 1L", occurrences: 45, percentage: 40 },
    { productName: "Manteiga 200g", occurrences: 38, percentage: 34 },
    { productName: "Sal Refinado 1kg", occurrences: 28, percentage: 25 },
  ],
  9: [
    { productName: "Macarrao Espaguete 500g", occurrences: 98, percentage: 82 },
    { productName: "Queijo Mussarela 500g", occurrences: 55, percentage: 46 },
    { productName: "Oleo de Soja 900ml", occurrences: 40, percentage: 33 },
    { productName: "Sal Refinado 1kg", occurrences: 30, percentage: 25 },
    { productName: "Arroz Integral 1kg", occurrences: 25, percentage: 21 },
  ],
  10: [
    { productName: "Cafe Torrado 500g", occurrences: 60, percentage: 55 },
    { productName: "Leite Integral 1L", occurrences: 48, percentage: 44 },
    { productName: "Manteiga 200g", occurrences: 38, percentage: 35 },
    { productName: "Queijo Mussarela 500g", occurrences: 28, percentage: 25 },
    { productName: "Iogurte Natural 170g", occurrences: 22, percentage: 20 },
  ],
};

// Gera related products para IDs sem mapeamento especifico
function getDefaultRelatedProducts(): RelatedProductData[] {
  return [
    { productName: "Arroz Integral 1kg", occurrences: 45, percentage: 42 },
    { productName: "Feijao Preto 1kg", occurrences: 38, percentage: 35 },
    { productName: "Oleo de Soja 900ml", occurrences: 30, percentage: 28 },
    { productName: "Leite Integral 1L", occurrences: 25, percentage: 23 },
    { productName: "Cafe Torrado 500g", occurrences: 20, percentage: 18 },
  ];
}

// ---------------------- ANALISE DE VENDAS ----------------------

function generateSalesNumbers(productId: number): { start: number; end: number } {
  // Gera numeros pseudo-deterministicos baseados no productId
  const base = 40 + (productId * 17) % 60;
  const variation = 10 + (productId * 7) % 30;
  return { start: base, end: base + variation };
}

export function buildMockSalesAnalysis(
  productId: number,
  productName: string,
  comparisonType: "compare" | "until",
  isSecondProduct: boolean,
  comparePeriods: boolean
): SalesAnalysis {
  const { start, end } = generateSalesNumbers(productId);
  const relatedProducts = relatedProductsMap[productId] || getDefaultRelatedProducts();

  if (comparisonType === "until" && !comparePeriods && !isSecondProduct) {
    return {
      productId,
      productName,
      startDateSales: 0,
      endDateSales: end,
      salesDifference: {
        percentage: 0,
        absoluteValue: end,
        isIncrease: true,
      },
      relatedProducts,
      showComparison: false,
    };
  }

  const absoluteDifference = end - start;
  const percentage = start === 0 ? 100 : Math.round((absoluteDifference / start) * 100);

  return {
    productId,
    productName,
    startDateSales: start,
    endDateSales: end,
    salesDifference: {
      percentage: Math.abs(percentage),
      absoluteValue: Math.abs(absoluteDifference),
      isIncrease: absoluteDifference >= 0,
    },
    relatedProducts,
    showComparison: true,
  };
}

// ---------------------- ESTOQUE: HISTORICO ----------------------

function generateStockHistory(
  productId: number,
  productName: string,
  startDate: string,
  endDate: string
): StockHistoryResponse {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const days: StockHistoryResponse["history"] = [];
  const baseQty = 80 + (productId * 13) % 120;
  const baseValue = baseQty * (mockProducts.find((p) => p.id_produto === productId)?.preco || 10);
  let qty = baseQty;

  const current = new Date(start);
  while (current <= end) {
    const entries = Math.floor(Math.random() * 20);
    const outputs = Math.floor(Math.random() * 18);
    qty = Math.max(0, qty + entries - outputs);
    const unitPrice = mockProducts.find((p) => p.id_produto === productId)?.preco || 10;
    days.push({
      date: current.toISOString().split("T")[0],
      quantity: qty,
      entries,
      outputs,
      value: parseFloat((qty * unitPrice).toFixed(2)),
    });
    current.setDate(current.getDate() + 1);
  }

  return {
    productId,
    productName,
    sku: String(productId),
    initialStock: baseQty,
    history: days,
  };
}

export { generateStockHistory };

// ---------------------- ESTOQUE: CLASSIFICACAO ----------------------

const classificationMap: Record<number, StockClassificationData> = {};

function buildClassification(productId: number): StockClassificationData {
  if (classificationMap[productId]) return classificationMap[productId];
  // Gera classificacao deterministicamente
  const ok = 40 + (productId * 11) % 50;
  const stockOver = 5 + (productId * 3) % 15;
  const criticalAge = 2 + (productId * 7) % 10;
  const expired = (productId * 5) % 6;
  const total = ok + stockOver + criticalAge + expired;
  const data = { ok, stockOver, criticalAge, expired, total };
  classificationMap[productId] = data;
  return data;
}

export { buildClassification };

// ---------------------- ESTOQUE: TOTAIS E ITENS ----------------------

export const mockStockTotal: StockTotal = {
  quantity: 4827,
  value: 89432.5,
};

export const mockStockItems: StockItem[] = mockProducts.map((p) => {
  const qty = 80 + (p.id_produto * 13) % 120;
  return {
    id: p.id_produto,
    productId: p.id_produto,
    productName: p.nome_produto,
    sku: String(p.id_produto),
    quantity: qty,
    value: parseFloat((qty * p.preco).toFixed(2)),
    unitPrice: p.preco,
    date: new Date().toISOString().split("T")[0],
  };
});

// ---------------------- IA (respostas mockadas) ----------------------

const aiResponses: Record<string, string> = {
  default: `Com base na analise dos dados de vendas e estoque, identifiquei os seguintes pontos:

1. **Produtos mais vendidos**: Arroz Integral 1kg e Feijao Preto 1kg lideram as vendas com crescimento constante nos ultimos 3 meses, representando juntos 18% do faturamento total.

2. **Oportunidades de cross-sell**: Ha forte correlacao entre Cafe Torrado e Acucar Cristal (75% de co-ocorrencia), sugerindo acoes promocionais conjuntas.

3. **Estoque critico**: Queijo Mussarela e Presunto Fatiado apresentam giro rapido e risco de ruptura. Recomenda-se aumentar o ponto de reposicao em 20%.

4. **Margem de contribuicao**: Os itens da categoria "mercearia seca" (farinha, oleo, acucar) possuem margem media de 32%, acima da media geral de 28%.

5. **Sazonalidade**: As vendas de Leite Integral tendem a aumentar 15% nos meses de inverno. Considerar estoque estrategico para o proximo trimestre.`,
};

export function getMockAIResponse(pergunta: string): string {
  const lower = pergunta.toLowerCase();

  if (lower.includes("cross") || lower.includes("relacionado") || lower.includes("junto")) {
    return `**Analise de Cross-Sell**

Os produtos com maior indice de venda conjunta sao:

- **Arroz + Feijao**: 74% das compras de arroz incluem feijao
- **Macarrao + Molho de Tomate**: 82% de co-ocorrencia
- **Cafe + Acucar**: 75% de co-ocorrencia
- **Pao de Forma + Manteiga**: 55% de co-ocorrencia
- **Leite + Cafe**: 66% de co-ocorrencia

**Recomendacao**: Posicionar estes pares de produtos em ilhas promocionais ou displays conjuntos pode aumentar o ticket medio em ate 12%.`;
  }

  if (lower.includes("estoque") || lower.includes("ruptura") || lower.includes("stock")) {
    return `**Analise de Estoque**

Situacao atual do estoque:
- **4.827 unidades** em estoque total (R$ 89.432,50)
- **OK (65%)**: 13 produtos com niveis adequados
- **Stock Over (18%)**: 4 produtos com excesso (Arroz, Detergente, Papel Higienico, Sabao em Po)
- **Idade Critica (12%)**: 2 produtos proximos ao vencimento (Iogurte Natural, Queijo Mussarela)
- **Vencido (5%)**: 1 produto com validade expirada

**Acoes recomendadas**:
1. Promocao relampago para itens com idade critica
2. Reduzir pedido de compra para itens em stock over
3. Descartar produto vencido e registrar perda`;
  }

  if (lower.includes("venda") || lower.includes("faturamento") || lower.includes("receita")) {
    return `**Analise de Vendas**

Resumo do periodo:
- **Faturamento total**: R$ 127.450,00
- **Ticket medio**: R$ 42,80
- **Crescimento**: +8,5% em relacao ao periodo anterior

**Top 5 produtos por faturamento**:
1. Cafe Torrado 500g - R$ 18.540 (14,5%)
2. Azeite de Oliva 500ml - R$ 15.920 (12,5%)
3. Queijo Mussarela 500g - R$ 14.300 (11,2%)
4. Papel Higienico 12 rolos - R$ 12.800 (10,0%)
5. Arroz Integral 1kg - R$ 11.230 (8,8%)

**Tendencia**: Os itens de mercearia basica mantiveram estabilidade, enquanto itens premium (azeite, queijo) tiveram crescimento de 12%.`;
  }

  return aiResponses.default;
}
