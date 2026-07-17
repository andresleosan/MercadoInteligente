import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { getPurchases, deletePurchase } from '@/services/purchases'
import type { Purchase } from '@/types'
import { DarkCard } from '@/components/ui/DarkCard'
import { DarkButton } from '@/components/ui/DarkButton'
import { EmptyState } from '@/components/ui/EmptyState'

interface Props {
  month?: string
  version?: number
}

export default function PurchaseHistory({ month, version }: Props) {
  const { user } = useAuth()
  const [purchases, setPurchases] = useState<Purchase[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState('')

  async function loadPurchases() {
    if (!user) return
    try {
      setError('')
      console.log('[PurchaseHistory] UID READ:', user.uid, '| month:', month)
      const data = await getPurchases(user.uid, month)
      console.log('[PurchaseHistory] purchases loaded:', data.length)
      setPurchases(data)
    } catch (err) {
      console.error('Error al cargar compras:', err)
      setError('Error al cargar las compras. Reintentar.')
    }
  }

  useEffect(() => {
    let isMounted = true

    async function initialLoad() {
      await loadPurchases()
      if (isMounted) setLoading(false)
    }
    initialLoad()

    return () => {
      isMounted = false
    }
  }, [user, month, version])

  async function handleRefresh() {
    setRefreshing(true)
    await loadPurchases()
    setRefreshing(false)
  }

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

  return (
    <DarkCard className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-text-primary">Historial de compras</h2>
        <DarkButton variant="secondary" size="sm" onClick={handleRefresh} disabled={refreshing}>
          {refreshing ? 'Actualizando...' : 'Actualizar historial'}
        </DarkButton>
      </div>

      <div className="space-y-4">
        {purchases.map((purchase) => (
          <DarkCard key={purchase.id} variant="secondary" className="p-4">
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="text-sm text-text-secondary">
                  {purchase.createdAt.toLocaleDateString('es-AR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
                <p className="text-lg font-semibold text-text-primary">
                  ${purchase.total.toLocaleString()}
                </p>
              </div>
              <DarkButton variant="danger" size="sm" onClick={() => handleDelete(purchase.id)}>
                Eliminar
              </DarkButton>
            </div>

            <ul className="text-sm text-text-secondary space-y-1">
              {purchase.items.map((item, index) => (
                <li key={index}>
                  {item.quantity}x {item.name} — ${item.totalPrice.toLocaleString()}
                </li>
              ))}
            </ul>
          </DarkCard>
        ))}
      </div>
    </DarkCard>
  )
}
