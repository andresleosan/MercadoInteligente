import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  generatePurchasesCSV,
  exportPurchasesToCSV,
  exportReportToPDF,
} from './export'
import type { Purchase } from '@/types'
import type { MonthlyComparison, CategorySpending } from '@/services/reports'
import jsPDF from 'jspdf'

const mockDoc = {
  setFillColor: vi.fn(),
  rect: vi.fn(),
  roundedRect: vi.fn(),
  setTextColor: vi.fn(),
  setFontSize: vi.fn(),
  text: vi.fn(),
  addPage: vi.fn(),
  save: vi.fn(),
}

vi.mock('jspdf', () => ({
  default: vi.fn().mockImplementation(function () {
    return mockDoc
  }),
}))

describe('Export Service', () => {
  const mockPurchases: Purchase[] = [
    {
      id: 'p-1',
      userId: 'user-1',
      storeId: 'store-1',
      storeName: 'Éxito, Calle 80',
      purchaseDate: '2026-10-14',
      items: [
        {
          name: 'Leche Deslactosada, 1L',
          quantity: 2,
          unitPrice: 4500,
          totalPrice: 9000,
          category: 'lacteos',
        },
        {
          name: 'Pan Tajado "Artesanal"',
          quantity: 1,
          unitPrice: 6000,
          totalPrice: 6000,
          category: 'panaderia',
        },
      ],
      discountPercent: 10,
      discountAmount: 1500,
      total: 13500,
      createdByEmail: 'andres@test.com',
      createdAt: new Date(),
    },
    {
      id: 'p-2',
      userId: 'user-1',
      storeId: 'store-2',
      storeName: 'D1',
      purchaseDate: '2026-10-15',
      items: [],
      total: 25000,
      createdAt: new Date(),
    },
  ]

  const mockComparison: MonthlyComparison = {
    currentMonth: '2026-10',
    currentSpent: 150000,
    currentBudget: 200000,
    previousMonth: '2026-09',
    previousSpent: 120000,
    difference: 30000,
    percentageChange: 25,
    topCategory: null,
    purchaseCount: 12,
    averageTicket: 12500,
    savingsOrDeficit: 50000,
  }

  const mockCategories: CategorySpending[] = [
    {
      categoryId: 'lacteos',
      categoryName: 'Lácteos',
      icon: '🥛',
      color: '#38BDF8',
      total: 60000,
      percentage: 40,
      itemCount: 8,
    },
    {
      categoryId: 'carnes',
      categoryName: 'Carnes',
      icon: '🥩',
      color: '#EF4444',
      total: 90000,
      percentage: 60,
      itemCount: 4,
    },
  ]

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('generatePurchasesCSV', () => {
    it('generates CSV with headers and properly escaped cells', () => {
      const csv = generatePurchasesCSV(mockPurchases)

      expect(csv).toContain('ID Compra,Fecha,Establecimiento,Producto')
      // Comma in store name escaped with quotes
      expect(csv).toContain('"Éxito, Calle 80"')
      // Comma and quotes in product name escaped
      expect(csv).toContain('"Leche Deslactosada, 1L"')
      expect(csv).toContain('"Pan Tajado ""Artesanal"""')
      expect(csv).toContain('andres@test.com')
      // Empty items purchase fallback
      expect(csv).toContain('Compra general')
    })
  })

  describe('exportPurchasesToCSV', () => {
    it('creates blob and triggers browser download', () => {
      const createObjectURLMock = vi.fn().mockReturnValue('blob:mock-url')
      const revokeObjectURLMock = vi.fn()
      window.URL.createObjectURL = createObjectURLMock
      window.URL.revokeObjectURL = revokeObjectURLMock
      const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})

      const appendChildSpy = vi.spyOn(document.body, 'appendChild')
      const removeChildSpy = vi.spyOn(document.body, 'removeChild')

      exportPurchasesToCSV(mockPurchases, 'mis-compras.csv')

      expect(createObjectURLMock).toHaveBeenCalled()
      expect(appendChildSpy).toHaveBeenCalled()
      expect(clickSpy).toHaveBeenCalled()
      expect(removeChildSpy).toHaveBeenCalled()
      expect(revokeObjectURLMock).toHaveBeenCalledWith('blob:mock-url')

      clickSpy.mockRestore()
    })
  })

  describe('exportReportToPDF', () => {
    it('generates styled PDF document and calls doc.save', async () => {
      await exportReportToPDF({
        month: '2026-10',
        comparison: mockComparison,
        categories: mockCategories,
      })

      expect(jsPDF).toHaveBeenCalled()
      const mockDoc = vi.mocked(jsPDF).mock.results[0]?.value
      expect(mockDoc.text).toHaveBeenCalledWith('Mercado Inteligente', 14, 18)
      expect(mockDoc.text).toHaveBeenCalledWith(expect.stringContaining('2026-10'), 14, 28)
      expect(mockDoc.text).toHaveBeenCalledWith(expect.stringContaining('$150,000'), 20, 58)
      expect(mockDoc.text).toHaveBeenCalledWith('Lácteos', 18, expect.any(Number))
      expect(mockDoc.save).toHaveBeenCalledWith('reporte-2026-10.pdf')
    })
  })
})
