import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Filter } from 'lucide-react';
import { ProductCard } from './ProductCard';
import { createMockService } from '@/lib/mock-service';
import type { Product } from '@/lib/types';

interface MenuListProps {
  restaurantId: string;
}

export function MenuList({ restaurantId }: MenuListProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    const mockService = createMockService(restaurantId);
    
    const loadProducts = async () => {
      try {
        const productList = await mockService.getProducts();
        setProducts(productList);
      } catch (error) {
        console.error('Error loading products:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [restaurantId]);

  const categories = [
    'all',
    ...Array.from(new Set(products.map(p => p.category)))
  ];

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const highlightedProducts = filteredProducts.filter(p => p.isHighlighted);
  const daySpecials = filteredProducts.filter(p => p.isDaySpecial);
  const regularProducts = filteredProducts.filter(p => !p.isHighlighted && !p.isDaySpecial);

  if (loading) {
    return (
      <div className="container py-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-muted rounded-lg h-48 mb-2"></div>
              <div className="bg-muted rounded h-4 mb-2"></div>
              <div className="bg-muted rounded h-4 w-2/3"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Search and Filter */}
      <div className="sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-10 pb-4">
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Buscar pratos, bebidas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Category Pills */}
          <div className="flex overflow-x-auto gap-2 pb-2">
            {categories.map((category) => (
              <Badge
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                className="cursor-pointer whitespace-nowrap"
                onClick={() => setSelectedCategory(category)}
              >
                {category === 'all' ? 'Todos' : category}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      {/* Menu Sections */}
      <div className="space-y-8">
        {/* Highlighted Items */}
        {highlightedProducts.length > 0 && (
          <section className="animate-fade-in">
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-2xl font-bold">Destaques</h2>
              <Badge className="bg-accent text-accent-foreground">
                <Filter className="w-3 h-3 mr-1" />
                {highlightedProducts.length}
              </Badge>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {highlightedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        )}

        {/* Day Specials */}
        {daySpecials.length > 0 && (
          <section className="animate-fade-in">
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-2xl font-bold">Pratos do Dia</h2>
              <Badge variant="secondary">
                {daySpecials.length}
              </Badge>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {daySpecials.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        )}

        {/* Regular Products by Category */}
        {categories.filter(cat => cat !== 'all').map((category) => {
          const categoryProducts = regularProducts.filter(p => p.category === category);
          
          if (categoryProducts.length === 0) return null;

          return (
            <section key={category} className="animate-fade-in">
              <div className="flex items-center gap-2 mb-4">
                <h2 className="text-2xl font-bold">{category}</h2>
                <Badge variant="outline">
                  {categoryProducts.length}
                </Badge>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {categoryProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </section>
          );
        })}

        {/* No Results */}
        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <div className="text-muted-foreground mb-4">
              <Search className="w-12 h-12 mx-auto mb-2" />
              Nenhum item encontrado
            </div>
            <p className="text-sm text-muted-foreground">
              Tente ajustar sua busca ou filtros
            </p>
          </div>
        )}
      </div>
    </div>
  );
}