export interface Product {
  id: string;
  name: string;
  barcode: string;
  category: string;
  brand: string;
  price: number;
  cost: number;
  stock: number;
  minStock: number;
  unit: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface StockMovement {
  id: string;
  productId: string;
  type: 'entrada' | 'saída';
  quantity: number;
  reason: string;
  date: Date;
  unitCost?: number;
  totalCost?: number;
}

export interface Sale {
  id: string;
  items: SaleItem[];
  total: number;
  date: Date;
  paymentMethod: 'dinheiro' | 'pix' | 'cartão' | 'débito';
}

export interface SaleItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface DashboardStats {
  totalProducts: number;
  lowStockItems: number;
  dailyRevenue: number;
  monthlyRevenue: number;
  yearlyRevenue: number;
  totalInventoryValue: number;
}