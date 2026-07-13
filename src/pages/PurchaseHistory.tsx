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
