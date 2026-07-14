import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AddPurchase from './AddPurchase'

vi.mock('@/hooks/useAuth', () => ({
  useAuth: vi.fn(() => ({ user: { uid: 'test-uid' }, loading: false })),
}))

vi.mock('@/hooks/useOCR', () => ({
  useOCR: vi.fn(() => ({
    status: 'idle',
    items: [],
    imageUrl: null,
    error: null,
    processTicket: vi.fn(),
    reset: vi.fn(),
  })),
}))

vi.mock('@/hooks/useVoice', () => ({
  useVoice: vi.fn(() => ({
    status: 'idle',
    items: [],
    transcript: '',
    error: null,
    startListening: vi.fn(),
    reset: vi.fn(),
  })),
}))

vi.mock('@/components/VoiceCapture', () => ({
  default: ({ onDone }: any) => (
    <button onClick={() => onDone([{ name: 'Leche', unitPrice: 1200, quantity: 1, totalPrice: 1200, confidence: 100 }])}>
      VoiceCaptureMock
    </button>
  ),
}))

describe('AddPurchase', () => {
  it('renderiza botones de foto y voz en modo manual', () => {
    render(<AddPurchase />)
    expect(screen.getByText(/registrar por foto/i)).toBeTruthy()
    expect(screen.getByText(/registrar por voz/i)).toBeTruthy()
  })

  it('al hacer clic en voz, cambia a modo voice', async () => {
    render(<AddPurchase />)
    const user = userEvent.setup()
    await user.click(screen.getByText(/registrar por voz/i))
    expect(screen.getByText('VoiceCaptureMock')).toBeTruthy()
  })

  it('vuelve a manual con boton Volver desde voz', async () => {
    render(<AddPurchase />)
    const user = userEvent.setup()
    await user.click(screen.getByText(/registrar por voz/i))
    await user.click(screen.getByText('VoiceCaptureMock'))
    expect(await screen.findByText(/Leche/)).toBeTruthy()
  })
})
