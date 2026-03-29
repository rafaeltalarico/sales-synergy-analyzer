import {
  StockHistoryResponse,
  StockFilterParams,
  StockClassificationData,
  StockTotal,
  StockItem,
} from "@/models/stockTypes";
import {
  mockProducts,
  mockStockTotal,
  mockStockItems,
  generateStockHistory,
  buildClassification,
} from "./mockData";

// Simula delay de rede
const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export const getStockHistory = async (
  query: string,
  searchType: "product" | "sku",
  startDate: Date,
  endDate: Date
): Promise<StockHistoryResponse | null> => {
  await delay(350);
  const product = findProduct(query, searchType);
  if (!product) return null;
  return generateStockHistory(
    product.id_produto,
    product.nome_produto,
    startDate.toISOString().split("T")[0],
    endDate.toISOString().split("T")[0]
  );
};

export const getStockData = async (
  params: StockFilterParams
): Promise<StockHistoryResponse | null> => {
  return getStockHistory(
    params.query,
    params.searchType,
    new Date(params.startDate),
    new Date(params.endDate)
  );
};

export const getStockHistoryWithFetch = async (
  params: StockFilterParams
): Promise<StockHistoryResponse | null> => {
  return getStockData(params);
};

export const getStockClassification = async (
  query: string,
  searchType: "product" | "sku"
): Promise<StockClassificationData | null> => {
  await delay(200);
  const product = findProduct(query, searchType);
  if (!product) return null;
  return buildClassification(product.id_produto);
};

export const getStockTotal = async (): Promise<StockTotal | null> => {
  await delay(200);
  return mockStockTotal;
};

export const getStockItems = async (): Promise<StockItem[]> => {
  await delay(300);
  return mockStockItems;
};

// Funcao auxiliar para encontrar produto por nome ou SKU
function findProduct(query: string, searchType: "product" | "sku") {
  if (searchType === "sku") {
    const id = Number(query);
    if (isNaN(id)) return null;
    return mockProducts.find((p) => p.id_produto === id) || null;
  }
  const lower = query.toLowerCase();
  return (
    mockProducts.find((p) => p.nome_produto.toLowerCase().includes(lower)) ||
    null
  );
}
