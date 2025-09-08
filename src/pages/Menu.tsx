import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MenuList } from "@/components/menu/MenuList";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { Store, MapPin, Clock, Phone, Utensils } from "lucide-react";
import { useCartStore } from "@/lib/store";

export default function MenuPage() {
  const params = useParams();
  const [searchParams] = useSearchParams();

  const restaurantSlug = params.restaurant || "demo-restaurant";
  const tableNumber = params.table;

  const channel =
    (searchParams.get("channel") as any) ||
    (tableNumber ? "dine_in" : "takeaway");

  const { setRestaurant, setTable, setChannel } = useCartStore();

  const restaurant = {
    id: restaurantSlug,
    name: "Restaurante Sabor & Arte",
    description:
      "Culinária artesanal com ingredientes frescos e sabores únicos",
    address: "Rua da ufu, 123 - Snata monica, Uberlândia - MG",
    phone: "(11) 99999-9999",
    logoUrl: null,
    coverUrl: null,
    isOpen: true,
    hours: "Seg-Dom: 11h às 23h",
  };

  useEffect(() => {
    setRestaurant(restaurantSlug);
    if (tableNumber) {
      setTable(tableNumber);
    }
    setChannel(channel);
  }, [
    restaurantSlug,
    tableNumber,
    channel,
    setRestaurant,
    setTable,
    setChannel,
  ]);

  const getChannelInfo = () => {
    switch (channel) {
      case "dine_in":
        return {
          title: `Mesa ${tableNumber}`,
          subtitle: "Consumo no local",
          icon: <Utensils className="w-5 h-5" />,
          badge: "Mesa",
        };
      case "takeaway":
        return {
          title: "Retirada no Local",
          subtitle: "Retire seu pedido no balcão",
          icon: <Store className="w-5 h-5" />,
          badge: "Retirada",
        };
      case "delivery":
        return {
          title: "Delivery",
          subtitle: "Entrega em domicílio",
          icon: <MapPin className="w-5 h-5" />,
          badge: "Delivery",
        };
      default:
        return {
          title: "Menu Digital",
          subtitle: "Faça seu pedido",
          icon: <Utensils className="w-5 h-5" />,
          badge: "Menu",
        };
    }
  };

  const channelInfo = getChannelInfo();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center text-white font-bold text-lg">
                {restaurant.name.charAt(0)}
              </div>
              <div>
                <h1 className="font-bold text-lg">{restaurant.name}</h1>
                <p className="text-sm text-muted-foreground">
                  {restaurant.description}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Badge variant="outline" className="flex items-center gap-1">
                {channelInfo.icon}
                {channelInfo.badge}
              </Badge>
              {restaurant.isOpen ? (
                <Badge className="bg-success text-success-foreground">
                  <Clock className="w-3 h-3 mr-1" />
                  Aberto
                </Badge>
              ) : (
                <Badge variant="destructive">
                  <Clock className="w-3 h-3 mr-1" />
                  Fechado
                </Badge>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Channel Info */}
      <div className="container mx-auto px-4 py-6">
        <Card className="mb-6 card-elevated">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {channelInfo.icon}
              {channelInfo.title}
            </CardTitle>
            <CardDescription>{channelInfo.subtitle}</CardDescription>
          </CardHeader>
          {channel !== "dine_in" && (
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span>{restaurant.address}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <span>{restaurant.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span>{restaurant.hours}</span>
                </div>
                {channel === "delivery" && (
                  <div className="sm:col-span-2">
                    <Badge
                      variant="secondary"
                      className="w-full justify-center"
                    >
                      Taxa de entrega: R$ 5,90 | Pedido mínimo: R$ 30,00
                    </Badge>
                  </div>
                )}
              </div>
            </CardContent>
          )}
        </Card>

        {/* Menu Items */}
        {restaurant.isOpen ? (
          <MenuList restaurantId={restaurantSlug} />
        ) : (
          <div className="text-center py-12">
            <Clock className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">Restaurante fechado</h3>
            <p className="text-muted-foreground mb-4">
              Voltamos a atender em: {restaurant.hours}
            </p>
            <Button variant="outline" disabled>
              Consultar cardápio
            </Button>
          </div>
        )}
      </div>

      {/* Cart Drawer */}
      {restaurant.isOpen && (
        <CartDrawer restaurantId={restaurantSlug} tableNumber={tableNumber} />
      )}
    </div>
  );
}
