// Firebase service functions for data operations
import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  Timestamp,
  writeBatch,
  DocumentData,
  QuerySnapshot
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from './firebase';
import type { 
  Restaurant, 
  Product, 
  Menu, 
  Table, 
  Order, 
  Coupon, 
  Settings,
  OrderItem 
} from './types';

export class FirebaseService {
  private restaurantId: string;

  constructor(restaurantId: string) {
    this.restaurantId = restaurantId;
  }

  // Products
  async getProducts(): Promise<Product[]> {
    const q = query(
      collection(db, `restaurants/${this.restaurantId}/products`),
      where('available', '==', true),
      orderBy('position', 'asc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
  }

  async getProduct(productId: string): Promise<Product | null> {
    const docRef = doc(db, `restaurants/${this.restaurantId}/products`, productId);
    const snapshot = await getDoc(docRef);
    return snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } as Product : null;
  }

  async addProduct(product: Omit<Product, 'id'>): Promise<string> {
    const docRef = await addDoc(
      collection(db, `restaurants/${this.restaurantId}/products`),
      {
        ...product,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      }
    );
    return docRef.id;
  }

  async updateProduct(productId: string, updates: Partial<Product>): Promise<void> {
    const docRef = doc(db, `restaurants/${this.restaurantId}/products`, productId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: Timestamp.now()
    });
  }

  async deleteProduct(productId: string): Promise<void> {
    const docRef = doc(db, `restaurants/${this.restaurantId}/products`, productId);
    await deleteDoc(docRef);
  }

  // Orders
  async createOrder(orderData: {
    items: OrderItem[];
    channel: string;
    tableId?: string;
    customer?: { name?: string; phone?: string };
  }): Promise<string> {
    const orderNumber = Math.floor(1000 + Math.random() * 9000);
    
    // Calculate totals
    const subtotal = orderData.items.reduce((sum, item) => {
      const optionsPrice = item.options.reduce((optSum, opt) => optSum + opt.price, 0);
      return sum + (item.unitPrice + optionsPrice) * item.qty;
    }, 0);

    const serviceFee = orderData.channel === 'dine_in' ? Math.round(subtotal * 0.1) : 0;
    const total = subtotal + serviceFee;

    const docRef = await addDoc(
      collection(db, `restaurants/${this.restaurantId}/orders`),
      {
        ...orderData,
        orderNumber,
        status: 'placed',
        amounts: {
          subtotal,
          discounts: 0,
          fees: { service: serviceFee },
          total
        },
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      }
    );

    return docRef.id;
  }

  async updateOrderStatus(orderId: string, status: string): Promise<void> {
    const docRef = doc(db, `restaurants/${this.restaurantId}/orders`, orderId);
    const updates: any = {
      status,
      updatedAt: Timestamp.now()
    };

    if (status === 'closed') {
      updates.closedAt = Timestamp.now();
    }

    await updateDoc(docRef, updates);
  }

  async getOrder(orderId: string): Promise<Order | null> {
    const docRef = doc(db, `restaurants/${this.restaurantId}/orders`, orderId);
    const snapshot = await getDoc(docRef);
    if (!snapshot.exists()) return null;
    
    const data = snapshot.data();
    return {
      id: snapshot.id,
      ...data,
      createdAt: data.createdAt?.toDate(),
      updatedAt: data.updatedAt?.toDate(),
      closedAt: data.closedAt?.toDate()
    } as Order;
  }

  async getOrders(filters?: { status?: string; limit?: number }): Promise<Order[]> {
    let q = query(
      collection(db, `restaurants/${this.restaurantId}/orders`),
      orderBy('createdAt', 'desc')
    );

    if (filters?.status) {
      q = query(q, where('status', '==', filters.status));
    }

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate(),
        closedAt: data.closedAt?.toDate()
      } as Order;
    });
  }

  // Real-time listeners
  subscribeToOrders(callback: (orders: Order[]) => void, filters?: { status?: string }) {
    let q = query(
      collection(db, `restaurants/${this.restaurantId}/orders`),
      orderBy('createdAt', 'desc')
    );

    if (filters?.status) {
      q = query(q, where('status', '==', filters.status));
    }

    return onSnapshot(q, (snapshot) => {
      const orders = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate(),
          closedAt: data.closedAt?.toDate()
        } as Order;
      });
      callback(orders);
    });
  }

  subscribeToOrder(orderId: string, callback: (order: Order | null) => void) {
    const docRef = doc(db, `restaurants/${this.restaurantId}/orders`, orderId);
    return onSnapshot(docRef, (snapshot) => {
      if (!snapshot.exists()) {
        callback(null);
        return;
      }
      
      const data = snapshot.data();
      callback({
        id: snapshot.id,
        ...data,
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate(),
        closedAt: data.closedAt?.toDate()
      } as Order);
    });
  }

  // Tables
  async getTables(): Promise<Table[]> {
    const q = query(
      collection(db, `restaurants/${this.restaurantId}/tables`),
      orderBy('number', 'asc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Table));
  }

  async addTable(table: Omit<Table, 'id'>): Promise<string> {
    const docRef = await addDoc(
      collection(db, `restaurants/${this.restaurantId}/tables`),
      table
    );
    return docRef.id;
  }

  // Coupons
  async getCoupon(code: string): Promise<Coupon | null> {
    const q = query(
      collection(db, `restaurants/${this.restaurantId}/coupons`),
      where('code', '==', code),
      where('active', '==', true)
    );
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) return null;
    
    const doc = snapshot.docs[0];
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      validFrom: data.validFrom?.toDate(),
      validTo: data.validTo?.toDate()
    } as Coupon;
  }

  // Image upload
  async uploadImage(file: File, path: string): Promise<string> {
    const storageRef = ref(storage, `restaurants/${this.restaurantId}/${path}`);
    const snapshot = await uploadBytes(storageRef, file);
    return await getDownloadURL(snapshot.ref);
  }
}

// Utility function to create service instance
export const createFirebaseService = (restaurantId: string) => new FirebaseService(restaurantId);