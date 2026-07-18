import { getCurrentDate } from '@/utils/date'
import DailyBudgetCard from '@/components/DailyBudgetCard'

interface Props {
  month?: string
  date?: string
  onSaved?: () => void
}

export default function BudgetPage({ month, date, onSaved }: Props) {
  const targetDate = date || (month ? `${month}-${new Date().getDate().toString().padStart(2, '0')}` : getCurrentDate())

  return (
    <DailyBudgetCard
      date={targetDate}
      onBudgetChange={onSaved}
    />
  )
}
