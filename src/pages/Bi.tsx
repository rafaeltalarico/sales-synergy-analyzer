import Navbar from "@/components/Navbar";
import QuickSightEmbed from "@/components/QuickSightEmbed";
import { useNavigate } from "react-router-dom";
function Bi() {
  return (
    <div className="min-h-screen w-full">
      
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8 max-w-6xl">
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
