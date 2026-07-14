import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import VoiceCapture from './VoiceCapture'

const { mockUseVoice } = vi.hoisted(() => ({
  mockUseVoice: vi.fn(),
}))

vi.mock('@/hooks/useVoice', () => ({
  useVoice: mockUseVoice,
}))

describe('VoiceCapture', () => {
  beforeEach(() => {
    mockUseVoice.mockReturnValue({
      status: 'idle',
      items: [],
      transcript: '',
      error: null,
      startListening: vi.fn(),
      reset: vi.fn(),
    })
  })

  it('renderiza estado idle', () => {
    render(<VoiceCapture onDone={vi.fn()} onBack={vi.fn()} />)
    expect(screen.getByText('Preparando microfono...')).toBeTruthy()
  })

  it('muestra transcripcion cuando cambia el texto', () => {
    mockUseVoice.mockReturnValue({
      status: 'listening',
      items: [],
      transcript: 'leche a 1200',
      error: null,
      startListening: vi.fn(),
      reset: vi.fn(),
    })

    render(<VoiceCapture onDone={vi.fn()} onBack={vi.fn()} />)
    expect(screen.getByText('leche a 1200')).toBeTruthy()
  })

  it('llama onDone cuando status es done', () => {
    const onDone = vi.fn()
    mockUseVoice.mockReturnValue({
      status: 'done',
      items: [{ name: 'Leche', unitPrice: 1200, quantity: 1, totalPrice: 1200, confidence: 100 }],
      transcript: 'leche a 1200',
      error: null,
      startListening: vi.fn(),
      reset: vi.fn(),
    })

    render(<VoiceCapture onDone={onDone} onBack={vi.fn()} />)
    expect(onDone).toHaveBeenCalledWith([
      expect.objectContaining({ name: 'Leche', unitPrice: 1200 }),
    ])
  })

  it('muestra mensaje de error', () => {
    mockUseVoice.mockReturnValue({
      status: 'error',
      items: [],
      transcript: '',
      error: 'Permiso de microfono denegado',
      startListening: vi.fn(),
      reset: vi.fn(),
    })

    render(<VoiceCapture onDone={vi.fn()} onBack={vi.fn()} />)
    expect(screen.getByText(/Permiso de microfono denegado/)).toBeTruthy()
  })
})
