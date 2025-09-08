// TypeScript types for the digital menu system
export interface Restaurant {
  id: string;
  name: string;
  slug: string;
  address: string;
  phone: string;
  logoUrl?: string;
  active: boolean;
  createdAt: Date;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  imageUrl?: string;
  category: string;
  price: number; // in cents
  options?: ProductOption[];
  available: boolean;
  position: number;
  isHighlighted?: boolean;
  isDaySpecial?: boolean;
}

export interface ProductOption {
  id: string;
  name: string;
  required?: boolean;
  maxSelections?: number;
  choices: ProductChoice[];
}

export interface ProductChoice {
  id: string;
  name: string;
  price: number; // additional price in cents
}

export interface Menu {
  id: string;
  active: boolean;
  categories: MenuCategory[];
  visibility: ('dine_in' | 'takeaway' | 'delivery')[];
}

export interface MenuCategory {
  name: string;
  position: number;
}

export interface Table {
  id: string;
  number: string;
  qrcodeUrl?: string;
  active: boolean;
  currentSessionId?: string;
}

export type OrderStatus = 
  | 'draft' 
  | 'placed' 
  | 'confirmed' 
  | 'in_preparation' 
  | 'ready' 
  | 'served' 
  | 'closed' 
  | 'canceled';

export type OrderChannel = 'dine_in' | 'takeaway' | 'delivery';

export interface OrderItem {
  productId: string;
  name: string;
  qty: number;
  unitPrice: number; // in cents
  options: SelectedOption[];
  notes?: string;
}

export interface SelectedOption {
  id: string;
  name: string;
  choice: string;
  price: number; // in cents
}

export interface Order {
  id: string;
  tableId?: string;
  items: OrderItem[];
  status: OrderStatus;
  channel: OrderChannel;
  amounts: {
    subtotal: number;
    discounts: number;
    fees: {
      service?: number;
      delivery?: number;
    };
    total: number;
  };
  customer?: {
    name?: string;
    phone?: string;
  };
  payments?: Payment[];
  orderNumber?: number;
  createdBy?: string;
  createdAt: Date;
  updatedAt: Date;
  closedAt?: Date;
}

export interface Payment {
  method: 'cash' | 'card' | 'pix' | 'online';
  amount: number;
  changeDue?: number;
}

export interface Coupon {
  id: string;
  code: string;
  type: 'percent' | 'fixed';
  value: number;
  validFrom: Date;
  validTo: Date;
  minSubtotal?: number;
  active: boolean;
}

export interface Settings {
  delivery: {
    enabled: boolean;
    zones?: string[];
    feeType: 'fixed' | 'by_distance';
    feeValue: number;
  };
  dineIn: {
    serviceFeePercent?: number;
  };
  pickup: {
    enabled: boolean;
  };
  whatsapp: {
    enabled: boolean;
    phoneE164?: string;
    messageTemplate?: string;
  };
}

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  qty: number;
  options: SelectedOption[];
  notes?: string;
  imageUrl?: string;
}

export interface CartState {
  items: CartItem[];
  restaurant: string;
  table?: string;
  channel: OrderChannel;
  subtotal: number;
  discounts: number;
  fees: { service?: number; delivery?: number };
  total: number;
  couponCode?: string;
}