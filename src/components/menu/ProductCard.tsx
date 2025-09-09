import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Star, Plus, Minus } from 'lucide-react';
import { useCartStore } from '@/lib/store';
import type { Product, SelectedOption } from '@/lib/types';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState<SelectedOption[]>([]);
  const [notes, setNotes] = useState('');
  const addItem = useCartStore((state) => state.addItem);

  const formatPrice = (price: number) => `R$ ${(price / 100).toFixed(2)}`;

  const calculateTotalPrice = () => {
    const optionsPrice = selectedOptions.reduce((sum, option) => sum + option.price, 0);
    return product.price + optionsPrice;
  };

  const handleAddToCart = () => {
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      options: selectedOptions,
      notes: notes.trim() || undefined,
      imageUrl: product.imageUrl,
      qty: quantity,
    });
    
    // Reset form
    setQuantity(1);
    setSelectedOptions([]);
    setNotes('');
    setIsOpen(false);
  };

  const handleOptionChange = (optionId: string, choiceId: string, choiceName: string, price: number) => {
    setSelectedOptions(prev => {
      const option = product.options?.find(opt => opt.id === optionId);
      if (!option) return prev;

      const existing = prev.find(opt => opt.id === optionId);
      
      if (option.maxSelections === 1) {
        // Radio behavior - replace existing
        return [
          ...prev.filter(opt => opt.id !== optionId),
          { id: optionId, name: option.name, choice: choiceName, price }
        ];
      } else {
        // Checkbox behavior - toggle
        if (existing) {
          return prev.filter(opt => opt.id !== optionId);
        } else {
          return [...prev, { id: optionId, name: option.name, choice: choiceName, price }];
        }
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Card className="menu-item-card group">
          <div className="relative">
            {product.imageUrl ? (
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-32 object-cover rounded-t-lg"
              />
            ) : (
              <div className="w-full h-32 bg-muted rounded-t-lg flex items-center justify-center">
                <span className="text-muted-foreground">Sem imagem</span>
              </div>
            )}
            
            {/* Badges */}
            <div className="absolute top-2 left-2 flex gap-1">
              {product.isHighlighted && (
                <Badge variant="default" className="bg-accent text-accent-foreground">
                  <Star className="w-3 h-3 mr-1" />
                  Destaque
                </Badge>
              )}
              {product.isDaySpecial && (
                <Badge variant="secondary">
                  Prato do Dia
                </Badge>
              )}
            </div>
          </div>

          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold line-clamp-2 group-hover:text-primary transition-colors">
              {product.name}
            </CardTitle>
            <CardDescription className="text-sm line-clamp-2">
              {product.description}
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-0">
            <div className="flex items-center justify-between">
              <span className="text-xl font-bold text-primary">
                {formatPrice(product.price)}
              </span>
              <Button 
                size="sm" 
                className="btn-primary"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsOpen(true);
                }}
              >
                <Plus className="w-4 h-4 mr-1" />
                Adicionar
              </Button>
            </div>
          </CardContent>
        </Card>
      </DialogTrigger>

      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">{product.name}</DialogTitle>
          <DialogDescription>{product.description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Product Image */}
          {product.imageUrl && (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-48 object-cover rounded-lg"
            />
          )}

          {/* Options */}
          {product.options && product.options.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-semibold">Personalize seu pedido</h3>
              
              {product.options.map((option) => (
                <div key={option.id} className="space-y-2">
                  <Label className="text-sm font-medium">
                    {option.name}
                    {option.required && <span className="text-destructive ml-1">*</span>}
                  </Label>
                  
                  {option.maxSelections === 1 ? (
                    <RadioGroup
                      value={selectedOptions.find(opt => opt.id === option.id)?.choice || ''}
                      onValueChange={(value) => {
                        const choice = option.choices.find(c => c.id === value);
                        if (choice) {
                          handleOptionChange(option.id, choice.id, choice.name, choice.price);
                        }
                      }}
                    >
                      {option.choices.map((choice) => (
                        <div key={choice.id} className="flex items-center space-x-2">
                          <RadioGroupItem value={choice.id} id={choice.id} />
                          <Label htmlFor={choice.id} className="flex-1 cursor-pointer">
                            <div className="flex justify-between">
                              <span>{choice.name}</span>
                              {choice.price > 0 && (
                                <span className="font-medium">+{formatPrice(choice.price)}</span>
                              )}
                            </div>
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  ) : (
                    <div className="space-y-2">
                      {option.choices.map((choice) => (
                        <div key={choice.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={choice.id}
                            checked={selectedOptions.some(opt => 
                              opt.id === option.id && opt.choice === choice.name
                            )}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                handleOptionChange(option.id, choice.id, choice.name, choice.price);
                              } else {
                                setSelectedOptions(prev => 
                                  prev.filter(opt => !(opt.id === option.id && opt.choice === choice.name))
                                );
                              }
                            }}
                          />
                          <Label htmlFor={choice.id} className="flex-1 cursor-pointer">
                            <div className="flex justify-between">
                              <span>{choice.name}</span>
                              {choice.price > 0 && (
                                <span className="font-medium">+{formatPrice(choice.price)}</span>
                              )}
                            </div>
                          </Label>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Observações</Label>
            <Textarea
              id="notes"
              placeholder="Alguma observação especial para este item?"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          {/* Quantity and Price */}
          <div className="flex items-center justify-between border-t pt-4">
            <div className="flex items-center space-x-3">
              <Label>Quantidade:</Label>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <span className="w-8 text-center font-medium">{quantity}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setQuantity(quantity + 1)}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="text-right">
              <div className="text-lg font-bold text-primary">
                {formatPrice(calculateTotalPrice() * quantity)}
              </div>
              <Button 
                className="btn-primary mt-2"
                onClick={handleAddToCart}
              >
                Adicionar ao Pedido
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}