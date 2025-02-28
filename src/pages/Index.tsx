
import { useState } from "react";
import Navbar from "@/components/Navbar";
import DateRangeSelector from "@/components/DateRangeSelector";
import ProductSearch from "@/components/ProductSearch";
import ResultsDisplay, { ProductResult } from "@/components/ResultsDisplay";
import InfoCard from "@/components/InfoCard";
import { analyzeSales, getProductByNameOrId } from "@/services/analysisService";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [startDate, setStartDate] = useState<Date | undefined>(
    new Date("2023-10-01")
  );
  const [endDate, setEndDate] = useState<Date | undefined>(
    new Date("2023-10-05")
  );
  const [comparisonType, setComparisonType] = useState<"compare" | "until">("compare");
  const [searchResult, setSearchResult] = useState<ProductResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSearch = (query: string, searchType: "product" | "sku") => {
    if (!startDate || !endDate) {
      toast({
        title: "Datas não selecionadas",
        description: "Por favor, selecione um período de análise.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    // Simular delay de API
    setTimeout(() => {
      const product = getProductByNameOrId(query, searchType);
      
      if (!product) {
        setSearchResult(null);
        toast({
          title: "Produto não encontrado",
          description: "Verifique o nome ou ID do produto e tente novamente.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      const analysis = analyzeSales(product.id_produto, startDate, endDate);
      
      setSearchResult({
        productName: product.nome_produto,
        productId: product.id_produto,
        salesDifference: analysis.salesDifference,
        relatedProducts: analysis.relatedProducts.map(rp => ({
          name: rp.productName,
          percentage: rp.percentage,
        })),
      });

      setIsLoading(false);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-synergy-light flex flex-col">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8 max-w-6xl">
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold text-synergy-dark mb-2">
              Análise de Vendas e Cross-Sell
            </h1>
            <p className="text-muted-foreground">
              Compare o desempenho de produtos e descubra oportunidades de cross-sell baseadas em dados reais de vendas.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <InfoCard title="Período de Análise">
                <DateRangeSelector
                  startDate={startDate}
                  endDate={endDate}
                  onStartDateChange={setStartDate}
                  onEndDateChange={setEndDate}
                  comparisonType={comparisonType}
                  onComparisonTypeChange={setComparisonType}
                />
              </InfoCard>
            </div>

            <div className="md:col-span-1">
              <InfoCard 
                title="Dica" 
                description="Como usar a análise de cross-sell"
              >
                <p className="text-sm text-muted-foreground">
                  Identifique produtos frequentemente comprados juntos para melhorar
                  displays, promoções combinadas e recomendações ao cliente.
                </p>
              </InfoCard>
            </div>
          </div>

          <InfoCard title="Pesquisar Produto">
            <ProductSearch onSearch={handleSearch} />
          </InfoCard>

          {isLoading ? (
            <div className="w-full flex justify-center py-12">
              <div className="animate-pulse flex flex-col items-center">
                <div className="h-8 w-40 bg-synergy-blue/20 rounded-md mb-4"></div>
                <div className="h-64 w-full max-w-2xl bg-synergy-blue/10 rounded-md"></div>
              </div>
            </div>
          ) : (
            searchResult && <ResultsDisplay result={searchResult} />
          )}
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

export default Index;
