import { useState, useMemo, useEffect } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, TrendingUp, TrendingDown, DollarSign, Package, ShoppingCart, BarChart3, Loader2 } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie, Legend, Area, AreaChart,
} from "recharts";
import { type BiData, fetchBiData } from "@/services/biService";

/* eslint-disable react-refresh/only-export-components */

const CORES_CATEGORIA: Record<string, string> = {
  "Laticínios": "#003B7A",
  "Mercearia": "#F47920",
  "Limpeza": "#0E8A6E",
  "Bebidas": "#8B5CF6",
  "Higiene Pessoal": "#DC2626",
  "Padaria": "#FACC15",
  "Bebês": "#d5d906",
  "Outros": "#6B7280",
};

const CORES_PRODUTO = [
  '#003B7A', '#F47920', '#2E86AB', '#A23B72', '#F18F01',
  '#C73E1D', '#44BBA4', '#E94F37', '#8ACB88', '#648DE5',
  '#D4A373', '#6C5B7B', '#C06C84', '#355C7D', '#0B3954',
  '#F67280', '#725A7A', '#E8175D', '#393E41', '#3B1F2B'
];

const Bi = () => {
  const [data, setData] = useState<BiData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categoriaFiltro, setCategoriaFiltro] = useState<string | null>(null);
  const [produtoFiltro, setProdutoFiltro] = useState<number | null>(null);

  useEffect(() => {
    fetchBiData()
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const produtos = data?.produtos ?? [];
  const mesAtualLabel = data?.mesAtualLabel ?? "";
  const mesAnteriorLabel = data?.mesAnteriorLabel ?? "";

  const produtosFiltrados = useMemo(() => {
    if (produtoFiltro) return produtos.filter((p) => p.sku === produtoFiltro);
    if (categoriaFiltro) return produtos.filter((p) => p.categoria === categoriaFiltro);
    return produtos;
  }, [categoriaFiltro, produtoFiltro, produtos]);

  const limparFiltros = () => { setCategoriaFiltro(null); setProdutoFiltro(null); };

  const faturamentoTotal = produtosFiltrados.reduce((s, p) => s + p.faturamentoAtual, 0);
  const faturamentoAnterior = produtosFiltrados.reduce((s, p) => s + p.faturamentoAnterior, 0);
  const variacaoFat = faturamentoAnterior > 0 ? ((faturamentoTotal - faturamentoAnterior) / faturamentoAnterior * 100).toFixed(1) : "0";
  const unidadesVendidas = produtosFiltrados.reduce((s, p) => s + p.qtdVendidaAtual, 0);
  const markupMedio = produtosFiltrados.length > 0 ? (produtosFiltrados.reduce((s, p) => s + p.markup, 0) / produtosFiltrados.length).toFixed(1) : "0";
  const margemMedia = produtosFiltrados.length > 0 ? (produtosFiltrados.reduce((s, p) => s + p.margemLiquida, 0) / produtosFiltrados.length).toFixed(1) : "0";

  const dadosCategoria = useMemo(() => {
    const cats: Record<string, number> = {};
    produtosFiltrados.forEach((p) => { cats[p.categoria] = (cats[p.categoria] || 0) + p.faturamentoAtual; });
    return Object.entries(cats).map(([name, value]) => ({ name, value }));
  }, [produtosFiltrados]);

  const faturamentoMensal = useMemo(() => {
    if (!data) return [];
    return data.meses.map((mes, i) => ({
      mes,
      valor: produtosFiltrados.reduce((acc, p) => acc + (data.evolucao[p.sku]?.[data.mesesKeys[i]] ?? 0), 0),
    }));
  }, [produtosFiltrados, data]);

  const dadosTopProdutos = useMemo(() => {
    return [...produtosFiltrados].sort((a, b) => b.faturamentoAtual - a.faturamentoAtual).slice(0, 8)
      .map((p) => ({ nome: p.nome.length > 20 ? p.nome.substring(0, 18) + "..." : p.nome, nomeCompleto: p.nome, sku: p.sku, faturamento: p.faturamentoAtual, categoria: p.categoria }));
  }, [produtosFiltrados]);

  const dadosMarkup = useMemo(() => {
    return [...produtosFiltrados].sort((a, b) => b.markup - a.markup).slice(0, 10)
      .map((p) => ({ nome: p.nome.length > 18 ? p.nome.substring(0, 16) + "..." : p.nome, nomeCompleto: p.nome, sku: p.sku, markup: p.markup, margem: p.margemLiquida, categoria: p.categoria }));
  }, [produtosFiltrados]);

  const dadosComparativo = useMemo(() => {
    return [...produtosFiltrados].sort((a, b) => b.faturamentoAtual - a.faturamentoAtual).slice(0, 8)
      .map((p) => ({ nome: p.nome.length > 15 ? p.nome.substring(0, 13) + "..." : p.nome, nomeCompleto: p.nome, sku: p.sku, atual: p.faturamentoAtual, anterior: p.faturamentoAnterior }));
  }, [produtosFiltrados]);

  const filtroAtivo = categoriaFiltro || produtoFiltro;
  const tituloFiltro = produtoFiltro ? produtos.find((p) => p.sku === produtoFiltro)?.nome || "" : categoriaFiltro || "Todos";
  const formatCurrency = (v: number) => `R$ ${v.toLocaleString("pt-BR", { minimumFractionDigits: 0 })}`;

  const CustomTooltipBar = ({ active, payload }: { active?: boolean; payload?: Array<{ value: number; payload: { nomeCompleto: string; nome: string } }> }) => {
    if (active && payload?.length) { const d = payload[0].payload; return (<div className="bg-white p-3 border rounded shadow text-sm"><p className="font-semibold">{d.nomeCompleto || d.nome}</p><p>Faturamento: {formatCurrency(payload[0].value)}</p></div>); }
    return null;
  };

  const CustomTooltipMarkup = ({ active, payload }: { active?: boolean; payload?: Array<{ value: number; payload: { nomeCompleto?: string; nome: string; markup: number; margem: number } }> }) => {
    if (active && payload?.length) { const d = payload[0].payload; return (<div className="bg-white p-3 border rounded shadow text-sm"><p className="font-semibold">{d.nomeCompleto || d.nome}</p><p>Markup: {d.markup}%</p><p>Margem Líquida: {d.margem}%</p></div>); }
    return null;
  };

  const CustomTooltipComp = ({ active, payload }: { active?: boolean; payload?: Array<{ value: number; payload: { nomeCompleto?: string; nome: string; atual: number; anterior: number } }> }) => {
    if (active && payload?.length) { const d = payload[0].payload; return (<div className="bg-white p-3 border rounded shadow text-sm"><p className="font-semibold">{d.nomeCompleto || d.nome}</p><p>{mesAtualLabel}: {formatCurrency(d.atual)}</p><p>{mesAnteriorLabel}: {formatCurrency(d.anterior)}</p></div>); }
    return null;
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-construtop-blue" />
          <p className="text-muted-foreground">Carregando dados do BI...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="text-red-600 font-medium">Erro ao carregar dados</p>
            <p className="text-sm text-muted-foreground mt-2">{error}</p>
            <Button className="mt-4" onClick={() => window.location.reload()}>Tentar novamente</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 container mx-auto px-4 py-8 max-w-7xl">
        <div className="space-y-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-synergy-dark mb-2">Relatórios Gerenciais</h1>
              <p className="text-muted-foreground">Painel interativo de indicadores</p>
            </div>
            {filtroAtivo && (<Button variant="outline" onClick={limparFiltros} className="flex items-center gap-2"><X className="h-4 w-4" />Limpar filtro: {tituloFiltro}</Button>)}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="border-l-4 border-l-construtop-blue"><CardContent className="pt-4 pb-4"><div className="flex items-center justify-between"><div><p className="text-xs text-muted-foreground uppercase font-medium">Faturamento {mesAtualLabel}</p><p className="text-2xl font-bold text-synergy-dark">{formatCurrency(faturamentoTotal)}</p><div className={`flex items-center text-xs mt-1 ${Number(variacaoFat) >= 0 ? "text-green-600" : "text-red-600"}`}>{Number(variacaoFat) >= 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}{variacaoFat}% vs {mesAnteriorLabel}</div></div><DollarSign className="h-8 w-8 text-construtop-blue/30" /></div></CardContent></Card>
            <Card className="border-l-4 border-l-construtop-orange"><CardContent className="pt-4 pb-4"><div className="flex items-center justify-between"><div><p className="text-xs text-muted-foreground uppercase font-medium">Un. Vendidas {mesAtualLabel}</p><p className="text-2xl font-bold text-synergy-dark">{unidadesVendidas.toLocaleString("pt-BR")}</p><p className="text-xs text-muted-foreground mt-1">{produtosFiltrados.length} SKUs</p></div><ShoppingCart className="h-8 w-8 text-construtop-orange/30" /></div></CardContent></Card>
            <Card className="border-l-4 border-l-green-600"><CardContent className="pt-4 pb-4"><div className="flex items-center justify-between"><div><p className="text-xs text-muted-foreground uppercase font-medium">Markup Médio</p><p className="text-2xl font-bold text-synergy-dark">{markupMedio}%</p><p className="text-xs text-muted-foreground mt-1">Média ponderada</p></div><BarChart3 className="h-8 w-8 text-green-600/30" /></div></CardContent></Card>
            <Card className="border-l-4 border-l-purple-600"><CardContent className="pt-4 pb-4"><div className="flex items-center justify-between"><div><p className="text-xs text-muted-foreground uppercase font-medium">Margem Líquida</p><p className="text-2xl font-bold text-synergy-dark">{margemMedia}%</p><p className="text-xs text-muted-foreground mt-1">Média do período</p></div><Package className="h-8 w-8 text-purple-600/30" /></div></CardContent></Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card><CardHeader className="pb-2"><CardTitle className="text-base">Faturamento por Categoria</CardTitle><p className="text-xs text-muted-foreground">Clique em uma fatia para filtrar</p></CardHeader><CardContent><ResponsiveContainer width="100%" height={280}><PieChart><Pie data={dadosCategoria} cx="50%" cy="50%" outerRadius={100} dataKey="value" nameKey="name" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} onClick={(entry) => { if (categoriaFiltro === entry.name) { setCategoriaFiltro(null); } else { setCategoriaFiltro(entry.name); setProdutoFiltro(null); } }} cursor="pointer">{dadosCategoria.map((entry) => (<Cell key={entry.name} fill={CORES_CATEGORIA[entry.name] || "#999"} opacity={categoriaFiltro && categoriaFiltro !== entry.name ? 0.3 : 1} stroke={categoriaFiltro === entry.name ? "#000" : "#fff"} strokeWidth={categoriaFiltro === entry.name ? 2 : 1} />))}</Pie><Tooltip formatter={(value: number) => formatCurrency(value)} /></PieChart></ResponsiveContainer></CardContent></Card>

            <Card><CardHeader className="pb-2"><CardTitle className="text-base">Evolução do Faturamento (6 meses)</CardTitle></CardHeader><CardContent><ResponsiveContainer width="100%" height={280}><AreaChart data={faturamentoMensal} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}><defs><linearGradient id="gradFat" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#003B7A" stopOpacity={0.3} /><stop offset="95%" stopColor="#003B7A" stopOpacity={0} /></linearGradient></defs><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="mes" tick={{ fontSize: 12 }} /><YAxis tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 12 }} /><Tooltip formatter={(value: number) => formatCurrency(value)} /><Area type="monotone" dataKey="valor" stroke="#003B7A" fill="url(#gradFat)" strokeWidth={2} /></AreaChart></ResponsiveContainer></CardContent></Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card><CardHeader className="pb-2"><CardTitle className="text-base">Top Produtos — Faturamento {mesAtualLabel}</CardTitle><p className="text-xs text-muted-foreground">Clique em uma barra para filtrar</p></CardHeader><CardContent><ResponsiveContainer width="100%" height={320}><BarChart data={dadosTopProdutos} layout="vertical" margin={{ top: 5, right: 20, left: 5, bottom: 5 }}><CartesianGrid strokeDasharray="3 3" /><XAxis type="number" tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 11 }} /><YAxis dataKey="nome" type="category" width={130} tick={{ fontSize: 11 }} interval={0} /><Tooltip content={CustomTooltipBar} /><Bar dataKey="faturamento" radius={[0, 4, 4, 0]} cursor="pointer" onClick={(entry: { sku: number }) => { if (produtoFiltro === entry.sku) { setProdutoFiltro(null); } else { setProdutoFiltro(entry.sku); setCategoriaFiltro(null); } }}>{dadosTopProdutos.map((entry, index) => (<Cell key={entry.sku} fill={CORES_PRODUTO[index % CORES_PRODUTO.length]} opacity={produtoFiltro && produtoFiltro !== entry.sku ? 0.3 : 1} />))}</Bar></BarChart></ResponsiveContainer></CardContent></Card>

            <Card><CardHeader className="pb-2"><CardTitle className="text-base">Comparativo {mesAnteriorLabel} vs {mesAtualLabel}</CardTitle></CardHeader><CardContent><ResponsiveContainer width="100%" height={320}><BarChart data={dadosComparativo} layout="vertical" margin={{ top: 5, right: 20, left: 5, bottom: 5 }}><CartesianGrid strokeDasharray="3 3" /><XAxis type="number" tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 11 }} /><YAxis dataKey="nome" type="category" width={110} tick={{ fontSize: 11 }} interval={0} /><Tooltip content={CustomTooltipComp} /><Legend /><Bar dataKey="anterior" name={mesAnteriorLabel} fill="#94a3b8" radius={[0, 4, 4, 0]} barSize={10} /><Bar dataKey="atual" name={mesAtualLabel} fill="#F47920" radius={[0, 4, 4, 0]} barSize={10} /></BarChart></ResponsiveContainer></CardContent></Card>
          </div>

          <Card><CardHeader className="pb-2"><CardTitle className="text-base">Markup e Margem Líquida por Produto</CardTitle><p className="text-xs text-muted-foreground">Clique em uma barra para filtrar por produto</p></CardHeader><CardContent><ResponsiveContainer width="100%" height={350}><BarChart data={dadosMarkup} margin={{ top: 10, right: 20, left: 5, bottom: 60 }}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="nome" tick={{ fontSize: 12 }} angle={-45} textAnchor="end" height={80} /><YAxis tickFormatter={(v) => `${v}%`} tick={{ fontSize: 11 }} /><Tooltip content={CustomTooltipMarkup} /><Legend /><Bar dataKey="markup" name="Markup" fill="#003B7A" radius={[4, 4, 0, 0]} barSize={18} cursor="pointer" onClick={(data: { sku: number }) => { if (produtoFiltro === data.sku) { setProdutoFiltro(null); } else { setProdutoFiltro(data.sku); setCategoriaFiltro(null); } }} /><Bar dataKey="margem" name="Margem Líquida" fill="#F47920" radius={[4, 4, 0, 0]} barSize={18} /></BarChart></ResponsiveContainer></CardContent></Card>

          <Card><CardHeader className="pb-2"><CardTitle className="text-base">Detalhamento por Produto</CardTitle></CardHeader><CardContent><div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b-2 border-gray-200"><th className="text-left py-2 px-2">SKU</th><th className="text-left py-2 px-2">Produto</th><th className="text-left py-2 px-2">Categoria</th><th className="text-right py-2 px-2">Fat. {mesAtualLabel}</th><th className="text-right py-2 px-2">Fat. {mesAnteriorLabel}</th><th className="text-right py-2 px-2">Var.</th><th className="text-right py-2 px-2">Markup</th><th className="text-right py-2 px-2">Margem</th><th className="text-right py-2 px-2">Estoque</th></tr></thead><tbody>{[...produtosFiltrados].sort((a, b) => b.faturamentoAtual - a.faturamentoAtual).map((p) => { const variacao = p.faturamentoAnterior > 0 ? ((p.faturamentoAtual - p.faturamentoAnterior) / p.faturamentoAnterior * 100).toFixed(1) : "0"; return (<tr key={p.sku} className={`border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${produtoFiltro === p.sku ? "bg-blue-50" : ""}`} onClick={() => { if (produtoFiltro === p.sku) { setProdutoFiltro(null); } else { setProdutoFiltro(p.sku); setCategoriaFiltro(null); } }}><td className="py-2 px-2 font-mono text-xs">{p.sku}</td><td className="py-2 px-2">{p.nome}</td><td className="py-2 px-2"><span className="inline-block px-2 py-0.5 rounded-full text-xs text-white" style={{ backgroundColor: CORES_CATEGORIA[p.categoria] || "#999" }}>{p.categoria}</span></td><td className="py-2 px-2 text-right">{formatCurrency(p.faturamentoAtual)}</td><td className="py-2 px-2 text-right">{formatCurrency(p.faturamentoAnterior)}</td><td className={`py-2 px-2 text-right font-medium ${Number(variacao) >= 0 ? "text-green-600" : "text-red-600"}`}>{Number(variacao) >= 0 ? "+" : ""}{variacao}%</td><td className="py-2 px-2 text-right">{p.markup}%</td><td className="py-2 px-2 text-right">{p.margemLiquida}%</td><td className="py-2 px-2 text-right">{p.estoque}</td></tr>); })}</tbody></table></div></CardContent></Card>
        </div>
      </main>
      <footer className="border-t bg-white py-6"><div className="container mx-auto px-4 text-center text-sm text-muted-foreground"><p>LuminAI &copy; {new Date().getFullYear()} - Gestão inteligente de vendas e estoque</p></div></footer>
    </div>
  );
};

export default Bi;
