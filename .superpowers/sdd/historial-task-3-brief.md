      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        Presupuesto mensual
      </h2>

      {budget && (
        <p className="text-sm text-gray-600 mb-4">
          Presupuesto actual: <span className="font-semibold">${budget.amount.toLocaleString()}</span>
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
            Monto mensual
          </label>
          <input
            id="amount"
            type="number"
            min="0"
            step="100"
            required
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
            placeholder="Ej: 50000"
          />
        </div>

        {message && (
          <p className={`text-sm ${message.includes('Error') ? 'text-red-600' : 'text-green-600'}`}>
            {message}
          </p>
        )}

        <button
          type="submit"
          disabled={saving}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
        >
          {saving ? 'Guardando...' : budget ? 'Actualizar presupuesto' : 'Crear presupuesto'}
        </button>
      </form>
    </div>
  )
}
```

Cambios clave:
- Agregado `interface Props { month?: string; onSaved?: () => void }`
- Firma: `export default function BudgetPage({ month, onSaved }: Props)`
- `loadBudget`: pasa `month` a `getBudget(user.uid, month)`. Si no hay budget, resetea `amount` a `''`.
- `handleSubmit`: pasa `month` a `setBudget(user.uid, Number(amount), month)`. Llama `onSaved()` despuÃ©s de guardar exitosamente.
- `useEffect` dep: `[user, month]` â€” recarga cuando cambia el mes.

- [ ] **Step 2: Verify typecheck**

Run: `npx tsc -b --noEmit`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add src/pages/Budget.tsx
git commit -m "feat(historial): Budget acepta month y onSaved props para multi-mes"
```

---

## Task 3: Modificar `PurchaseHistory.tsx` â€” aceptar prop `month`

**Files:**
- Modify: `src/pages/PurchaseHistory.tsx`

**Interfaces:**
- Produces: `<PurchaseHistory month?: string />`. Si `month` se pasa, lo usa en `getPurchases`. Si no, usa mes actual.

- [ ] **Step 1: Modify PurchaseHistory.tsx**

Reemplazar `src/pages/PurchaseHistory.tsx` completo con:

```tsx
import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { getPurchases, deletePurchase } from '@/services/purchases'
import type { Purchase } from '@/types'

interface Props {
  month?: string
}

export default function PurchaseHistory({ month }: Props) {
  const { user } = useAuth()
  const [purchases, setPurchases] = useState<Purchase[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let isMounted = true

    async function loadPurchases() {
      if (!user) return
      try {
        setError('')
        const data = await getPurchases(user.uid, month)
        if (isMounted) {
          setPurchases(data)
        }
      } catch (err) {
        console.error('Error al cargar compras:', err)
        if (isMounted) {
          setError('Error al cargar las compras. Reintentar.')
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }
    loadPurchases()

    return () => {
      isMounted = false
    }
  }, [user, month])
