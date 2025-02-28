
import { useState } from "react";
import Navbar from "@/components/Navbar";
import DateRangeSelector from "@/components/DateRangeSelector";
import ProductSearch from "@/components/ProductSearch";
import ResultsDisplay, { ProductResult } from "@/components/ResultsDisplay";
import InfoCard from "@/components/InfoCard";
import { analyzeSales, getProductByNameOrId } from "@/services/analysisService";
import { useToast } from "@/hooks/use-toast";
import { ProductSearchResult } from "@/models/types";
import { ArrowLeftRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const Index = () => {
  const [startDate, setStartDate] = useState<Date | undefined>(
    new Date("2023-10-01")
  );
  const [endDate, setEndDate] = useState<Date | undefined>(
    new Date("2023-10-05")
  );
  const [comparisonType, setComparisonType] = useState<"compare" | "until">("compare");
  const [searchResults, setSearchResults] = useState<ProductSearchResult[]>([]);
  const [activeResult, setActiveResult] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const [showSecondSearch, setShowSecondSearch] = useState(false);
  const { toast } = useToast();

  const handleSearch = (query: string, searchType: "product" | "sku", searchIndex: number = 0) => {
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
        // Se for a primeira pesquisa e não encontrou, limpa tudo
        if (searchIndex === 0) {
          setSearchResults([]);
        }
        
        toast({
          title: "Produto não encontrado",
          description: "Verifique o nome ou ID do produto e tente novamente.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      const analysis = analyzeSales(product.id_produto, startDate, endDate, comparisonType);
      
      const newResult: ProductSearchResult = {
        id: searchIndex,
        productName: product.nome_produto,
        productId: product.id_produto,
        salesDifference: analysis.salesDifference,
        relatedProducts: analysis.relatedProducts.map(rp => ({
          name: rp.productName,
          percentage: rp.percentage,
        })),
        showComparison: analysis.showComparison
      };

      // Atualiza o resultado correspondente ao índice ou adiciona um novo
      const updatedResults = [...searchResults];
      updatedResults[searchIndex] = newResult;
      
      setSearchResults(updatedResults);
      setActiveResult(searchIndex); // Define o resultado ativo como o que acabou de ser pesquisado
      setIsLoading(false);
    }, 800);
  };

  const handleToggleResult = () => {
    if (searchResults.length > 1) {
      setActiveResult(activeResult === 0 ? 1 : 0);
    }
  };

  const handleAddSecondSearch = () => {
    setShowSecondSearch(true);
  };

  const handleRemoveSecondSearch = () => {
    setShowSecondSearch(false);
    // Remove o segundo resultado se existir
    if (searchResults.length > 1) {
      setSearchResults(searchResults.slice(0, 1));
      setActiveResult(0);
    }
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
            <div className="space-y-4">
              <ProductSearch 
                onSearch={(query, searchType) => handleSearch(query, searchType, 0)} 
                label="Produto Principal"
                placeholder="Digite o nome do produto ou SKU..."
                onAddSecondSearch={handleAddSecondSearch}
              />
              
              {showSecondSearch && (
                <ProductSearch 
                  onSearch={(query, searchType) => handleSearch(query, searchType, 1)} 
                  label="Produto para Comparação"
                  placeholder="Digite um segundo produto para comparar..."
                  isSecondary={true}
                  onRemoveSecondSearch={handleRemoveSecondSearch}
                />
              )}
            </div>
          </InfoCard>

          {isLoading ? (
            <div className="w-full flex justify-center py-12">
              <div className="animate-pulse flex flex-col items-center">
                <div className="h-8 w-40 bg-synergy-blue/20 rounded-md mb-4"></div>
                <div className="h-64 w-full max-w-2xl bg-synergy-blue/10 rounded-md"></div>
              </div>
            </div>
          ) : (
            searchResults.length > 0 && (
              <div className="space-y-4">
                {searchResults.length > 1 && (
                  <div className="flex justify-center">
                    <Button 
                      variant="outline" 
                      onClick={handleToggleResult}
                      className="flex items-center gap-2 text-synergy-blue hover:text-synergy-blue/90"
                    >
                      <ArrowLeftRight className="h-4 w-4" />
                      <span>Alternar entre {searchResults[0].productName} e {searchResults[1].productName}</span>
                    </Button>
                  </div>
                )}
                
                <ResultsDisplay 
                  result={searchResults[activeResult] ? 
                    {
                      productName: searchResults[activeResult].productName,
                      productId: searchResults[activeResult].productId,
                      salesDifference: searchResults[activeResult].salesDifference,
                      relatedProducts: searchResults[activeResult].relatedProducts,
                      showComparison: searchResults[activeResult].showComparison
                    } : null
                  } 
                />
              </div>
            )
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
