import { useState, useMemo } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, TrendingUp, TrendingDown} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie, LineChart, Line, Legend, Area, AreaChart,
} from "recharts";

// ======================== DADOS DO BI ========================

type Categoria = "Laticínios" | "Mercearia" | "Limpeza" | "Bebidas" | "Higiene Pessoal" | "Padaria" | "Bebês";

interface ProdutoBI {
  sku: number;
  nome: string;
  categoria: Categoria;
  faturamentoMar: number;
  faturamentoFev: number;
  qtdVendidaMar: number;
  qtdVendidaFev: number;
  markup: number;
  margemLiquida: number;
  estoque: number;
  custoMedio: number;
}

const produtos: ProdutoBI[] = [
  { sku: 1,  nome: "Requeijão Cremoso Itambé 200g",              categoria: "Laticínios",      faturamentoMar: 52800,  faturamentoFev: 44400, qtdVendidaMar: 220,  qtdVendidaFev: 185,  markup: 15.8, margemLiquida: 4.7,  estoque: 122, custoMedio: 30.14 },
  { sku: 2,  nome: "Leite Condensado Moça 395g",                 categoria: "Laticínios",      faturamentoMar: 41325,  faturamentoFev: 34200, qtdVendidaMar: 145,  qtdVendidaFev: 120,  markup: 38.2, margemLiquida: 12.4, estoque: 168, custoMedio: 20.62 },
  { sku: 3,  nome: "Gelatina em Pó Dr. Oetker 25g",              categoria: "Mercearia",       faturamentoMar: 49118,  faturamentoFev: 40732, qtdVendidaMar: 82,   qtdVendidaFev: 68,   markup: 58.7, margemLiquida: 21.6, estoque: 95,  custoMedio: 37.75 },
  { sku: 4,  nome: "Miojo Nissin Lámen Galinha 85g (3 unid)",    categoria: "Mercearia",       faturamentoMar: 23865,  faturamentoFev: 20898, qtdVendidaMar: 1850, qtdVendidaFev: 1620, markup: 12.3, margemLiquida: 3.1,  estoque: 1200,custoMedio: 1.15 },
  { sku: 5,  nome: "Sabão em Pó Omo Lavagem Perfeita 1,8kg",     categoria: "Limpeza",         faturamentoMar: 72162,  faturamentoFev: 79758, qtdVendidaMar: 38,   qtdVendidaFev: 42,   markup: 65.3, margemLiquida: 24.1, estoque: 28,  custoMedio: 114.88 },
  { sku: 6,  nome: "Fralda Desc. Huggies Tripla Prot. M (12 unid)", categoria: "Bebês",       faturamentoMar: 43605,  faturamentoFev: 35802, qtdVendidaMar: 95,   qtdVendidaFev: 78,   markup: 44.1, margemLiquida: 16.2, estoque: 85,  custoMedio: 31.85 },
  { sku: 7,  nome: "Vodka Smirnoff 750ml",                       categoria: "Bebidas",         faturamentoMar: 60480,  faturamentoFev: 66150, qtdVendidaMar: 32,   qtdVendidaFev: 35,   markup: 42.8, margemLiquida: 15.8, estoque: 40,  custoMedio: 132.35 },
  { sku: 8,  nome: "Café Pilão Tradicional 250g",                categoria: "Mercearia",       faturamentoMar: 13200,  faturamentoFev: 11040, qtdVendidaMar: 110,  qtdVendidaFev: 92,   markup: 18.4, margemLiquida: 5.9,  estoque: 42,  custoMedio: 101.35 },
  { sku: 9,  nome: "Creme Dental Colgate Tripla Ação 90g",       categoria: "Higiene Pessoal", faturamentoMar: 14175,  faturamentoFev: 11880, qtdVendidaMar: 105,  qtdVendidaFev: 88,   markup: 20.1, margemLiquida: 6.8,  estoque: 55,  custoMedio: 112.41 },
  { sku: 10, nome: "Leite em Pó Ninho Instantâneo 800g",         categoria: "Laticínios",      faturamentoMar: 68000,  faturamentoFev: 58650, qtdVendidaMar: 160,  qtdVendidaFev: 138,  markup: 22.5, margemLiquida: 7.9,  estoque: 67,  custoMedio: 34.69 },
  { sku: 11, nome: "Shampoo Seda Recarga Natural 325ml",         categoria: "Higiene Pessoal", faturamentoMar: 59976,  faturamentoFev: 69972, qtdVendidaMar: 24,   qtdVendidaFev: 28,   markup: 78.2, margemLiquida: 28.4, estoque: 18,  custoMedio: 140.23 },
  { sku: 12, nome: "Desodorante Dove Aerosol 150ml",             categoria: "Higiene Pessoal", faturamentoMar: 22575,  faturamentoFev: 19092, qtdVendidaMar: 175,  qtdVendidaFev: 148,  markup: 48.5, margemLiquida: 18.1, estoque: 280, custoMedio: 8.69 },
  { sku: 13, nome: "Café em Cápsulas Nescafé Dolce Gusto (16 un.)", categoria: "Mercearia",    faturamentoMar: 18668,  faturamentoFev: 16155, qtdVendidaMar: 52,   qtdVendidaFev: 45,   markup: 44.1, margemLiquida: 16.2, estoque: 60,  custoMedio: 24.91 },
  { sku: 14, nome: "Amaciante Downy Brisa de Verão 1,5L",        categoria: "Limpeza",         faturamentoMar: 31410,  faturamentoFev: 26175, qtdVendidaMar: 90,   qtdVendidaFev: 75,   markup: 52.3, margemLiquida: 19.5, estoque: 110, custoMedio: 22.92 },
  { sku: 15, nome: "Pão de Forma Pullman Tradicional 500g",      categoria: "Padaria",         faturamentoMar: 35091,  faturamentoFev: 42889, qtdVendidaMar: 9,    qtdVendidaFev: 11,   markup: 40.2, margemLiquida: 14.5, estoque: 12,  custoMedio: 278.10 },
  { sku: 16, nome: "Esponja de Aço Assolan c/ 8 unidades",       categoria: "Limpeza",         faturamentoMar: 13485,  faturamentoFev: 16182, qtdVendidaMar: 15,   qtdVendidaFev: 18,   markup: 38.9, margemLiquida: 13.2, estoque: 22,  custoMedio: 64.72 },
  { sku: 17, nome: "Óleo de Soja Liza 900ml (kit c/ 3)",         categoria: "Mercearia",       faturamentoMar: 26598,  faturamentoFev: 21450, qtdVendidaMar: 62,   qtdVendidaFev: 50,   markup: 45.6, margemLiquida: 17.0, estoque: 75,  custoMedio: 29.46 },
  { sku: 18, nome: "Vinho Chileno Reservado Concha y Toro 750ml",categoria: "Bebidas",         faturamentoMar: 49792,  faturamentoFev: 40845, qtdVendidaMar: 128,  qtdVendidaFev: 105,  markup: 28.4, margemLiquida: 9.2,  estoque: 105, custoMedio: 30.30 },
  { sku: 19, nome: "Sabonete Líquido Palmolive Nutritivo 250ml", categoria: "Higiene Pessoal", faturamentoMar: 34965,  faturamentoFev: 29862, qtdVendidaMar: 185,  qtdVendidaFev: 158,  markup: 25.1, margemLiquida: 8.1,  estoque: 310, custoMedio: 15.11 },
  { sku: 20, nome: "Chocolate Kit Kat 41,5g",                    categoria: "Mercearia",       faturamentoMar: 13410,  faturamentoFev: 11622, qtdVendidaMar: 90,   qtdVendidaFev: 78,   markup: 30.2, margemLiquida: 10.1, estoque: 195, custoMedio: 11.44 },
];

const CORES_CATEGORIA: Record<Categoria, string> = {
  Laticínios: "#003B7A",
  Mercearia: "#F47920",
  Limpeza: "#0E8A6E",
  Bebidas:   "#8B5CF6",
  "Higiene Pessoal":  "#DC2626",
  Padaria: "#FACC15",
  Bebês: "#d5d906",
};

const CORES_PRODUTO = [
  '#003B7A', '#F47920', '#2E86AB', '#A23B72', '#F18F01',
  '#C73E1D', '#44BBA4', '#E94F37', '#8ACB88', '#648DE5',
  '#D4A373', '#6C5B7B', '#C06C84', '#355C7D', '#0B3954',
  '#F67280', '#725A7A', '#E8175D', '#393E41', '#3B1F2B'
];




// ======================== COMPONENTE ========================






const BI = () => {
  const [categoriaFiltro, setCategoriaFiltro] = useState<Categoria | null>(null);
  const [produtoFiltro, setProdutoFiltro] = useState<number | null>(null);

  const produtosFiltrados = useMemo(() => {
    if (produtoFiltro) return produtos.filter((p) => p.sku === produtoFiltro);
    if (categoriaFiltro) return produtos.filter((p) => p.categoria === categoriaFiltro);
    return produtos;
  }, [categoriaFiltro, produtoFiltro]);

  const limparFiltros = () => {
    setCategoriaFiltro(null);
    setProdutoFiltro(null);
  };

  // --- KPIs ---
  const faturamentoTotal = produtosFiltrados.reduce((s, p) => s + p.faturamentoMar, 0);
  const faturamentoAnterior = produtosFiltrados.reduce((s, p) => s + p.faturamentoFev, 0);
  const variacaoFat = faturamentoAnterior > 0 ? ((faturamentoTotal - faturamentoAnterior) / faturamentoAnterior * 100).toFixed(1) : "0";
  const ticketMedio = produtosFiltrados.reduce((s, p) => s + p.qtdVendidaMar, 0);
  const markupMedio = produtosFiltrados.length > 0 ? (produtosFiltrados.reduce((s, p) => s + p.markup, 0) / produtosFiltrados.length).toFixed(1) : "0";
  const margemMedia = produtosFiltrados.length > 0 ? (produtosFiltrados.reduce((s, p) => s + p.margemLiquida, 0) / produtosFiltrados.length).toFixed(1) : "0";

  // --- Dados para gráficos ---
  const dadosCategoria = useMemo(() => {
    const cats: Record<string, number> = {};
    produtosFiltrados.forEach((p) => {
      cats[p.categoria] = (cats[p.categoria] || 0) + p.faturamentoMar;
    });
    return Object.entries(cats).map(([name, value]) => ({ name, value }));
  }, [produtosFiltrados]);

  const evolucaoPorProduto: Record<number, Record<string, number>> = {
    1:  { Out: 33300, Nov: 35520, Dez: 37740, Jan: 40000, Fev: 44400, Mar: 52800 },
    2:  { Out: 25650, Nov: 27360, Dez: 29070, Jan: 30780, Fev: 34200, Mar: 41325 },
    3:  { Out: 30549, Nov: 32586, Dez: 34622, Jan: 36659, Fev: 40732, Mar: 49118 },
    4:  { Out: 15673, Nov: 16718, Dez: 17763, Jan: 18808, Fev: 20898, Mar: 23865 },
    5:  { Out: 59818, Nov: 63806, Dez: 67794, Jan: 71782, Fev: 79758, Mar: 72162 },
    6:  { Out: 26852, Nov: 28642, Dez: 30432, Jan: 32222, Fev: 35802, Mar: 43605 },
    7:  { Out: 49613, Nov: 52920, Dez: 56228, Jan: 59535, Fev: 66150, Mar: 60480 },
    8:  { Out: 8280,  Nov: 8832,  Dez: 9384,  Jan: 9936,  Fev: 11040, Mar: 13200 },
    9:  { Out: 8910,  Nov: 9504,  Dez: 10098, Jan: 10692, Fev: 11880, Mar: 14175 },
    10: { Out: 43988, Nov: 46920, Dez: 49853, Jan: 52785, Fev: 58650, Mar: 68000 },
    11: { Out: 52479, Nov: 55978, Dez: 59476, Jan: 62975, Fev: 69972, Mar: 59976 },
    12: { Out: 14319, Nov: 15274, Dez: 16228, Jan: 17183, Fev: 19092, Mar: 22575 },
    13: { Out: 12116, Nov: 12924, Dez: 13732, Jan: 14540, Fev: 16155, Mar: 18668 },
    14: { Out: 19631, Nov: 20940, Dez: 22249, Jan: 23558, Fev: 26175, Mar: 31410 },
    15: { Out: 32167, Nov: 34311, Dez: 36456, Jan: 38600, Fev: 42889, Mar: 35091 },
    16: { Out: 12136, Nov: 12946, Dez: 13755, Jan: 14564, Fev: 16182, Mar: 13485 },
    17: { Out: 16088, Nov: 17160, Dez: 18233, Jan: 19305, Fev: 21450, Mar: 26598 },
    18: { Out: 30634, Nov: 32676, Dez: 34718, Jan: 36761, Fev: 40845, Mar: 49792 },
    19: { Out: 22397, Nov: 23890, Dez: 25383, Jan: 26876, Fev: 29862, Mar: 34965 },
    20: { Out: 8717,  Nov: 9298,  Dez: 9880,  Jan: 10460, Fev: 11622, Mar: 13410 },
  };
  const faturamentoMensal = useMemo(() => {
    const meses = ["Out", "Nov", "Dez", "Jan", "Fev", "Mar"];

    

    return meses.map(mes => ({
        mes,
        valor: produtosFiltrados.reduce(
        (acc, p) => acc + (evolucaoPorProduto[p.sku]?.[mes] ?? 0), 0
        ),
    }));
    }, [produtosFiltrados]);

  const dadosTopProdutos = useMemo(() => {
    return [...produtosFiltrados]
      .sort((a, b) => b.faturamentoMar - a.faturamentoMar)
      .slice(0, 8)
      .map((p) => ({
        nome: p.nome.length > 20 ? p.nome.substring(0, 18) + "..." : p.nome,
        nomeCompleto: p.nome,
        sku: p.sku,
        faturamento: p.faturamentoMar,
        categoria: p.categoria,
      }));
  }, [produtosFiltrados]);

  const dadosMarkup = useMemo(() => {
    return [...produtosFiltrados]
      .sort((a, b) => b.markup - a.markup)
      .slice(0, 10)
      .map((p) => ({
        nome: p.nome.length > 18 ? p.nome.substring(0, 16) + "..." : p.nome,
        nomeCompleto: p.nome,
        sku: p.sku,
        markup: p.markup,
        margem: p.margemLiquida,
        categoria: p.categoria,
      }));
  }, [produtosFiltrados]);

  const dadosComparativo = useMemo(() => {
    return [...produtosFiltrados]
      .sort((a, b) => b.faturamentoMar - a.faturamentoMar)
      .slice(0, 8)
      .map((p) => ({
        nome: p.nome.length > 15 ? p.nome.substring(0, 13) + "..." : p.nome,
        nomeCompleto: p.nome,
        sku: p.sku,
        marco: p.faturamentoMar,
        fevereiro: p.faturamentoFev,
      }));
  }, [produtosFiltrados]);

  const filtroAtivo = categoriaFiltro || produtoFiltro;
  const tituloFiltro = produtoFiltro
    ? produtos.find((p) => p.sku === produtoFiltro)?.nome || ""
    : categoriaFiltro || "Todos";

  const formatCurrency = (v: number) => `R$ ${v.toLocaleString("pt-BR", { minimumFractionDigits: 0 })}`;

  const CustomTooltipBar = ({ active, payload }: { active?: boolean; payload?: Array<{ value: number; payload: { nomeCompleto: string; nome: string } }> }) => {
    if (active && payload && payload.length) {
      const d = payload[0].payload;
      return (
        <div className="bg-white p-3 border rounded shadow text-sm">
          <p className="font-semibold">{d.nomeCompleto || d.nome}</p>
          <p>Faturamento: {formatCurrency(payload[0].value)}</p>
        </div>
      );
    }
    return null;
  };

  const CustomTooltipMarkup = ({ active, payload }: { active?: boolean; payload?: Array<{ value: number; payload: { nomeCompleto?: string; nome: string; markup: number; margem: number } }> }) => {
    if (active && payload && payload.length) {
      const d = payload[0].payload;
      return (
        <div className="bg-white p-3 border rounded shadow text-sm">
          <p className="font-semibold">{d.nomeCompleto || d.nome}</p>
          <p>Markup: {d.markup}%</p>
          <p>Margem Líquida: {d.margem}%</p>
        </div>
      );
    }
    return null;
  };

  const CustomTooltipComp = ({ active, payload }: { active?: boolean; payload?: Array<{ value: number; payload: { nomeCompleto?: string; nome: string; marco: number; fevereiro: number } }> }) => {
    if (active && payload && payload.length) {
      const d = payload[0].payload;
      return (
        <div className="bg-white p-3 border rounded shadow text-sm">
          <p className="font-semibold">{d.nomeCompleto || d.nome}</p>
          <p>Março: {formatCurrency(d.marco)}</p>
          <p>Fevereiro: {formatCurrency(d.fevereiro)}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="flex flex-col">

      <main className="flex-1 container mx-auto px-4 py-8 max-w-7xl">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-synergy-dark mb-2">Business Intelligence</h1>
              <p className="text-muted-foreground">
                Painel interativo de indicadores — Março/2026
              </p>
            </div>
            {filtroAtivo && (
              <Button variant="outline" onClick={limparFiltros} className="flex items-center gap-2">
                <X className="h-4 w-4" />
                Limpar filtro: {tituloFiltro}
              </Button>
            )}
          </div>

          {/* KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="border-l-4 border-l-construtop-blue">
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase font-medium">Faturamento Mar</p>
                    <p className="text-2xl font-bold text-synergy-dark">{formatCurrency(faturamentoTotal)}</p>
                    <div className={`flex items-center text-xs mt-1 ${Number(variacaoFat) >= 0 ? "text-green-600" : "text-red-600"}`}>
                      {Number(variacaoFat) >= 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                      {variacaoFat}% vs Fev
                    </div>
                  </div>
                  
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-construtop-orange">
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase font-medium">Un. Vendidas Mar</p>
                    <p className="text-2xl font-bold text-synergy-dark">{ticketMedio.toLocaleString("pt-BR")}</p>
                    <p className="text-xs text-muted-foreground mt-1">{produtosFiltrados.length} SKUs</p>
                  </div>
                  
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-green-600">
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase font-medium">Markup Médio</p>
                    <p className="text-2xl font-bold text-synergy-dark">{markupMedio}%</p>
                    <p className="text-xs text-muted-foreground mt-1">Média ponderada</p>
                  </div>
                  
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-purple-600">
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase font-medium">Margem Líquida</p>
                    <p className="text-2xl font-bold text-synergy-dark">{margemMedia}%</p>
                    <p className="text-xs text-muted-foreground mt-1">Média do período</p>
                  </div>
                  
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Linha 1: Pizza de categorias + Evolução mensal */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Pizza por categoria */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Faturamento por Categoria</CardTitle>
                <p className="text-xs text-muted-foreground">Clique em uma fatia para filtrar</p>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie
                      data={dadosCategoria}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      dataKey="value"
                      nameKey="name"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      onClick={(entry) => {
                        if (categoriaFiltro === entry.name) {
                          setCategoriaFiltro(null);
                        } else {
                          setCategoriaFiltro(entry.name as Categoria);
                          setProdutoFiltro(null);
                        }
                      }}
                      cursor="pointer"
                    >
                      {dadosCategoria.map((entry) => (
                        <Cell
                          key={entry.name}
                          fill={CORES_CATEGORIA[entry.name as Categoria] || "#999"}
                          opacity={categoriaFiltro && categoriaFiltro !== entry.name ? 0.3 : 1}
                          stroke={categoriaFiltro === entry.name ? "#000" : "#fff"}
                          strokeWidth={categoriaFiltro === entry.name ? 2 : 1}
                        />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Evolução mensal */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Evolução do Faturamento (6 meses)</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart data={faturamentoMensal} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="gradFat" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#003B7A" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#003B7A" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="mes" tick={{ fontSize: 12 }} />
                    <YAxis tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 12 }} />
                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                    <Area type="monotone" dataKey="valor" stroke="#003B7A" fill="url(#gradFat)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Linha 2: Top produtos + Comparativo Fev vs Mar */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top produtos por faturamento */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Top Produtos — Faturamento Março</CardTitle>
                <p className="text-xs text-muted-foreground">Clique em uma barra para filtrar</p>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart data={dadosTopProdutos} layout="vertical" margin={{ top: 5, right: 20, left: 5, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 11 }} />
                    <YAxis dataKey="nome" type="category" width={130} tick={{ fontSize: 11 }} interval={0} />
                    <Tooltip content={CustomTooltipBar} />
                    <Bar
                      dataKey="faturamento"
                      radius={[0, 4, 4, 0]}
                      cursor="pointer"
                      onClick={(entry: { sku: number }) => {
                        if (produtoFiltro === entry.sku) {
                          setProdutoFiltro(null);
                        } else {
                          setProdutoFiltro(entry.sku);
                          setCategoriaFiltro(null);
                        }
                      }}
                    >
                      {dadosTopProdutos.map((entry) => (
                        <Cell
                          key={entry.sku}
                          fill={CORES_PRODUTO[entry.sku % CORES_PRODUTO.length]}
                          opacity={produtoFiltro && produtoFiltro !== entry.sku ? 0.3 : 1}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Comparativo Fev vs Mar */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Comparativo Fevereiro vs Março</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart data={dadosComparativo} layout="vertical" margin={{ top: 5, right: 20, left: 5, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 11 }} />
                    <YAxis dataKey="nome" type="category" width={110} tick={{ fontSize: 11 }} interval={0} />
                    <Tooltip content={CustomTooltipComp} />
                    <Legend />
                    <Bar dataKey="fevereiro" name="Fevereiro" fill="#94a3b8" radius={[0, 4, 4, 0]} barSize={10} />
                    <Bar dataKey="marco" name="Março" fill="#F47920" radius={[0, 4, 4, 0]} barSize={10} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Linha 3: Markup e Margem */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Markup e Margem Líquida por Produto</CardTitle>
              <p className="text-xs text-muted-foreground">Clique em uma barra para filtrar por produto</p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={dadosMarkup} margin={{ top: 10, right: 20, left: 5, bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="nome" tick={{ fontSize: 12 }} angle={-45} textAnchor="end" height={80} />
                  <YAxis tickFormatter={(v) => `${v}%`} tick={{ fontSize: 11 }} />
                  <Tooltip content={CustomTooltipMarkup} />
                  <Legend />
                  <Bar
                    dataKey="markup"
                    name="Markup"
                    fill="#003B7A"
                    radius={[4, 4, 0, 0]}
                    barSize={18}
                    cursor="pointer"
                    onClick={(data: { sku: number; nome: string; [key: string]: unknown }) => {
                      if (produtoFiltro === data.sku) {
                        setProdutoFiltro(null);
                      } else {
                        setProdutoFiltro(data.sku);
                        setCategoriaFiltro(null);
                      }
                    }}
                  />
                  <Bar dataKey="margem" name="Margem Líquida" fill="#F47920" radius={[4, 4, 0, 0]} barSize={18} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Tabela resumo */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Detalhamento por Produto</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b-2 border-gray-200">
                      <th className="text-left py-2 px-2">SKU</th>
                      <th className="text-left py-2 px-2">Produto</th>
                      <th className="text-left py-2 px-2">Categoria</th>
                      <th className="text-right py-2 px-2">Fat. Mar</th>
                      <th className="text-right py-2 px-2">Fat. Fev</th>
                      <th className="text-right py-2 px-2">Var.</th>
                      <th className="text-right py-2 px-2">Markup</th>
                      <th className="text-right py-2 px-2">Margem</th>
                      <th className="text-right py-2 px-2">Estoque</th>
                    </tr>
                  </thead>
                  <tbody>
                    {produtosFiltrados
                      .sort((a, b) => b.faturamentoMar - a.faturamentoMar)
                      .map((p) => {
                        const variacao = ((p.faturamentoMar - p.faturamentoFev) / p.faturamentoFev * 100).toFixed(1);
                        return (
                          <tr
                            key={p.sku}
                            className={`border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${produtoFiltro === p.sku ? "bg-blue-50" : ""}`}
                            onClick={() => {
                              if (produtoFiltro === p.sku) {
                                setProdutoFiltro(null);
                              } else {
                                setProdutoFiltro(p.sku);
                                setCategoriaFiltro(null);
                              }
                            }}
                          >
                            <td className="py-2 px-2 font-mono text-xs">{p.sku}</td>
                            <td className="py-2 px-2">{p.nome}</td>
                            <td className="py-2 px-2">
                              <span
                                className="inline-block px-2 py-0.5 rounded-full text-xs text-white"
                                style={{ backgroundColor: CORES_CATEGORIA[p.categoria] }}
                              >
                                {p.categoria}
                              </span>
                            </td>
                            <td className="py-2 px-2 text-right">{formatCurrency(p.faturamentoMar)}</td>
                            <td className="py-2 px-2 text-right">{formatCurrency(p.faturamentoFev)}</td>
                            <td className={`py-2 px-2 text-right font-medium ${Number(variacao) >= 0 ? "text-green-600" : "text-red-600"}`}>
                              {Number(variacao) >= 0 ? "+" : ""}{variacao}%
                            </td>
                            <td className="py-2 px-2 text-right">{p.markup}%</td>
                            <td className="py-2 px-2 text-right">{p.margemLiquida}%</td>
                            <td className="py-2 px-2 text-right">{p.estoque}</td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <footer className="border-t bg-white py-6">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>LuminAI &copy; {new Date().getFullYear()} - Gestão inteligente de vendas e estoque</p>
        </div>
      </footer>
    </div>
  );
};

export default BI;