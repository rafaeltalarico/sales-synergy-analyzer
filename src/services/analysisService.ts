
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
  endDate: Date
): SalesAnalysis => {
  // Formatação de datas para comparação com o formato do banco de dados
  const formatDate = (date: Date) => {
    return date.toISOString().split("T")[0];
  };
  
  const formattedStartDate = formatDate(startDate);
  const formattedEndDate = formatDate(endDate);
  
  // Obter todas as compras no período inicial (até a startDate)
  const startPeriodPurchases = mockPurchases.filter(
    (p) => p.data_compra <= formattedStartDate
  );
  
  // Obter todas as compras no período final (até a endDate)
  const endPeriodPurchases = mockPurchases.filter(
    (p) => p.data_compra <= formattedEndDate && p.data_compra > formattedStartDate
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
  
  // Calcular a diferença de vendas
  const absoluteDifference = endPeriodSales - startPeriodSales;
  const percentageDifference = startPeriodSales === 0
    ? 100
    : Math.round((absoluteDifference / startPeriodSales) * 100);
  
  // Encontrar produtos relacionados (que foram comprados junto)
  const relatedProducts = getRelatedProducts(productId, endPeriodPurchaseIds);
  
  const product = mockProducts.find((p) => p.id_produto === productId);
  
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
  };
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
