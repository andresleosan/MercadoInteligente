import { useState, useEffect } from 'react'
import {
  ComposedChart, Bar, Line, XAxis, YAxis, Tooltip, CartesianGrid,
  ResponsiveContainer, BarChart, LineChart, PieChart, Pie, Cell,
} from 'recharts'
import { getTotalSpentByMonth, getTopProducts, getSpendingByStore, getPurchaseFrequency } from '@/services/analytics'
import type { MonthData, ProductData, StoreChartData, FrequencyData } from '@/services/analytics'

const MONTH_LABELS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']

function monthToLabel(month: string): string {
  const parts = month.split('-').map(Number)
  const monthNum = parts[1] ?? 1
  return MONTH_LABELS[monthNum - 1] ?? ''
}

interface Props {
  userId: string
  selectedMonth: string
}

const PIE_COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899']

export default function ChartsContent({ userId, selectedMonth }: Props) {
  const [monthlyData, setMonthlyData] = useState<MonthData[]>([])
  const [topProducts, setTopProducts] = useState<ProductData[]>([])
  const [storeData, setStoreData] = useState<StoreChartData[]>([])
  const [frequencyData, setFrequencyData] = useState<FrequencyData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function loadData() {
    setLoading(true)
    setError('')
    try {
      const [monthly, top, stores, freq] = await Promise.all([
        getTotalSpentByMonth(userId, 6, selectedMonth),
        getTopProducts(userId, selectedMonth, 5),
        getSpendingByStore(userId, selectedMonth),
        getPurchaseFrequency(userId, 6, selectedMonth),
      ])
      setMonthlyData(monthly)
      setTopProducts(top)
      setStoreData(stores)
      setFrequencyData(freq)
    } catch (err) {
      console.error('Error cargando gráficos:', err)
      setError('Error al cargar gráficos. Reintentar.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [userId, selectedMonth])

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-green"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-surface rounded-radius-md shadow-card p-6 text-center">
        <p className="text-sm text-accent-red mb-3">{error}</p>
        <button onClick={loadData} className="text-sm text-accent-green hover:opacity-80">
          Reintentar
        </button>
      </div>
    )
  }

  const chartData = monthlyData.map((d) => ({
    name: monthToLabel(d.month),
    spent: d.spent,
    budget: d.budget,
  }))

  return (
    <div className="space-y-6">
      <div className="bg-surface rounded-radius-md shadow-card p-6">
        <h3 className="text-lg font-semibold text-primary mb-4">Gastado vs Presupuesto (6 meses)</h3>
        <ResponsiveContainer width="100%" height={250}>
          <ComposedChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
            <XAxis dataKey="name" stroke="#9CA3AF" tick={{ fill: '#9CA3AF' }} />
            <YAxis stroke="#9CA3AF" tick={{ fill: '#9CA3AF' }} />
            <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', color: '#F9FAFB' }} />
            <Bar dataKey="spent" fill="#10B981" name="Gastado" />
            <Line dataKey="budget" stroke="#6B7280" name="Presupuesto" connectNulls={false} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-surface rounded-radius-md shadow-card p-6">
        <h3 className="text-lg font-semibold text-primary mb-4">Top 5 productos</h3>
        {topProducts.length === 0 ? (
          <p className="text-secondary">Sin compras en este mes.</p>
        ) : (
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={topProducts} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
              <XAxis type="number" stroke="#9CA3AF" tick={{ fill: '#9CA3AF' }} />
              <YAxis dataKey="name" type="category" width={100} stroke="#9CA3AF" tick={{ fill: '#9CA3AF' }} />
              <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', color: '#F9FAFB' }} />
              <Bar dataKey="totalSpent" fill="#10B981" name="Gastado" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="bg-surface rounded-radius-md shadow-card p-6">
        <h3 className="text-lg font-semibold text-primary mb-4">Tendencia de gastos</h3>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
            <XAxis dataKey="name" stroke="#9CA3AF" tick={{ fill: '#9CA3AF' }} />
            <YAxis stroke="#9CA3AF" tick={{ fill: '#9CA3AF' }} />
            <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', color: '#F9FAFB' }} />
            <Line dataKey="spent" stroke="#10B981" name="Gastado" dot />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {storeData.length > 0 && (
        <div className="bg-surface rounded-radius-md shadow-card p-6">
          <h3 className="text-lg font-semibold text-primary mb-4">Gasto por tienda</h3>
          <div className="flex items-center gap-4">
            <ResponsiveContainer width="50%" height={200}>
              <PieChart>
                <Pie
                  data={storeData}
                  dataKey="total"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ name, percent }: { name?: string; percent?: number }) => `${name || ''} ${((percent || 0) * 100).toFixed(0)}%`}
                >
                  {storeData.map((_, index) => (
                    <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', color: '#F9FAFB' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-2">
              {storeData.map((store, index) => (
                <div key={store.name} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }}
                  />
                  <span className="text-sm text-text-secondary flex-1">{store.name}</span>
                  <span className="text-sm font-medium text-text-primary">${store.total.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {frequencyData.length > 0 && (
        <div className="bg-surface rounded-radius-md shadow-card p-6">
          <h3 className="text-lg font-semibold text-primary mb-4">Frecuencia de compras</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={frequencyData.map(d => ({ name: monthToLabel(d.month), count: d.count }))}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
              <XAxis dataKey="name" stroke="#9CA3AF" tick={{ fill: '#9CA3AF' }} />
              <YAxis stroke="#9CA3AF" tick={{ fill: '#9CA3AF' }} />
              <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', color: '#F9FAFB' }} />
              <Bar dataKey="count" fill="#3B82F6" name="Compras" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
