import { lazy, Suspense } from 'react'
import { Loader2 } from 'lucide-react'

const ChartsContent = lazy(() => import('./ChartsContent'))

interface Props {
  userId: string
  selectedMonth: string
}

export default function ChartsSection({ userId, selectedMonth }: Props) {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center py-8">
          <Loader2 className="animate-spin text-accent-green" size={24} />
        </div>
      }
    >
      <ChartsContent userId={userId} selectedMonth={selectedMonth} />
    </Suspense>
  )
}
