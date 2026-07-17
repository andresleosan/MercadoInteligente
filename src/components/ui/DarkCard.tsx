import React from 'react'

interface DarkCardProps {
  children: React.ReactNode
  className?: string
  variant?: 'primary' | 'secondary'
  hover?: boolean
}

export function DarkCard({
  children,
  className = '',
  variant = 'primary',
  hover = false,
  ...props
}: DarkCardProps & React.HTMLAttributes<HTMLDivElement>) {
  const baseStyles = 'border border-border-subtle shadow-card transition-fast'

  const variants = {
    primary: 'bg-surface rounded-radius-xl',
    secondary: 'bg-elevated rounded-radius-lg',
  }

  const hoverStyles = hover
    ? 'hover:shadow-elevated hover:scale-[1.01] cursor-pointer'
    : ''

  return (
    <div
      className={`${baseStyles} ${variants[variant]} ${hoverStyles} ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}
