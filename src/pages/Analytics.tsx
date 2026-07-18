import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useNavigate } from 'react-router-dom'
import StoreAnalytics from '@/components/StoreAnalytics'
import { getCurrentMonth } from '@/utils/date'
import { ArrowLeft, BarChart3 } from 'lucide-react'

export default function Analytics() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth)

  if (!user) return null

  return (
    <div className="min-h-screen bg-bg-base">
      {/* Header */}
      <header className="bg-bg-header border-b border-border-subtle">
        <div className="max-w-[640px] mx-auto px-4 h-14 flex items-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-1.5 text-xs text-text-secondary hover:text-text-primary transition-colors"
          >
            <ArrowLeft size={16} />
            Volver
          </button>
          <div className="flex items-center gap-2">
            <BarChart3 size={18} className="text-accent-green" />
            <span className="text-sm font-semibold text-text-primary">Analítica</span>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-[640px] mx-auto px-4 py-5">
        {/* Selector de mes */}
        <div className="mb-4">
          <label className="block text-xs font-medium text-text-secondary mb-1.5">Mes</label>
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="w-full h-10 px-3 bg-bg-input border border-border-subtle rounded-radius-sm text-sm text-text-primary focus:outline-none focus:border-accent-green transition-colors"
          />
        </div>

        <StoreAnalytics userId={user.uid} selectedMonth={selectedMonth} />
      </main>
    </div>
  )
}
