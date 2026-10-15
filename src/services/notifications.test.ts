import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  checkBudgetStatus,
  evaluateBudgetAlerts,
  isNotificationSupported,
  getNotificationPermission,
  requestNotificationPermission,
  sendBudgetNotification,
  type BudgetAlert,
} from './notifications'
import { getBudget } from '@/services/budget'
import { getDailyBudget } from '@/services/dailyBudget'
import { getPurchases, getTotalSpent } from '@/services/purchases'

vi.mock('@/services/budget', () => ({
  getBudget: vi.fn(),
}))

vi.mock('@/services/dailyBudget', () => ({
  getDailyBudget: vi.fn(),
}))

vi.mock('@/services/purchases', () => ({
  getPurchases: vi.fn(),
  getTotalSpent: vi.fn(),
}))

describe('notifications and budget alert service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('checkBudgetStatus', () => {
    it('returns null if budget is 0 or negative', () => {
      expect(checkBudgetStatus(50, 0, 'daily', '2026-07-20')).toBeNull()
      expect(checkBudgetStatus(50, -100, 'monthly', '2026-07')).toBeNull()
    })

    it('returns null if spent is below 80% of budget', () => {
      expect(checkBudgetStatus(79, 100, 'daily', '2026-07-20')).toBeNull()
      expect(checkBudgetStatus(750, 1000, 'monthly', '2026-07')).toBeNull()
    })

    it('returns warning alert when spent is between 80% and 99%', () => {
      const alert = checkBudgetStatus(80, 100, 'daily', '2026-07-20')
      expect(alert).not.toBeNull()
      expect(alert?.level).toBe('warning')
      expect(alert?.percentage).toBe(80)
      expect(alert?.remaining).toBe(20)
      expect(alert?.title).toContain('80% del Presupuesto Diario')

      const monthAlert = checkBudgetStatus(950, 1000, 'monthly', '2026-07')
      expect(monthAlert?.level).toBe('warning')
      expect(monthAlert?.percentage).toBe(95)
      expect(monthAlert?.title).toContain('80% del Presupuesto Mensual')
    })

    it('returns danger alert when spent is >= 100%', () => {
      const exactAlert = checkBudgetStatus(100, 100, 'daily', '2026-07-20')
      expect(exactAlert?.level).toBe('danger')
      expect(exactAlert?.percentage).toBe(100)
      expect(exactAlert?.remaining).toBe(0)

      const exceededAlert = checkBudgetStatus(120, 100, 'daily', '2026-07-20')
      expect(exceededAlert?.level).toBe('danger')
      expect(exceededAlert?.percentage).toBe(120)
      expect(exceededAlert?.remaining).toBe(-20)
      expect(exceededAlert?.message).toContain('Exceso: $20')
    })
  })

  describe('evaluateBudgetAlerts', () => {
    it('evaluates both daily and monthly alerts together', async () => {
      vi.mocked(getDailyBudget).mockResolvedValue({
        id: '2026-07-20',
        userId: 'u1',
        date: '2026-07-20',
        amount: 100,
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      vi.mocked(getBudget).mockResolvedValue({
        id: '2026-07',
        userId: 'u1',
        month: '2026-07',
        amount: 1000,
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      vi.mocked(getPurchases).mockResolvedValue([
        {
          id: 'p1',
          userId: 'u1',
          storeId: 's1',
          storeName: 'Tienda',
          purchaseDate: '2026-07-20',
          total: 85,
          items: [],
          createdAt: new Date(),
        },
      ])

      vi.mocked(getTotalSpent).mockResolvedValue(1050) // 105% of monthly budget

      const alerts = await evaluateBudgetAlerts('u1', '2026-07-20', '2026-07')

      expect(alerts).toHaveLength(2)
      expect(alerts[0]?.scope).toBe('daily')
      expect(alerts[0]?.level).toBe('warning')
      expect(alerts[1]?.scope).toBe('monthly')
      expect(alerts[1]?.level).toBe('danger')
    })

    it('handles absence of budgets gracefully without throwing', async () => {
      vi.mocked(getDailyBudget).mockResolvedValue(null)
      vi.mocked(getBudget).mockResolvedValue(null)
      vi.mocked(getPurchases).mockResolvedValue([])
      vi.mocked(getTotalSpent).mockResolvedValue(0)

      const alerts = await evaluateBudgetAlerts('u1', '2026-07-20', '2026-07')
      expect(alerts).toEqual([])
    })
  })

  describe('browser notification helpers', () => {
    it('checks notification support', () => {
      expect(typeof isNotificationSupported()).toBe('boolean')
    })

    it('returns denied if Notification is unavailable', () => {
      const originalNotification = window.Notification
      // @ts-expect-error simulating missing window.Notification
      delete window.Notification

      expect(getNotificationPermission()).toBe('denied')

      window.Notification = originalNotification
    })

    it('requests notification permission via browser API', async () => {
      const originalNotification = window.Notification
      const mockRequestPermission = vi.fn().mockResolvedValue('granted')
      // @ts-expect-error mocking browser Notification API
      window.Notification = {
        requestPermission: mockRequestPermission,
        permission: 'default',
      }

      const result = await requestNotificationPermission()
      expect(result).toBe('granted')
      expect(mockRequestPermission).toHaveBeenCalled()

      window.Notification = originalNotification
    })

    it('sends notification and prevents duplicates', () => {
      const originalNotification = window.Notification
      const mockNotification = vi.fn()
      // @ts-expect-error mocking browser Notification constructor
      window.Notification = mockNotification
      // @ts-expect-error setting mock permission
      window.Notification.permission = 'granted'

      const alert: BudgetAlert = {
        id: 'unique-alert-1',
        scope: 'daily',
        level: 'danger',
        percentage: 110,
        spent: 110,
        budget: 100,
        remaining: -10,
        title: 'Presupuesto Excedido',
        message: 'Has superado el presupuesto',
        dateOrMonth: '2026-07-20',
      }

      const firstSend = sendBudgetNotification(alert)
      expect(firstSend).toBe(true)
      expect(mockNotification).toHaveBeenCalledWith('Presupuesto Excedido', expect.objectContaining({
        body: 'Has superado el presupuesto',
      }))

      // Second send of same alert should be deduplicated
      const secondSend = sendBudgetNotification(alert)
      expect(secondSend).toBe(false)
      expect(mockNotification).toHaveBeenCalledTimes(1)

      window.Notification = originalNotification
    })
  })
})
