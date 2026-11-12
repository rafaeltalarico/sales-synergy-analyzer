const API_URL = import.meta.env.VITE_API_URL;

export interface ProdutoBI {
  sku: number;
  nome: string;
  categoria: string;
  faturamentoAtual: number;
  faturamentoAnterior: number;
  qtdVendidaAtual: number;
  qtdVendidaAnterior: number;
  markup: number;
  margemLiquida: number;
  estoque: number;
  custoMedio: number;
}

export interface BiData {
  produtos: ProdutoBI[];
  evolucao: Record<number, Record<string, number>>;
  meses: string[];
  mesesKeys: string[];
  mesAtualLabel: string;
  mesAnteriorLabel: string;
}

export async function fetchBiData(): Promise<BiData> {
  const response = await fetch(`${API_URL}/api/bi/dados`);
  if (!response.ok) {
    throw new Error(`Erro ao carregar dados do BI: ${response.statusText}`);
  }
  return response.json();
}
