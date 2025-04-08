import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import InfoCard from "@/components/InfoCard";
import { StockTotal } from "@/models/stockTypes";
import { getStockTotal } from "@/services/stockService";

const Dashboard = () => {
  const [stockTotal, setStockTotal] = useState<StockTotal | null>(null);

  useEffect(() => {
    const fetchStockTotal = async () => {
      try {
        const total = await getStockTotal();
        if (total) {
          setStockTotal(total);
        }
      } catch (err) {
        console.error("Erro ao buscar dados de estoque:", err);
      }
    };

    fetchStockTotal();
  }, []);

  return (
    <div className="min-h-screen bg-synergy-light flex flex-col">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-8 max-w-6xl">
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold text-synergy-dark mb-2">Dashboard</h1>
            <p className="text-muted-foreground">
              Visão geral das análises e métricas de vendas.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <InfoCard title="Quantidade Total em Estoque">
              <p className="text-2xl font-semibold">
                {stockTotal ? stockTotal.quantity : "Carregando..."}
              </p>
            </InfoCard>

            <InfoCard title="Valor Total em Estoque">
              <p className="text-2xl font-semibold">
                {stockTotal ? `R$ ${stockTotal.value.toFixed(2)}` : "Carregando..."}
              </p>
            </InfoCard>
          </div>
        </div>
      </main>

      <footer className="border-t bg-white py-6">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>
            SalesSynergy Analytics &copy; {new Date().getFullYear()} - Análise de vendas inteligente para supermercados
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;
