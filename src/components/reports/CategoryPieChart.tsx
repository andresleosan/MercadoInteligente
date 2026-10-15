import React from 'react'
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts'
import type { CategorySpending } from '@/services/reports'

interface Props {
  data: CategorySpending[]
}

export const CategoryPieChart: React.FC<Props> = ({ data }) => {
  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-52 text-text-muted text-sm">
        <span>No hay gastos por categoría en este mes</span>
      </div>
    )
  }

  return (
    <div className="flex flex-col md:flex-row items-center gap-4">
      <div className="w-full md:w-1/2 h-56">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="total"
              nameKey="categoryName"
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={80}
              paddingAngle={2}
            >
              {data.map((entry) => (
                <Cell key={entry.categoryId} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value, name) => [
                `$${Number(value || 0).toLocaleString()}`,
                String(name || ''),
              ]}
              contentStyle={{
                backgroundColor: '#111827',
                borderColor: 'rgba(255,255,255,0.08)',
                borderRadius: '8px',
                color: '#F9FAFB',
                fontSize: '12px',
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="w-full md:w-1/2 flex flex-col gap-2 max-h-56 overflow-y-auto pr-1">
        {data.map((cat) => (
          <div
            key={cat.categoryId}
            className="flex items-center justify-between text-xs py-1 border-b border-border-subtle last:border-b-0"
          >
            <div className="flex items-center gap-2 truncate">
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: cat.color }}
              />
              <span className="text-text-primary font-medium truncate">{cat.categoryName}</span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-text-secondary font-semibold">${cat.total.toLocaleString()}</span>
              <span className="text-text-muted w-10 text-right">{cat.percentage}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
