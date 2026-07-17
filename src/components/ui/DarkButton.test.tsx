import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { DarkButton } from './DarkButton'

describe('DarkButton', () => {
  it('renders children', () => {
    render(<DarkButton>Click me</DarkButton>)
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })

  it('calls onClick when clicked', () => {
    const onClick = vi.fn()
    render(<DarkButton onClick={onClick}>Click</DarkButton>)
    fireEvent.click(screen.getByText('Click'))
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('applies primary variant styles by default', () => {
    render(<DarkButton data-testid="btn">Click</DarkButton>)
    const btn = screen.getByTestId('btn')
    expect(btn.className).toContain('from-accent-green')
    expect(btn.className).toContain('to-accent-success')
  })

  it('applies secondary variant styles', () => {
    render(<DarkButton variant="secondary" data-testid="btn">Click</DarkButton>)
    const btn = screen.getByTestId('btn')
    expect(btn.className).toContain('bg-transparent')
    expect(btn.className).toContain('border-border-subtle')
  })

  it('applies danger variant styles', () => {
    render(<DarkButton variant="danger" data-testid="btn">Click</DarkButton>)
    const btn = screen.getByTestId('btn')
    expect(btn.className).toContain('bg-accent-red')
  })

  it('applies size sm', () => {
    render(<DarkButton size="sm" data-testid="btn">Click</DarkButton>)
    const btn = screen.getByTestId('btn')
    expect(btn.className).toContain('px-3')
    expect(btn.className).toContain('py-1.5')
    expect(btn.className).toContain('text-sm')
  })

  it('applies size md by default', () => {
    render(<DarkButton data-testid="btn">Click</DarkButton>)
    const btn = screen.getByTestId('btn')
    expect(btn.className).toContain('px-4')
    expect(btn.className).toContain('py-2')
    expect(btn.className).toContain('text-sm')
  })

  it('applies size lg', () => {
    render(<DarkButton size="lg" data-testid="btn">Click</DarkButton>)
    const btn = screen.getByTestId('btn')
    expect(btn.className).toContain('px-6')
    expect(btn.className).toContain('py-3')
    expect(btn.className).toContain('text-base')
  })

  it('is disabled when disabled prop is true', () => {
    render(<DarkButton disabled data-testid="btn">Click</DarkButton>)
    const btn = screen.getByTestId('btn')
    expect(btn).toBeDisabled()
    expect(btn.className).toContain('opacity-50')
    expect(btn.className).toContain('cursor-not-allowed')
  })
})
