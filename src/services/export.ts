import type { Purchase } from '@/types'
import type { MonthlyComparison, CategorySpending } from '@/services/reports'
import { getCurrentDate } from '@/utils/date'

function escapeCsvField(field: unknown): string {
  const str = String(field ?? '')
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

/**
 * Genera el contenido en formato CSV a partir de una lista de compras.
 */
export function generatePurchasesCSV(purchases: Purchase[]): string {
  const headers = [
    'ID Compra',
    'Fecha',
    'Establecimiento',
    'Producto',
    'Cantidad',
    'Precio Unitario',
    'Total Producto',
    'Descuento Compra',
    'Total Compra',
    'Categoría',
    'Registrado Por',
  ]

  const rows: string[] = [headers.join(',')]

  for (const p of purchases) {
    if (p.items && p.items.length > 0) {
      for (const item of p.items) {
        rows.push(
          [
            escapeCsvField(p.id),
            escapeCsvField(p.purchaseDate),
            escapeCsvField(p.storeName || 'Sin establecimiento'),
            escapeCsvField(item.name),
            escapeCsvField(item.quantity),
            escapeCsvField(item.unitPrice),
            escapeCsvField(item.totalPrice),
            escapeCsvField(p.discountAmount ? `$${p.discountAmount}` : '0'),
            escapeCsvField(p.total),
            escapeCsvField(item.category || 'Sin categoría'),
            escapeCsvField(p.createdByEmail || ''),
          ].join(',')
        )
      }
    } else {
      rows.push(
        [
          escapeCsvField(p.id),
          escapeCsvField(p.purchaseDate),
          escapeCsvField(p.storeName || 'Sin establecimiento'),
          escapeCsvField('Compra general'),
          escapeCsvField(1),
          escapeCsvField(p.total),
          escapeCsvField(p.total),
          escapeCsvField(p.discountAmount ? `$${p.discountAmount}` : '0'),
          escapeCsvField(p.total),
          escapeCsvField('Sin categoría'),
          escapeCsvField(p.createdByEmail || ''),
        ].join(',')
      )
    }
  }

  return rows.join('\r\n')
}

/**
 * Descarga un Blob en el navegador creando un enlace temporal.
 */
export function downloadBlob(blob: Blob, filename: string): void {
  if (typeof window === 'undefined') return
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * Exporta y descarga el historial de compras en formato CSV (con BOM UTF-8 para Excel).
 */
export function exportPurchasesToCSV(purchases: Purchase[], filename?: string): void {
  const csv = generatePurchasesCSV(purchases)
  // \uFEFF asegura que Excel reconozca caracteres en español y tildes
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
  const actualName = filename || `compras-${getCurrentDate()}.csv`
  downloadBlob(blob, actualName)
}

export interface ExportReportPDFOptions {
  month: string
  comparison: MonthlyComparison
  categories: CategorySpending[]
}

/**
 * Exporta el reporte mensual detallado a un documento PDF descargable.
 */
export async function exportReportToPDF({
  month,
  comparison,
  categories,
}: ExportReportPDFOptions): Promise<void> {
  const { default: jsPDF } = await import('jspdf')
  const doc = new jsPDF()

  // Cabecera estilizada
  doc.setFillColor(15, 15, 18) // Fondo oscuro de marca #0F0F12
  doc.rect(0, 0, 210, 36, 'F')

  doc.setTextColor(16, 185, 129) // Verde de marca #10B981
  doc.setFontSize(18)
  doc.text('Mercado Inteligente', 14, 18)

  doc.setTextColor(249, 250, 251) // Blanco
  doc.setFontSize(11)
  doc.text(`Reporte Mensual de Gastos — ${month}`, 14, 28)

  // Caja de métricas KPI
  doc.setFillColor(243, 244, 246)
  doc.roundedRect(14, 44, 182, 38, 3, 3, 'F')

  doc.setTextColor(107, 114, 128)
  doc.setFontSize(9)
  doc.text('Total Gastado', 20, 52)
  doc.text('Presupuesto Mensual', 20, 64)
  doc.text('N° de Compras', 20, 74)

  doc.setTextColor(17, 24, 39)
  doc.setFontSize(10)
  doc.text(`$${comparison.currentSpent.toLocaleString()}`, 20, 58)
  doc.text(
    comparison.currentBudget !== null
      ? `$${comparison.currentBudget.toLocaleString()}`
      : 'Sin presupuesto asignado',
    20,
    70
  )
  doc.text(`${comparison.purchaseCount} registradas`, 20, 79)

  doc.setTextColor(107, 114, 128)
  doc.setFontSize(9)
  doc.text('Mes Anterior', 110, 52)
  doc.text('Variación de Gasto', 110, 64)
  doc.text('Ticket Promedio', 110, 74)

  doc.setTextColor(17, 24, 39)
  doc.setFontSize(10)
  doc.text(`$${comparison.previousSpent.toLocaleString()}`, 110, 58)
  doc.text(
    `${comparison.percentageChange > 0 ? '+' : ''}${comparison.percentageChange}%`,
    110,
    70
  )
  doc.text(`$${comparison.averageTicket.toLocaleString()}`, 110, 79)

  // Sección de desglose de categorías
  doc.setTextColor(17, 24, 39)
  doc.setFontSize(13)
  doc.text('Desglose de Gastos por Categoría', 14, 96)

  // Encabezados de tabla
  doc.setFillColor(229, 231, 235)
  doc.rect(14, 102, 182, 8, 'F')
  doc.setFontSize(9)
  doc.setTextColor(75, 85, 99)
  doc.text('Categoría', 18, 107)
  doc.text('Total Gastado', 85, 107)
  doc.text('% del Total', 135, 107)
  doc.text('N° Ítems', 170, 107)

  // Filas de categorías
  let y = 117
  for (const cat of categories) {
    if (y > 270) {
      doc.addPage()
      y = 20
    }
    doc.setFontSize(9)
    doc.setTextColor(31, 41, 55)
    doc.text(cat.categoryName, 18, y)
    doc.text(`$${cat.total.toLocaleString()}`, 85, y)
    doc.text(`${cat.percentage}%`, 135, y)
    doc.text(`${cat.itemCount}`, 170, y)
    y += 8
  }

  // Pie de página
  doc.setFontSize(8)
  doc.setTextColor(156, 163, 175)
  doc.text(`Generado el ${new Date().toLocaleDateString()} — Mercado Inteligente`, 14, 288)

  doc.save(`reporte-${month}.pdf`)
}

