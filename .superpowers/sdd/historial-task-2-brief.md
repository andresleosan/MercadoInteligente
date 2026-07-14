  )
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/components/MonthNavigator.test.tsx`
Expected: PASS â€” 6 tests.

- [ ] **Step 5: Commit**

```bash
git add src/components/MonthNavigator.tsx src/components/MonthNavigator.test.tsx
git commit -m "feat(historial): componente MonthNavigator con flechas y label en espaÃ±ol"
```

---

## Task 2: Modificar `Budget.tsx` â€” aceptar `month` y `onSaved` props

**Files:**
- Modify: `src/pages/Budget.tsx`

**Interfaces:**
- Produces: `<BudgetPage month?: string, onSaved?: () => void />`. Si `month` se pasa, lo usa en `getBudget`/`setBudget`. Si no, usa mes actual (comportamiento existente). Si `onSaved` se pasa, lo llama despuÃ©s de guardar exitosamente.

- [ ] **Step 1: Modify Budget.tsx**

Reemplazar `src/pages/Budget.tsx` completo con:

```tsx
import { useState, useEffect, type FormEvent } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { getBudget, setBudget } from '@/services/budget'
import type { Budget } from '@/types'

interface Props {
  month?: string
  onSaved?: () => void
}

export default function BudgetPage({ month, onSaved }: Props) {
  const { user } = useAuth()
  const [budget, setBudgetState] = useState<Budget | null>(null)
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    async function loadBudget() {
      if (!user) return
      try {
        const currentBudget = await getBudget(user.uid, month)
        if (currentBudget) {
          setBudgetState(currentBudget)
          setAmount(String(currentBudget.amount))
        } else {
          setBudgetState(null)
          setAmount('')
        }
      } catch (err) {
        console.error('Error al cargar presupuesto:', err)
        setMessage('Error al cargar el presupuesto')
      } finally {
        setLoading(false)
      }
    }
    loadBudget()
  }, [user, month])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!user) return

    setSaving(true)
    setMessage('')

    try {
      const newBudget = await setBudget(user.uid, Number(amount), month)
      setBudgetState(newBudget)
      setMessage('Presupuesto guardado correctamente')
      if (onSaved) onSaved()
    } catch (err) {
      setMessage('Error al guardar el presupuesto')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>