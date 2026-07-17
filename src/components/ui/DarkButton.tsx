import React from 'react'

interface DarkButtonProps {
  children: React.ReactNode
  variant?: 'primary' | 'secondary' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  onClick?: () => void
  type?: 'button' | 'submit'
  className?: string
}

export function DarkButton({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  onClick,
  type = 'button',
  className = '',
  ...props
}: DarkButtonProps & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const baseStyles = 'font-medium rounded-radius-md transition-fast focus:ring-2 focus:ring-accent-green focus:ring-offset-2 focus:ring-offset-bg-base'

  const variants = {
    primary: 'bg-gradient-to-r from-accent-green to-accent-success text-white hover:brightness-110',
    secondary: 'bg-transparent border border-border-subtle text-text-primary hover:bg-elevated',
    danger: 'bg-accent-red text-white hover:brightness-110',
  }

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  }

  const disabledStyles = disabled ? 'opacity-50 cursor-not-allowed' : ''

  return (
    <button
      type={type}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${disabledStyles} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
