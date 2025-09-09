import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { ShoppingCart, Plus, Minus, Trash2, Tag, User, Phone } from 'lucide-react';
import { useCartStore } from '@/lib/store';
import { createMockService } from '@/lib/mock-service';
import { useToast } from '@/hooks/use-toast';
import type { CartItem } from '@/lib/types';

interface CartDrawerProps {
  restaurantId: string;
  tableNumber?: string;
}

export function CartDrawer({ restaurantId, tableNumber }: CartDrawerProps) {
  const {
    items,
    subtotal,
    discounts,
    fees,
    total,
    channel,
    couponCode,
    updateItemQty,
    removeItem,
    applyCoupon,
    removeCoupon,
    clearCart
  } = useCartStore();

  const [isOpen, setIsOpen] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [couponInput, setCouponInput] = useState('');
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const { toast } = useToast();

  const formatPrice = (price: number) => `R$ ${(price / 100).toFixed(2)}`;

  const itemCount = items.reduce((sum, item) => sum + item.qty, 0);

  const handleUpdateQuantity = (item: CartItem, newQty: number) => {
    updateItemQty(item.productId, newQty, item.options);
  };

  const handleRemoveItem = (item: CartItem) => {
    removeItem(item.productId, item.options);
  };

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return;

    try {
      const mockService = createMockService(restaurantId);
      const coupon = await mockService.getCoupon(couponInput.toUpperCase());
      
      if (!coupon) {
        toast({
          title: "Cupom inválido",
          description: "O cupom informado não foi encontrado ou não está ativo.",
          variant: "destructive"
        });
        return;
      }

      // Check minimum subtotal
      if (coupon.minSubtotal && subtotal < coupon.minSubtotal) {
        toast({
          title: "Valor mínimo não atingido",
          description: `Este cupom requer um pedido mínimo de ${formatPrice(coupon.minSubtotal)}.`,
          variant: "destructive"
        });
        return;
      }

      // Calculate discount
      let discount = 0;
      if (coupon.type === 'percent') {
        discount = Math.round(subtotal * (coupon.value / 100));
      } else {
        discount = coupon.value;
      }

      applyCoupon(couponInput.toUpperCase(), discount);
      setCouponInput('');
      
      toast({
        title: "Cupom aplicado!",
        description: `Desconto de ${formatPrice(discount)} aplicado.`
      });
    } catch (error) {
      console.error('Error applying coupon:', error);
      toast({
        title: "Erro",
        description: "Não foi possível aplicar o cupom. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  const handlePlaceOrder = async () => {
    if (items.length === 0) return;

    setIsPlacingOrder(true);

    try {
      const mockService = createMockService(restaurantId);
      
      const orderData = {
        items: items.map(item => ({
          productId: item.productId,
          name: item.name,
          qty: item.qty,
          unitPrice: item.price,
          options: item.options,
          notes: item.notes
        })),
        channel,
        tableId: tableNumber,
        customer: {
          name: customerName.trim() || undefined,
          phone: customerPhone.trim() || undefined
        }
      };

      const orderId = await mockService.createOrder(orderData);
      
      // Clear cart and show success
      clearCart();
      setCustomerName('');
      setCustomerPhone('');
      setIsOpen(false);
      
      toast({
        title: "Pedido realizado!",
        description: `Seu pedido foi enviado para a cozinha. Acompanhe o status: ${orderId}`,
      });

      // Navigate to order tracking (in a real app, you'd use router)
      console.log('Order placed:', orderId);
      
    } catch (error) {
      console.error('Error placing order:', error);
      toast({
        title: "Erro ao fazer pedido",
        description: "Não foi possível enviar seu pedido. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsPlacingOrder(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button 
          className="fixed bottom-4 right-4 rounded-full w-14 h-14 shadow-lg z-50 btn-primary"
          size="lg"
        >
          <div className="relative">
            <ShoppingCart className="w-6 h-6" />
            {itemCount > 0 && (
              <Badge className="absolute -top-2 -right-2 w-6 h-6 rounded-full p-0 flex items-center justify-center bg-accent text-accent-foreground">
                {itemCount}
              </Badge>
            )}
          </div>
        </Button>
      </SheetTrigger>

      <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Seu Pedido</SheetTitle>
          <SheetDescription>
            {tableNumber ? `Mesa ${tableNumber}` : 'Carrinho de compras'}
          </SheetDescription>
        </SheetHeader>

        <div className="py-4 space-y-6">
          {/* Cart Items */}
          {items.length === 0 ? (
            <div className="text-center py-8">
              <ShoppingCart className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
              <p className="text-muted-foreground">Seu carrinho está vazio</p>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item, index) => (
                <div key={`${item.productId}-${index}`} className="flex gap-3 p-3 border rounded-lg">
                  {item.imageUrl && (
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded"
                    />
                  )}
                  
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium truncate">{item.name}</h4>
                    
                    {item.options.length > 0 && (
                      <div className="text-xs text-muted-foreground mt-1">
                        {item.options.map((opt, i) => (
                          <div key={i}>{opt.name}: {opt.choice}</div>
                        ))}
                      </div>
                    )}
                    
                    {item.notes && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Obs: {item.notes}
                      </p>
                    )}

                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUpdateQuantity(item, item.qty - 1)}
                          disabled={item.qty <= 1}
                        >
                          <Minus className="w-3 h-3" />
                        </Button>
                        <span className="w-8 text-center text-sm">{item.qty}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUpdateQuantity(item, item.qty + 1)}
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                      </div>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveItem(item)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-medium">
                      {formatPrice((item.price + item.options.reduce((sum, opt) => sum + opt.price, 0)) * item.qty)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {items.length > 0 && (
            <>
              {/* Coupon Section */}
              <div className="space-y-3">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <Tag className="w-4 h-4" />
                  Cupom de desconto
                </Label>
                
                {couponCode ? (
                  <div className="flex items-center justify-between p-3 bg-accent/10 rounded-lg">
                    <div>
                      <span className="text-sm font-medium">Cupom: {couponCode}</span>
                      <div className="text-xs text-muted-foreground">
                        Desconto: {formatPrice(discounts)}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={removeCoupon}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Input
                      placeholder="Código do cupom"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                    />
                    <Button
                      variant="outline"
                      onClick={handleApplyCoupon}
                      disabled={!couponInput.trim()}
                    >
                      Aplicar
                    </Button>
                  </div>
                )}
              </div>

              {/* Customer Info */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Informações do cliente (opcional)</Label>
                
                <div className="space-y-3">
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      placeholder="Seu nome"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      placeholder="Seu telefone"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>

              {/* Order Summary */}
              <div className="space-y-2 p-4 bg-muted/50 rounded-lg">
                <div className="flex justify-between text-sm">
                  <span>Subtotal:</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                
                {discounts > 0 && (
                  <div className="flex justify-between text-sm text-accent">
                    <span>Desconto:</span>
                    <span>-{formatPrice(discounts)}</span>
                  </div>
                )}
                
                {fees.service && fees.service > 0 && (
                  <div className="flex justify-between text-sm">
                    <span>Taxa de serviço (10%):</span>
                    <span>{formatPrice(fees.service)}</span>
                  </div>
                )}
                
                {fees.delivery && fees.delivery > 0 && (
                  <div className="flex justify-between text-sm">
                    <span>Taxa de entrega:</span>
                    <span>{formatPrice(fees.delivery)}</span>
                  </div>
                )}
                
                <Separator />
                
                <div className="flex justify-between font-bold text-lg">
                  <span>Total:</span>
                  <span className="text-primary">{formatPrice(total)}</span>
                </div>
              </div>

              {/* Place Order Button */}
              <Button
                className="w-full btn-primary"
                onClick={handlePlaceOrder}
                disabled={isPlacingOrder}
                size="lg"
              >
                {isPlacingOrder ? 'Enviando pedido...' : 'Fazer Pedido'}
              </Button>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}