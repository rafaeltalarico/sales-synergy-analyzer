import type { AIInsightsResponse } from "@/models/types";
import { getMockAIResponse } from "./mockData";

// Simula delay de rede
const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function perguntarAoLuminAI(pergunta: string): Promise<string> {
  await delay(800); // Simula tempo de processamento da IA
  return getMockAIResponse(pergunta);
}

export async function getProductInsights(
  productId: string,
  salesData?: unknown,
  stockData?: unknown,
  relatedProducts?: unknown[]
): Promise<AIInsightsResponse> {
  await delay(600);
  return {
    summary: `Analise completa do produto ConstruTOP - ${productId} com base nos dados de vendas e estoque. Este produto apresenta desempenho acima da media no periodo analisado.`,
    insights: [
      {
        title: "Vendas em alta",
        description:
          "O produto teve aumento nas vendas de 15% nos ultimos 30 dias, superando a media da categoria.",
        type: "positive",
        metric: { value: 15, unit: "%", change: 5 },
      },
      {
        title: "Cross-sell identificado",
        description:
          "74% dos clientes que compraram este produto tambem levaram itens complementares. Oportunidade de bundle.",
        type: "suggestion",
        metric: { value: 74, unit: "%" },
      },
      {
        title: "Estoque adequado",
        description:
          "O nivel de estoque atual e suficiente para 22 dias de venda no ritmo atual.",
        type: "neutral",
        metric: { value: 22, unit: "dias" },
      },
      {
        title: "Atencao a sazonalidade",
        description:
          "Historicamente, as vendas deste produto caem 8% no proximo trimestre. Considere ajustar pedidos.",
        type: "negative",
        metric: { value: -8, unit: "%", change: -3 },
      },
    ],
  };
}
