import { useState } from "react";
import Navbar from "@/components/Navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import AIInsights from "@/components/AIInsights";
import { useToast } from "@/components/ui/use-toast";
import { getStockClassification } from "@/services/stockService";

const Analytics = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [productData, setProductData] = useState<any>(null);
  const [salesData, setSalesData] = useState<any>(null);
  const [stockData, setStockData] = useState<any>(null);
  const { toast } = useToast();

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast({
        title: "Busca vazia",
        description: "Por favor, digite um nome ou ID de produto para buscar.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Fetch product data
      const product = await getProductByNameOrId(searchQuery, "product");
      if (!product) {
        toast({
          title: "Produto não encontrado",
          description: "Verifique o nome ou ID do produto e tente novamente.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      setProductData(product);

      // Fetch stock classification data
      const stockClassification = await getStockClassification(
        product.id_produto.toString(),
        "sku"
      );
      setStockData(stockClassification);

      // Fetch sales analysis data
      const today = new Date();
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(today.getDate() - 30);
      
      const salesAnalysis = await analyzeSales(
        product.id_produto,
        thirtyDaysAgo,
        today,
        "until"
      );
      setSalesData(salesAnalysis);

    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        title: "Erro na busca",
        description: "Ocorreu um erro ao buscar os dados do produto.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-synergy-light flex flex-col">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-8 max-w-6xl">
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold text-synergy-dark mb-2">Análises</h1>
            <p className="text-muted-foreground">
              Análise detalhada de produtos com insights de inteligência artificial.
            </p>
          </div>

          <Card>
            <CardContent className="pt-6">
              <div className="flex gap-2">
                <Input
                  placeholder="Buscar produto por nome ou ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1"
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                />
                <Button onClick={handleSearch} disabled={isLoading}>
                  {isLoading ? "Buscando..." : <Search className="h-4 w-4 mr-2" />}
                  Buscar
                </Button>
              </div>
            </CardContent>
          </Card>

          {productData && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                {/* Aqui você pode adicionar gráficos e outras visualizações */}
                <Card>
                  <CardContent className="pt-6">
                    <h2 className="text-xl font-semibold mb-4">Dados do Produto</h2>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Nome do Produto</p>
                        <p className="font-medium">{productData.nome_produto}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">ID do Produto</p>
                        <p className="font-medium">{productData.id_produto}</p>
                      </div>
                      {/* Adicione mais informações do produto conforme necessário */}
                    </div>
                  </CardContent>
                </Card>
                
                {/* Adicione mais cards com gráficos e análises aqui */}
              </div>
              
              <div>
                <AIInsights 
                  productId={productData.id_produto.toString()}
                  productName={productData.nome_produto}
                  salesData={salesData}
                  stockData={stockData}
                  relatedProducts={salesData?.relatedProducts}
                />
              </div>
            </div>
          )}
        </div>
      </main>

      <footer className="border-t bg-white py-6">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>LuminAI &copy; {new Date().getFullYear()} - Análise de vendas inteligente</p>
        </div>
      </footer>
    </div>
  );
};

export default Analytics;