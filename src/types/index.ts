export interface User {
  uid: string
  email: string
  displayName: string | null
  createdAt: Date
}

/**
 * @deprecated Usar DailyBudget + StoreBudget para el nuevo modelo de presupuesto diario.
 * Mantener solo para datos legacy.
 */
export interface Budget {
  id: string
  userId: string
  month: string
  amount: number
  createdAt: Date
  updatedAt: Date
}

export interface PurchaseItem {
  name: string
  quantity: number
  unitPrice: number
  totalPrice: number
  confidence?: number
  category?: string
}

export interface Purchase {
  id: string
  userId: string
  storeId: string
  storeName: string
  purchaseDate: string // YYYY-MM-DD
  items: PurchaseItem[]
  subtotal?: number
  discountPercent?: number
  discountAmount?: number
  total: number
  receiptImageUrl?: string
  createdAt: Date
}

export interface ParsedItem {
  name: string
  unitPrice: number
  quantity: number
  totalPrice: number
  confidence: number
  discountPercent?: number
}

export interface Store {
  id: string
  userId: string
  name: string
  category?: 'supermercado' | 'tienda' | 'barrio' | 'otro'
  color?: string   // hex: #10B981
  icon?: string    // emoji: 🛒
  createdAt: Date
}

export type DefaultCategoryId =
  | 'lacteos' | 'panaderia' | 'carnes' | 'frutas-verduras'
  | 'bebidas' | 'limpieza' | 'higiene' | 'snacks' | 'otro'

export interface Category {
  id: string
  name: string
  icon: string
  isDefault: boolean
}

export interface CategoryMapping {
  id: string
  productName: string
  categoryId: string
  userId: string
  createdAt: Date
}

export interface DailyBudget {
  id: string
  userId: string
  date: string       // YYYY-MM-DD
  amount: number
  createdAt: Date
  updatedAt: Date
}

export interface StoreBudget {
  id: string
  userId: string
  date: string       // YYYY-MM-DD
  storeId: string
  storeName: string
  amount: number
  createdAt: Date
  updatedAt: Date
}

export interface DailySpending {
  date: string
  total: number
  byStore: Map<string, number>
}

export interface StoreSpending {
  storeId: string
  storeName: string
  total: number
  purchaseCount: number
  lastPurchase: Date
}
