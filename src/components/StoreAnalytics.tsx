import { useState, useEffect } from 'react'
import { getSpendingByStore, getPurchaseFrequency, getDailySpend, getStoreRanking } from '@/services/analytics'
import { getCurrentMonth } from '@/utils/date'
import type { DailySpending, StoreSpending } from '@/types'
import { DarkCard } from '@/components/ui/DarkCard'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts'

interface StoreChartData {
  name: string
  total: number
  count: number
}

interface FrequencyData {
  month: string
  count: number
}

interface Props {
  userId: string
  selectedMonth?: string
}

export default function StoreAnalytics({ userId, selectedMonth }: Props) {
  const month = selectedMonth || getCurrentMonth()
  const [spendingByStore, setSpendingByStore] = useState<StoreChartData[]>([])
  const [frequency, setFrequency] = useState<FrequencyData[]>([])
  const [dailySpend, setDailySpend] = useState<DailySpending[]>([])
  const [ranking, setRanking] = useState<StoreSpending[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    async function loadData() {
      try {
        const [spending, freq, daily, rank] = await Promise.all([
          getSpendingByStore(userId, month),
          getPurchaseFrequency(userId, 6, month),
          getDailySpend(userId, 30),
          getStoreRanking(userId, month),
        ])

        if (isMounted) {
          setSpendingByStore(spending)
          setFrequency(freq)
          setDailySpend(daily)
          setRanking(rank)
        }
      } catch (err) {
        console.error('Error al cargar analítica:', err)
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    loadData()
    return () => { isMounted = false }
  }, [userId, month])

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-green"></div>
      </div>
    )
  }

  const tooltipStyle = { backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }
  const labelStyle = { color: '#F3F4F6' }

  return (
    <div className="space-y-4">
      {/* Gasto por establecimiento */}
      {spendingByStore.length > 0 && (
        <DarkCard className="p-6">
          <h3 className="text-sm font-semibold text-text-primary mb-4">Gasto por establecimiento</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={spendingByStore}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="name" stroke="#9CA3AF" fontSize={12} />
                <YAxis stroke="#9CA3AF" fontSize={12} />
                <Tooltip contentStyle={tooltipStyle} labelStyle={labelStyle} />
                <Bar dataKey="total" fill="#10B981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </DarkCard>
      )}

      {/* Frecuencia de compra */}
      {frequency.length > 0 && (
        <DarkCard className="p-6">
          <h3 className="text-sm font-semibold text-text-primary mb-4">Frecuencia de compra (6 meses)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={frequency}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="month" stroke="#9CA3AF" fontSize={12} />
                <YAxis stroke="#9CA3AF" fontSize={12} />
                <Tooltip contentStyle={tooltipStyle} labelStyle={labelStyle} />
                <Bar dataKey="count" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </DarkCard>
      )}

      {/* Gasto diario */}
      {dailySpend.length > 0 && (
        <DarkCard className="p-6">
          <h3 className="text-sm font-semibold text-text-primary mb-4">Gasto diario (últimos 30 días)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailySpend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="date" stroke="#9CA3AF" fontSize={10} />
                <YAxis stroke="#9CA3AF" fontSize={12} />
                <Tooltip contentStyle={tooltipStyle} labelStyle={labelStyle} />
                <Line type="monotone" dataKey="total" stroke="#10B981" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </DarkCard>
      )}

      {/* Ranking de establecimientos */}
      {ranking.length > 0 && (
        <DarkCard className="p-6">
          <h3 className="text-sm font-semibold text-text-primary mb-4">Ranking de establecimientos</h3>
          <div className="space-y-3">
            {ranking.map((store, index) => (
              <div key={store.storeId || index} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-lg font-bold text-text-muted w-6">#{index + 1}</span>
                  <div>
                    <p className="text-sm font-medium text-text-primary">{store.storeName}</p>
                    <p className="text-xs text-text-muted">{store.purchaseCount} compra{store.purchaseCount !== 1 ? 's' : ''}</p>
                  </div>
                </div>
                <span className="text-sm font-semibold text-accent-green">
                  ${store.total.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </DarkCard>
      )}
    </div>
  )
}
