import React from 'react'
import { DarkButton } from './DarkButton'

interface EmptyStateProps {
  icon: string
  title: string
  description: string
  action?: {
    label: string
    onClick: () => void
  }
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <span className="text-6xl mb-4">{icon}</span>
      <h3 className="text-lg font-semibold text-text-primary mb-2">{title}</h3>
      <p className="text-sm text-text-secondary text-center max-w-sm mb-6">{description}</p>
      {action && (
        <DarkButton onClick={action.onClick}>{action.label}</DarkButton>
      )}
    </div>
  )
}