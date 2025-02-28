
import { mockProducts, mockPurchases, mockPurchaseItems } from "./mockData";
import { Product, RelatedProductData, SalesAnalysis } from "@/models/types";

// Obter um produto pelo nome ou ID
export const getProductByNameOrId = (
  query: string,
  searchType: "product" | "sku"
): Product | null => {
  if (searchType === "product") {
    return (
      mockProducts.find(
        (p) => p.nome_produto.toLowerCase().includes(query.toLowerCase())
      ) || null
    );
  } else {
    const productId = parseInt(query);
    return mockProducts.find((p) => p.id_produto === productId) || null;
  }
};

// Analisar vendas de um produto entre duas datas
export const analyzeSales = (
  productId: number,
  startDate: Date,
  endDate: Date,
  comparisonType: "compare" | "until" = "compare"
): SalesAnalysis => {
  // Formatação de datas para comparação com o formato do banco de dados
  const formatDate = (date: Date) => {
    return date.toISOString().split("T")[0];
  };
  
  const formattedStartDate = formatDate(startDate);
  const formattedEndDate = formatDate(endDate);
  
  // Obter informações do produto
  const product = mockProducts.find((p) => p.id_produto === productId);
  
  if (comparisonType === "compare") {
    // Modo de comparação: comparar duas datas
    console.log("Analisando no modo COMPARAR:", formattedStartDate, "vs", formattedEndDate);
    
    // Obter todas as compras no período inicial (até a startDate)
    const startPeriodPurchases = mockPurchases.filter(
      (p) => p.data_compra <= formattedStartDate
    );
    
    // Obter todas as compras no período final (entre startDate e endDate)
    const endPeriodPurchases = mockPurchases.filter(
      (p) => p.data_compra > formattedStartDate && p.data_compra <= formattedEndDate
    );
    
    // IDs das compras em cada período
    const startPeriodPurchaseIds = startPeriodPurchases.map((p) => p.id_compra);
    const endPeriodPurchaseIds = endPeriodPurchases.map((p) => p.id_compra);
    
    // Itens vendidos do produto em cada período
    const startPeriodItems = mockPurchaseItems.filter(
      (item) =>
        item.id_produto === productId &&
        startPeriodPurchaseIds.includes(item.id_compra)
    );
    
    const endPeriodItems = mockPurchaseItems.filter(
      (item) =>
        item.id_produto === productId &&
        endPeriodPurchaseIds.includes(item.id_compra)
    );
    
    // Contagem de vendas em cada período
    const startPeriodSales = startPeriodItems.length;
    const endPeriodSales = endPeriodItems.length;
    
    console.log(`Vendas no período inicial: ${startPeriodSales}`);
    console.log(`Vendas no período final: ${endPeriodSales}`);
    
    // Calcular a diferença de vendas
    const absoluteDifference = endPeriodSales - startPeriodSales;
    const percentageDifference = startPeriodSales === 0
      ? 100
      : Math.round((absoluteDifference / startPeriodSales) * 100);
    
    // Encontrar produtos relacionados (que foram comprados junto) no período final
    const relatedProducts = getRelatedProducts(productId, endPeriodPurchaseIds);
    
    return {
      productId,
      productName: product?.nome_produto || "Produto Desconhecido",
      startDateSales: startPeriodSales,
      endDateSales: endPeriodSales,
      salesDifference: {
        percentage: Math.abs(percentageDifference),
        absoluteValue: Math.abs(absoluteDifference),
        isIncrease: absoluteDifference >= 0,
      },
      relatedProducts,
      showComparison: true
    };
  } else {
    // Modo "até": exibir apenas o total de vendas no período selecionado
    console.log("Analisando no modo ATÉ:", formattedStartDate, "até", formattedEndDate);
    
    // Obter todas as compras no período selecionado (entre startDate e endDate)
    const periodPurchases = mockPurchases.filter(
      (p) => p.data_compra >= formattedStartDate && p.data_compra <= formattedEndDate
    );
    
    // IDs das compras no período
    const periodPurchaseIds = periodPurchases.map((p) => p.id_compra);
    
    // Itens vendidos do produto no período
    const periodItems = mockPurchaseItems.filter(
      (item) =>
        item.id_produto === productId &&
        periodPurchaseIds.includes(item.id_compra)
    );
    
    // Contagem de vendas no período
    const totalSales = periodItems.length;
    
    console.log(`Total de vendas no período: ${totalSales}`);
    
    // Encontrar produtos relacionados (que foram comprados junto) no período
    const relatedProducts = getRelatedProducts(productId, periodPurchaseIds);
    
    return {
      productId,
      productName: product?.nome_produto || "Produto Desconhecido",
      startDateSales: 0,
      endDateSales: totalSales,
      salesDifference: {
        percentage: 0,
        absoluteValue: totalSales,
        isIncrease: true, // Não relevante no modo "até"
      },
      relatedProducts,
      showComparison: false
    };
  }
};

// Encontrar produtos relacionados (comprados junto)
const getRelatedProducts = (
  productId: number,
  purchaseIds: number[]
): RelatedProductData[] => {
  // Encontrar todas as compras que contêm o produto
  const purchasesWithProduct = mockPurchaseItems
    .filter(
      (item) => item.id_produto === productId && purchaseIds.includes(item.id_compra)
    )
    .map((item) => item.id_compra);
  
  if (purchasesWithProduct.length === 0) {
    return [];
  }
  
  // Contabilizar outros produtos nestas compras
  const productOccurrences: Record<number, number> = {};
  
  mockPurchaseItems.forEach((item) => {
    if (
      purchasesWithProduct.includes(item.id_compra) &&
      item.id_produto !== productId
    ) {
      if (!productOccurrences[item.id_produto]) {
        productOccurrences[item.id_produto] = 0;
      }
      productOccurrences[item.id_produto]++;
    }
  });
  
  // Calcular percentuais
  const totalPurchases = purchasesWithProduct.length;
  const relatedProductsData: RelatedProductData[] = Object.entries(productOccurrences)
    .map(([idProduto, occurrences]) => {
      const id = parseInt(idProduto);
      const product = mockProducts.find((p) => p.id_produto === id);
      return {
        productName: product?.nome_produto || `Produto ${id}`,
        occurrences,
        percentage: Math.round((occurrences / totalPurchases) * 100),
      };
    })
    .sort((a, b) => b.percentage - a.percentage)
    .slice(0, 5); // Top 5 produtos relacionados
  
  return relatedProductsData;
};
