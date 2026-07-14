import { useState, lazy, Suspense } from 'react'

const ChartsContent = lazy(() => import('./ChartsContent'))

interface Props {
  userId: string
  selectedMonth: string
}

export default function ChartsSection({ userId, selectedMonth }: Props) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div>
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full bg-white rounded-lg shadow p-4 text-left flex justify-between items-center hover:bg-gray-50"
      >
        <span className="text-lg font-semibold text-gray-900">
          {expanded ? 'Ocultar gráficos' : 'Ver gráficos'}
        </span>
        <span className="text-gray-400">{expanded ? '\u25B2' : '\u25BC'}</span>
      </button>

      {expanded && (
        <div className="mt-4">
          <Suspense
            fallback={
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
              </div>
            }
          >
            <ChartsContent userId={userId} selectedMonth={selectedMonth} />
          </Suspense>
        </div>
      )}
    </div>
  )
}
