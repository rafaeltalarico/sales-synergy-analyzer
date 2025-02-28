
import Navbar from "@/components/Navbar";
import InfoCard from "@/components/InfoCard";

const Analytics = () => {
  return (
    <div className="min-h-screen bg-synergy-light flex flex-col">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8 max-w-6xl">
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold text-synergy-dark mb-2">Análises Avançadas</h1>
            <p className="text-muted-foreground">
              Análises detalhadas e insights baseados em dados de vendas.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <InfoCard title="Em desenvolvimento">
              <p className="text-muted-foreground">
                Este módulo está em desenvolvimento. Volte em breve para ver as novas funcionalidades.
              </p>
            </InfoCard>
          </div>
        </div>
      </main>
      
      <footer className="border-t bg-white py-6">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>SalesSynergy Analytics &copy; {new Date().getFullYear()} - Análise de vendas inteligente para supermercados</p>
        </div>
      </footer>
    </div>
  );
};

export default Analytics;
