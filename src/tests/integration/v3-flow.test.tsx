import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  createFamily,
  getFamilyByCode,
  joinFamilyByCode,
  leaveFamily,
} from '@/services/families'
import {
  checkBudgetStatus,
  sendBudgetNotification,
} from '@/services/notifications'
import {
  generatePurchasesCSV,
} from '@/services/export'
import type { Purchase, BudgetAlert } from '@/types'
import {
  addDoc,
  getDoc,
  updateDoc,
  getDocs,
} from 'firebase/firestore'

vi.mock('firebase/firestore', () => ({
  collection: vi.fn((_db, name) => ({ id: name, path: name })),
  doc: vi.fn((_db, ...args) => ({ id: args[args.length - 1], path: args.join('/') })),
  getDoc: vi.fn(),
  setDoc: vi.fn(),
  addDoc: vi.fn(),
  updateDoc: vi.fn(),
  deleteDoc: vi.fn(),
  getDocs: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  orderBy: vi.fn(),
  limit: vi.fn(),
  serverTimestamp: () => new Date('2026-07-22T10:00:00Z'),
}))

vi.mock('@/config/firebase', () => ({
  db: {},
  isConfigValid: true,
}))

describe('v3 End-to-End Integration Flow', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  describe('1. Flujo de Presupuesto Familiar (Fase 4)', () => {
    it('permite a un usuario crear una familia, obtener el código y permitir que otro miembro se una', async () => {
      // 1. Crear familia
      vi.mocked(addDoc).mockResolvedValueOnce({ id: 'family-123' } as any)
      vi.mocked(updateDoc).mockResolvedValue(undefined as any)

      const family = await createFamily(
        'owner-uid-1',
        'owner@example.com',
        'Familia Rodríguez',
        'Andrés'
      )

      expect(family.name).toBe('Familia Rodríguez')
      expect(family.ownerId).toBe('owner-uid-1')
      expect(family.code).toMatch(/^FAM-[23456789ABCDEFGHJKLMNPQRSTUVWXYZ]{4}$/)
      expect(family.members).toHaveLength(1)
      expect(family.members[0].role).toBe('owner')

      // 2. Simular búsqueda por código de invitación
      vi.mocked(getDocs).mockResolvedValueOnce({
        empty: false,
        docs: [
          {
            id: family.id,
            data: () => ({
              ...family,
              createdAt: { toDate: () => new Date() },
              updatedAt: { toDate: () => new Date() },
              members: family.members.map(m => ({
                ...m,
                joinedAt: { toDate: () => new Date() },
              })),
            }),
          },
        ],
      } as any)

      const foundFamily = await getFamilyByCode(family.code)
      expect(foundFamily).not.toBeNull()
      expect(foundFamily?.id).toBe(family.id)

      // 3. Unirse a la familia
      vi.mocked(getDocs).mockResolvedValueOnce({
        empty: false,
        docs: [
          {
            id: family.id,
            data: () => ({
              ...family,
              createdAt: { toDate: () => new Date() },
              updatedAt: { toDate: () => new Date() },
              members: family.members.map(m => ({
                ...m,
                joinedAt: { toDate: () => new Date() },
              })),
            }),
          },
        ],
      } as any)
      const joined = await joinFamilyByCode(
        'member-uid-2',
        'member@example.com',
        family.code,
        'María'
      )

      expect(joined.members).toHaveLength(2)
      expect(joined.members[1].uid).toBe('member-uid-2')
      expect(joined.members[1].role).toBe('member')

      // 4. Salir de la familia
      vi.mocked(getDoc).mockResolvedValueOnce({
        exists: () => true,
        id: family.id,
        data: () => ({
          ...joined,
          createdAt: { toDate: () => new Date() },
          updatedAt: { toDate: () => new Date() },
          members: joined.members.map(m => ({
            ...m,
            joinedAt: { toDate: () => new Date() },
          })),
        }),
      } as any)

      await leaveFamily('member-uid-2', family.id)
      expect(updateDoc).toHaveBeenCalled()
    })
  })

  describe('2. Flujo de Alertas y Notificaciones (Fase 3)', () => {
    it('dispara alerta al 80% y 100% del presupuesto diario', () => {
      // Mock window.Notification
      const originalNotification = window.Notification
      const mockNotification = vi.fn()
      // @ts-expect-error mocking browser Notification
      window.Notification = mockNotification
      // @ts-expect-error mocking permission
      window.Notification.permission = 'granted'

      // Caso 1: 50% de gasto (sin alerta)
      const noAlert = checkBudgetStatus(25000, 50000, 'daily', '2026-07-22')
      expect(noAlert).toBeNull()

      // Caso 2: 85% de gasto diario (alerta 80%)
      const alert80 = checkBudgetStatus(42500, 50000, 'daily', '2026-07-22')
      expect(alert80).not.toBeNull()
      expect(alert80?.level).toBe('warning')
      expect(alert80?.scope).toBe('daily')
      expect(alert80?.percentage).toBe(85)

      // Caso 3: 105% de gasto diario (alerta 100%)
      const alert100 = checkBudgetStatus(52500, 50000, 'daily', '2026-07-22')
      expect(alert100).not.toBeNull()
      expect(alert100?.level).toBe('danger')
      expect(alert100?.scope).toBe('daily')
      expect(alert100?.percentage).toBe(105)

      // Deduplicación en almacenamiento local
      const sent1 = sendBudgetNotification(alert100 as BudgetAlert)
      expect(sent1).toBe(true)

      const sent2 = sendBudgetNotification(alert100 as BudgetAlert)
      expect(sent2).toBe(false) // Ya enviada hoy

      window.Notification = originalNotification
    })
  })

  describe('3. Flujo de Exportación (Fase 5)', () => {
    it('genera CSV estructurado con información completa de compras compartidas', () => {
      const purchases: Purchase[] = [
        {
          id: 'purch-1',
          userId: 'owner-uid-1',
          familyId: 'fam-123',
          createdByEmail: 'owner@example.com',
          storeId: 'store-1',
          storeName: 'Carulla',
          purchaseDate: '2026-07-22',
          items: [
            {
              name: 'Carne Molida Especial',
              quantity: 2,
              unitPrice: 15000,
              totalPrice: 30000,
              category: 'carnes',
            },
            {
              name: 'Leche Deslactosada',
              quantity: 3,
              unitPrice: 4500,
              totalPrice: 13500,
              category: 'lacteos',
            },
          ],
          total: 43500,
          discountAmount: 2000,
          createdAt: new Date(),
        },
      ]

      const csv = generatePurchasesCSV(purchases)
      const lines = csv.split('\r\n')

      expect(lines[0]).toBe(
        'ID Compra,Fecha,Establecimiento,Producto,Cantidad,Precio Unitario,Total Producto,Descuento Compra,Total Compra,Categoría,Registrado Por'
      )
      expect(lines).toHaveLength(3) // Encabezado + 2 productos
      expect(lines[1]).toContain('Carulla')
      expect(lines[1]).toContain('Carne Molida Especial')
      expect(lines[1]).toContain('carnes')
      expect(lines[1]).toContain('owner@example.com')
      expect(lines[2]).toContain('Leche Deslactosada')
      expect(lines[2]).toContain('lacteos')
    })
  })
})
