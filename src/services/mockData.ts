
import { Product, Purchase, PurchaseItem } from "@/models/types";

// Dados mock para produtos
export const mockProducts: Product[] = [
  { id_produto: 1, nome_produto: "Pipoca Yoki", preco: 4.99 },
  { id_produto: 2, nome_produto: "Guaraná Antarc. 1L", preco: 5.49 },
  { id_produto: 3, nome_produto: "Coca-cola 600ml", preco: 6.99 },
  { id_produto: 4, nome_produto: "Sal", preco: 2.29 },
  { id_produto: 5, nome_produto: "Margarina 500g", preco: 7.89 },
  { id_produto: 6, nome_produto: "Fanta Laranja 600ml", preco: 6.49 },
  { id_produto: 7, nome_produto: "Biscoito Trakinas", preco: 3.99 },
  { id_produto: 8, nome_produto: "Leite Integral 1L", preco: 4.29 },
  { id_produto: 9, nome_produto: "Cerveja Heineken 350ml", preco: 4.99 },
  { id_produto: 10, nome_produto: "Café 3 Corações 500g", preco: 16.99 },
  { id_produto: 11, nome_produto: "Arroz Tio João 5kg", preco: 24.99 },
  { id_produto: 12, nome_produto: "Feijão Carioca 1kg", preco: 7.49 },
  { id_produto: 13, nome_produto: "Óleo de Soja 900ml", preco: 7.99 },
  { id_produto: 14, nome_produto: "Açúcar Cristal 5kg", preco: 19.99 },
  { id_produto: 15, nome_produto: "Salgadinho Doritos", preco: 9.99 },
];

// Gerar compras para o período de outubro 2023
export const generateMockPurchases = (): Purchase[] => {
  const purchases: Purchase[] = [];
  // Criar 200 compras de 01/10/2023 a 10/10/2023
  for (let i = 1; i <= 200; i++) {
    const day = Math.floor(Math.random() * 10) + 1; // Dias de 1 a 10
    purchases.push({
      id_compra: i,
      data_compra: `2023-10-${day < 10 ? '0' + day : day}`,
      cpf: `${Math.floor(Math.random() * 999)}.${Math.floor(Math.random() * 999)}.${Math.floor(Math.random() * 999)}-${Math.floor(Math.random() * 99)}`,
    });
  }
  return purchases;
};

// Gerar itens de compra com base nas compras
export const generateMockPurchaseItems = (purchases: Purchase[]): PurchaseItem[] => {
  const items: PurchaseItem[] = [];
  let id = 1;
  
  purchases.forEach(purchase => {
    // Cada compra tem entre 2 e 8 itens
    const numItems = Math.floor(Math.random() * 7) + 2;
    
    // Seleciona produtos aleatórios para a compra
    const selectedProducts = new Set<number>();
    
    // Garantir que algumas compras tenham Pipoca Yoki (id_produto: 1)
    // Maior chance nos dias 5 a 10 para simular um aumento
    const shouldIncludePipoca = Math.random() < 0.4; // 40% de chance
    const purchaseDay = parseInt(purchase.data_compra.split('-')[2], 10);
    
    if (shouldIncludePipoca || 
        (purchaseDay >= 5 && Math.random() < 0.6)) { // Dias 5-10 têm 60% de chance
      selectedProducts.add(1); // Adicionar Pipoca Yoki
      
      // Se tiver Pipoca Yoki, aumentar chance de ter refrigerantes
      if (Math.random() < 0.7) selectedProducts.add(2); // Guaraná
      if (Math.random() < 0.65) selectedProducts.add(3); // Coca-cola
      if (Math.random() < 0.3) selectedProducts.add(6); // Fanta
    }
    
    // Adicionar outros produtos aleatórios até atingir numItems
    while (selectedProducts.size < numItems) {
      const randomProductId = Math.floor(Math.random() * mockProducts.length) + 1;
      selectedProducts.add(randomProductId);
    }
    
    // Criar itens para os produtos selecionados
    selectedProducts.forEach(productId => {
      const product = mockProducts.find(p => p.id_produto === productId);
      if (product) {
        items.push({
          id: id++,
          id_compra: purchase.id_compra,
          id_produto: productId,
          valor_unitario: product.preco,
          encarte: Math.random() < 0.2 ? 'sim' : null, // 20% de chance de ser item de encarte
        });
      }
    });
  });
  
  return items;
};

// Gerar todos os dados mock
export const mockPurchases = generateMockPurchases();
export const mockPurchaseItems = generateMockPurchaseItems(mockPurchases);
