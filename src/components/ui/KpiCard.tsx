import React from 'react'

interface KpiCardProps {
  icon: string
  value: string
  label: string
  color?: 'green' | 'amber' | 'red'
}

export function KpiCard({
  icon,
  value,
  label,
  color = 'green',
  ...props
}: KpiCardProps & React.HTMLAttributes<HTMLDivElement>) {
  const colorBorders = {
    green: 'border-accent-green/30',
    amber: 'border-accent-amber/30',
    red: 'border-accent-red/30',
  }

  return (
    <div
      className={`bg-surface border ${colorBorders[color]} rounded-radius-lg p-4
      flex flex-col items-center gap-2
      hover:scale-[1.02] hover:shadow-glow transition-fast cursor-default`}
      {...props}
    >
      <span className="text-2xl">{icon}</span>
      <span className="text-3xl font-extrabold text-text-primary">{value}</span>
      <span className="text-sm text-text-secondary">{label}</span>
    </div>
  )
}
