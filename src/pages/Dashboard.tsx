import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { logout } from '@/services/auth'
import { getBudget } from '@/services/budget'
import { getTotalSpent } from '@/services/purchases'
import { useNavigate } from 'react-router-dom'
import BudgetPage from '@/pages/Budget'
import AddPurchase from '@/pages/AddPurchase'
import PurchaseHistory from '@/pages/PurchaseHistory'
import ChartsSection from '@/components/ChartsSection'
import usePWAInstall from '@/hooks/usePWAInstall'
import { getCurrentMonth } from '@/utils/date'
import ExpandableCard from '@/components/ui/ExpandableCard'
import { DarkCard } from '@/components/ui/DarkCard'
import { MonthSelector } from '@/components/ui/MonthSelector'
import { KpiCard } from '@/components/ui/KpiCard'
import { ProgressBar } from '@/components/ui/ProgressBar'

import {
  Wallet,
  TrendingUp,
  History,
  PlusCircle,
  BarChart3,
  LogOut,
  Download,
  User,
  AlertCircle,
  Loader2,
} from 'lucide-react'

function stringToDate(month: string): Date {
  const [year, monthNum] = month.split('-').map(Number)
  return new Date(year!, monthNum! - 1, 1)
}

function dateToString(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  return `${y}-${m}`
}

export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth)
  const [budget, setBudget] = useState<number | null>(null)
  const [totalSpent, setTotalSpent] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [budgetVersion, setBudgetVersion] = useState(0)
  const [purchaseVersion, setPurchaseVersion] = useState(0)
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
      } catch {
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
  }, [user, selectedMonth, budgetVersion, purchaseVersion])

  async function handleLogout() {
    try {
      await logout()
      navigate('/login')
    } catch {
      setError('Error al cerrar sesión.')
    }
  }

  const remaining = budget !== null ? budget - totalSpent : 0
  const isOverBudget = budget !== null && totalSpent > budget
  const percentage = budget !== null && budget > 0 ? (totalSpent / budget) * 100 : 0

  return (
    <div className="min-h-screen bg-bg-base">
      {/* Header */}
      <header className="bg-bg-header border-b border-border-subtle">
        <div className="max-w-[640px] mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Wallet className="text-accent-green" size={20} />
            <span className="text-sm font-semibold text-text-primary">Mercado Inteligente</span>
          </div>
          <div className="flex items-center gap-3">
            {isInstallable ? (
              <button
                onClick={() => void promptInstall()}
                className="flex items-center gap-1.5 text-xs text-text-secondary hover:text-text-primary transition-colors"
              >
                <Download size={14} />
                Instalar
              </button>
            ) : null}
            <div className="flex items-center gap-2 text-xs text-text-secondary">
              <User size={14} />
              {user?.email}
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-xs text-text-muted hover:text-accent-red transition-colors"
            >
              <LogOut size={14} />
              Salir
            </button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-[640px] mx-auto px-4 py-5 space-y-4">
        {error && (
          <div className="flex items-center gap-2 bg-accent-red/10 border border-accent-red/30 rounded-radius-sm px-4 py-3">
            <AlertCircle size={16} className="text-accent-red shrink-0" />
            <p className="text-sm text-accent-red">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="animate-spin text-accent-green" size={28} />
          </div>
        ) : (
          <>
            {/* 1. Presupuesto */}
            <ExpandableCard
              title="Presupuesto"
              icon={<Wallet size={18} />}
              defaultExpanded
            >
              <BudgetPage
                month={selectedMonth}
                onSaved={() => setBudgetVersion(v => v + 1)}
              />
            </ExpandableCard>

            {/* 2. Resumen del mes */}
            <ExpandableCard
              title="Resumen del mes"
              icon={<TrendingUp size={18} />}
              defaultExpanded
            >
              <MonthSelector
                currentMonth={stringToDate(selectedMonth)}
                onMonthChange={(date) => setSelectedMonth(dateToString(date))}
              />

              <div className="mt-4 grid grid-cols-3 gap-3">
                <KpiCard icon="💰" value={`$${totalSpent.toLocaleString()}`} label="Gastado" color="green" />
                {budget !== null ? (
                  <>
                    <KpiCard icon="📊" value={`$${budget.toLocaleString()}`} label="Presupuesto" color="green" />
                    <KpiCard
                      icon={isOverBudget ? '⚠️' : '✅'}
                      value={`$${Math.abs(remaining).toLocaleString()}`}
                      label={isOverBudget ? 'Pasado' : 'Restante'}
                      color={isOverBudget ? 'red' : 'green'}
                    />
                  </>
                ) : (
                  <DarkCard className="col-span-2 p-4 text-center">
                    <p className="text-xs text-text-secondary">Presupuesto</p>
                    <p className="text-sm text-text-muted mt-1">Sin presupuesto</p>
                  </DarkCard>
                )}
              </div>

              {budget !== null && budget > 0 && (
                <div className="mt-4">
                  <ProgressBar
                    percentage={percentage}
                    color={percentage > 100 ? 'red' : percentage > 80 ? 'amber' : 'green'}
                  />
                  <p className="text-xs text-text-muted mt-2">
                    {percentage.toFixed(1)}% del presupuesto utilizado
                  </p>
                </div>
              )}
            </ExpandableCard>

            {/* 3. Historial de compras */}
            <ExpandableCard
              title="Historial de compras"
              icon={<History size={18} />}
            >
              <PurchaseHistory month={selectedMonth} version={purchaseVersion} />
            </ExpandableCard>

            {/* 4. Registrar compra */}
            <ExpandableCard
              title="Registrar compra"
              icon={<PlusCircle size={18} />}
            >
              <AddPurchase onSaved={() => setPurchaseVersion(v => v + 1)} />
            </ExpandableCard>

            {/* 5. Gráficos */}
            <ExpandableCard
              title="Gráficos"
              icon={<BarChart3 size={18} />}
            >
              <ChartsSection userId={user!.uid} selectedMonth={selectedMonth} />
            </ExpandableCard>
          </>
        )}
      </main>
    </div>
  )
}
