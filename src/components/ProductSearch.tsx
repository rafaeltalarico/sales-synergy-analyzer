
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Search } from "lucide-react";
import { useState } from "react";

interface ProductSearchProps {
  onSearch: (query: string, searchType: "product" | "sku") => void;
  label?: string;
  placeholder?: string;
}

const ProductSearch = ({ 
  onSearch, 
  label = "Produto", 
  placeholder = "Digite o nome do produto ou SKU..." 
}: ProductSearchProps) => {
  const [query, setQuery] = useState("");
  const [searchType, setSearchType] = useState<"product" | "sku">("product");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query, searchType);
    }
  };

  return (
    <form onSubmit={handleSearch} className="w-full">
      {label && (
        <div className="mb-2 text-sm font-medium text-muted-foreground">
          {label}
        </div>
      )}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative w-full">
            <Input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={placeholder}
              className="pl-10 search-input border-synergy-blue/20 focus:border-synergy-blue/50"
            />
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
              <Search className="h-4 w-4 text-synergy-blue" />
            </div>
          </div>
        </div>
        
        <div className="flex flex-row sm:flex-col gap-2 items-center">
          <div className="text-xs font-medium text-muted-foreground">
            Filtrar por:
          </div>
          <RadioGroup
            value={searchType}
            onValueChange={(value) => setSearchType(value as "product" | "sku")}
            className="flex items-center space-x-2"
          >
            <div className="flex items-center space-x-1">
              <RadioGroupItem value="product" id={`product-${label}`} />
              <Label htmlFor={`product-${label}`} className="text-xs font-medium">PRODUTO</Label>
            </div>
            <div className="flex items-center space-x-1">
              <RadioGroupItem value="sku" id={`sku-${label}`} />
              <Label htmlFor={`sku-${label}`} className="text-xs font-medium">SKU</Label>
            </div>
          </RadioGroup>
        </div>
        
        <Button 
          type="submit" 
          className="bg-synergy-blue hover:bg-synergy-blue/90 transition-colors duration-200"
        >
          Pesquisar
        </Button>
      </div>
    </form>
  );
};

export default ProductSearch;
