import type { Store } from '@/types'

interface StoreBadgeProps {
  store: Store
  size?: 'sm' | 'md' | 'lg'
  showIcon?: boolean
}

export default function StoreBadge({ store, size = 'md', showIcon = true }: StoreBadgeProps) {
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3 py-1.5',
  }

  const iconSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium ${sizeClasses[size]}`}
      style={{
        backgroundColor: store.color ? `${store.color}20` : 'rgba(107, 114, 128, 0.2)',
        color: store.color || '#6B7280',
        border: `1px solid ${store.color ? `${store.color}40` : 'rgba(107, 114, 128, 0.3)'}`,
      }}
    >
      {showIcon && store.icon && (
        <span className={iconSizes[size]}>{store.icon}</span>
      )}
      {store.name}
    </span>
  )
}
