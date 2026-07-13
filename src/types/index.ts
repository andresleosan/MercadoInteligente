export interface User {
  uid: string
  email: string
  displayName: string | null
  createdAt: Date
}

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
}

export interface Purchase {
  id: string
  userId: string
  items: PurchaseItem[]
  total: number
  receiptImageUrl?: string
  createdAt: Date
}
