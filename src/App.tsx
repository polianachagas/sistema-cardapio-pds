import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import MenuPage from "./pages/Menu";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          {/* Mesa Routes - QR Code access */}
          <Route path="/m/:restaurant/:table" element={<MenuPage />} />
          {/* Menu Routes - Public access */}
          <Route path="/menu/:restaurant" element={<MenuPage />} />
          {/* Order Tracking */}
          {/* <Route path="/order/:orderId" element={<OrderTracking />} /> */}
          {/* Admin Routes */}
          {/* <Route path="/admin" element={<AdminDashboard />} /> */}
          {/* Catch-all route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
