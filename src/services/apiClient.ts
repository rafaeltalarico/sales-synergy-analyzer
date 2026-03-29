import { Product, SalesAnalysis } from "@/models/types";
import { mockProducts, buildMockSalesAnalysis } from "./mockData";

// Simula delay de rede para parecer realista na apresentacao
const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

// Buscar um produto pelo nome ou ID (mockado)
export const getProductByNameOrId = async (
  query: string,
  searchType: "product" | "sku"
): Promise<Product | null> => {
  await delay(300);

  if (!query.trim()) return null;

  if (searchType === "sku") {
    const id = Number(query);
    if (isNaN(id)) return null;
    return mockProducts.find((p) => p.id_produto === id) || null;
  }

  // Busca por nome (parcial, case-insensitive)
  const lower = query.toLowerCase();
  return (
    mockProducts.find((p) => p.nome_produto.toLowerCase().includes(lower)) ||
    null
  );
};

// Analisar vendas de um produto (mockado)
export const analyzeSales = async (
  productId: number,
  startDate: Date,
  endDate: Date,
  comparisonType: "compare" | "until" = "compare",
  isSecondProduct: boolean = false,
  firstProductId?: number,
  selectedDateRange?: number | null,
  comparePeriods: boolean = false,
  secondStartDate?: Date,
  secondEndDate?: Date
): Promise<SalesAnalysis> => {
  await delay(400);

  const product = mockProducts.find((p) => p.id_produto === productId);
  const productName = product?.nome_produto || "Produto Desconhecido";

  return buildMockSalesAnalysis(
    productId,
    productName,
    comparisonType,
    isSecondProduct,
    comparePeriods
  );
};
