// src/components/ui/ProgressBar.test.tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ProgressBar } from './ProgressBar'

describe('ProgressBar', () => {
  it('renders with percentage label when showLabel=true', () => {
    render(<ProgressBar percentage={50} showLabel />)
    expect(screen.getByText('50%')).toBeInTheDocument()
  })

  it('does not render label when showLabel=false', () => {
    render(<ProgressBar percentage={50} />)
    expect(screen.queryByText('50%')).not.toBeInTheDocument()
  })

  it('applies correct width to fill bar', () => {
    render(<ProgressBar percentage={75} data-testid="fill" />)
    const fill = screen.getByTestId('fill')
    expect(fill.style.width).toBe('75%')
  })

  it('applies green gradient by default', () => {
    render(<ProgressBar percentage={50} data-testid="fill" />)
    const fill = screen.getByTestId('fill')
    expect(fill.className).toContain('from-accent-green')
    expect(fill.className).toContain('to-accent-success')
  })

  it('applies amber color', () => {
    render(<ProgressBar percentage={50} color="amber" data-testid="fill" />)
    const fill = screen.getByTestId('fill')
    expect(fill.className).toContain('bg-accent-amber')
  })

  it('applies red color', () => {
    render(<ProgressBar percentage={50} color="red" data-testid="fill" />)
    const fill = screen.getByTestId('fill')
    expect(fill.className).toContain('bg-accent-red')
  })
})