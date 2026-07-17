import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { DarkInput } from './DarkInput'

describe('DarkInput', () => {
  it('renders input', () => {
    render(<DarkInput value="" onChange={vi.fn()} />)
    expect(screen.getByRole('textbox')).toBeInTheDocument()
  })

  it('renders label when provided', () => {
    render(<DarkInput label="Email" value="" onChange={vi.fn()} />)
    expect(screen.getByText('Email')).toBeInTheDocument()
  })

  it('renders prefix when provided', () => {
    render(<DarkInput prefix="$" value="" onChange={vi.fn()} />)
    expect(screen.getByText('$')).toBeInTheDocument()
  })

  it('calls onChange when typing', () => {
    const onChange = vi.fn()
    render(<DarkInput value="" onChange={onChange} />)
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'test' } })
    expect(onChange).toHaveBeenCalledTimes(1)
  })

  it('renders error when provided', () => {
    render(<DarkInput error="Required" value="" onChange={vi.fn()} />)
    expect(screen.getByText('Required')).toBeInTheDocument()
  })

  it('applies error styles to input', () => {
    render(<DarkInput error="Invalid" value="" onChange={vi.fn()} data-testid="input" />)
    const input = screen.getByTestId('input')
    expect(input.className).toContain('border-accent-red')
  })

  it('applies placeholder', () => {
    render(<DarkInput placeholder="Enter email" value="" onChange={vi.fn()} />)
    expect(screen.getByPlaceholderText('Enter email')).toBeInTheDocument()
  })

  it('applies custom className', () => {
    render(<DarkInput className="custom" value="" onChange={vi.fn()} data-testid="input" />)
    const input = screen.getByTestId('input')
    expect(input.className).toContain('custom')
  })
})
