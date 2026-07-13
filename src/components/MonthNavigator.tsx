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
        ←
      </button>
      <span className="text-lg font-semibold text-gray-900">{formatLabel(month)}</span>
      <button
        type="button"
        aria-label="Mes siguiente"
        onClick={() => onChange(shiftMonth(month, 1))}
        className="p-2 rounded-md text-gray-600 hover:bg-gray-100 text-xl"
      >
        →
      </button>
    </div>
  )
}
