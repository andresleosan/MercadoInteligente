import { type ReactNode, useState } from 'react'
import { ChevronDown } from 'lucide-react'

interface ExpandableCardProps {
  title: string
  icon: ReactNode
  defaultExpanded?: boolean
  children: ReactNode
}

export default function ExpandableCard({
  title,
  icon,
  defaultExpanded = false,
  children,
}: ExpandableCardProps) {
  const [expanded, setExpanded] = useState(defaultExpanded)

  return (
    <div className="bg-surface rounded-radius-md shadow-card border border-border-subtle overflow-hidden">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-4 py-3.5 text-left transition-colors duration-200 hover:bg-elevated"
        aria-expanded={expanded}
      >
        <div className="flex items-center gap-3">
          <span className="text-accent-green">{icon}</span>
          <span className="text-sm font-semibold text-text-primary">{title}</span>
        </div>
        <ChevronDown
          size={18}
          className={`text-text-muted animate-chevron ${expanded ? 'rotate-180' : ''}`}
        />
      </button>

      {expanded && (
        <div className="animate-slide-down px-4 pb-4">
          {children}
        </div>
      )}
    </div>
  )
}
