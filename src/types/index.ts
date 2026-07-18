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
}

export interface Purchase {
  id: string
  userId: string
  storeId: string
  storeName: string
  purchaseDate: string // YYYY-MM-DD
  items: PurchaseItem[]
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
