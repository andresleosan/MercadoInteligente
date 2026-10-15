import React from 'react'
import type { CategorySpending } from '@/services/reports'
import { CategoryIcon } from '@/config/categoryIcons'

interface Props {
  categories: CategorySpending[]
}

export const CategoryBreakdownTable: React.FC<Props> = ({ categories }) => {
  if (categories.length === 0) {
    return (
      <div className="text-center py-6 text-text-muted text-sm">
        No hay productos categorizados para este mes.
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-border-subtle text-xs text-text-muted">
            <th className="pb-3 font-medium">Categoría</th>
            <th className="pb-3 font-medium text-center">Unidades</th>
            <th className="pb-3 font-medium text-right">Gasto</th>
            <th className="pb-3 font-medium text-right w-28">Participación</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border-subtle/50">
          {categories.map((cat) => (
            <tr key={cat.categoryId} className="hover:bg-bg-elevated/40 transition-colors">
              <td className="py-3 pr-2">
                <div className="flex items-center gap-2.5">
                  <span
                    className="inline-flex h-7 w-7 items-center justify-center rounded-full shrink-0"
                    style={{ backgroundColor: `${cat.color}25`, color: cat.color }}
                  >
                    <CategoryIcon icon={cat.icon} size={14} />
                  </span>
                  <span className="font-medium text-text-primary text-xs sm:text-sm">
                    {cat.categoryName}
                  </span>
                </div>
              </td>
              <td className="py-3 px-2 text-center text-xs text-text-secondary">
                {cat.itemCount} {cat.itemCount === 1 ? 'ud' : 'uds'}
              </td>
              <td className="py-3 px-2 text-right font-semibold text-text-primary text-xs sm:text-sm">
                ${cat.total.toLocaleString()}
              </td>
              <td className="py-3 pl-2 text-right">
                <div className="flex flex-col items-end gap-1">
                  <span className="text-xs font-medium text-text-secondary">
                    {cat.percentage}%
                  </span>
                  <div className="w-full bg-bg-elevated rounded-full h-1.5 overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${Math.min(100, Math.max(0, cat.percentage))}%`,
                        backgroundColor: cat.color,
                      }}
                    />
                  </div>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

