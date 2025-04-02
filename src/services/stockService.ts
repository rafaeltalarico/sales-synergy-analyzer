import axios, { AxiosResponse } from 'axios';
// Add to package.json: npm install axios @types/axios
import { StockHistoryResponse, StockFilterParams } from "@/models/stockTypes";

const API_URL = "http://localhost:8000";

// Função para buscar o histórico de estoque de um produto
// Nota: searchType "sku" se refere ao id_produto nas tabelas do banco de dados
export const getStockHistory = async (
  query: string,
  searchType: "product" | "sku",
  startDate: Date,
  endDate: Date
) => {
  try {
    const response = await axios.get(`${API_URL}/stock/history`, {  
      params: {
        query,
        search_type: searchType,
        start_date: startDate.toISOString().split("T")[0],
        end_date: endDate.toISOString().split("T")[0],
      }
    });

    return response.data;
  } catch (error) {
    console.error("Erro ao buscar histórico de estoque:", error);
    return null;
  }
};

// Função para buscar dados de estoque usando StockFilterParams
export const getStockData = async (
  params: StockFilterParams
): Promise<StockHistoryResponse | null> => {
  try {
    // Chamar a API para buscar dados reais do banco
    const result = await getStockHistory(
      params.query,
      params.searchType,
      new Date(params.startDate),
      new Date(params.endDate)
    );
    
    // Se não encontrou dados no banco, retornar null
    if (!result) {
      console.log("Nenhum dado de estoque encontrado para os parâmetros fornecidos");
      return null;
    }
    
    // Processar e retornar os dados obtidos
    console.log(`Dados de estoque obtidos para ${result.productName} (${result.sku})`);
    return result;
  } catch (error) {
    console.error("Erro ao processar dados de estoque:", error);
    return null;
  }
};

// Versão alternativa usando fetch diretamente (se necessário)
export const getStockHistoryWithFetch = async (params: StockFilterParams): Promise<StockHistoryResponse | null> => {
  try {
    // Construir a URL com os parâmetros de consulta
    const url = `${API_URL}/stock/history?query=${encodeURIComponent(params.query)}&search_type=${params.searchType}&start_date=${params.startDate}&end_date=${params.endDate}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`Erro ao buscar histórico de estoque: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Erro ao buscar histórico de estoque:", error);
    return null;
  }
};