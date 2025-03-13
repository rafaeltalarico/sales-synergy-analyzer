import { useState } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, XAxis, YAxis, Tooltip, Bar, ResponsiveContainer, Cell } from "recharts";
import { ArrowDown, ArrowUp, BarChart2, List, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

export interface RelatedProduct {
  name: string;
  percentage: number;
  absoluteValue: number;
}

export interface ProductResult {
  productName: string;
  productId: number;
  totalSales: number;
  salesDifference: {
    percentage: number;
    absoluteValue: number;
    isIncrease: boolean;
  };
  relatedProducts: RelatedProduct[];
  showComparison: boolean;
  showCrossSell?: boolean;
}

interface ResultsDisplayProps {
  result: ProductResult | null;
  comparisonType: "compare" | "until";
  showCrossSell?: boolean;
}

const ResultsDisplay = ({ result, comparisonType, showCrossSell = true }: ResultsDisplayProps) => {
  const [displayType, setDisplayType] = useState<"list" | "chart">("list");
  const [valueType, setValueType] = useState<"percentage" | "absolute">("absolute");

  if (!result) return null;

  const chartData = result.relatedProducts.map((product) => ({
    name: product.name,
    value: product.percentage,
  }));
  

  return (
    <div className="w-full space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pl-6">
        <div className="flex flex-col">
          <span className="text-sm text-muted-foreground">Produto analisado</span>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-semibold">{result.productName}</h2>
            <div className="flex flex-row gap-2">
              {result.showComparison ? (
                <div className="flex items-center space-x-6">
                  <div className="flex item-center">
                    <span className="flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {valueType === "absolute" && `  ${result.totalSales} un. vendidas`}
                      {valueType === "percentage" && `  ${result.totalSales} un. vendidas`}
                    </span>
                  </div>
                  
                  <div className="flex flex-row gap-5 px-3 py-0.5 text-sm font-semibold bg-yellow-50 text-yellow-900 border border-yellow-200">
                    <span>VARIAÇÃO</span>
                    <div className={cn(
                      "flex items-center gap-1 py-0.5 px-1 rounded-full text-xs font-medium",
                      result.salesDifference.absoluteValue === 0 ? "bg-gray-100 text-gray-600" :
                      result.salesDifference.isIncrease ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                    )}>
                      {result.salesDifference.absoluteValue === 0 ? (
                        <Minus className="h-3 w-3" />
                      ) : result.salesDifference.isIncrease ? (
                        <ArrowUp className="h-3 w-3" />
                      ) : (
                        <ArrowDown className="h-3 w-3" />
                      )}
                      <span>
                        {valueType === "percentage" 
                          ? `${result.salesDifference.percentage}%` 
                          : `${result.salesDifference.absoluteValue} un.`}
                      </span>
                    </div>
                  </div>
                </div>
                
              ) : (
                <div className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  <span>
                    {result.salesDifference.absoluteValue} unidades vendidas
                  </span>
                  
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-6">
          {result.showComparison && (
            <div className="flex flex-col gap-1">
              <div className="text-xs font-medium text-muted-foreground">
                Exibir valores em:
              </div>
              <RadioGroup
                value={valueType}
                onValueChange={(value) => setValueType(value as "percentage" | "absolute")}
                className="flex items-center space-x-2"
              >
                <div className="flex items-center space-x-1">
                  <RadioGroupItem value="absolute" id="absolute" />
                  <Label htmlFor="absolute" className="text-xs font-medium">123</Label>
                </div>
                <div className="flex items-center space-x-1">
                  <RadioGroupItem value="percentage" id="percentage" />
                  <Label htmlFor="percentage" className="text-xs font-medium">%</Label>
                </div>
              </RadioGroup>
            </div>
          )}

          <div className="flex flex-col gap-1">
            <div className="text-xs font-medium text-muted-foreground">
              Exibir como:
            </div>
            <RadioGroup
              value={displayType}
              onValueChange={(value) => setDisplayType(value as "list" | "chart")}
              className="flex items-center space-x-2"
            >
              <div className="flex items-center space-x-1">
                <RadioGroupItem value="chart" id="chart" />
                <Label htmlFor="chart" className="text-xs font-medium flex items-center">
                  <BarChart2 className="h-3 w-3 mr-1" />
                  GRÁFICO
                </Label>
              </div>
              <div className="flex items-center space-x-1">
                <RadioGroupItem value="list" id="list" />
                <Label htmlFor="list" className="text-xs font-medium flex items-center">
                  <List className="h-3 w-3 mr-1" />
                  LISTA
                </Label>
              </div>
            </RadioGroup>
          </div>
        </div>
      </div>

      <div className="text-sm text-muted-foreground">
        {comparisonType === "compare" 
          ? "Resultado da comparação entre as datas selecionadas."
          : "Resultado do recorte das vendas até a data selecionada."}
      </div>

      {showCrossSell ? (
        <div className="w-full mt-4">
          <Card className="results-card border-synergy-blue/10">
            <CardHeader>
              <CardTitle className="text-sm text-muted-foreground">
                Produtos mais vendidos junto com {result.productName}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {displayType === "list" ? (
                <div className="space-y-2">
                  {result.relatedProducts.length > 0 ? (
                    result.relatedProducts.map((product, index) => (
                      <div 
                        key={product.name} 
                        className="flex items-center justify-between py-2 border-b last:border-b-0 animate-result-item"
                        style={{ animationDelay: `${index * 0.1}s` }}
                      >
                        <span className="font-medium">{product.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-synergy-blue">{product.percentage}%</span>                        
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-4 text-center text-muted-foreground">
                      Não há dados suficientes para análise de cross-sell neste período.
                    </div>
                  )}
                </div>
              ) : (
                <div className="h-60 sm:h-72 w-full">
                  {result.relatedProducts.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={chartData}
                        layout="vertical"
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <XAxis type="number" domain={[0, 100]} />
                        <YAxis dataKey="name" type="category" width={120} />
                        <Tooltip
                          formatter={(value) => [`${value}%`, 'Frequência']}
                          contentStyle={{ 
                            backgroundColor: 'white', 
                            borderRadius: '8px',
                            border: '1px solid #e2e8f0'
                          }}
                        />
                        <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                          {chartData.map((entry, index) => (
                            <Cell 
                              key={`cell-${index}`} 
                              fill="#36A2EB" 
                              fillOpacity={1 - (index * 0.15)} 
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-muted-foreground">
                      Não há dados suficientes para análise de cross-sell neste período.
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="w-full mt-4">
          <Card className="results-card border-synergy-blue/10">
            <CardContent>
              <div className="py-4 text-center text-muted-foreground">
                Não é gerado resultado de vendas atreladas ao produto pesquisado, pois não há um período selecionado. Para exibir o resultado, basta ativar qualquer um dos períodos.
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ResultsDisplay;