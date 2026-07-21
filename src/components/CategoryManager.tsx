import { useCategories } from '@/hooks/useCategories'
import { CategoryBadge } from './CategoryBadge'

interface CategoryManagerProps {
  userId: string
}

export function CategoryManager({ userId }: CategoryManagerProps) {
  const { categories, loading, remove } = useCategories(userId)

  if (loading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-12 bg-bg-elevated rounded-radius-sm animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {categories.map(category => (
        <div
          key={category.id}
          className="flex items-center justify-between p-3 bg-bg-elevated rounded-radius-md"
        >
          <CategoryBadge category={category} />
          {!category.isDefault && (
            <button
              onClick={() => remove(category.id)}
              className="text-text-muted hover:text-accent-red text-sm"
            >
              ×
            </button>
          )}
        </div>
      ))}
    </div>
  )
}
