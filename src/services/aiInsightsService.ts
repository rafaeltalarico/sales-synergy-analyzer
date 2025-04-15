import { ProductData } from "@/models/productTypes";
import { StockClassificationData } from "@/models/stockTypes";

// Types for AI insights
export interface ProductInsight {
  type: 'positive' | 'negative' | 'neutral' | 'suggestion';
  title: string;
  description: string;
  metric?: {
    value: number;
    unit: string;
    change?: number;
  };
}

export interface AIInsightsResponse {
  insights: ProductInsight[];
  summary: string;
}

// Mock function to generate insights based on product data
// In a real implementation, this would call an AI service API
export const getProductInsights = async (
  productId: string,
  salesData?: any,
  stockData?: StockClassificationData,
  relatedProducts?: any[]
): Promise<AIInsightsResponse> => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // In a real implementation, you would send the data to an AI service
  // and receive insights back. For now, we'll generate mock insights.
  
  const insights: ProductInsight[] = [
    {
      type: 'positive',
      title: 'Vendas em crescimento',
      description: 'Este produto apresentou um aumento de vendas de 12% nos últimos 30 dias comparado ao período anterior.',
      metric: {
        value: 12,
        unit: '%',
        change: 1
      }
    },
    {
      type: 'negative',
      title: 'Estoque crítico',
      description: 'Há unidades com data de validade próxima do vencimento. Considere estratégias promocionais para evitar perdas.',
      metric: {
        value: 15,
        unit: 'unidades',
        change: -1
      }
    },
    {
      type: 'suggestion',
      title: 'Oportunidade de cross-sell',
      description: 'Clientes que compram este produto frequentemente também compram produtos complementares. Considere criar promoções combinadas.',
    },
    {
      type: 'neutral',
      title: 'Sazonalidade detectada',
      description: 'Este produto apresenta picos de venda nos meses de verão. Planeje seu estoque de acordo.',
    }
  ];
  
  // Generate a summary
  const summary = "Este produto apresenta bom desempenho de vendas, mas requer atenção ao estoque. Há oportunidades de cross-sell e promoções sazonais que podem ser exploradas para maximizar o retorno.";
  
  return {
    insights,
    summary
  };
};