
```tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import MonthNavigator from './MonthNavigator'

describe('MonthNavigator', () => {
  it('should render the month label in Spanish', () => {
    render(<MonthNavigator month="2026-07" onChange={vi.fn()} />)
    expect(screen.getByText('Julio 2026')).toBeInTheDocument()
  })

  it('should call onChange with previous month when left arrow clicked', () => {
    const onChange = vi.fn()
    render(<MonthNavigator month="2026-07" onChange={onChange} />)
    fireEvent.click(screen.getByRole('button', { name: /mes anterior/i }))
    expect(onChange).toHaveBeenCalledWith('2026-06')
  })

  it('should call onChange with next month when right arrow clicked', () => {
    const onChange = vi.fn()
    render(<MonthNavigator month="2026-07" onChange={onChange} />)
    fireEvent.click(screen.getByRole('button', { name: /mes siguiente/i }))
    expect(onChange).toHaveBeenCalledWith('2026-08')
  })

  it('should handle year change going back (January -> December previous year)', () => {
    const onChange = vi.fn()
    render(<MonthNavigator month="2026-01" onChange={onChange} />)
    fireEvent.click(screen.getByRole('button', { name: /mes anterior/i }))
    expect(onChange).toHaveBeenCalledWith('2025-12')
  })

  it('should handle year change going forward (December -> January next year)', () => {
    const onChange = vi.fn()
    render(<MonthNavigator month="2026-12" onChange={onChange} />)
    fireEvent.click(screen.getByRole('button', { name: /mes siguiente/i }))
    expect(onChange).toHaveBeenCalledWith('2027-01')
  })

  it('should render correct Spanish name for each month', () => {
    const cases: Array<[string, string]> = [
      ['2026-01', 'Enero 2026'],
      ['2026-02', 'Febrero 2026'],
      ['2026-03', 'Marzo 2026'],
      ['2026-04', 'Abril 2026'],
      ['2026-05', 'Mayo 2026'],
      ['2026-06', 'Junio 2026'],
      ['2026-07', 'Julio 2026'],
      ['2026-08', 'Agosto 2026'],
      ['2026-09', 'Septiembre 2026'],
      ['2026-10', 'Octubre 2026'],
      ['2026-11', 'Noviembre 2026'],
      ['2026-12', 'Diciembre 2026'],
    ]
    for (const [month, expected] of cases) {
      const { unmount } = render(<MonthNavigator month={month} onChange={vi.fn()} />)
      expect(screen.getByText(expected)).toBeInTheDocument()
      unmount()
    }
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/MonthNavigator.test.tsx`
Expected: FAIL con `Cannot find module './MonthNavigator'`.

- [ ] **Step 3: Write minimal implementation**

Crear `src/components/MonthNavigator.tsx`:

```tsx
interface Props {
  month: string
  onChange: (month: string) => void
}

const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

function shiftMonth(month: string, delta: number): string {
  const [year, monthNum] = month.split('-').map(Number)
  const date = new Date(year!, monthNum! - 1, 1)
  date.setMonth(date.getMonth() + delta)
  const newYear = date.getFullYear()
  const newMonth = date.getMonth() + 1
  return `${newYear}-${String(newMonth).padStart(2, '0')}`
}

function formatLabel(month: string): string {
  const [year, monthNum] = month.split('-').map(Number)
  return `${MONTHS[monthNum! - 1]} ${year}`
}

export default function MonthNavigator({ month, onChange }: Props) {
  return (
    <div className="flex items-center justify-between bg-white rounded-lg shadow p-4">
      <button
        type="button"
        aria-label="Mes anterior"
        onClick={() => onChange(shiftMonth(month, -1))}
        className="p-2 rounded-md text-gray-600 hover:bg-gray-100 text-xl"
      >
        â†
      </button>
      <span className="text-lg font-semibold text-gray-900">{formatLabel(month)}</span>
      <button
        type="button"
        aria-label="Mes siguiente"
        onClick={() => onChange(shiftMonth(month, 1))}