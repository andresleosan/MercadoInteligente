import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import TodayPurchases from './TodayPurchases'

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({ user: { uid: 'test-uid' } }),
}))

vi.mock('@/hooks/useCategories', () => ({
  useCategories: () => ({ categories: [], loading: false }),
}))

vi.mock('@/services/purchases', () => ({
  getTodayPurchases: vi.fn(),
  deletePurchase: vi.fn(),
}))

vi.mock('@/components/CategoryBadge', () => ({
  CategoryBadge: () => <span>CategoryBadge</span>,
}))

import { getTodayPurchases } from '@/services/purchases'

describe('TodayPurchases', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('groups purchases by store and shows a clearer store header', async () => {
    vi.mocked(getTodayPurchases).mockResolvedValue([
      {
        id: 'p1',
        userId: 'test-uid',
        storeId: 'store-1',
        storeName: 'Éxito',
        purchaseDate: '2026-07-22',
        items: [{ name: 'Leche', quantity: 1, unitPrice: 1200, totalPrice: 1200 }],
        total: 1200,
        createdAt: new Date(),
      },
      {
        id: 'p2',
        userId: 'test-uid',
        storeId: 'store-1',
        storeName: 'Éxito',
        purchaseDate: '2026-07-22',
        items: [{ name: 'Pan', quantity: 2, unitPrice: 1500, totalPrice: 3000 }],
        total: 3000,
        createdAt: new Date(),
      },
      {
        id: 'p3',
        userId: 'test-uid',
        storeId: 'store-2',
        storeName: 'D1',
        purchaseDate: '2026-07-22',
        items: [{ name: 'Arroz', quantity: 1, unitPrice: 5000, totalPrice: 5000 }],
        total: 5000,
        createdAt: new Date(),
      },
    ])

    render(<TodayPurchases date="2026-07-22" />)

    await waitFor(() => {
      expect(screen.getByText('Éxito')).toBeInTheDocument()
    })

    expect(screen.getByText('2 compras registradas')).toBeInTheDocument()
    expect(screen.getByText('1 compra registrada')).toBeInTheDocument()
    expect(screen.getAllByText('Subtotal del grupo')).toHaveLength(2)
    expect(screen.getAllByText((_, element) => element?.textContent === '$4.200')).toHaveLength(1)
    expect(screen.getAllByText((_, element) => element?.textContent === '$5.000')).toHaveLength(2)
    expect(screen.getAllByText('Tienda')).toHaveLength(2)
  })
})