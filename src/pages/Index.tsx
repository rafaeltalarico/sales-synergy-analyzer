import { useState } from "react";
import Navbar from "@/components/Navbar";
import DateRangeSelector from "@/components/DateRangeSelector";
import ProductSearch from "@/components/ProductSearch";
import ResultsDisplay, { ProductResult } from "@/components/ResultsDisplay";
import InfoCard from "@/components/InfoCard";
import { analyzeSales } from "@/services/apiClient";
import { getProductByNameOrId } from "@/services/apiClient";
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
  const [searchCount, setSearchCount] = useState(1);
  const { toast } = useToast();

  const handleSearch = async (query: string, searchType: "product" | "sku", searchIndex: number = 0) => {
    if (!startDate || !endDate) {
      toast({
        title: "Datas não selecionadas",
        description: "Por favor, selecione um período de análise.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const product = await getProductByNameOrId(query, searchType);
      
      if (!product) {
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

      const isComparisonProduct = searchIndex > 0;
      const firstProductId = isComparisonProduct && searchResults.length > 0 ? searchResults[0].productId : undefined;
      
      const analysis = await analyzeSales(
        product.id_produto, 
        startDate, 
        endDate, 
        comparisonType, 
        isComparisonProduct, 
        firstProductId
      );
      
      const newResult: ProductSearchResult = {
        id: searchIndex,
        productName: product.nome_produto,
        productId: product.id_produto,
        salesDifference: analysis.salesDifference,
        relatedProducts: analysis.relatedProducts.map(rp => ({
          name: rp.productName,
          percentage: rp.percentage,
        })),
        showComparison: analysis.showComparison,
        comparisonType: comparisonType // Adicione esta linha
      };

      const updatedResults = [...searchResults];
      updatedResults[searchIndex] = newResult;
      
      setSearchResults(updatedResults);
      setActiveResult(searchIndex);
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
      toast({
        title: "Erro ao buscar dados",
        description: "Ocorreu um erro ao buscar os dados. Por favor, tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleResult = () => {
    if (searchResults.length > 1) {
      setActiveResult(activeResult === 0 ? 1 : 0);
    }
  };

  const handleAddSearch = () => {
    if (searchCount < 5) {
      setSearchCount(prevCount => prevCount + 1);
    }
  };

  const handleRemoveSearch = (index: number) => {
    setSearchCount(prevCount => prevCount - 1);
    const updatedResults = searchResults.filter((_, i) => i !== index);
    setSearchResults(updatedResults);
    setActiveResult(Math.min(activeResult, updatedResults.length - 1));
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
              {Array.from({ length: searchCount }).map((_, index) => (
                <ProductSearch 
                  key={index}
                  onSearch={(query, searchType) => handleSearch(query, searchType, index)} 
                  label={index === 0 ? "Produto Principal" : `Produto para Comparação ${index}`}
                  placeholder={index === 0 ? "Digite o nome do produto ou SKU..." : "Digite um produto para comparar..."}
                  isSecondary={index !== 0}
                  onAddSecondSearch={index === 0 && searchCount < 5 ? handleAddSearch : undefined}
                  onRemoveSecondSearch={index !== 0 ? () => handleRemoveSearch(index) : undefined}
                />
              ))}
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
                  <div className="flex justify-center gap-2">
                    {searchResults.map((result, index) => (
                      <Button 
                        key={index}
                        variant={activeResult === index ? "default" : "outline"}
                        onClick={() => {
                          setActiveResult(index);
                          setComparisonType(result.comparisonType); // Atualiza o comparisonType global
                        }}
                        className={`flex items-center gap-2 ${activeResult === index ? 'bg-synergy-blue text-white' : 'text-synergy-blue hover:text-synergy-blue/90'}`}
                      >
                        {result.productName}
                      </Button>
                    ))}
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
                  comparisonType={searchResults[activeResult]?.comparisonType || "compare"} // Use o comparisonType do resultado ativo
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