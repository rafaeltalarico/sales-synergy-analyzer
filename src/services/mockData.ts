// ============================================================
// DADOS MOCKADOS - LuminAI (Material de Construcao)
// Versao de apresentacao (mockup) sem integracao com backend.
// Todos os valores sao explicitos, sem calculos.
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
  { id_produto: 1, nome_produto: "Requeijão Cremoso Itambé 200g", preco: 7.89 },
  { id_produto: 2, nome_produto: "Leite Condensado Moça 395g", preco: 10.89 },
  { id_produto: 3, nome_produto: "Gelatina em Pó Dr. Oetker 25g", preco: 1.94 },
  { id_produto: 4, nome_produto: "Miojo Nissin Lámen Galinha 85g (3 unid)", preco: 6.84 },
  { id_produto: 5, nome_produto: "Sabão em Pó Omo Lavagem Perfeita 1,8kg", preco: 25.89 },
  { id_produto: 6, nome_produto: "Fralda Desc. Huggies Tripla Prot. M (12 unid)", preco: 19 },
  { id_produto: 7, nome_produto: "Vodka Smirnoff 750ml", preco: 31.22 },
  { id_produto: 8, nome_produto: "Café Pilão Tradicional 250g", preco: 8.79 },
  { id_produto: 9, nome_produto: "Creme Dental Colgate Tripla Ação 90g", preco: 3.45 },
  { id_produto: 10, nome_produto: "Leite em Pó Ninho Instantâneo 800g", preco: 44.87 },
  { id_produto: 11, nome_produto: "Shampoo Seda Recarga Natural 325ml", preco: 14.54 },
  { id_produto: 12, nome_produto: "Desodorante Dove Aerosol 150ml", preco: 15.94 },
  { id_produto: 13, nome_produto: "Café em Cápsulas Nescafé Dolce Gusto (16 un.)", preco: 28.66 },
  { id_produto: 14, nome_produto: "Amaciante Downy Brisa de Verão 1,5L", preco: 20.94 },
  { id_produto: 15, nome_produto: "Pão de Forma Pullman Tradicional 500g", preco: 6.02 },
  { id_produto: 16, nome_produto: "Esponja de Aço Assolan c/ 8 unidades", preco: 4.19 },
  { id_produto: 17, nome_produto: "Óleo de Soja Liza 900ml (kit c/ 3)", preco: 24 },
  { id_produto: 18, nome_produto: "Vinho Chileno Reservado Concha y Toro 750ml", preco: 37.74 },
  { id_produto: 19, nome_produto: "Sabonete Líquido Palmolive Nutritivo 250ml", preco: 16.77 },
  { id_produto: 20, nome_produto: "Chocolate Kit Kat 41,5g", preco: 2.99 },
];

// ---------------------- CROSS-SELL ----------------------
// "ate" = recorte de ~20 dias, volumes maiores
// "comparar" = dia unico, volumes proporcionalmente menores

const crossSellAte: Record<number, RelatedProductData[]> = {
  1: [
    { productName: "Café Pilão Tradicional 250g", occurrences: 92, percentage: 78 },
    { productName: "Creme Dental Colgate Tripla Ação 90g", occurrences: 80, percentage: 68 },
    { productName: "Sabonete Líquido Palmolive Nutritivo 250ml", occurrences: 55, percentage: 47 },
    { productName: "Leite em Pó Ninho Instantâneo 800g", occurrences: 45, percentage: 38 },
    { productName: "Chocolate Kit Kat 41,5g", occurrences: 35, percentage: 30 },
  ],
  2: [
    { productName: "Gelatina em Pó Dr. Oetker 25g", occurrences: 88, percentage: 75 },
    { productName: "Desodorante Dove Aerosol 150ml", occurrences: 82, percentage: 70 },
    { productName: "Amaciante Downy Brisa de Verão 1,5L", occurrences: 60, percentage: 51 },
    { productName: "Requeijão Cremoso Itambé 200g", occurrences: 30, percentage: 25 },
    { productName: "Óleo de Soja Liza 900ml (kit c/ 3)", occurrences: 22, percentage: 19 },
  ],
};

const crossSellComparar: Record<number, RelatedProductData[]> = {
  1: [
    { productName: "Café Pilão Tradicional 250g", occurrences: 15, percentage: 75 },
    { productName: "Creme Dental Colgate Tripla Ação 90g", occurrences: 13, percentage: 65 },
    { productName: "Sabonete Líquido Palmolive Nutritivo 250ml", occurrences: 9, percentage: 45 },
    { productName: "Leite em Pó Ninho Instantâneo 800g", occurrences: 7, percentage: 35 },
    { productName: "Chocolate Kit Kat 41,5g", occurrences: 6, percentage: 30 },
  ],
  2: [
    { productName: "Gelatina em Pó Dr. Oetker 25g", occurrences: 24, percentage: 75 },
    { productName: "Desodorante Dove Aerosol 150ml", occurrences: 22, percentage: 69 },
    { productName: "Amaciante Downy Brisa de Verão 1,5L", occurrences: 17, percentage: 53 },
    { productName: "Requeijão Cremoso Itambé 200g", occurrences: 8, percentage: 25 },
    { productName: "Óleo de Soja Liza 900ml (kit c/ 3)", occurrences: 6, percentage: 19 },
  ],
};

function getDefaultRelatedProducts(): RelatedProductData[] {
  return [
    { productName: "Requeijão Cremoso Itambé 200g", occurrences: 50, percentage: 45 },
    { productName: "Café Pilão Tradicional 250g", occurrences: 42, percentage: 38 },
    { productName: "Leite Condensado Moça 395g", occurrences: 35, percentage: 32 },
    { productName: "Desodorante Dove Aerosol 150ml", occurrences: 28, percentage: 25 },
    { productName: "Sabonete Líquido Palmolive Nutritivo 250ml", occurrences: 22, percentage: 20 },
  ];
}

// ---------------------- VENDAS EXPLICITAS ----------------------
//
// MODO "ATE" (recorte de periodo):
//   Mar = 02/03/2026 ate 23/03/2026
//   Feb = 02/02/2026 ate 23/02/2026
//
// MODO "COMPARAR" (dia unico):
//   Dia 02/03/2026 vs Dia 02/02/2026
//

// --- SKU 1: Cimento CP II 50kg ---
//
// ATE Mar: 220 un. | ATE Feb: 185 un. | diff: 35, 19%, Feb<Mar (queda)
// COMPARAR 02/02: 8 un. | COMPARAR 02/03: 12 un. | diff: 4, 50%, aumento
//
// --- SKU 2: Argamassa AC-II 20kg ---
//
// ATE Mar: 145 un. | ATE Feb: 120 un. | diff: 25, 21%, Feb<Mar (queda)
// COMPARAR 02/02: 5 un. | COMPARAR 02/03: 7 un. | diff: 2, 40%, aumento
//

export function buildMockSalesAnalysis(
  productId: number,
  productName: string,
  comparisonType: "compare" | "until",
  isSecondProduct: boolean,
  comparePeriods: boolean,
  startDate?: string,
  endDate?: string,
  secondStartDate?: string,
  secondEndDate?: string
): SalesAnalysis {
  if (isSecondProduct) {
    const key = `${startDate}_${endDate}`;

    // Vendas do segundo produto no periodo
    let salesSegundoProduto = 0;
    if (productId === 2) {
      salesSegundoProduto = key === "2026-02-02_2026-02-23" ? 120 : 145;
    } else if (productId === 1) {
      salesSegundoProduto = key === "2026-02-02_2026-02-23" ? 185 : 220;
    } else {
      salesSegundoProduto = 30; // fallback
    }

    // Vendas do produto principal (SKU 1) no mesmo periodo
    // firstProductId e passado pelo Index.tsx mas aqui usamos valores explicitos
    let salesProdutoPrincipal = 0;
    if (key === "2026-02-02_2026-02-23") {
      salesProdutoPrincipal = 185; // SKU 1 em Fev
    } else {
      salesProdutoPrincipal = 220; // SKU 1 em Mar
    }

    const diff = salesSegundoProduto - salesProdutoPrincipal;

    return {
      productId,
      productName,
      startDateSales: salesProdutoPrincipal,
      endDateSales: salesSegundoProduto,
      salesDifference: {
        percentage: Math.round(Math.abs(diff / salesProdutoPrincipal) * 100),
        absoluteValue: Math.abs(diff),
        isIncrease: diff >= 0,
      },
      relatedProducts: (comparisonType === "compare"
        ? crossSellComparar[productId]
        : crossSellAte[productId]) || getDefaultRelatedProducts(),
      showComparison: true,
    };
  }

  // ================================================================
  //  MODO COMPARAR (duas datas pontuais: 02/02 vs 02/03)
  // ================================================================
  if (comparisonType === "compare") {

    if (productId === 1) {
      return {
        productId: 1,
        productName: "Requeijão Cremoso Itambé 200g ",
        startDateSales: 8,          // vendas em 02/02 (primeira data)
        endDateSales: 12,           // vendas em 02/03 (segunda data)
        salesDifference: {
          percentage: 50,
          absoluteValue: 4,
          isIncrease: true,         // 02/03 vendeu mais que 02/02
        },
        relatedProducts: crossSellComparar[1],
        showComparison: true,
      };
    }

    if (productId === 2) {
      return {
        productId: 2,
        productName: "Requeijão Cremoso Itambé 200g ",
        startDateSales: 15,
        endDateSales: 17,
        salesDifference: {
          percentage: 13,
          absoluteValue: 2,
          isIncrease: true,
        },
        relatedProducts: crossSellComparar[2],
        showComparison: true,
      };
    }

    // Fallback para qualquer outro SKU no modo comparar
    return {
      productId,
      productName,
      startDateSales: 3,
      endDateSales: 5,
      salesDifference: { percentage: 67, absoluteValue: 2, isIncrease: true },
      relatedProducts: getDefaultRelatedProducts(),
      showComparison: true,
    };
  }

  // ================================================================
  //  MODO ATE - PERIODO UNICO (sem comparacao entre periodos)
  // ================================================================
  if (!comparePeriods && !isSecondProduct) {
    const key = `${startDate}_${endDate}`;

    if (productId === 1) {
      const sales = key === "2026-02-02_2026-02-23" ? 185 : 220;
      return {
        productId: 1,
        productName: "Requeijão Cremoso Itambé 200g ",
        startDateSales: 0,
        endDateSales: sales,
        salesDifference: { percentage: 0, absoluteValue: sales, isIncrease: true },
        relatedProducts: crossSellAte[1],
        showComparison: false,
      };
    }

    if (productId === 2) {
      const sales = key === "2026-02-02_2026-02-23" ? 120 : 145;
      return {
        productId: 2,
        productName: "Requeijão Cremoso Itambé 200g ",
        startDateSales: 0,
        endDateSales: sales,
        salesDifference: { percentage: 0, absoluteValue: sales, isIncrease: true },
        relatedProducts: crossSellAte[2],
        showComparison: false,
      };
    }

    // Fallback
    return {
      productId,
      productName,
      startDateSales: 0,
      endDateSales: 30,
      salesDifference: { percentage: 0, absoluteValue: 30, isIncrease: true },
      relatedProducts: getDefaultRelatedProducts(),
      showComparison: false,
    };
  }

  // ================================================================
  //  MODO ATE - COMPARACAO DE 2 PERIODOS
  //  endDateSales   = Feb (exibido como principal)
  //  startDateSales = Mar (exibido no badge amarelo)
  //  Badge calcula:  isIncrease ? endDateSales - diff : endDateSales + diff
  // ================================================================

  if (productId === 1) {
    // Feb=185, Mar=220 → badge: 185+35=220 ✓
    return {
      productId: 1,
      productName: "Requeijão Cremoso Itambé 200g ",
      startDateSales: 220,
      endDateSales: 185,
      salesDifference: {
        percentage: 19,
        absoluteValue: 35,
        isIncrease: false,
      },
      relatedProducts: crossSellAte[1],
      showComparison: true,
    };
  }

  if (productId === 2) {
    // Feb=120, Mar=145 → badge: 120+25=145 ✓
    return {
      productId: 2,
      productName: "Requeijão Cremoso Itambé 200g ",
      startDateSales: 145,
      endDateSales: 120,
      salesDifference: {
        percentage: 21,
        absoluteValue: 25,
        isIncrease: false,
      },
      relatedProducts: crossSellAte[2],
      showComparison: true,
    };
  }

  // Fallback
  return {
    productId,
    productName,
    startDateSales: 30,
    endDateSales: 25,
    salesDifference: { percentage: 20, absoluteValue: 5, isIncrease: false },
    relatedProducts: getDefaultRelatedProducts(),
    showComparison: true,
  };
}

// ---------------------- ESTOQUE: HISTORICO ----------------------

type HistoryDay = { date: string; quantity: number; entries: number; outputs: number; value: number };

const stockHistorySku1: HistoryDay[] = [
  { date: "2026-03-02", quantity: 93,  entries: 0,  outputs: 0,  value: 3245.70 },
  { date: "2026-03-03", quantity: 85,  entries: 0,  outputs: 8,  value: 2966.50 },
  { date: "2026-03-04", quantity: 78,  entries: 0,  outputs: 7,  value: 2722.20 },
  { date: "2026-03-05", quantity: 72,  entries: 0,  outputs: 6,  value: 2512.80 },
  { date: "2026-03-06", quantity: 65,  entries: 0,  outputs: 7,  value: 2268.50 },
  { date: "2026-03-07", quantity: 115, entries: 60, outputs: 10, value: 4013.50 },
  { date: "2026-03-08", quantity: 108, entries: 0,  outputs: 7,  value: 3769.20 },
  { date: "2026-03-09", quantity: 99,  entries: 0,  outputs: 9,  value: 3455.10 },
  { date: "2026-03-10", quantity: 90,  entries: 0,  outputs: 9,  value: 3141.00 },
  { date: "2026-03-11", quantity: 84,  entries: 0,  outputs: 6,  value: 2931.60 },
  { date: "2026-03-12", quantity: 76,  entries: 0,  outputs: 8,  value: 2652.40 },
  { date: "2026-03-13", quantity: 70,  entries: 0,  outputs: 6,  value: 2443.00 },
  { date: "2026-03-14", quantity: 130, entries: 70, outputs: 10, value: 4537.00 },
  { date: "2026-03-15", quantity: 122, entries: 0,  outputs: 8,  value: 4257.80 },
  { date: "2026-03-16", quantity: 115, entries: 0,  outputs: 7,  value: 4013.50 },
  { date: "2026-03-17", quantity: 106, entries: 0,  outputs: 9,  value: 3699.40 },
  { date: "2026-03-18", quantity: 98,  entries: 0,  outputs: 8,  value: 3420.20 },
  { date: "2026-03-19", quantity: 91,  entries: 0,  outputs: 7,  value: 3175.90 },
  { date: "2026-03-20", quantity: 82,  entries: 0,  outputs: 9,  value: 2861.80 },
  { date: "2026-03-21", quantity: 140, entries: 68, outputs: 10, value: 4886.00 },
  { date: "2026-03-22", quantity: 132, entries: 0,  outputs: 8,  value: 4606.80 },
  { date: "2026-03-23", quantity: 124, entries: 0,  outputs: 8,  value: 4327.60 },
  { date: "2026-03-24", quantity: 117, entries: 0,  outputs: 7,  value: 4083.30 },
  // --- ultimos 7 dias (25/03 a 31/03) ---
  { date: "2026-03-25", quantity: 109, entries: 0,  outputs: 8,  value: 3804.10 },
  { date: "2026-03-26", quantity: 101, entries: 0,  outputs: 8,  value: 3524.90 },
  { date: "2026-03-27", quantity: 93,  entries: 0,  outputs: 8,  value: 3245.70 },
  { date: "2026-03-28", quantity: 148, entries: 65, outputs: 10, value: 5165.20 },
  { date: "2026-03-29", quantity: 139, entries: 0,  outputs: 9,  value: 4851.10 },
  { date: "2026-03-30", quantity: 131, entries: 0,  outputs: 8,  value: 4571.90 },
  { date: "2026-03-31", quantity: 122, entries: 0,  outputs: 9,  value: 4257.80 },
];

const stockHistorySku2: HistoryDay[] = [
  { date: "2026-03-02", quantity: 140, entries: 0,  outputs: 0,  value: 3990.00 },
  { date: "2026-03-03", quantity: 135, entries: 0,  outputs: 5,  value: 3847.50 },
  { date: "2026-03-04", quantity: 131, entries: 0,  outputs: 4,  value: 3733.50 },
  { date: "2026-03-05", quantity: 126, entries: 0,  outputs: 5,  value: 3591.00 },
  { date: "2026-03-06", quantity: 120, entries: 0,  outputs: 6,  value: 3420.00 },
  { date: "2026-03-07", quantity: 158, entries: 45, outputs: 7,  value: 4503.00 },
  { date: "2026-03-08", quantity: 152, entries: 0,  outputs: 6,  value: 4332.00 },
  { date: "2026-03-09", quantity: 147, entries: 0,  outputs: 5,  value: 4189.50 },
  { date: "2026-03-10", quantity: 141, entries: 0,  outputs: 6,  value: 4018.50 },
  { date: "2026-03-11", quantity: 136, entries: 0,  outputs: 5,  value: 3876.00 },
  { date: "2026-03-12", quantity: 130, entries: 0,  outputs: 6,  value: 3705.00 },
  { date: "2026-03-13", quantity: 125, entries: 0,  outputs: 5,  value: 3562.50 },
  { date: "2026-03-14", quantity: 168, entries: 50, outputs: 7,  value: 4788.00 },
  { date: "2026-03-15", quantity: 162, entries: 0,  outputs: 6,  value: 4617.00 },
  { date: "2026-03-16", quantity: 157, entries: 0,  outputs: 5,  value: 4474.50 },
  { date: "2026-03-17", quantity: 151, entries: 0,  outputs: 6,  value: 4303.50 },
  { date: "2026-03-18", quantity: 145, entries: 0,  outputs: 6,  value: 4132.50 },
  { date: "2026-03-19", quantity: 140, entries: 0,  outputs: 5,  value: 3990.00 },
  { date: "2026-03-20", quantity: 134, entries: 0,  outputs: 6,  value: 3819.00 },
  { date: "2026-03-21", quantity: 175, entries: 48, outputs: 7,  value: 4987.50 },
  { date: "2026-03-22", quantity: 169, entries: 0,  outputs: 6,  value: 4816.50 },
  { date: "2026-03-23", quantity: 164, entries: 0,  outputs: 5,  value: 4674.00 },
  { date: "2026-03-24", quantity: 158, entries: 0,  outputs: 6,  value: 4503.00 },
  // --- ultimos 7 dias (25/03 a 31/03) ---
  { date: "2026-03-25", quantity: 153, entries: 0,  outputs: 5,  value: 4360.50 },
  { date: "2026-03-26", quantity: 147, entries: 0,  outputs: 6,  value: 4189.50 },
  { date: "2026-03-27", quantity: 142, entries: 0,  outputs: 5,  value: 4047.00 },
  { date: "2026-03-28", quantity: 185, entries: 50, outputs: 7,  value: 5272.50 },
  { date: "2026-03-29", quantity: 179, entries: 0,  outputs: 6,  value: 5101.50 },
  { date: "2026-03-30", quantity: 174, entries: 0,  outputs: 5,  value: 4959.00 },
  { date: "2026-03-31", quantity: 168, entries: 0,  outputs: 6,  value: 4788.00 },
];

function generateStockHistory(
  productId: number,
  productName: string,
  startDate: string,
  endDate: string
): StockHistoryResponse {
  // SKU 1 e 2: retorna dados fixos filtrados pelo periodo
  const fixedData: Record<number, HistoryDay[]> = {
    1: stockHistorySku1,
    2: stockHistorySku2,
  };

  const allDays = fixedData[productId];
  if (allDays) {
    const filtered = allDays.filter((d) => d.date >= startDate && d.date <= endDate);
    return {
      productId,
      productName,
      sku: String(productId),
      initialStock: filtered.length > 0 ? filtered[0].quantity : 0,
      history: filtered,
    };
  }

  // Fallback para outros SKUs (dados simples fixos)
  return {
    productId,
    productName,
    sku: String(productId),
    initialStock: 50,
    history: [
      { date: startDate, quantity: 50, entries: 0, outputs: 0, value: 500.00 },
      { date: endDate, quantity: 45, entries: 5, outputs: 10, value: 450.00 },
    ],
  };
}

export { generateStockHistory };
// ---------------------- ESTOQUE: CLASSIFICACAO ----------------------

const classificationMap: Record<number, StockClassificationData> = {};

function buildClassification(productId: number): StockClassificationData {
  if (classificationMap[productId]) return classificationMap[productId];
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
  quantity: 12450,
  value: 534890.0,
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

// ---------------------- IA ----------------------

const aiResponses: Record<string, string> = {
  default: `Com base na analise dos dados de vendas e estoque, identifiquei os seguintes pontos:

1. **Produtos mais vendidos**: Requeijão Cremoso Itambé 200g e Leite Condensado Moça 395g lideram as vendas, representando juntos 22% do faturamento total. Ambos apresentam crescimento consistente de 12% nos ultimos 3 meses.

2. **Oportunidades de cross-sell**: Ha forte correlacao entre Gelatina em Pó Dr. Oetker 25g e Leite Condensado Moça 395g (82% de co-ocorrencia) e entre Requeijão Cremoso Itambé 200g e Café Pilão Tradicional 250g (78%). Recomendamos kits promocionais.

3. **Estoque critico**: Leite em Pó Ninho Instantâneo 800g e Vinho Chileno Reservado Concha y Toro 750ml apresentam giro rapido e risco de ruptura. Recomenda-se aumentar o ponto de reposicao em 25%.

4. **Margem de contribuicao**: Os itens de laticínios possuem margem media de 38%, significativamente acima da media geral de 26%.

5. **Sazonalidade**: Historicamente, as vendas de bebidas aumentam 20% em datas festivas ou feriados prolongados. Recomenda-se preparar estoque estrategico.`,
};

export function getMockAIResponse(pergunta: string): string {
  const lower = pergunta.toLowerCase();

  // Pergunta 1: Estoque inteligente / projeção de compras
  if (lower.includes("estoque") || lower.includes("compra") || lower.includes("projec") || lower.includes("reposic") || lower.includes("inteligente")) {
    return `**Projecao Inteligente de Compras - LuminAI**
*Periodo analisado: 02/02/2026 a 23/03/2026 | Base: vendas, estoque atual, sazonalidade e fatores externos*

---

**Resumo do cenario atual:**
- Estoque total: 12.450 unidades (R$ 534.890,00)
- Orcamento disponivel para compras: R$ 180.000,00
- Periodo projetado: Abril e Maio/2026

---

**Fatores considerados na projecao:**
- Historico de vendas dos ultimos 60 dias
- Giro medio por SKU (cobertura em dias)
- Sazonalidade: abril marca o fim do periodo chuvoso no Ceara, com retomada forte de obras (+18% vs. marco)
- Feriado de Semana Santa (02-04/abr): queda estimada de 35% nas vendas da semana
- Feriado de Tiradentes (21/abr): queda pontual de 15%
- Dia das Maes (mai): aumento de 22% em itens de acabamento e reforma

---

**Itens com necessidade critica de reposicao (ruptura em ate 7 dias):**

| SKU | Produto | Estoque atual | Giro/dia | Cobertura | Qtd sugerida | Investimento |
|-----|---------|--------------|----------|-----------|-------------|-------------|
| 1 | Requeijão Cremoso Itambé 200g  | 93 un. | 10,5 un. | 9 dias | 450 un. | R$ 15.705,00 |
| 10 | Leite em Pó Ninho Instantâneo 800g | 67 un. | 7,6 un. | 9 dias | 320 un. | R$ 13.600,00 |
| 8 | Café Pilão Tradicional 250g | 42 un. | 5,2 un. | 8 dias | 220 un. | R$ 26.400,00 |

**Itens com reposicao recomendada (cobertura entre 8 e 15 dias):**

| SKU | Produto | Estoque atual | Giro/dia | Cobertura | Qtd sugerida | Investimento |
|-----|---------|--------------|----------|-----------|-------------|-------------|
| 9 | Creme Dental Colgate Tripla Ação 90g | 88 un. | 5,0 un. | 18 dias | 180 un. | R$ 24.300,00 |
| 4 | Miojo Nissin Lámen Galinha 85g (3 unid) | 1.200 un. | 88 un. | 14 dias | 3.500 un. | R$ 4.515,00 |
| 18 | Vinho Chileno Reservado Concha y Toro 750ml | 105 un. | 6,1 un. | 17 dias | 250 un. | R$ 9.725,00 |

**Itens em excesso (stock over — nao comprar):**

| SKU | Produto | Estoque atual | Giro/dia | Cobertura |
|-----|---------|--------------|----------|-----------|
| 19 | Sabonete Líquido Palmolive Nutritivo 250ml | 310 un. | 3,8 un. | 82 dias |
| 20 | Chocolate Kit Kat 41,5g | 195 un. | 2,1 un. | 93 dias |
| 12 | Desodorante Dove Aerosol 150ml | 280 un. | 3,5 un. | 80 dias |

---

**Sugestao de pedido otimizado (dentro do orcamento de R$ 180.000):**

| Prioridade | Investimento | Itens |
|-----------|-------------|-------|
| Critica | R$ 55.705,00 | Requeijão, Leite em Pó, Café |
| Recomendada | R$ 38.540,00 | Creme Dental, Miojo, Vinho |
| Bebidas  | R$ 42.800,00 | Vodka Smirnoff, Vinho Concha y Toro |
| Reserva tecnica | R$ 42.955,00 | Margem para compras emergenciais |
| **Total** | **R$ 180.000,00** | |

**Conclusao**: Priorizar a reposicao de insumos basicos do dia a dia (requeijão, leite em pó, café) que estao com cobertura critica. Reservar 24% do orcamento para bebidas. Nao realizar compras de produtos de limpeza nos próximos 45 dias`;
  }

  // Pergunta 2: Markup e margem líquida
  if (lower.includes("markup") || lower.includes("margem") || lower.includes("lucrativ") || lower.includes("rentabil")) {
    return `**Analise de Markup e Margem Liquida - LuminAI**
*Referencia: Marco/2026*

---

**Indicadores gerais do mes:**
- **Markup medio**: 42,5%
- **Margem liquida media**: 14,8%
- Faturamento bruto: R$ 892.340,00
- Lucro liquido estimado: R$ 132.066,00

---

**Top 3 SKUs — Melhor markup e margem liquida:**

| # | SKU | Produto | Markup | Margem Liquida |
|---|-----|---------|--------|---------------|
| 1 | 11 | Shampoo Seda Recarga Natural 325ml | 78,2% | 28,4% |
| 2 | 5 | Sabão em Pó Omo Lavagem Perfeita 1,8kg | 65,3% | 24,1% |
| 3 | 3 | Gelatina em Pó Dr. Oetker 25g | 58,7% | 21,6% |

*Observacao: Itens de higiene pessoal concentram as melhores margens. O Shampoo Seda lidera devido ao baixo custo de aquisicao e alto valor percebido pelo cliente. O sabão em pó possui margem elevada por conta de acordo comercial com o fornecedor que reduziu o custo em 8% neste trimestre.*

---

**Top 3 SKUs — Pior markup e margem liquida:**

| # | SKU | Produto | Markup | Margem Liquida |
|---|-----|---------|--------|---------------|
| 1 | 4 | Miojo Nissin Lámen Galinha 85g (3 unid) | 12,3% | 3,1% |
| 2 | 1 | Requeijão Cremoso Itambé 200g  | 15,8% | 4,7% |
| 3 | 8 | Café Pilão Tradicional 250g | 18,4% | 5,9% |

*Observacao: Bebidas operam com margens apertadas por serem altamente competitivos e sensiveis a preco. Porem, sao os principais geradores de trafego na loja — 72% dos clientes que compram requeijão levam pelo menos 3 outros itens com margem superior.*

---

**Analise complementar:**
- A categoria **Bebida** (Vodka Smirnoff, Vinho Concha y Toro) representa 20% do volume mas contribui com 38% do lucro liquido
- A categoria **Higiene Pessoal** (Colgate, Shampoo Seda, Dove, Sabonete Palmolive) representa 55% do volume mas apenas 28% do lucro liquido
- A categoria **Padaria** (Pão Pullman) possui markup medio de 44,1% e margem liquida de 16,2%

**Recomendacao**: Intensificar acoes de cross-sell entre itens estruturais (alto giro, baixa margem) e itens de acabamento (menor giro, alta margem). Cada cliente que compra cimento e leva tambem um impermeabilizante eleva o ticket medio em R$ 249,90 e a margem da venda de 4,7% para 18,3%.`;
  }

  // Pergunta 3: Análise geral (fallback)
  return `**Analise Geral - LuminAI**
*Periodo: Fevereiro e Marco/2026*

---

**Desempenho comercial:**
- Faturamento acumulado: R$ 1.748.600,00
- Crescimento vs. bimestre anterior: +9,3%
- Ticket medio: R$ 287,50 (+4,2% vs. periodo anterior)
- Total de vendas: 6.082 transacoes

**Produtos mais vendidos (volume):**
1. Miojo Nissin Lámen Galinha 85g (3 unid) — 3.470 un.
2. Requeijão Cremoso Itambé 200g  — 405 un.
3. Sabonete Líquido Palmolive Nutritivo 250ml — 343 un.
4. Leite Condensado Moça 395g — 265 un.
5. Desodorante Dove Aerosol 150ml — 323 un.

**Produtos mais vendidos (faturamento):**
1. Miojo Nissin Lámen Galinha 85g (3 unid) — R$ 156.800 (17,6%)
2. Gelatina em Pó Dr. Oetker 25g  — R$ 128.500 (14,4%)
3. Sabão em Pó Omo Lavagem Perfeita 1,8kg — R$ 98.700 (11,1%)
4. Vodka Smirnoff 750ml — R$ 78.400 (8,8%)
5. Shampoo Seda Recarga Natural 325ml — R$ 62.300 (7,0%)

---

**Estoque:**
- 12.450 unidades em estoque (R$ 534.890,00)
- 3 itens com risco de ruptura em ate 7 dias (Requeijão, Leite em Pó, Café)
- 3 itens em excesso com cobertura acima de 80 dias (Sabonete Palmolive, Chocolate Kit Kat, Desodorante Dove)

**Markup e rentabilidade:**
- Markup medio: 42,5%
- Margem liquida media: 14,8%
- Melhor margem: Shampoo Seda Recarga Natural 325ml (28,4%)
- Pior margem: Miojo Nissin Lámen Galinha 85g (3 unid) (3,1%)

---

**Oportunidades identificadas:**
1. **Cross-sell bebidas + latícínios**: 78% dos clientes que compram cerveja tambem compram leite, mas apenas 12% levam enxaguante bucal. Acao de venda sugerida na baia de higiene pessoal pode elevar margem media em 13,6 pontos percentuais
2. **Sazonalidade**: Junho marca início da copa do mundo e festas de São João. Preparar estoque de insumos basicos (farinha, leite, ovos) e bebidas (cerveja, refrigerante) para atender aumento de demanda estimado em +18% vs. maio
3. **Dia das Maes (maio)**: Historicamente +22% em itens de papelaria. 
4. **Estoque inteligente**: Realocar R$ 55.700 do orcamento para reposicao critica de pipoca, páo de forma e papel toalha. Suspender compras de alvejante e vassoura por 45 dias

**Conclusao**: O bimestre apresenta crescimento solido com oportunidades claras de melhoria na margem atraves de cross-sell e gestao inteligente de estoque. Priorizar acoes que conectem produtos de alto giro com produtos de alta margem.`;
}
