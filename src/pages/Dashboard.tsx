import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { logout } from '@/services/auth'
import { getTotalSpent } from '@/services/purchases'
import { useNavigate } from 'react-router-dom'
import BudgetPage from '@/pages/Budget'
import AddPurchase from '@/pages/AddPurchase'
import PurchaseHistory from '@/pages/PurchaseHistory'
import ChartsSection from '@/components/ChartsSection'
import TodayPurchases from '@/components/TodayPurchases'
import usePWAInstall from '@/hooks/usePWAInstall'
import { getCurrentMonth, getCurrentDate } from '@/utils/date'
import ExpandableCard from '@/components/ui/ExpandableCard'
import { MonthSelector } from '@/components/ui/MonthSelector'
import { KpiCard } from '@/components/ui/KpiCard'
import { BudgetAlertBanner } from '@/components/BudgetAlertBanner'
import {
  evaluateBudgetAlerts,
  sendBudgetNotification,
  type BudgetAlert,
} from '@/services/notifications'
import { getUserFamily } from '@/services/families'
import type { Family } from '@/types'

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
  ShoppingBag,
  Calendar,
  Users,
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
  const [selectedDate] = useState(getCurrentDate)
  const [totalSpent, setTotalSpent] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [budgetVersion, setBudgetVersion] = useState(0)
  const [purchaseVersion, setPurchaseVersion] = useState(0)
  const [family, setFamily] = useState<Family | null>(null)
  const [alerts, setAlerts] = useState<BudgetAlert[]>([])
  const [dismissedAlertIds, setDismissedAlertIds] = useState<string[]>([])
  const { isInstallable, promptInstall } = usePWAInstall()

  useEffect(() => {
    let isMounted = true

    async function loadData() {
      if (!user) return
      setLoading(true)
      setError('')

      let userFam: Family | null = null
      try {
        userFam = await getUserFamily(user.uid)
        if (isMounted) {
          setFamily(userFam)
        }
      } catch (famErr) {
        console.error('Error al cargar datos familiares:', famErr)
      }

      try {
        const spent = userFam?.id
          ? await getTotalSpent(user.uid, selectedMonth, userFam.id)
          : await getTotalSpent(user.uid, selectedMonth)
        if (!isMounted) return
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

      try {
        const activeAlerts = userFam?.id
          ? await evaluateBudgetAlerts(user.uid, selectedDate, selectedMonth, userFam.id)
          : await evaluateBudgetAlerts(user.uid, selectedDate, selectedMonth)
        if (isMounted) {
          setAlerts(activeAlerts)
          for (const alert of activeAlerts) {
            sendBudgetNotification(alert)
          }
        }
      } catch (alertError) {
        console.error('Error al evaluar alertas de presupuesto:', alertError)
      }
    }

    loadData()
    return () => { isMounted = false }
  }, [user, selectedMonth, selectedDate, purchaseVersion, budgetVersion])

  function handleDismissAlert(alertId: string) {
    setDismissedAlertIds((prev) => [...prev, alertId])
  }

  const visibleAlerts = alerts.filter((alert) => !dismissedAlertIds.includes(alert.id))

  async function handleLogout() {
    try {
      await logout()
      navigate('/login')
    } catch {
      setError('Error al cerrar sesión.')
    }
  }

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
            {/* Alertas de presupuesto */}
            <BudgetAlertBanner
              alerts={visibleAlerts}
              onDismiss={handleDismissAlert}
            />

            {/* Indicador de modo familiar */}
            {family && (
              <div
                onClick={() => navigate('/family')}
                role="button"
                tabIndex={0}
                className="flex items-center justify-between bg-accent-green/10 border border-accent-green/20 rounded-radius-md px-3.5 py-2 text-xs cursor-pointer hover:bg-accent-green/15 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Users size={14} className="text-accent-green shrink-0" />
                  <span className="font-semibold text-accent-green">
                    Modo Familiar: {family.name}
                  </span>
                  <span className="text-[11px] text-text-muted">
                    ({family.members.length} {family.members.length === 1 ? 'miembro' : 'miembros'})
                  </span>
                </div>
                <span className="text-[11px] text-accent-green font-medium">Gestionar →</span>
              </div>
            )}

            {/* Accesos rápidos */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <button
                onClick={() => navigate('/reports')}
                className="flex items-center justify-center gap-2 bg-bg-surface hover:bg-bg-elevated border border-border-subtle rounded-radius-md p-3 text-xs font-semibold text-text-primary transition-colors"
              >
                <BarChart3 size={16} className="text-accent-green" />
                <span>Reportes</span>
              </button>
              <button
                onClick={() => navigate('/stores')}
                className="flex items-center justify-center gap-2 bg-bg-surface hover:bg-bg-elevated border border-border-subtle rounded-radius-md p-3 text-xs font-semibold text-text-primary transition-colors"
              >
                <ShoppingBag size={16} className="text-accent-amber" />
                <span>Tiendas</span>
              </button>
              <button
                onClick={() => navigate('/family')}
                className="flex items-center justify-center gap-2 bg-bg-surface hover:bg-bg-elevated border border-border-subtle rounded-radius-md p-3 text-xs font-semibold text-text-primary transition-colors"
              >
                <Users size={16} className="text-accent-green" />
                <span>{family ? family.name : 'Familia'}</span>
              </button>
              <button
                onClick={() => navigate('/analytics')}
                className="flex items-center justify-center gap-2 bg-bg-surface hover:bg-bg-elevated border border-border-subtle rounded-radius-md p-3 text-xs font-semibold text-text-primary transition-colors"
              >
                <TrendingUp size={16} className="text-accent-green" />
                <span>Analítica</span>
              </button>
            </div>

            {/* 1. Presupuesto diario */}
            <ExpandableCard
              title="Presupuesto diario"
              icon={<Calendar size={18} />}
            >
              <BudgetPage
                date={selectedDate}
                onSaved={() => setBudgetVersion(v => v + 1)}
                familyId={family?.id}
              />
            </ExpandableCard>

            {/* 2. Registrar compra */}
            <ExpandableCard
              title="Registrar compra"
              icon={<PlusCircle size={18} />}
              defaultExpanded
            >
              <AddPurchase
                onSaved={() => setPurchaseVersion(v => v + 1)}
                familyId={family?.id}
              />
            </ExpandableCard>

            {/* 3. Compras de hoy */}
            <ExpandableCard
              title="Compras de hoy"
              icon={<ShoppingBag size={18} />}
              defaultExpanded
            >
              <TodayPurchases
                date={selectedDate}
                refreshKey={purchaseVersion}
                familyId={family?.id}
              />
            </ExpandableCard>

            {/* 4. Historial */}
            <ExpandableCard
              title="Historial"
              icon={<History size={18} />}
            >
              <PurchaseHistory
                month={selectedMonth}
                version={purchaseVersion}
                familyId={family?.id}
              />
            </ExpandableCard>

            {/* 5. Resumen mensual */}
            <ExpandableCard
              title="Resumen mensual"
              icon={<TrendingUp size={18} />}
            >
              <MonthSelector
                currentMonth={stringToDate(selectedMonth)}
                onMonthChange={(date) => setSelectedMonth(dateToString(date))}
              />

              <div className="mt-4 grid grid-cols-3 gap-3">
                <KpiCard icon="💰" value={`$${totalSpent.toLocaleString()}`} label="Gastado" color="green" />
                <KpiCard icon="📊" value={selectedMonth} label="Mes" color="green" />
                <KpiCard icon="🛒" value={`${purchaseVersion}`} label="Compras" color="green" />
              </div>
            </ExpandableCard>

            {/* 6. Gráficos */}
            <ExpandableCard
              title="Gráficos"
              icon={<BarChart3 size={18} />}
            >
              <div className="mb-4 flex justify-end">
                <button
                  onClick={() => navigate('/reports')}
                  className="inline-flex items-center gap-1.5 text-xs text-accent-green hover:underline font-medium"
                >
                  Ver reporte detallado y categorías →
                </button>
              </div>
              <ChartsSection userId={user!.uid} selectedMonth={selectedMonth} />
            </ExpandableCard>
          </>
        )}
      </main>
    </div>
  )
}
