import type { Category } from '@/types'
import { CategoryIcon } from '@/config/categoryIcons'

interface CategoryBadgeProps {
  category: Category
  editable?: boolean
  onEdit?: () => void
}

const CATEGORY_COLORS: Record<string, { bg: string; text: string }> = {
  'lacteos': { bg: 'bg-blue-500/20', text: 'text-blue-300' },
  'panaderia': { bg: 'bg-amber-500/20', text: 'text-amber-300' },
  'carnes': { bg: 'bg-red-500/20', text: 'text-red-300' },
  'frutas-verduras': { bg: 'bg-green-500/20', text: 'text-green-300' },
  'bebidas': { bg: 'bg-cyan-500/20', text: 'text-cyan-300' },
  'limpieza': { bg: 'bg-purple-500/20', text: 'text-purple-300' },
  'higiene': { bg: 'bg-pink-500/20', text: 'text-pink-300' },
  'snacks': { bg: 'bg-orange-500/20', text: 'text-orange-300' },
  'otro': { bg: 'bg-gray-500/20', text: 'text-gray-300' },
}

const DEFAULT_COLORS = { bg: 'bg-gray-500/20', text: 'text-gray-300' }

export function CategoryBadge({ category, editable, onEdit }: CategoryBadgeProps) {
  const colors = CATEGORY_COLORS[category.id] ?? DEFAULT_COLORS

  return (
    <span
      title={category.name}
      className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium border ${colors.bg} ${colors.text} ${editable ? 'cursor-pointer hover:opacity-80' : ''}`}
      onClick={editable ? onEdit : undefined}
    >
      <span
        data-testid={`category-icon-${category.id}`}
        className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-bg-surface/60"
      >
        <CategoryIcon icon={category.icon} size={12} />
      </span>
      <span>{category.name}</span>
    </span>
  )
}
