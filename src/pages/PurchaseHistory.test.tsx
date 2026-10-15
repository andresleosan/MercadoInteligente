import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import PurchaseHistory from './PurchaseHistory'
import type { Purchase } from '@/types'

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({ user: { uid: 'test-uid' } }),
}))

vi.mock('@/hooks/useCategories', () => ({
  useCategories: () => ({
    categories: [{ id: 'lacteos', name: 'Lácteos', icon: 'milk', isDefault: true }],
  }),
}))

vi.mock('@/components/CategorySelector', () => ({
  CategorySelector: () => <div data-testid="history-category-selector" />,
}))

vi.mock('@/components/CategoryBadge', () => ({
  CategoryBadge: ({ category }: { category: { id: string; name: string } }) => (
    <span data-testid={`category-badge-${category.id}`}>{category.name}</span>
  ),
}))

vi.mock('@/services/purchases', () => ({
  getPurchases: vi.fn(),
  getPurchasesGroupedByDate: vi.fn(),
  getPurchasesGroupedByStore: vi.fn(),
  deletePurchase: vi.fn(),
}))

vi.mock('@/services/export', () => ({
  exportPurchasesToCSV: vi.fn(),
}))

import { exportPurchasesToCSV } from '@/services/export'

import {
  getPurchases,
  getPurchasesGroupedByDate,
  getPurchasesGroupedByStore,
} from '@/services/purchases'

function createPurchase(category?: string): Purchase {
  return {
    id: 'purchase-1',
    userId: 'test-uid',
    storeId: 'store-1',
    storeName: 'Éxito',
    purchaseDate: '2026-07-22',
    items: [
      {
        name: 'Leche',
        quantity: 1,
        unitPrice: 1200,
        totalPrice: 1200,
        ...(category === undefined ? {} : { category }),
      },
      { name: 'Pan', quantity: 1, unitPrice: 800, totalPrice: 800 },
    ],
    total: 2000,
    createdAt: new Date(),
  }
}

function mockHistory(purchase: Purchase) {
  vi.mocked(getPurchases).mockResolvedValue([purchase])
  vi.mocked(getPurchasesGroupedByDate).mockResolvedValue(
    new Map([['2026-07-22', [purchase]]])
  )
  vi.mocked(getPurchasesGroupedByStore).mockResolvedValue(
    new Map([['store-1', [purchase]]])
  )
}

describe('PurchaseHistory', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('muestra categorías en las vistas por fecha y por tienda', async () => {
    mockHistory(createPurchase('lacteos'))
    const user = userEvent.setup()

    render(<PurchaseHistory month="2026-07" />)

    await waitFor(() => {
      expect(screen.getByText(/Leche/)).toBeInTheDocument()
    })
    expect(screen.getByTestId('category-badge-lacteos')).toHaveTextContent('Lácteos')
    expect(screen.getByText(/Pan/)).toBeInTheDocument()
    expect(screen.queryByTestId('category-badge-panaderia')).not.toBeInTheDocument()
    expect(screen.getByTestId('history-category-selector')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Por tienda' }))

    expect(screen.getByTestId('category-badge-lacteos')).toHaveTextContent('Lácteos')
  })

  it('mantiene visible un producto con categoría no resuelta sin mostrar badge', async () => {
    mockHistory(createPurchase('categoria-inexistente'))

    render(<PurchaseHistory month="2026-07" />)

    await waitFor(() => {
      expect(screen.getByText(/Leche/)).toBeInTheDocument()
    })
    expect(screen.queryByTestId('category-badge-categoria-inexistente')).not.toBeInTheDocument()
    expect(screen.queryByText(/error al cargar/i)).not.toBeInTheDocument()
  })

  it('permite exportar las compras a CSV', async () => {
    const purchase = createPurchase('lacteos')
    mockHistory(purchase)
    const user = userEvent.setup()

    render(<PurchaseHistory month="2026-07" />)

    await waitFor(() => {
      expect(screen.getByText(/Leche/)).toBeInTheDocument()
    })

    const exportBtn = screen.getByTitle('Exportar a CSV')
    await user.click(exportBtn)

    expect(exportPurchasesToCSV).toHaveBeenCalledWith(
      [purchase],
      'historial-compras-2026-07.csv'
    )
  })
})
