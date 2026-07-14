import { useState, useEffect } from 'react'
import {
  ComposedChart, Bar, Line, XAxis, YAxis, Tooltip, CartesianGrid,
  ResponsiveContainer, BarChart, LineChart,
} from 'recharts'
import { getTotalSpentByMonth, getTopProducts } from '@/services/analytics'
import type { MonthData, ProductData } from '@/services/analytics'

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

export default function ChartsContent({ userId, selectedMonth }: Props) {
  const [monthlyData, setMonthlyData] = useState<MonthData[]>([])
  const [topProducts, setTopProducts] = useState<ProductData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function loadData() {
    setLoading(true)
    setError('')
    try {
      const [monthly, top] = await Promise.all([
        getTotalSpentByMonth(userId, 6, selectedMonth),
        getTopProducts(userId, selectedMonth, 5),
      ])
      setMonthlyData(monthly)
      setTopProducts(top)
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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6 text-center">
        <p className="text-sm text-red-600 mb-3">{error}</p>
        <button onClick={loadData} className="text-sm text-green-600 hover:text-green-800">
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
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Gastado vs Presupuesto (6 meses)</h3>
        <ResponsiveContainer width="100%" height={250}>
          <ComposedChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="spent" fill="#16a34a" name="Gastado" />
            <Line dataKey="budget" stroke="#6b7280" name="Presupuesto" connectNulls={false} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Top 5 productos</h3>
        {topProducts.length === 0 ? (
          <p className="text-gray-600">Sin compras en este mes.</p>
        ) : (
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={topProducts} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={100} />
              <Tooltip />
              <Bar dataKey="totalSpent" fill="#16a34a" name="Gastado" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Tendencia de gastos</h3>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Line dataKey="spent" stroke="#16a34a" name="Gastado" dot />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
