import type { Category } from '@/types'

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
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${colors.bg} ${colors.text} ${editable ? 'cursor-pointer hover:opacity-80' : ''}`}
      onClick={editable ? onEdit : undefined}
    >
      <span>{category.icon}</span>
      <span>{category.name}</span>
    </span>
  )
}
