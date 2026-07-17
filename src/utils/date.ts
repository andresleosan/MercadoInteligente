export function getCurrentMonth(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

export function getCurrentDate(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
}

export function formatDate(date: string): string {
  const [year, month, day] = date.split('-').map(Number)
  const dateObj = new Date(year!, month! - 1, day)
  return dateObj.toLocaleDateString('es-AR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

export function formatDateShort(date: string): string {
  const [year, month, day] = date.split('-').map(Number)
  const dateObj = new Date(year!, month! - 1, day)
  return dateObj.toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

export function getDateRange(daysBack: number): { start: string; end: string } {
  const end = new Date()
  const start = new Date()
  start.setDate(start.getDate() - daysBack)

  return {
    start: `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, '0')}-${String(start.getDate()).padStart(2, '0')}`,
    end: `${end.getFullYear()}-${String(end.getMonth() + 1).padStart(2, '0')}-${String(end.getDate()).padStart(2, '0')}`,
  }
}

export function isToday(date: string): boolean {
  return date === getCurrentDate()
}

export function daysBetween(date1: string, date2: string): number {
  const [y1, m1, d1] = date1.split('-').map(Number)
  const [y2, m2, d2] = date2.split('-').map(Number)
  const d1Obj = new Date(y1!, m1! - 1, d1)
  const d2Obj = new Date(y2!, m2! - 1, d2)
  const diffTime = Math.abs(d2Obj.getTime() - d1Obj.getTime())
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}
