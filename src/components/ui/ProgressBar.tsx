// src/components/ui/ProgressBar.tsx
import React from 'react'

interface ProgressBarProps {
  percentage: number
  color?: 'green' | 'amber' | 'red'
  showLabel?: boolean
}

export function ProgressBar({
  percentage,
  color = 'green',
  showLabel = false,
  ...props
}: ProgressBarProps & React.HTMLAttributes<HTMLDivElement>) {
  const clampedPercentage = Math.min(100, Math.max(0, percentage))

  const colorStyles = {
    green: 'bg-gradient-to-r from-accent-green to-accent-success',
    amber: 'bg-accent-amber',
    red: 'bg-accent-red',
  }

  // Extract data-testid from props to apply to inner fill bar
  const { 'data-testid': testId, ...restProps } = props

  return (
    <div className="relative" {...restProps}>
      {showLabel && (
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs text-text-secondary">{clampedPercentage}%</span>
        </div>
      )}
      <div className="bg-bg-elevated rounded-radius-full h-3 overflow-hidden">
        <div
          data-testid={testId}
          className={`${colorStyles[color]} h-full rounded-radius-full transition-all duration-500 ease-out`}
          style={{ width: `${clampedPercentage}%` }}
        />
      </div>
    </div>
  )
}