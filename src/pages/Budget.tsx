import { getCurrentDate } from '@/utils/date'
import DailyBudgetCard from '@/components/DailyBudgetCard'

interface Props {
  month?: string
  date?: string
  onSaved?: () => void
  familyId?: string
}

export default function BudgetPage({ month, date, onSaved, familyId }: Props) {
  const targetDate = date || (month ? `${month}-${new Date().getDate().toString().padStart(2, '0')}` : getCurrentDate())

  return (
    <DailyBudgetCard
      date={targetDate}
      onBudgetChange={onSaved}
      familyId={familyId}
    />
  )
}
