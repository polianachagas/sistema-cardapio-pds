/**
 * Core domain types for the Digital Menu System
 * Based on the frontend types but adapted for server-side usage
 */

export interface Restaurant {
  id: string;
  name: string;
  slug: string;
  address: string;
  phone: string;
  logoUrl?: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
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
  createdAt: Date;
  updatedAt: Date;
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
  createdAt: Date;
  updatedAt: Date;
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
  createdAt: Date;
  updatedAt: Date;
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
  restaurantId: string;
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
  createdAt: Date;
  updatedAt: Date;
}

export interface Settings {
  id: string;
  restaurantId: string;
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
  createdAt: Date;
  updatedAt: Date;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;
    details?: any;
  };
  timestamp: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Database document interface for Firestore
export interface FirestoreDocument {
  id?: string;
  createdAt?: Date | FirebaseFirestore.Timestamp;
  updatedAt?: Date | FirebaseFirestore.Timestamp;
}

// Utility types for API operations
export type CreateInput<T> = Omit<T, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateInput<T> = Partial<Omit<T, 'id' | 'createdAt' | 'updatedAt'>>;

// Request context
export interface RequestContext {
  restaurantId: string;
  userId?: string;
  userRole?: 'admin' | 'manager' | 'staff';
}
