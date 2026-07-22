import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useCategories } from '@/hooks/useCategories'
import { getTodayPurchases, deletePurchase } from '@/services/purchases'
import { getCurrentDate } from '@/utils/date'
import type { Purchase } from '@/types'
import { DarkCard } from '@/components/ui/DarkCard'
import { EmptyState } from '@/components/ui/EmptyState'
import { CategoryBadge } from '@/components/CategoryBadge'
import { Store } from 'lucide-react'

interface Props {
  date?: string
  refreshKey?: number
}

export default function TodayPurchases({ date, refreshKey }: Props) {
  const { user } = useAuth()
  const { categories } = useCategories(user?.uid ?? null)
  const targetDate = date || getCurrentDate()
  const [purchases, setPurchases] = useState<Purchase[]>([])
  const [loading, setLoading] = useState(true)

  const loadData = useCallback(async () => {
    if (!user) return
    try {
      const data = await getTodayPurchases(user.uid, targetDate)
      setPurchases(data)
    } catch (err) {
      console.error('Error al cargar compras de hoy:', err)
    } finally {
      setLoading(false)
    }
  }, [user, targetDate])

  useEffect(() => {
    loadData()
  }, [loadData, refreshKey])

  async function handleDelete(purchaseId: string) {
    if (!user) return
    if (!confirm('¿Eliminar esta compra?')) return
    try {
      await deletePurchase(user.uid, purchaseId)
      setPurchases(prev => prev.filter(p => p.id !== purchaseId))
    } catch (err) {
      console.error('Error al eliminar compra:', err)
    }
  }

  if (loading) {
    return (
      <DarkCard className="p-6">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-bg-input rounded w-1/3" />
          <div className="h-6 bg-bg-input rounded w-1/2" />
        </div>
      </DarkCard>
    )
  }

  const totalDay = purchases.reduce((sum, p) => sum + p.total, 0)

  const byStore = new Map<string, { storeName: string; total: number; purchases: Purchase[] }>()
  for (const p of purchases) {
    const key = p.storeId || '__no_store__'
    const existing = byStore.get(key) || { storeName: p.storeName, total: 0, purchases: [] }
    existing.total += p.total
    existing.purchases.push(p)
    byStore.set(key, existing)
  }

  const storeGroups = Array.from(byStore.entries())

  if (purchases.length === 0) {
    return (
      <DarkCard className="p-6">
        <h2 className="text-lg font-semibold text-text-primary mb-3">Compras de hoy</h2>
        <EmptyState
          icon="🛒"
          title="Hoy no compraste nada"
          description="Registrá una compra para verla acá."
        />
      </DarkCard>
    )
  }

  return (
    <DarkCard className="p-6">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-lg font-semibold text-text-primary">Compras de hoy</h2>
        <span className="text-sm font-bold text-accent-green">${totalDay.toLocaleString()}</span>
      </div>

      <div className="space-y-3">
        {storeGroups.map(([storeId, { storeName, total, purchases: storePurchases }]) => {
          const purchaseCount = storePurchases.length

          return (
          <div
            key={storeId}
            className="rounded-radius-lg border border-border-subtle bg-bg-surface/70 p-3 shadow-[0_1px_0_rgba(255,255,255,0.03)]"
          >
            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="flex min-w-0 items-center gap-2">
                <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border-subtle bg-bg-elevated text-accent-green shadow-sm">
                  <Store size={14} aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-semibold text-text-primary">{storeName}</p>
                    <span className="inline-flex items-center rounded-full border border-border-subtle bg-bg-elevated px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-text-muted">
                      {storeId === '__no_store__' ? 'Sin tienda' : 'Tienda'}
                    </span>
                  </div>
                  <p className="text-xs text-text-muted">
                    {purchaseCount === 1 ? '1 compra registrada' : `${purchaseCount} compras registradas`}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-accent-green">${total.toLocaleString()}</p>
                <p className="text-[11px] text-text-muted">Subtotal del grupo</p>
              </div>
            </div>
            <div className="space-y-1">
              {storePurchases.map(purchase => (
                <div key={purchase.id} className="flex justify-between items-start gap-3 rounded-radius-md border border-border-subtle/60 bg-bg-base/40 px-3 py-2">
                  <ul className="text-sm text-text-secondary flex-1">
                    {purchase.items.map((item, index) => {
                      const matchedCategory = item.category
                        ? categories.find(c => c.id === item.category)
                        : undefined
                      return (
                        <li key={index} className="text-xs">
                          <div className="flex items-center gap-2">
                            <span>{item.quantity}x {item.name}</span>
                            {matchedCategory && (
                              <CategoryBadge category={matchedCategory} />
                            )}
                          </div>
                        </li>
                      )
                    })}
                  </ul>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-text-primary">
                      ${purchase.total.toLocaleString()}
                    </span>
                    <button
                      onClick={() => handleDelete(purchase.id)}
                      className="text-xs text-accent-red hover:text-accent-red/80 transition-colors"
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )})}
      </div>
    </DarkCard>
  )
}
