import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import {
  getCategorySpending,
  getMonthlyComparison,
  getMonthlyTrends,
  formatMonthLabel,
  shiftMonth,
  type CategorySpending,
  type MonthlyComparison,
  type MonthlyTrend,
} from '@/services/reports'
import { getCurrentMonth } from '@/utils/date'
import { ComparisonKpis } from '@/components/reports/ComparisonKpis'
import { CategoryPieChart } from '@/components/reports/CategoryPieChart'
import { MonthlyTrendChart } from '@/components/reports/MonthlyTrendChart'
import { CategoryBreakdownTable } from '@/components/reports/CategoryBreakdownTable'
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  BarChart2,
  PieChart,
  ListFilter,
  Loader2,
  AlertCircle,
  PlusCircle,
} from 'lucide-react'

export default function Reports() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth)
  const [comparison, setComparison] = useState<MonthlyComparison | null>(null)
  const [categoryData, setCategoryData] = useState<CategorySpending[]>([])
  const [trends, setTrends] = useState<MonthlyTrend[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadData = useCallback(async () => {
    if (!user) return
    setLoading(true)
    setError('')

    try {
      const [comp, cats, tr] = await Promise.all([
        getMonthlyComparison(user.uid, selectedMonth),
        getCategorySpending(user.uid, selectedMonth),
        getMonthlyTrends(user.uid, 6, selectedMonth),
      ])
      setComparison(comp)
      setCategoryData(cats)
      setTrends(tr)
    } catch (err) {
      console.error('Error al cargar reportes:', err)
      setError('No se pudieron cargar los datos de reportes. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }, [user, selectedMonth])

  useEffect(() => {
    loadData()
  }, [loadData])

  if (!user) return null

  return (
    <div className="min-h-screen bg-bg-base text-text-primary">
      {/* Header */}
      <header className="bg-bg-header border-b border-border-subtle sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-1.5 text-xs text-text-secondary hover:text-text-primary transition-colors p-1.5 rounded-radius-sm hover:bg-bg-elevated"
              aria-label="Volver al inicio"
            >
              <ArrowLeft size={16} />
              <span className="hidden sm:inline">Volver</span>
            </button>
            <div className="flex items-center gap-2">
              <BarChart2 size={18} className="text-accent-green" />
              <h1 className="text-sm sm:text-base font-semibold">Reportes y Tendencias</h1>
            </div>
          </div>

          {/* Month Navigator */}
          <div className="flex items-center gap-1.5 bg-bg-surface border border-border-subtle rounded-radius-md px-2 py-1">
            <button
              onClick={() => setSelectedMonth((m) => shiftMonth(m, -1))}
              className="p-1 rounded-radius-sm text-text-secondary hover:text-text-primary hover:bg-bg-elevated transition-colors"
              aria-label="Mes anterior"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-xs font-semibold px-2 min-w-[100px] text-center">
              {formatMonthLabel(selectedMonth)}
            </span>
            <button
              onClick={() => setSelectedMonth((m) => shiftMonth(m, 1))}
              className="p-1 rounded-radius-sm text-text-secondary hover:text-text-primary hover:bg-bg-elevated transition-colors"
              aria-label="Mes siguiente"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        {error && (
          <div className="flex items-center gap-2 bg-accent-red/10 border border-accent-red/30 rounded-radius-md p-4 text-accent-red text-sm">
            <AlertCircle size={18} className="shrink-0" />
            <p className="flex-1">{error}</p>
            <button
              onClick={loadData}
              className="text-xs underline font-semibold hover:opacity-80"
            >
              Reintentar
            </button>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-text-muted">
            <Loader2 className="animate-spin text-accent-green" size={32} />
            <span className="text-sm">Generando reportes del mes...</span>
          </div>
        ) : (
          <>
            {/* 1. KPIs de Comparativa */}
            {comparison && <ComparisonKpis comparison={comparison} />}

            {/* Empty state if no purchases in the month */}
            {comparison && comparison.purchaseCount === 0 ? (
              <div className="bg-bg-surface border border-border-subtle rounded-radius-md p-8 text-center space-y-3">
                <p className="text-text-secondary text-sm">
                  No hay compras registradas en {formatMonthLabel(selectedMonth)}.
                </p>
                <button
                  onClick={() => navigate('/')}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-accent-green hover:bg-accent-success text-bg-base font-semibold text-xs rounded-radius-sm transition-colors"
                >
                  <PlusCircle size={16} />
                  Registrar una compra
                </button>
              </div>
            ) : (
              <>
                {/* 2. Visual Charts Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Category Donut Chart */}
                  <div className="bg-bg-surface border border-border-subtle rounded-radius-md p-5 flex flex-col justify-between">
                    <div className="flex items-center justify-between pb-3 mb-2 border-b border-border-subtle">
                      <div className="flex items-center gap-2">
                        <PieChart size={16} className="text-accent-green" />
                        <h2 className="text-sm font-semibold text-text-primary">
                          Gasto por Categoría
                        </h2>
                      </div>
                      <span className="text-xs text-text-muted">
                        {categoryData.length} {categoryData.length === 1 ? 'rubro' : 'rubros'}
                      </span>
                    </div>
                    <CategoryPieChart data={categoryData} />
                  </div>

                  {/* Monthly Trend Chart */}
                  <div className="bg-bg-surface border border-border-subtle rounded-radius-md p-5 flex flex-col justify-between">
                    <div className="flex items-center justify-between pb-3 mb-2 border-b border-border-subtle">
                      <div className="flex items-center gap-2">
                        <BarChart2 size={16} className="text-accent-amber" />
                        <h2 className="text-sm font-semibold text-text-primary">
                          Evolución Mensual (6 meses)
                        </h2>
                      </div>
                      <span className="text-xs text-text-muted">Historial vs Presupuesto</span>
                    </div>
                    <MonthlyTrendChart data={trends} />
                  </div>
                </div>

                {/* 3. Category Detailed Breakdown Table */}
                <div className="bg-bg-surface border border-border-subtle rounded-radius-md p-5">
                  <div className="flex items-center justify-between pb-3 mb-4 border-b border-border-subtle">
                    <div className="flex items-center gap-2">
                      <ListFilter size={16} className="text-accent-green" />
                      <h2 className="text-sm font-semibold text-text-primary">
                        Detalle por Categoría
                      </h2>
                    </div>
                    <span className="text-xs text-text-muted">
                      Total: ${comparison?.currentSpent.toLocaleString()}
                    </span>
                  </div>
                  <CategoryBreakdownTable categories={categoryData} />
                </div>
              </>
            )}
          </>
        )}
      </main>
    </div>
  )
}
