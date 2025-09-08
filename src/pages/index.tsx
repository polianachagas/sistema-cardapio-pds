import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  QrCode,
  Store,
  MapPin,
  Clock,
  Utensils,
  Star,
  ShoppingCart,
} from "lucide-react";
import QRCode from "react-qr-code";

const Index = () => {
  const restaurant = {
    name: "Sabor & Arte",
    description:
      "Culinária artesanal com ingredientes frescos e sabores únicos",
    address: "Rua da ufu, 123 - Snata monica, Uberlândia - MG",
    phone: "(11) 99999-9999",
  };

  const tables = ["01", "02", "03", "04", "05", "06"];

  const demoLinks = [
    {
      title: "Mesa 01 (QR Code)",
      subtitle: "Experiência completa do cliente",
      url: "/m/demo-restaurant/01",
      icon: <Utensils className="w-5 h-5" />,
      badge: "Dine In",
      description: "Simula o acesso via QR Code da mesa",
    },
    {
      title: "Retirada no Local",
      subtitle: "Pedido para retirar no balcão",
      url: "/menu/demo-restaurant?channel=takeaway",
      icon: <Store className="w-5 h-5" />,
      badge: "Takeaway",
      description: "Menu para pedidos de retirada",
    },
    {
      title: "Delivery",
      subtitle: "Entrega em domicílio",
      url: "/menu/demo-restaurant?channel=delivery",
      icon: <MapPin className="w-5 h-5" />,
      badge: "Delivery",
      description: "Menu com taxa de entrega",
    },
  ];

  const features = [
    {
      title: "QR Code por Mesa",
      description:
        "Cada mesa tem seu QR Code único para acesso direto ao cardápio",
      icon: <QrCode className="w-6 h-6" />,
    },
    {
      title: "Múltiplos Canais",
      description: "Suporte a consumo no local, retirada e delivery",
      icon: <Store className="w-6 h-6" />,
    },
    {
      title: "Carrinho Inteligente",
      description:
        "Personalização de produtos, cupons de desconto e cálculo automático",
      icon: <ShoppingCart className="w-6 h-6" />,
    },
    {
      title: "Status em Tempo Real",
      description: "Acompanhamento do status do pedido em tempo real",
      icon: <Clock className="w-6 h-6" />,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <header className="gradient-hero text-white">
        <div className="container mx-auto px-4 py-16 text-center">
          <div className="max-w-3xl mx-auto">
            <Badge className="mb-4 bg-white/20 text-white border-white/30">
              <Star className="w-3 h-3 mr-1" />
              Sistema Completo de Cardápio Digital
            </Badge>

            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              {restaurant.name}
            </h1>

            <p className="text-xl md:text-2xl mb-6 text-white/90">
              {restaurant.description}
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 text-white/80 mb-8">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span>{restaurant.address}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>Seg-Dom: 11h às 23h</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 justify-center">
              {demoLinks.map((link, index) => (
                <Button
                  key={index}
                  asChild
                  className="bg-white/10 text-white border border-white/20 hover:bg-white/20 backdrop-blur-sm"
                  size="lg"
                >
                  <a href={link.url}>
                    {link.icon}
                    <span className="ml-2">{link.badge}</span>
                  </a>
                </Button>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section className="py-16 container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Funcionalidades</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Sistema completo inspirado no OlaClick com todas as funcionalidades
            essenciais
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-16">
          {features.map((feature, index) => (
            <Card key={index} className="card-elevated text-center">
              <CardHeader>
                <div className="w-12 h-12 mx-auto bg-primary/10 rounded-lg flex items-center justify-center text-primary mb-2">
                  {feature.icon}
                </div>
                <CardTitle className="text-lg">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Demo Access Cards */}
        <div className="grid gap-6 md:grid-cols-3 mb-16">
          {demoLinks.map((link, index) => (
            <Card
              key={index}
              className="card-elevated group hover:shadow-lg transition-all duration-300"
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {link.icon}
                    <CardTitle className="text-lg">{link.title}</CardTitle>
                  </div>
                  <Badge variant="outline">{link.badge}</Badge>
                </div>
                <CardDescription>{link.subtitle}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  {link.description}
                </p>
                <Button asChild className="w-full btn-primary">
                  <a href={link.url}>Acessar Demo</a>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* QR Codes Section */}
        <div className="bg-muted/30 rounded-xl p-8">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold mb-4">QR Codes das Mesas</h3>
            <p className="text-muted-foreground">
              Escaneie qualquer QR Code para acessar o cardápio da mesa
              correspondente
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            {tables.map((table) => (
              <Card key={table} className="card-elevated text-center">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Mesa {table}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-white p-4 rounded-lg mb-4">
                    <QRCode
                      value={`${window.location.origin}/m/demo-restaurant/${table}`}
                      size={120}
                      style={{
                        height: "auto",
                        maxWidth: "100%",
                        width: "100%",
                      }}
                    />
                  </div>
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="w-full"
                  >
                    <a href={`/m/demo-restaurant/${table}`}>
                      Acessar Mesa {table}
                    </a>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-muted/50 py-16">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-2xl font-bold mb-4">Desenvolvido por:</h3>
          <div className="flex flex-wrap gap-2 justify-center max-w-2xl mx-auto">
            {[
              "Gabriel Nogueira Motta e Silva",
              "Poliana Rezende Chagas",
              "André Noro Crivellenti",
              "Felipe Moneda Gilioli",
              "Vitor Hugo Ribeiro Franco",
              "Izzy",
            ].map((tech) => (
              <Badge key={tech} variant="secondary" className="text-sm">
                {tech}
              </Badge>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>Sistema de Cardápio Digital</p>
          <p className="text-sm mt-2">PDS 2025</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
