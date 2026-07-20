
---

## Task 5: Tests de integraciÃ³n del Dashboard multi-mes

**Files:**
- Create: `src/pages/Dashboard.test.tsx`

**Interfaces:**
- Consumes: Dashboard con `MonthNavigator`, `BudgetPage`, `PurchaseHistory`, servicios mockeados.

- [ ] **Step 1: Write the failing test**

Crear `src/pages/Dashboard.test.tsx`:

```tsx
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Dashboard from './Dashboard'

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({ user: { uid: 'user-1', email: 'test@test.com' } }),
}))
vi.mock('@/hooks/usePWAInstall', () => ({
  default: () => ({ isInstallable: false, promptInstall: vi.fn() }),
}))
vi.mock('@/services/auth', () => ({
  logout: vi.fn(),
}))
vi.mock('@/services/budget', () => ({
  getBudget: vi.fn(),
}))
vi.mock('@/services/purchases', () => ({
  getTotalSpent: vi.fn(),
  getPurchases: vi.fn(),
}))
vi.mock('@/pages/Budget', () => ({
  default: () => <div data-testid="budget-form">Budget Form</div>,
}))
vi.mock('@/pages/AddPurchase', () => ({
  default: () => <div data-testid="add-purchase">Add Purchase</div>,
}))
vi.mock('@/pages/PurchaseHistory', () => ({
  default: ({ month }: { month?: string }) => (
    <div data-testid="purchase-history">History for {month}</div>
  ),
}))

function renderDashboard() {
  return render(
    <MemoryRouter>
      <Dashboard />
    </MemoryRouter>
  )
}

describe('Dashboard multi-mes', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should show current month label on load', async () => {
    const { getBudget } = await import('@/services/budget')
    const { getTotalSpent } = await import('@/services/purchases')
    vi.mocked(getBudget).mockResolvedValue({ amount: 50000 } as any)
    vi.mocked(getTotalSpent).mockResolvedValue(30000)

    renderDashboard()

    const now = new Date()
    const monthName = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'][now.getMonth()]
    await waitFor(() => {
      expect(screen.getByText(`${monthName} ${now.getFullYear()}`)).toBeInTheDocument()
    })
  })

  it('should show resumen with presupuesto and restante when budget exists', async () => {
    const { getBudget } = await import('@/services/budget')
    const { getTotalSpent } = await import('@/services/purchases')