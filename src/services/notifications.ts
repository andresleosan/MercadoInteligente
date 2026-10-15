import { getBudget } from '@/services/budget'
import { getDailyBudget } from '@/services/dailyBudget'
import { getPurchases, getTotalSpent } from '@/services/purchases'

export type AlertLevel = 'warning' | 'danger'
export type BudgetScope = 'daily' | 'monthly'

export interface BudgetAlert {
  id: string
  scope: BudgetScope
  level: AlertLevel
  percentage: number
  spent: number
  budget: number
  remaining: number
  title: string
  message: string
  dateOrMonth: string
}

/**
 * Evalúa los montos y retorna la alerta correspondiente según los umbrales:
 * - >= 100%: danger (Límite alcanzado o superado)
 * - >= 80% y < 100%: warning (Advertencia de proximidad al límite)
 * - < 80%: null
 */
export function checkBudgetStatus(
  spent: number,
  budget: number,
  scope: BudgetScope,
  dateOrMonth: string
): BudgetAlert | null {
  if (budget <= 0) return null

  const percentage = Math.round((spent / budget) * 100)
  const remaining = budget - spent

  if (percentage >= 100) {
    const isDaily = scope === 'daily'
    const excess = Math.abs(remaining)
    return {
      id: `${scope}-${dateOrMonth}-100`,
      scope,
      level: 'danger',
      percentage,
      spent,
      budget,
      remaining,
      title: isDaily
        ? '⚠️ Límite de Presupuesto Diario Excedido'
        : '⚠️ Presupuesto Mensual Agotado',
      message: isDaily
        ? `Has alcanzado el ${percentage}% de tu presupuesto diario ($${spent.toLocaleString()} de $${budget.toLocaleString()}). Exceso: $${excess.toLocaleString()}.`
        : `Has superado el 100% de tu presupuesto mensual. Total gastado: $${spent.toLocaleString()} de $${budget.toLocaleString()}.`,
      dateOrMonth,
    }
  }

  if (percentage >= 80) {
    const isDaily = scope === 'daily'
    return {
      id: `${scope}-${dateOrMonth}-80`,
      scope,
      level: 'warning',
      percentage,
      spent,
      budget,
      remaining,
      title: isDaily
        ? '⚡ Alerta: 80% del Presupuesto Diario'
        : '⚡ Alerta: 80% del Presupuesto Mensual',
      message: isDaily
        ? `Has consumido el ${percentage}% de tu presupuesto diario. Te quedan $${remaining.toLocaleString()}.`
        : `Atención: llevas el ${percentage}% del presupuesto mensual consumido ($${remaining.toLocaleString()} disponibles).`,
      dateOrMonth,
    }
  }

  return null
}

/**
 * Consulta tanto el presupuesto diario como el mensual y evalúa si hay alertas activas.
 */
export async function evaluateBudgetAlerts(
  userId: string,
  date: string,
  month: string,
  familyId?: string
): Promise<BudgetAlert[]> {
  const alerts: BudgetAlert[] = []

  const [dailyBudgetDoc, monthlyBudgetDoc, monthPurchases, monthTotal] = await Promise.all([
    Promise.resolve(getDailyBudget(userId, date, familyId)).catch(() => null),
    Promise.resolve(getBudget(userId, month)).catch(() => null),
    Promise.resolve(getPurchases(userId, month, familyId)).catch(() => []),
    Promise.resolve(getTotalSpent(userId, month, familyId)).catch(() => 0),
  ])

  // 1. Evaluar presupuesto diario
  if (dailyBudgetDoc && dailyBudgetDoc.amount > 0) {
    const todayPurchases = monthPurchases.filter(
      (p) => p.purchaseDate === date
    )
    const todaySpent = todayPurchases.reduce((sum, p) => sum + (p.total || 0), 0)
    const dailyAlert = checkBudgetStatus(todaySpent, dailyBudgetDoc.amount, 'daily', date)
    if (dailyAlert) {
      alerts.push(dailyAlert)
    }
  }

  // 2. Evaluar presupuesto mensual
  if (monthlyBudgetDoc && monthlyBudgetDoc.amount > 0) {
    const monthlyAlert = checkBudgetStatus(monthTotal, monthlyBudgetDoc.amount, 'monthly', month)
    if (monthlyAlert) {
      alerts.push(monthlyAlert)
    }
  }

  return alerts
}

/**
 * Funciones de soporte para Notificaciones del Navegador (Web Notification API)
 */

export function isNotificationSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window
}

export function getNotificationPermission(): NotificationPermission {
  if (!isNotificationSupported()) return 'denied'
  return Notification.permission
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!isNotificationSupported()) return 'denied'
  try {
    return await Notification.requestPermission()
  } catch (err) {
    console.error('Error solicitando permisos de notificación:', err)
    return 'denied'
  }
}

const notifiedCache = new Set<string>()

/**
 * Envía una notificación del sistema si las notificaciones están permitidas.
 * Utiliza un cache en memoria para no enviar notificaciones duplicadas idénticas.
 */
export function sendBudgetNotification(alert: BudgetAlert): boolean {
  if (!isNotificationSupported() || Notification.permission !== 'granted') {
    return false
  }

  if (notifiedCache.has(alert.id)) {
    return false
  }

  try {
    new Notification(alert.title, {
      body: alert.message,
      icon: '/pwa-192x192.png',
      tag: alert.id,
    })
    notifiedCache.add(alert.id)
    return true
  } catch (err) {
    console.warn('Error emitiendo Notification:', err)
    return false
  }
}
