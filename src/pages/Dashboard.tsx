import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import InfoCard from "@/components/InfoCard";
import { StockTotal, StockItem, StockClassificationData } from "@/models/stockTypes";
import { getStockTotal, getStockItems, getStockClassification } from "@/services/stockService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import StockClassification from  "@/components/StockClassification";



const Dashboard = () => {
  const [stockTotal, setStockTotal] = useState<StockTotal | null>(null);
  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<StockItem | null>(null);
  const [classificationData, setClassificationData] = useState<StockClassificationData | null>(null);
  const [isClassificationLoading, setIsClassificationLoading] = useState(false);
  const [overallClassificationData, setOverallClassificationData] = useState<StockClassificationData | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const total = await getStockTotal();
        if (total) {
          setStockTotal(total);
        }

        const items = await getStockItems();
        setStockItems(items);

        if (items.length > 0) {
          const overall: StockClassificationData = {
            stockOver: 0,
            criticalAge: 0,
            expired: 0,
            ok: 0,
            total: 0
          };

          for (const item of items.slice(0,20)) {
            try {
              const itemClassification = await getStockClassification(item.productId.toString(),"sku");
              if (itemClassification) {
                overall.stockOver += itemClassification.stockOver || 0;
                overall.criticalAge += itemClassification.criticalAge || 0;
                overall.expired += itemClassification.expired || 0;
                overall.ok += itemClassification.ok || 0;
                overall.total += itemClassification.total || 0;
              }
            } catch (error) {
              console.error(`Erro ao buscar dados de classificação ${item.produtctId}`, error);
            
            }
          }
          setOverallClassificationData(overall);
        }

      } catch (err) {
        console.error("Erro ao buscar dados de estoque:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const fetchClassificationData = async () => {
      if (selectedProduct) {
        setIsClassificationLoading(true);
        try {
          const data = await getStockClassification(selectedProduct.productId.toString(),"sku"
          );
          setClassificationData(data);
        } catch (err) {
          console.error("Erro ao buscar dados de classificação:", err);
        } finally {
          setIsClassificationLoading(false);
        }
      } else {
        setClassificationData(null);
      }
    };

    fetchClassificationData();
  }, [selectedProduct]);

  const handleProductSelect = (product: StockItem) => {
    setSelectedProduct(product);
  };

  const clearSelection = () => {
    setSelectedProduct(null);
  };

  const displayQuantity = selectedProduct ? selectedProduct.quantity : 
  stockTotal?.quantity;

  const displayValue = selectedProduct? selectedProduct.value :
  stockTotal?.value;

  const displayClassification = selectedProduct ? classificationData : overallClassificationData;

  const isDisplayClassificationLoading = selectedProduct ? isClassificationLoading : isLoading;


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

          <div className="mb-6">             
            <StockClassification
              data={displayClassification}
              isLoading={isDisplayClassificationLoading}
              title={selectedProduct ?`Classificação de Estoque: ${selectedProduct.productName}` :
                "Classificação de Estoque Geral"}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <InfoCard title={selectedProduct ? `Quantidade em estoque: ${selectedProduct.productName}` :
              "Quantidade total em estoque"}>
              <p className="text-2xl font-semibold">
                {isLoading ? "Carregando..." : displayQuantity || 0}
              </p>          
            </InfoCard>

            <InfoCard title={selectedProduct ? `Valor em estoque: ${selectedProduct.productName}` :
              "Valor total em estoque"}>
              <p className="text-2xl font-semibold">
                {isLoading ? "Carregando..." : displayValue || 0}
              </p>
            </InfoCard>
            {selectedProduct && (
              <InfoCard title="Preço Unitário">
                <p className="text-2xl font-semibold"> 
                  R$ {selectedProduct.unitPrice.toFixed(2)}
                </p>
              </InfoCard>
            )}
          </div>

          <div className="mt-8">
            <div>
              <h2 className="text-2xl font-bold text-synergy-dark mb-4">Produtos em Estoque</h2>
                {selectedProduct && (              
                  <Button variant="outline" onClick={clearSelection}>
                    <X className="h-4 w-4 mr-2" />
                    Fechar
                  </Button>
              )}
            </div>
            <Card className="mt-6">
              <CardContent className="pt-6">
              <div className="grid grid-cols-4 font-semibold border-b border-gray-300 pb-2">
                <div>Produto</div>
                <div className="text-right">Quantidade</div>
                <div className="text-right">Valor (R$)</div>
              </div>               
                {stockItems.map((item) => (
                  <div 
                    key={item.productId} 
                    className={`grid grid-cols-4 py-2 border-b border-gray-100 text-sm
                      cursor-pointer hover:bg-gray-50 ${selectedProduct?.productId === item.productId ? "bg-gray-100" : ""
                    }`}
                    onClick={() => handleProductSelect(item)}
                  >
                    <div>{item.productName}</div>
                    <div className="text-right">{item.quantity}</div>
                    <div className="text-right">{item.value.toFixed(2)}</div>
                  </div>
                ))}                
              </CardContent>
            </Card>
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
