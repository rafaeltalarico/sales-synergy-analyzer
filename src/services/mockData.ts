// ============================================================
// DADOS MOCKADOS - CONSTRUTOP (Material de Construcao)
// Versao de apresentacao (mockup) sem integracao com backend.
// ============================================================

import { Product, SalesAnalysis, RelatedProductData } from "@/models/types";
import {
  StockHistoryResponse,
  StockClassificationData,
  StockTotal,
  StockItem,
} from "@/models/stockTypes";

// ---------------------- PRODUTOS (Material de Construcao) ----------------------

export const mockProducts: Product[] = [
  { id_produto: 1, nome_produto: "Cimento CP II 50kg", preco: 34.9 },
  { id_produto: 2, nome_produto: "Argamassa AC-II 20kg", preco: 28.5 },
  { id_produto: 3, nome_produto: "Porcelanato 60x60 Polido (m²)", preco: 59.9 },
  { id_produto: 4, nome_produto: "Tijolo Ceramico 8 Furos", preco: 1.29 },
  { id_produto: 5, nome_produto: "Tinta Acrilica 18L Branco Neve", preco: 189.9 },
  { id_produto: 6, nome_produto: "Tubo PVC 100mm 6m", preco: 45.9 },
  { id_produto: 7, nome_produto: "Fio Eletrico 2.5mm 100m", preco: 189.0 },
  { id_produto: 8, nome_produto: "Areia Media m³", preco: 120.0 },
  { id_produto: 9, nome_produto: "Brita 1 m³", preco: 135.0 },
  { id_produto: 10, nome_produto: "Vergalhao CA-50 10mm 12m", preco: 42.5 },
  { id_produto: 11, nome_produto: "Impermeabilizante 18L", preco: 249.9 },
  { id_produto: 12, nome_produto: "Rejunte Flexivel 1kg", preco: 12.9 },
  { id_produto: 13, nome_produto: "Registro Pressao 3/4", preco: 35.9 },
  { id_produto: 14, nome_produto: "Ceramica 45x45 (m²)", preco: 34.9 },
  { id_produto: 15, nome_produto: "Vaso Sanitario c/ Caixa Acoplada", preco: 389.9 },
  { id_produto: 16, nome_produto: "Chuveiro Eletrico 5500W", preco: 89.9 },
  { id_produto: 17, nome_produto: "Massa Corrida PVA 25kg", preco: 42.9 },
  { id_produto: 18, nome_produto: "Telha Fibrocimento 2.44m", preco: 38.9 },
  { id_produto: 19, nome_produto: "Cal Hidratada 20kg", preco: 18.9 },
  { id_produto: 20, nome_produto: "Arame Recozido 1kg", preco: 14.9 },
];

// ---------------------- CROSS-SELL (produtos relacionados) ----------------------

const relatedProductsMap: Record<number, RelatedProductData[]> = {
  1: [ // Cimento
    { productName: "Areia Media m³", occurrences: 92, percentage: 78 },
    { productName: "Brita 1 m³", occurrences: 80, percentage: 68 },
    { productName: "Cal Hidratada 20kg", occurrences: 55, percentage: 47 },
    { productName: "Vergalhao CA-50 10mm 12m", occurrences: 45, percentage: 38 },
    { productName: "Arame Recozido 1kg", occurrences: 35, percentage: 30 },
  ],
  2: [ // Argamassa
    { productName: "Porcelanato 60x60 Polido (m²)", occurrences: 88, percentage: 75 },
    { productName: "Rejunte Flexivel 1kg", occurrences: 82, percentage: 70 },
    { productName: "Ceramica 45x45 (m²)", occurrences: 60, percentage: 51 },
    { productName: "Desempenadeira Aco", occurrences: 30, percentage: 25 },
    { productName: "Nivel de Bolha 30cm", occurrences: 22, percentage: 19 },
  ],
  3: [ // Porcelanato
    { productName: "Argamassa AC-II 20kg", occurrences: 95, percentage: 82 },
    { productName: "Rejunte Flexivel 1kg", occurrences: 90, percentage: 77 },
    { productName: "Espaçador 2mm", occurrences: 70, percentage: 60 },
    { productName: "Rodo Aluminio 40cm", occurrences: 32, percentage: 27 },
    { productName: "Impermeabilizante 18L", occurrences: 28, percentage: 24 },
  ],
  4: [ // Tijolo
    { productName: "Cimento CP II 50kg", occurrences: 98, percentage: 85 },
    { productName: "Areia Media m³", occurrences: 90, percentage: 78 },
    { productName: "Cal Hidratada 20kg", occurrences: 75, percentage: 65 },
    { productName: "Vergalhao CA-50 10mm 12m", occurrences: 55, percentage: 48 },
    { productName: "Arame Recozido 1kg", occurrences: 40, percentage: 35 },
  ],
  5: [ // Tinta
    { productName: "Massa Corrida PVA 25kg", occurrences: 88, percentage: 76 },
    { productName: "Rolo de La 23cm", occurrences: 72, percentage: 62 },
    { productName: "Lixa d'agua 220", occurrences: 65, percentage: 56 },
    { productName: "Fita Crepe 50m", occurrences: 50, percentage: 43 },
    { productName: "Bandeja para Pintura", occurrences: 45, percentage: 39 },
  ],
  6: [ // Tubo PVC
    { productName: "Registro Pressao 3/4", occurrences: 75, percentage: 65 },
    { productName: "Joelho PVC 90° 100mm", occurrences: 70, percentage: 61 },
    { productName: "Cola PVC 175g", occurrences: 65, percentage: 56 },
    { productName: "Vaso Sanitario c/ Caixa Acoplada", occurrences: 40, percentage: 35 },
    { productName: "Chuveiro Eletrico 5500W", occurrences: 30, percentage: 26 },
  ],
  7: [ // Fio Eletrico
    { productName: "Disjuntor 20A", occurrences: 68, percentage: 62 },
    { productName: "Tomada 2P+T 10A", occurrences: 60, percentage: 55 },
    { productName: "Caixa de Luz 4x2", occurrences: 55, percentage: 50 },
    { productName: "Fita Isolante 20m", occurrences: 50, percentage: 45 },
    { productName: "Interruptor Simples", occurrences: 42, percentage: 38 },
  ],
  8: [ // Areia
    { productName: "Cimento CP II 50kg", occurrences: 95, percentage: 82 },
    { productName: "Brita 1 m³", occurrences: 85, percentage: 73 },
    { productName: "Cal Hidratada 20kg", occurrences: 60, percentage: 52 },
    { productName: "Tijolo Ceramico 8 Furos", occurrences: 50, percentage: 43 },
    { productName: "Vergalhao CA-50 10mm 12m", occurrences: 38, percentage: 33 },
  ],
  9: [ // Brita
    { productName: "Cimento CP II 50kg", occurrences: 92, percentage: 80 },
    { productName: "Areia Media m³", occurrences: 88, percentage: 76 },
    { productName: "Vergalhao CA-50 10mm 12m", occurrences: 55, percentage: 48 },
    { productName: "Arame Recozido 1kg", occurrences: 40, percentage: 35 },
    { productName: "Tijolo Ceramico 8 Furos", occurrences: 30, percentage: 26 },
  ],
  10: [ // Vergalhao
    { productName: "Cimento CP II 50kg", occurrences: 90, percentage: 78 },
    { productName: "Areia Media m³", occurrences: 82, percentage: 71 },
    { productName: "Brita 1 m³", occurrences: 78, percentage: 67 },
    { productName: "Arame Recozido 1kg", occurrences: 72, percentage: 62 },
    { productName: "Tijolo Ceramico 8 Furos", occurrences: 45, percentage: 39 },
  ],
};

function getDefaultRelatedProducts(): RelatedProductData[] {
  return [
    { productName: "Cimento CP II 50kg", occurrences: 50, percentage: 45 },
    { productName: "Areia Media m³", occurrences: 42, percentage: 38 },
    { productName: "Argamassa AC-II 20kg", occurrences: 35, percentage: 32 },
    { productName: "Rejunte Flexivel 1kg", occurrences: 28, percentage: 25 },
    { productName: "Cal Hidratada 20kg", occurrences: 22, percentage: 20 },
  ];
}

// ---------------------- ANALISE DE VENDAS ----------------------

function generateSalesNumbers(productId: number): { start: number; end: number } {
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

// ---------------------- ESTOQUE: HISTORICO (valores fixos) ----------------------
//
// Dados explicitos dia a dia para SKU 1 e 2 nos ultimos 30 dias (02/03 a 31/03/2026).
// Os ultimos 7 dias (25/03 a 31/03) sao um subconjunto, garantindo consistencia.
// Preco unitario: SKU 1 = R$ 34,90 | SKU 2 = R$ 28,50
//

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

// ---------------------- IA (respostas mockadas - contexto Construtop) ----------------------

const aiResponses: Record<string, string> = {
  default: `Com base na analise dos dados de vendas e estoque da ConstruTOP, identifiquei os seguintes pontos:

1. **Produtos mais vendidos**: Cimento CP II 50kg e Argamassa AC-II 20kg lideram as vendas, representando juntos 22% do faturamento total. Ambos apresentam crescimento consistente de 12% nos ultimos 3 meses.

2. **Oportunidades de cross-sell**: Ha forte correlacao entre Porcelanato e Argamassa (82% de co-ocorrencia) e entre Cimento e Areia (78%). Recomendamos kits promocionais "Obra Completa".

3. **Estoque critico**: Vergalhao CA-50 e Telha Fibrocimento apresentam giro rapido e risco de ruptura. Recomenda-se aumentar o ponto de reposicao em 25%.

4. **Margem de contribuicao**: Os itens de acabamento (porcelanatos, ceramicas, tintas) possuem margem media de 38%, significativamente acima da media geral de 26%.

5. **Sazonalidade**: Historicamente, as vendas de materiais basicos (cimento, areia, tijolo) aumentam 20% entre agosto e novembro, periodo forte de construcao no Ceara. Recomenda-se preparar estoque estrategico.`,
};

export function getMockAIResponse(pergunta: string): string {
  const lower = pergunta.toLowerCase();

  if (lower.includes("cross") || lower.includes("relacionado") || lower.includes("junto")) {
    return `**Analise de Cross-Sell - ConstruTOP**

Os produtos com maior indice de venda conjunta sao:

- **Cimento + Areia**: 78% das compras de cimento incluem areia
- **Porcelanato + Argamassa**: 82% de co-ocorrencia
- **Tinta + Massa Corrida**: 76% de co-ocorrencia
- **Tubo PVC + Registro**: 65% de co-ocorrencia
- **Fio Eletrico + Disjuntor**: 62% de co-ocorrencia

**Recomendacao**: Criar kits promocionais por etapa da obra (kit alvenaria, kit acabamento, kit hidraulica) pode aumentar o ticket medio em ate 18%. Posicionar estes combos proximo aos caixas e nas pontas de gondola.`;
  }

  if (lower.includes("estoque") || lower.includes("ruptura") || lower.includes("stock")) {
    return `**Analise de Estoque - ConstruTOP**

Situacao atual do estoque:
- **12.450 unidades** em estoque total (R$ 534.890,00)
- **OK (62%)**: 12 produtos com niveis adequados
- **Stock Over (20%)**: 4 produtos com excesso (Cal Hidratada, Arame Recozido, Rejunte, Massa Corrida)
- **Idade Critica (13%)**: 3 produtos com giro abaixo do esperado (Impermeabilizante, Chuveiro Eletrico, Vaso Sanitario)
- **Vencido (5%)**: 1 produto com validade expirada (Impermeabilizante lote antigo)

**Acoes recomendadas**:
1. Promocao "Queima de Estoque" para Cal Hidratada e Arame Recozido (excesso de 35%)
2. Aumentar reposicao de Cimento e Vergalhao - risco de ruptura em 5 dias
3. Liquidar lote vencido de Impermeabilizante e ajustar ponto de compra`;
  }

  if (lower.includes("venda") || lower.includes("faturamento") || lower.includes("receita")) {
    return `**Analise de Vendas - ConstruTOP**

Resumo do periodo:
- **Faturamento total**: R$ 892.340,00
- **Ticket medio**: R$ 287,50
- **Crescimento**: +11,2% em relacao ao periodo anterior

**Top 5 produtos por faturamento**:
1. Cimento CP II 50kg - R$ 156.800 (17,6%)
2. Porcelanato 60x60 Polido - R$ 128.500 (14,4%)
3. Tinta Acrilica 18L - R$ 98.700 (11,1%)
4. Fio Eletrico 2.5mm 100m - R$ 78.400 (8,8%)
5. Impermeabilizante 18L - R$ 62.300 (7,0%)

**Tendencia**: O segmento de acabamento (porcelanatos, ceramicas, tintas) cresceu 15% no periodo, indicando aquecimento da fase de finalizacao de obras na regiao. Materiais basicos mantiveram estabilidade.`;
  }

  if (lower.includes("obra") || lower.includes("construc") || lower.includes("reform")) {
    return `**Analise de Tendencias de Obras - ConstruTOP**

Com base nos padroes de compra identificados:

**Perfil de compras por tipo de obra**:
- **Construcao nova**: Representa 45% do faturamento. Itens principais: cimento, areia, brita, tijolo, vergalhao
- **Reforma**: 35% do faturamento. Itens principais: tintas, porcelanatos, tubos PVC, registros
- **Acabamento**: 20% do faturamento. Itens: ceramicas, rejunte, metais, loucas sanitarias

**Insights**:
1. Clientes de reforma tem ticket medio 22% maior que clientes de construcao nova
2. 68% dos clientes que compram porcelanato voltam em ate 15 dias para comprar rejunte e argamassa
3. A venda de Impermeabilizante cresce 40% no periodo chuvoso (jan-abr)

**Oportunidade**: Criar um programa de fidelidade "Obra TOP" com descontos progressivos por etapa da obra pode reter ate 30% mais clientes recorrentes.`;
  }

  return aiResponses.default;
}
