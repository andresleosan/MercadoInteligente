      await deletePurchase(user.uid, purchaseId)
      setPurchases(purchases.filter((p) => p.id !== purchaseId))
    } catch (err) {
      console.error('Error al eliminar compra:', err)
      alert('Error al eliminar la compra. IntentÃ¡ de nuevo.')
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Historial de compras</h2>
        <p className="text-sm text-red-600 mb-3">{error}</p>
        <button
          onClick={() => {
            setLoading(true)
            loadPurchases()
          }}
          className="text-sm text-green-600 hover:text-green-800"
        >
          Reintentar
        </button>
      </div>
    )
  }

  if (purchases.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Historial de compras</h2>
        <p className="text-gray-600">Sin compras en este mes.</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Historial de compras</h2>

      <div className="space-y-4">
        {purchases.map((purchase) => (
          <div key={purchase.id} className="border-b pb-4 last:border-0">
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="text-sm text-gray-600">
                  {purchase.createdAt.toLocaleDateString('es-AR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
                <p className="text-lg font-semibold text-gray-900">
                  ${purchase.total.toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => handleDelete(purchase.id)}
                className="text-sm text-red-600 hover:text-red-800"
              >
                Eliminar
              </button>
            </div>

            <ul className="text-sm text-gray-600 space-y-1">
              {purchase.items.map((item, index) => (
                <li key={index}>
                  {item.quantity}x {item.name} â€” ${item.totalPrice.toLocaleString()}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  )

  async function loadPurchases() {
    if (!user) return
    try {
      setError('')
      const data = await getPurchases(user.uid, month)
      setPurchases(data)
    } catch (err) {
      console.error('Error al cargar compras:', err)
      setError('Error al cargar las compras. Reintentar.')
    } finally {
      setLoading(false)
    }
  }
}
```

NOTA: Hay una duplicaciÃ³n de `loadPurchases` (una dentro de `useEffect` con `isMounted`, otra fuera para reintentar). Esto es intencional â€” la del `useEffect` maneja cleanup, la externa es para el botÃ³n reintentar. Si el implementer prefiere refactorizar a una sola funciÃ³n con flag `isMounted` como state, es aceptable siempre que mantenga el comportamiento.

- [ ] **Step 2: Verify typecheck**

Run: `npx tsc -b --noEmit`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add src/pages/PurchaseHistory.tsx
git commit -m "feat(historial): PurchaseHistory acepta prop month con manejo de errores"
```

---

## Task 4: Modificar `Dashboard.tsx` â€” integrar MonthNavigator, selectedMonth, resumen 3 nÃºmeros, botÃ³n definir presupuesto

**Files:**
- Modify: `src/pages/Dashboard.tsx`

**Interfaces:**
- Consumes: `MonthNavigator` (Task 1), `BudgetPage` con `month`/`onSaved` (Task 2), `PurchaseHistory` con `month` (Task 3).

- [ ] **Step 1: Modify Dashboard.tsx**

Reemplazar `src/pages/Dashboard.tsx` completo con:

```tsx
import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { logout } from '@/services/auth'
import { getBudget } from '@/services/budget'
import { getTotalSpent } from '@/services/purchases'
import { useNavigate } from 'react-router-dom'
import BudgetPage from '@/pages/Budget'
import AddPurchase from '@/pages/AddPurchase'
import PurchaseHistory from '@/pages/PurchaseHistory'
import MonthNavigator from '@/components/MonthNavigator'
import usePWAInstall from '@/hooks/usePWAInstall'

function getCurrentMonth(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth)
  const [budget, setBudget] = useState<number | null>(null)
  const [totalSpent, setTotalSpent] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showBudgetForm, setShowBudgetForm] = useState(false)