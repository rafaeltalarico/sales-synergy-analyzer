
export interface Product {
  id_produto: number;
  nome_produto: string;
  preco: number;
}

export interface Purchase {
  id_compra: number;
  data_compra: string;
  cpf: string;
}

export interface PurchaseItem {
  id: number;
  id_compra: number;
  id_produto: number;
  valor_unitario: number;
  encarte: string | null;
}

export interface RelatedProductData {
  productName: string;
  occurrences: number;
  percentage: number;
}

export interface SalesAnalysis {
  productId: number;
  productName: string;
  startDateSales: number;
  endDateSales: number;
  salesDifference: {
    percentage: number;
    absoluteValue: number;
    isIncrease: boolean;
  };
  relatedProducts: RelatedProductData[];
}
