import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { getPurchases, deletePurchase, getPurchasesGroupedByDate, getPurchasesGroupedByStore } from '@/services/purchases'
import { getMonthRange, formatDateDisplay } from '@/utils/date'
import type { Purchase } from '@/types'
import { DarkCard } from '@/components/ui/DarkCard'
import { DarkButton } from '@/components/ui/DarkButton'
import { EmptyState } from '@/components/ui/EmptyState'

interface Props {
  month?: string
  version?: number
}

type ViewMode = 'date' | 'store'

export default function PurchaseHistory({ month, version }: Props) {
  const { user } = useAuth()
  const [purchases, setPurchases] = useState<Purchase[]>([])
  const [groupedByDate, setGroupedByDate] = useState<Map<string, Purchase[]>>(new Map())
  const [groupedByStore, setGroupedByStore] = useState<Map<string, Purchase[]>>(new Map())
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState('')
  const [viewMode, setViewMode] = useState<ViewMode>('date')

  const loadData = useCallback(async () => {
    if (!user) return
    try {
      setError('')
      const targetMonth = month || new Date().toISOString().slice(0, 7)
      const { start, end } = getMonthRange(targetMonth)

      const [flat, byDate, byStore] = await Promise.all([
        getPurchases(user.uid, month),
        getPurchasesGroupedByDate(user.uid, start, end),
        getPurchasesGroupedByStore(user.uid, start, end),
      ])

      setPurchases(flat)
      setGroupedByDate(byDate)
      setGroupedByStore(byStore)
    } catch (err) {
      console.error('Error al cargar compras:', err)
      setError('Error al cargar las compras. Reintentar.')
    }
  }, [user, month])

  useEffect(() => {
    let isMounted = true

    async function initialLoad() {
      await loadData()
      if (isMounted) setLoading(false)
    }
    initialLoad()

    return () => {
      isMounted = false
    }
  }, [loadData, version])

  async function handleRefresh() {
    setRefreshing(true)
    await loadData()
    setRefreshing(false)
  }

  async function handleDelete(purchaseId: string) {
    if (!user) return
    if (!confirm('¿Eliminar esta compra?')) return

    try {
      await deletePurchase(user.uid, purchaseId)
      await loadData()
    } catch (err) {
      console.error('Error al eliminar compra:', err)
      alert('Error al eliminar la compra. Intentá de nuevo.')
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-green"></div>
      </div>
    )
  }

  if (error) {
    return (
      <DarkCard className="p-6">
        <h2 className="text-xl font-semibold text-text-primary mb-4">Historial de compras</h2>
        <p className="text-sm text-accent-red mb-3">{error}</p>
        <DarkButton variant="secondary" size="sm" onClick={handleRefresh} disabled={refreshing}>
          {refreshing ? 'Actualizando...' : 'Reintentar'}
        </DarkButton>
      </DarkCard>
    )
  }

  if (purchases.length === 0) {
    return (
      <DarkCard className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-text-primary">Historial de compras</h2>
          <DarkButton variant="secondary" size="sm" onClick={handleRefresh} disabled={refreshing}>
            {refreshing ? 'Actualizando...' : 'Actualizar historial'}
          </DarkButton>
        </div>
        <EmptyState
          icon="🛒"
          title="Sin compras"
          description="No hay compras registradas en este mes."
        />
      </DarkCard>
    )
  }

  const sortedDates = Array.from(groupedByDate.keys()).sort().reverse()
  const sortedStores = Array.from(groupedByStore.keys()).sort()

  return (
    <DarkCard className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-text-primary">Historial de compras</h2>
        <div className="flex gap-2">
          <DarkButton
            variant={viewMode === 'date' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setViewMode('date')}
          >
            Por fecha
          </DarkButton>
          <DarkButton
            variant={viewMode === 'store' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setViewMode('store')}
          >
            Por tienda
          </DarkButton>
          <DarkButton variant="secondary" size="sm" onClick={handleRefresh} disabled={refreshing}>
            {refreshing ? '...' : '↻'}
          </DarkButton>
        </div>
      </div>

      {viewMode === 'date' && (
        <div className="space-y-4">
          {sortedDates.map(date => {
            const dayPurchases = groupedByDate.get(date) || []
            const dayTotal = dayPurchases.reduce((sum, p) => sum + p.total, 0)

            return (
              <div key={date}>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold text-text-primary capitalize">
                    {formatDateDisplay(date)}
                  </h3>
                  <span className="text-sm font-medium text-accent-green">
                    ${dayTotal.toLocaleString()}
                  </span>
                </div>

                <div className="space-y-2">
                  {dayPurchases.map(purchase => (
                    <DarkCard key={purchase.id} variant="secondary" className="p-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-xs text-text-muted">{purchase.storeName}</p>
                          <ul className="text-sm text-text-secondary mt-1">
                            {purchase.items.map((item, index) => (
                              <li key={index}>
                                {item.quantity}x {item.name} — ${item.totalPrice.toLocaleString()}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-semibold text-text-primary">
                            ${purchase.total.toLocaleString()}
                          </span>
                          <DarkButton
                            variant="danger"
                            size="sm"
                            onClick={() => handleDelete(purchase.id)}
                          >
                            ×
                          </DarkButton>
                        </div>
                      </div>
                    </DarkCard>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {viewMode === 'store' && (
        <div className="space-y-4">
          {sortedStores.map(storeId => {
            const storePurchases = groupedByStore.get(storeId) || []
            const storeTotal = storePurchases.reduce((sum, p) => sum + p.total, 0)
            const storeName = storePurchases[0]?.storeName || 'Sin establecimiento'

            return (
              <div key={storeId}>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold text-text-primary">
                    {storeName}
                  </h3>
                  <span className="text-xs text-text-muted">
                    {storePurchases.length} compra{storePurchases.length !== 1 ? 's' : ''} · ${storeTotal.toLocaleString()}
                  </span>
                </div>

                <div className="space-y-2">
                  {storePurchases.map(purchase => (
                    <DarkCard key={purchase.id} variant="secondary" className="p-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-xs text-text-muted">{purchase.purchaseDate}</p>
                          <ul className="text-sm text-text-secondary mt-1">
                            {purchase.items.map((item, index) => (
                              <li key={index}>
                                {item.quantity}x {item.name} — ${item.totalPrice.toLocaleString()}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-semibold text-text-primary">
                            ${purchase.total.toLocaleString()}
                          </span>
                          <DarkButton
                            variant="danger"
                            size="sm"
                            onClick={() => handleDelete(purchase.id)}
                          >
                            ×
                          </DarkButton>
                        </div>
                      </div>
                    </DarkCard>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </DarkCard>
  )
}
