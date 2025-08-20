import Navbar from "@/components/Navbar";
import QuickSightEmbed from "@/components/QuickSightEmbed";
import { useNavigate } from "react-router-dom";
function Bi() {
  return (
    <div className="p-4">
      
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-8 max-w-6xl">
        <h1 className="text-3xl font-bold text-synergy-dark mb-4">
          Dashboard de BI
        </h1>
        <p className="text-muted-foreground mb-6">
          Acompanhe os principais indicadores do negócio em tempo real.
        </p>

        <QuickSightEmbed />
      </main>

      <footer className="border-t bg-white py-6">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>LuminAI &copy; {new Date().getFullYear()} - Análise de vendas inteligente</p>
        </div>
      </footer>
    </div>
  );
}

export default Bi;
