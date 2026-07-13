# Fase 4: Historial Multi-Mes — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Permitir al usuario navegar entre meses (pasados y futuros) desde el Dashboard, viendo presupuesto, total gastado, restante/pasado y lista de compras de cualquier mes.

**Architecture:** Componente `MonthNavigator` (flechas ← →) en el Dashboard. Estado `selectedMonth` (default: mes actual) que se pasa a `getBudget`, `getTotalSpent` y `getPurchases`. Resumen con 3 números clave + barra de progreso condicional. Si no hay presupuesto, botón para definirlo ahí mismo.

**Tech Stack:** React 18 + TypeScript + Vite, Firebase Firestore, Vitest + @testing-library/react.

## Global Constraints

- Nomenclatura: PascalCase componentes, camelCase funciones/variables.
- Estilos: Tailwind CSS, mobile-first. Verde (`green-600`/`green-700`) primario, `gray-*` texto/fondos, `red-600` para pasado/eliminar, `yellow-500` para warning.
- Path alias: `@/` → `./src/`.
- Firebase: usar instancias desde `@/config/firebase`. Servicios `getBudget(uid, month?)`, `getPurchases(uid, month?)`, `getTotalSpent(uid, month?)`, `setBudget(uid, amount, month?)` ya aceptan `month` opcional — no modificar los servicios.
- Formato de mes: `YYYY-MM` (ej: `"2026-07"`).
- Tests: Vitest + vi.mock para Firebase. Pattern de `src/services/budget.test.ts`. Excluir `.test.tsx` del typecheck de build (ya configurado en `tsconfig.json`).
- Build: `npm run build` = `tsc -b && vite build`.
- Commits: prefijos `feat:`, `fix:`, `test:`, `docs:`. Español en mensajes.
- `noUnusedLocals` y `noUnusedParameters` habilitados — sin imports sin usar.

---

## File Structure

| Archivo | Responsabilidad | Acción |
|---|---|---|
| `src/components/MonthNavigator.tsx` | Flechas ← → + label mes en español. Props `month`, `onChange`. | Crear |
| `src/components/MonthNavigator.test.tsx` | Tests: render label, flecha resta, flecha suma, cambio de año, onChange. | Crear |
| `src/pages/Dashboard.tsx` | Agregar `selectedMonth`, `MonthNavigator`, resumen 3 números, carga independiente con errores, botón "Definir presupuesto". | Modificar |
| `src/pages/PurchaseHistory.tsx` | Aceptar prop `month`, pasar a `getPurchases`. Mensaje "Sin compras en este mes". | Modificar |
| `src/pages/Budget.tsx` | Aceptar props `month?` y `onSaved?`. Usar `month` en `getBudget`/`setBudget`. | Modificar |

---

## Task 1: `MonthNavigator.tsx` — componente de navegación de meses

**Files:**
- Create: `src/components/MonthNavigator.tsx`
- Test: `src/components/MonthNavigator.test.tsx`

**Interfaces:**
- Produces: `<MonthNavigator month: string, onChange: (month: string) => void />`. Formato `month`: `YYYY-MM`.

- [ ] **Step 1: Write the failing test**

Crear `src/components/MonthNavigator.test.tsx`:

```tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import MonthNavigator from './MonthNavigator'

describe('MonthNavigator', () => {
  it('should render the month label in Spanish', () => {
    render(<MonthNavigator month="2026-07" onChange={vi.fn()} />)
    expect(screen.getByText('Julio 2026')).toBeInTheDocument()
  })

  it('should call onChange with previous month when left arrow clicked', () => {
    const onChange = vi.fn()
    render(<MonthNavigator month="2026-07" onChange={onChange} />)
    fireEvent.click(screen.getByRole('button', { name: /mes anterior/i }))
    expect(onChange).toHaveBeenCalledWith('2026-06')
  })

  it('should call onChange with next month when right arrow clicked', () => {
    const onChange = vi.fn()
    render(<MonthNavigator month="2026-07" onChange={onChange} />)
    fireEvent.click(screen.getByRole('button', { name: /mes siguiente/i }))
    expect(onChange).toHaveBeenCalledWith('2026-08')
  })

  it('should handle year change going back (January -> December previous year)', () => {
    const onChange = vi.fn()
    render(<MonthNavigator month="2026-01" onChange={onChange} />)
    fireEvent.click(screen.getByRole('button', { name: /mes anterior/i }))
    expect(onChange).toHaveBeenCalledWith('2025-12')
  })

  it('should handle year change going forward (December -> January next year)', () => {
    const onChange = vi.fn()
    render(<MonthNavigator month="2026-12" onChange={onChange} />)
    fireEvent.click(screen.getByRole('button', { name: /mes siguiente/i }))
    expect(onChange).toHaveBeenCalledWith('2027-01')
  })

  it('should render correct Spanish name for each month', () => {
    const cases: Array<[string, string]> = [
      ['2026-01', 'Enero 2026'],
      ['2026-02', 'Febrero 2026'],
      ['2026-03', 'Marzo 2026'],
      ['2026-04', 'Abril 2026'],
      ['2026-05', 'Mayo 2026'],
      ['2026-06', 'Junio 2026'],
      ['2026-07', 'Julio 2026'],
      ['2026-08', 'Agosto 2026'],
      ['2026-09', 'Septiembre 2026'],
      ['2026-10', 'Octubre 2026'],
      ['2026-11', 'Noviembre 2026'],
      ['2026-12', 'Diciembre 2026'],
    ]
    for (const [month, expected] of cases) {
      const { unmount } = render(<MonthNavigator month={month} onChange={vi.fn()} />)
      expect(screen.getByText(expected)).toBeInTheDocument()
      unmount()
    }
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/MonthNavigator.test.tsx`
Expected: FAIL con `Cannot find module './MonthNavigator'`.

- [ ] **Step 3: Write minimal implementation**

Crear `src/components/MonthNavigator.tsx`:

```tsx
interface Props {
  month: string
  onChange: (month: string) => void
}

const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

function shiftMonth(month: string, delta: number): string {
  const [year, monthNum] = month.split('-').map(Number)
  const date = new Date(year!, monthNum! - 1, 1)
  date.setMonth(date.getMonth() + delta)
  const newYear = date.getFullYear()
  const newMonth = date.getMonth() + 1
  return `${newYear}-${String(newMonth).padStart(2, '0')}`
}

function formatLabel(month: string): string {
  const [year, monthNum] = month.split('-').map(Number)
  return `${MONTHS[monthNum! - 1]} ${year}`
}

export default function MonthNavigator({ month, onChange }: Props) {
  return (
    <div className="flex items-center justify-between bg-white rounded-lg shadow p-4">
      <button
        type="button"
        aria-label="Mes anterior"
        onClick={() => onChange(shiftMonth(month, -1))}
        className="p-2 rounded-md text-gray-600 hover:bg-gray-100 text-xl"
      >
        ←
      </button>
      <span className="text-lg font-semibold text-gray-900">{formatLabel(month)}</span>
      <button
        type="button"
        aria-label="Mes siguiente"
        onClick={() => onChange(shiftMonth(month, 1))}
        className="p-2 rounded-md text-gray-600 hover:bg-gray-100 text-xl"
      >
        →
      </button>
    </div>
  )
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/components/MonthNavigator.test.tsx`
Expected: PASS — 6 tests.

- [ ] **Step 5: Commit**

```bash
git add src/components/MonthNavigator.tsx src/components/MonthNavigator.test.tsx
git commit -m "feat(historial): componente MonthNavigator con flechas y label en español"
```

---

## Task 2: Modificar `Budget.tsx` — aceptar `month` y `onSaved` props

**Files:**
- Modify: `src/pages/Budget.tsx`

**Interfaces:**
- Produces: `<BudgetPage month?: string, onSaved?: () => void />`. Si `month` se pasa, lo usa en `getBudget`/`setBudget`. Si no, usa mes actual (comportamiento existente). Si `onSaved` se pasa, lo llama después de guardar exitosamente.

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
    )
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
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
- `handleSubmit`: pasa `month` a `setBudget(user.uid, Number(amount), month)`. Llama `onSaved()` después de guardar exitosamente.
- `useEffect` dep: `[user, month]` — recarga cuando cambia el mes.

- [ ] **Step 2: Verify typecheck**

Run: `npx tsc -b --noEmit`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add src/pages/Budget.tsx
git commit -m "feat(historial): Budget acepta month y onSaved props para multi-mes"
```

---

## Task 3: Modificar `PurchaseHistory.tsx` — aceptar prop `month`

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

  async function handleDelete(purchaseId: string) {
    if (!user) return
    if (!confirm('¿Eliminar esta compra?')) return

    try {
      await deletePurchase(user.uid, purchaseId)
      setPurchases(purchases.filter((p) => p.id !== purchaseId))
    } catch (err) {
      console.error('Error al eliminar compra:', err)
      alert('Error al eliminar la compra. Intentá de nuevo.')
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
                  {item.quantity}x {item.name} — ${item.totalPrice.toLocaleString()}
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

NOTA: Hay una duplicación de `loadPurchases` (una dentro de `useEffect` con `isMounted`, otra fuera para reintentar). Esto es intencional — la del `useEffect` maneja cleanup, la externa es para el botón reintentar. Si el implementer prefiere refactorizar a una sola función con flag `isMounted` como state, es aceptable siempre que mantenga el comportamiento.

- [ ] **Step 2: Verify typecheck**

Run: `npx tsc -b --noEmit`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add src/pages/PurchaseHistory.tsx
git commit -m "feat(historial): PurchaseHistory acepta prop month con manejo de errores"
```

---

## Task 4: Modificar `Dashboard.tsx` — integrar MonthNavigator, selectedMonth, resumen 3 números, botón definir presupuesto

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
  const { isInstallable, promptInstall } = usePWAInstall()

  useEffect(() => {
    let isMounted = true

    async function loadData() {
      if (!user) return
      setLoading(true)
      setError('')

      try {
        const [budgetData, spent] = await Promise.all([
          getBudget(user.uid, selectedMonth),
          getTotalSpent(user.uid, selectedMonth),
        ])

        if (!isMounted) return

        setBudget(budgetData ? budgetData.amount : null)
        setTotalSpent(spent)
      } catch (err) {
        console.error('Error cargando datos:', err)
        if (isMounted) {
          setError('Error al cargar los datos. Recargá la página.')
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    loadData()

    return () => {
      isMounted = false
    }
  }, [user, selectedMonth])

  async function handleLogout() {
    try {
      await logout()
      navigate('/login')
    } catch (err) {
      console.error('Error al cerrar sesión:', err)
      setError('Error al cerrar sesión. Intentá de nuevo.')
    }
  }

  const remaining = budget !== null ? budget - totalSpent : 0
  const isOverBudget = budget !== null && totalSpent > budget
  const percentage = budget !== null && budget > 0 ? (totalSpent / budget) * 100 : 0

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Mercado Inteligente</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{user?.email}</span>
            {isInstallable ? (
              <button
                onClick={() => void promptInstall()}
                className="text-sm text-green-600 hover:text-green-800"
              >
                Instalar app
              </button>
            ) : null}
            <button
              onClick={handleLogout}
              className="text-sm text-red-600 hover:text-red-800"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-6">
        <MonthNavigator month={selectedMonth} onChange={setSelectedMonth} />

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          </div>
        ) : showBudgetForm ? (
          <BudgetPage
            month={selectedMonth}
            onSaved={() => {
              setShowBudgetForm(false)
            }}
          />
        ) : (
          <>
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Resumen del mes</h2>

              <div className="grid grid-cols-3 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-600">Gastado</p>
                  <p className="text-2xl font-bold text-red-600">${totalSpent.toLocaleString()}</p>
                </div>
                {budget !== null ? (
                  <>
                    <div>
                      <p className="text-sm text-gray-600">Presupuesto</p>
                      <p className="text-2xl font-bold text-gray-900">${budget.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">{isOverBudget ? 'Pasado' : 'Restante'}</p>
                      <p className={`text-2xl font-bold ${isOverBudget ? 'text-red-600' : 'text-green-600'}`}>
                        ${Math.abs(remaining).toLocaleString()}
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="col-span-2">
                    <p className="text-sm text-gray-600">Presupuesto</p>
                    <p className="text-lg font-medium text-gray-500 mb-2">Sin presupuesto</p>
                    <button
                      onClick={() => setShowBudgetForm(true)}
                      className="text-sm text-green-600 hover:text-green-800"
                    >
                      Definir presupuesto
                    </button>
                  </div>
                )}
              </div>

              {budget !== null && budget > 0 && (
                <>
                  <div className="w-full bg-gray-200 rounded-full h-4">
                    <div
                      className={`h-4 rounded-full transition-all ${
                        percentage > 100 ? 'bg-red-600' : percentage > 80 ? 'bg-yellow-500' : 'bg-green-600'
                      }`}
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    {percentage.toFixed(1)}% del presupuesto utilizado
                  </p>
                </>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <BudgetPage month={selectedMonth} />
              <AddPurchase />
            </div>

            <PurchaseHistory month={selectedMonth} />
          </>
        )}
      </main>
    </div>
  )
}
```

Cambios clave:
- Import `MonthNavigator` y `getCurrentMonth` helper.
- Estado `selectedMonth` (default: `getCurrentMonth()`), `budget` (ahora `number | null`), `showBudgetForm`.
- `useEffect` con `isMounted` flag y dep `[user, selectedMonth]` — recarga al cambiar mes, cancela queries pendientes.
- `getBudget` y `getTotalSpent` llamados con `selectedMonth`.
- Resumen 3 estados: normal (restante verde), pasado (rojo), sin presupuesto (botón definir).
- `showBudgetForm` renderiza `<BudgetPage month={selectedMonth} onSaved={...} />` en lugar del Dashboard.
- `<BudgetPage month={selectedMonth} />` en la grid (no solo mes actual).
- `<PurchaseHistory month={selectedMonth} />` (no solo mes actual).
- Eliminado el `{user?.uid}` del header (era info de debug innecesaria).

- [ ] **Step 2: Verify typecheck**

Run: `npx tsc -b --noEmit`
Expected: PASS.

- [ ] **Step 3: Verify build**

Run: `npm run build`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add src/pages/Dashboard.tsx
git commit -m "feat(historial): Dashboard con MonthNavigator, selectedMonth, resumen 3 estados y boton definir presupuesto"
```

---

## Task 5: Tests de integración del Dashboard multi-mes

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
    vi.mocked(getBudget).mockResolvedValue({ amount: 50000 } as any)
    vi.mocked(getTotalSpent).mockResolvedValue(30000)

    renderDashboard()

    await waitFor(() => {
      expect(screen.getByText('Gastado')).toBeInTheDocument()
      expect(screen.getByText('Presupuesto')).toBeInTheDocument()
      expect(screen.getByText('Restante')).toBeInTheDocument()
      expect(screen.getByText('$20.000')).toBeInTheDocument()
    })
  })

  it('should show Pasado in red when spent > budget', async () => {
    const { getBudget } = await import('@/services/budget')
    const { getTotalSpent } = await import('@/services/purchases')
    vi.mocked(getBudget).mockResolvedValue({ amount: 50000 } as any)
    vi.mocked(getTotalSpent).mockResolvedValue(80000)

    renderDashboard()

    await waitFor(() => {
      expect(screen.getByText('Pasado')).toBeInTheDocument()
      expect(screen.getByText('$30.000')).toBeInTheDocument()
    })
  })

  it('should show Sin presupuesto and Definir button when budget is null', async () => {
    const { getBudget } = await import('@/services/budget')
    const { getTotalSpent } = await import('@/services/purchases')
    vi.mocked(getBudget).mockResolvedValue(null)
    vi.mocked(getTotalSpent).mockResolvedValue(0)

    renderDashboard()

    await waitFor(() => {
      expect(screen.getByText('Sin presupuesto')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /definir presupuesto/i })).toBeInTheDocument()
    })
  })

  it('should open Budget form when Definir presupuesto clicked', async () => {
    const { getBudget } = await import('@/services/budget')
    const { getTotalSpent } = await import('@/services/purchases')
    vi.mocked(getBudget).mockResolvedValue(null)
    vi.mocked(getTotalSpent).mockResolvedValue(0)

    renderDashboard()

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /definir presupuesto/i })).toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole('button', { name: /definir presupuesto/i }))

    await waitFor(() => {
      expect(screen.getByTestId('budget-form')).toBeInTheDocument()
    })
  })

  it('should call services with selectedMonth when navigating', async () => {
    const { getBudget } = await import('@/services/budget')
    const { getTotalSpent } = await import('@/services/purchases')
    vi.mocked(getBudget).mockResolvedValue({ amount: 50000 } as any)
    vi.mocked(getTotalSpent).mockResolvedValue(30000)

    renderDashboard()

    await waitFor(() => {
      expect(getBudget).toHaveBeenCalledWith('user-1', expect.any(String))
    })

    vi.mocked(getBudget).mockClear()
    vi.mocked(getTotalSpent).mockClear()

    fireEvent.click(screen.getByRole('button', { name: /mes anterior/i }))

    await waitFor(() => {
      expect(getBudget).toHaveBeenCalledWith('user-1', expect.any(String))
      expect(getTotalSpent).toHaveBeenCalledWith('user-1', expect.any(String))
    })
  })

  it('should pass month to PurchaseHistory', async () => {
    const { getBudget } = await import('@/services/budget')
    const { getTotalSpent } = await import('@/services/purchases')
    vi.mocked(getBudget).mockResolvedValue({ amount: 50000 } as any)
    vi.mocked(getTotalSpent).mockResolvedValue(30000)

    renderDashboard()

    await waitFor(() => {
      expect(screen.getByTestId('purchase-history')).toBeInTheDocument()
    })
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/pages/Dashboard.test.tsx`
Expected: FAIL (módulos no encontrados o comportamiento no implementado).

- [ ] **Step 3: Run test to verify it passes (after Tasks 1-4)**

Run: `npx vitest run src/pages/Dashboard.test.tsx`
Expected: PASS — 7 tests.

NOTA: Este test se escribe DESPUÉS de que Tasks 1-4 estén implementados. Si se corre antes, fallará. El implementer debe asegurarse de que Tasks 1-4 estén commiteados antes de correr este test.

- [ ] **Step 4: Commit**

```bash
git add src/pages/Dashboard.test.tsx
git commit -m "test(historial): tests de integracion del Dashboard multi-mes"
```

---

## Task 6: Smoke test + build final + actualizar tasks-v2 + deploy

**Files:** ninguno (verificación)

- [ ] **Step 1: Correr todos los tests**

Run: `npx vitest run`
Expected: PASS — todos los tests (incluyendo los nuevos de MonthNavigator y Dashboard).

- [ ] **Step 2: Build de producción**

Run: `npm run build`
Expected: PASS.

- [ ] **Step 3: Smoke test local**

Run: `npm run dev`
Verificar manualmente:
1. Login.
2. Dashboard abre en mes actual con "← Julio 2026 →" arriba.
3. Ver resumen con Gastado/Presupuesto/Restante.
4. Tap "←" → cambia a junio 2026. Verificar que resumen e historial se actualizan.
5. Tap "→" varias veces → navegar a meses futuros. Verificar "Sin compras en este mes".
6. Navegar a mes sin presupuesto → ver "Sin presupuesto" + botón "Definir presupuesto".
7. Tap "Definir presupuesto" → ver form de Budget. Definir monto. Guardar.
8. Verificar que vuelve al Dashboard del mes seleccionado con el presupuesto cargado.
9. Navegar de diciembre a enero (cambio de año) — verificar label correcto.

- [ ] **Step 4: Actualizar tasks-v2.md**

Marcar las tareas 4.1-4.5 de la Fase 4 como `aprobada`:

```md
### Fase 4 — Historial Multi-Mes
| # | Tarea | Titán | Estado |
|---|---|---|---|
| 4.1 | Crear selector de mes/año | Hefesto | aprobada |
| 4.2 | Modificar queries para soportar cualquier mes | Prometeo | aprobada |
| 4.3 | Crear página de historial con navegación | Hefesto | aprobada |
| 4.4 | Mostrar resumen por mes (total, presupuesto, diferencia) | Hefesto | aprobada |
| 4.5 | Tests de historial multi-mes | Temis | aprobada |
```

- [ ] **Step 5: Commit y push**

```bash
git add tasks-v2.md
git commit -m "docs: Fase 4 Historial Multi-Mes aprobada y desplegada"
git push origin master
```

Cloudflare Pages auto-deploya.

---

## Self-Review Checklist

- **Spec coverage:**
  - Flechas ← → con label español: Task 1 ✓
  - Sincronizar Dashboard: Task 4 (selectedMonth pasado a todos) ✓
  - Sin presupuesto + botón definir: Task 4 (budget === null → botón) ✓
  - Meses futuros permitidos: Task 1 (flechas siempre habilitadas) ✓
  - Resumen 3 números: Task 4 (Gastado/Presupuesto/Restante-Pasado) ✓
  - Default mes actual: Task 4 (`useState(getCurrentMonth)`) ✓
  - Navegación libre: Task 1 (sin límites) ✓
  - Budget con month/onSaved: Task 2 ✓
  - PurchaseHistory con month: Task 3 ✓
  - Manejo de errores independiente: Task 3 (error en compras no bloquea), Task 4 (isMounted) ✓
  - Carga cancelable: Task 3 + Task 4 (isMounted flag) ✓

- **Placeholders:** Ninguno. Todos los pasos tienen código completo.

- **Type consistency:**
  - `MonthNavigator` props `month: string, onChange: (month: string) => void` — usado en Task 4 ✓
  - `BudgetPage` props `month?: string, onSaved?: () => void` — usado en Task 4 ✓
  - `PurchaseHistory` props `month?: string` — usado en Task 4 ✓
  - `getBudget(uid, month?)`, `getTotalSpent(uid, month?)`, `getPurchases(uid, month?)` — ya existen, no se modifican ✓
