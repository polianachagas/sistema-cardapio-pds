import { Badge } from '@/components/ui/badge';
import { Clock, CheckCircle, ChefHat, Package, Utensils, XCircle } from 'lucide-react';
import type { OrderStatus } from '@/lib/types';

interface OrderStatusBadgeProps {
  status: OrderStatus;
  size?: 'sm' | 'default' | 'lg';
}

export function OrderStatusBadge({ status, size = 'default' }: OrderStatusBadgeProps) {
  const getStatusConfig = (status: OrderStatus) => {
    switch (status) {
      case 'draft':
        return {
          label: 'Rascunho',
          variant: 'outline' as const,
          icon: Clock,
          className: 'bg-gray-50 text-gray-600 border-gray-200'
        };
      case 'placed':
        return {
          label: 'Enviado',
          variant: 'default' as const,
          icon: Clock,
          className: 'bg-blue-100 text-blue-800 border-blue-200'
        };
      case 'confirmed':
        return {
          label: 'Confirmado',
          variant: 'default' as const,
          icon: CheckCircle,
          className: 'bg-yellow-100 text-yellow-800 border-yellow-200'
        };
      case 'in_preparation':
        return {
          label: 'Preparando',
          variant: 'default' as const,
          icon: ChefHat,
          className: 'bg-orange-100 text-orange-800 border-orange-200'
        };
      case 'ready':
        return {
          label: 'Pronto',
          variant: 'default' as const,
          icon: Package,
          className: 'bg-green-100 text-green-800 border-green-200'
        };
      case 'served':
        return {
          label: 'Entregue',
          variant: 'default' as const,
          icon: Utensils,
          className: 'bg-success/10 text-success border-success/20'
        };
      case 'closed':
        return {
          label: 'Finalizado',
          variant: 'outline' as const,
          icon: CheckCircle,
          className: 'bg-gray-100 text-gray-700 border-gray-300'
        };
      case 'canceled':
        return {
          label: 'Cancelado',
          variant: 'destructive' as const,
          icon: XCircle,
          className: 'bg-destructive/10 text-destructive border-destructive/20'
        };
      default:
        return {
          label: status,
          variant: 'outline' as const,
          icon: Clock,
          className: 'bg-gray-50 text-gray-600 border-gray-200'
        };
    }
  };

  const config = getStatusConfig(status);
  const Icon = config.icon;

  return (
    <Badge 
      variant={config.variant}
      className={`status-badge ${config.className} ${
        size === 'sm' ? 'text-xs py-1 px-2' : 
        size === 'lg' ? 'text-sm py-2 px-3' : 
        'text-xs py-1 px-2'
      }`}
    >
      <Icon className={`mr-1 ${
        size === 'sm' ? 'w-3 h-3' :
        size === 'lg' ? 'w-4 h-4' :
        'w-3 h-3'
      }`} />
      {config.label}
    </Badge>
  );
}