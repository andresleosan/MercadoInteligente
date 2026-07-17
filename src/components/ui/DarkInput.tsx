import React from 'react'

interface DarkInputProps {
  label?: string
  error?: string
  prefix?: string
  type?: string
  value: string | number
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  placeholder?: string
  className?: string
}

export function DarkInput({
  label,
  error,
  prefix,
  type = 'text',
  value,
  onChange,
  placeholder,
  className = '',
  ...props
}: DarkInputProps & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="flex flex-col">
      {label && (
        <label htmlFor={props.id as string | undefined} className="text-sm text-text-secondary mb-1">{label}</label>
      )}
      <div className="flex items-center">
        {prefix && (
          <span className="text-text-muted mr-2">{prefix}</span>
        )}
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`flex-1 bg-bg-elevated border ${
            error ? 'border-accent-red' : 'border-border-subtle'
          } rounded-radius-md px-3 py-2 text-text-primary placeholder-text-muted
          focus:ring-2 focus:ring-accent-green focus:ring-offset-2 focus:ring-offset-bg-base
          focus:outline-none transition-fast ${className}`}
          {...props}
        />
      </div>
      {error && (
        <span className="text-sm text-accent-red mt-1">{error}</span>
      )}
    </div>
  )
}
