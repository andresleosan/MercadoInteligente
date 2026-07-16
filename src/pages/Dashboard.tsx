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
import ChartsSection from '@/components/ChartsSection'
import { getCurrentMonth } from '@/utils/date'
import ExpandableCard from '@/components/ui/ExpandableCard'
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
              <MonthNavigator month={selectedMonth} onChange={setSelectedMonth} />

              <div className="mt-4 grid grid-cols-3 gap-3">
                <div>
                  <p className="text-xs text-text-secondary">Gastado</p>
                  <p className="text-2xl font-bold text-text-primary">
                    ${totalSpent.toLocaleString()}
                  </p>
                </div>
                {budget !== null ? (
                  <>
                    <div>
                      <p className="text-xs text-text-secondary">Presupuesto</p>
                      <p className="text-2xl font-bold text-text-primary">
                        ${budget.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-text-secondary">
                        {isOverBudget ? 'Pasado' : 'Restante'}
                      </p>
                      <p className={`text-2xl font-bold ${isOverBudget ? 'text-accent-red' : 'text-accent-green'}`}>
                        ${Math.abs(remaining).toLocaleString()}
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="col-span-2">
                    <p className="text-xs text-text-secondary">Presupuesto</p>
                    <p className="text-sm text-text-muted mt-1">Sin presupuesto</p>
                  </div>
                )}
              </div>

              {budget !== null && budget > 0 && (
                <div className="mt-4">
                  <div className="w-full bg-border-subtle rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        percentage > 100 ? 'bg-accent-red' : percentage > 80 ? 'bg-accent-amber' : 'bg-accent-green'
                      }`}
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    />
                  </div>
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
