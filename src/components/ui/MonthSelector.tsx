import React from 'react'

const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
]

interface MonthSelectorProps {
  currentMonth: Date
  onMonthChange: (date: Date) => void
}

function shiftMonth(date: Date, delta: number): Date {
  const newDate = new Date(date)
  newDate.setMonth(newDate.getMonth() + delta)
  return newDate
}

function formatLabel(date: Date): string {
  return `${MONTH_NAMES[date.getMonth()]} ${date.getFullYear()}`
}

export function MonthSelector({
  currentMonth,
  onMonthChange,
  ...props
}: MonthSelectorProps & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`bg-bg-surface rounded-radius-lg p-4 flex items-center justify-between ${props.className || ''}`}
      {...props}
    >
      <button
        type="button"
        aria-label="Mes anterior"
        onClick={() => onMonthChange(shiftMonth(currentMonth, -1))}
        className="bg-bg-elevated rounded-radius-md p-2 hover:bg-border-subtle transition-fast text-text-primary focus:ring-2 focus:ring-accent-green focus:ring-offset-2 focus:ring-offset-bg-base"
      >
        ←
      </button>
      <span className="text-xl font-semibold text-text-primary">
        {formatLabel(currentMonth)}
      </span>
      <button
        type="button"
        aria-label="Mes siguiente"
        onClick={() => onMonthChange(shiftMonth(currentMonth, 1))}
        className="bg-bg-elevated rounded-radius-md p-2 hover:bg-border-subtle transition-fast text-text-primary focus:ring-2 focus:ring-accent-green focus:ring-offset-2 focus:ring-offset-bg-base"
      >
        →
      </button>
    </div>
  )
}