import React from 'react'
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts'
import type { MonthlyTrend } from '@/services/reports'

interface Props {
  data: MonthlyTrend[]
}

export const MonthlyTrendChart: React.FC<Props> = ({ data }) => {
  if (data.length === 0 || data.every((d) => d.spent === 0 && d.budget === null)) {
    return (
      <div className="flex flex-col items-center justify-center h-56 text-text-muted text-sm">
        <span>No hay suficiente historial de compras para mostrar la tendencia</span>
      </div>
    )
  }

  const chartData = data.map((d) => ({
    name: d.monthLabel.split(' ')[0], // 'Enero' instead of 'Enero 2026' for compact axis
    fullMonth: d.monthLabel,
    Gastado: d.spent,
    Presupuesto: d.budget,
  }))

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" vertical={false} />
          <XAxis
            dataKey="name"
            stroke="#9CA3AF"
            tick={{ fill: '#9CA3AF', fontSize: 11 }}
            axisLine={{ stroke: 'rgba(255,255,255,0.08)' }}
            tickLine={false}
          />
          <YAxis
            stroke="#9CA3AF"
            tick={{ fill: '#9CA3AF', fontSize: 11 }}
            axisLine={{ stroke: 'rgba(255,255,255,0.08)' }}
            tickLine={false}
            tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
          />
          <Tooltip
            formatter={(value, name) => [
              `$${Number(value || 0).toLocaleString()}`,
              String(name || ''),
            ]}
            labelFormatter={(_, payload) => payload?.[0]?.payload?.fullMonth || ''}
            contentStyle={{
              backgroundColor: '#111827',
              borderColor: 'rgba(255,255,255,0.08)',
              borderRadius: '8px',
              color: '#F9FAFB',
              fontSize: '12px',
            }}
          />
          <Legend
            verticalAlign="top"
            align="right"
            wrapperStyle={{ paddingBottom: '10px', fontSize: '12px' }}
          />
          <Bar dataKey="Gastado" fill="#10B981" radius={[4, 4, 0, 0]} maxBarSize={40} />
          <Line
            dataKey="Presupuesto"
            stroke="#F59E0B"
            strokeWidth={2}
            dot={{ r: 3, fill: '#F59E0B' }}
            connectNulls
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}
