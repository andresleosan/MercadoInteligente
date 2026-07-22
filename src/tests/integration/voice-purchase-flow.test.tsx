import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import AddPurchase from '@/pages/AddPurchase'

const routerMocks = vi.hoisted(() => ({
  navigate: vi.fn(),
}))

vi.mock('@/hooks/useAuth', () => ({
  useAuth: vi.fn(() => ({ user: { uid: 'test-uid' }, loading: false })),
}))

vi.mock('react-router-dom', () => ({
  useNavigate: () => routerMocks.navigate,
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

const mockStartListening = vi.fn()
const mockReset = vi.fn()

vi.mock('@/hooks/useVoice', () => ({
  useVoice: vi.fn(() => ({
    status: 'idle',
    items: [],
    transcript: '',
    error: null,
    startListening: mockStartListening,
    reset: mockReset,
  })),
}))

vi.mock('@/components/VoiceCapture', () => ({
  default: ({ onDone, onBack }: { onDone: (items: any[]) => void; onBack: () => void }) => (
    <div data-testid="voice-capture">
      <button data-testid="voice-done" onClick={() => onDone([
        { name: 'Leche', unitPrice: 1200, quantity: 1, totalPrice: 1200, confidence: 100 },
        { name: 'Pan', unitPrice: 500, quantity: 2, totalPrice: 1000, confidence: 90 },
      ])}>
        Voice Done
      </button>
      <button data-testid="voice-back" onClick={onBack}>Volver</button>
    </div>
  ),
}))

vi.mock('@/services/purchases', () => ({
  addPurchase: vi.fn().mockResolvedValue({ id: 'new-id' }),
}))

vi.mock('@/services/categorizer', () => ({
  suggestCategory: vi.fn().mockResolvedValue(null),
  normalizeProductName: (name: string) => name.toLowerCase().trim(),
}))

vi.mock('@/services/categoryMapping', () => ({
  getCategoryForProduct: vi.fn().mockResolvedValue(null),
  saveCategoryMapping: vi.fn().mockResolvedValue(undefined),
}))

vi.mock('@/hooks/useCategories', () => ({
  useCategories: () => ({
    categories: [],
    loading: false,
    error: null,
    create: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
    refresh: vi.fn(),
  }),
}))

describe('Voice → Purchase Integration', () => {
  beforeEach(() => {
    localStorage.clear()
    routerMocks.navigate.mockReset()
    vi.clearAllMocks()
  })

  it('navigates from manual to voice mode when voice button clicked', () => {
    render(<AddPurchase />)

    fireEvent.click(screen.getByText(/registrar por voz/i))
    expect(screen.getByTestId('voice-capture')).toBeInTheDocument()
  })

  it('transitions to review mode when voice capture completes', async () => {
    render(<AddPurchase />)

    fireEvent.click(screen.getByText(/registrar por voz/i))
    fireEvent.click(screen.getByTestId('voice-done'))

    await waitFor(() => {
      expect(screen.getByText('Revisá los productos')).toBeInTheDocument()
      expect(screen.getByText('Leche')).toBeInTheDocument()
      expect(screen.getByText('Pan')).toBeInTheDocument()
    })
  })

  it('saves voice-parsed items as purchase and shows success', async () => {
    const { addPurchase } = await import('@/services/purchases')

    render(<AddPurchase />)

    fireEvent.click(screen.getByText(/registrar por voz/i))
    fireEvent.click(screen.getByTestId('voice-done'))

    await waitFor(() => {
      expect(screen.getByText('Revisá los productos')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole('button', { name: /guardar compra/i }))

    await waitFor(() => {
      expect(addPurchase).toHaveBeenCalledWith(
        'test-uid',
        [
          { name: 'Leche', unitPrice: 1200, quantity: 1, totalPrice: 1200, confidence: 100 },
          { name: 'Pan', unitPrice: 500, quantity: 2, totalPrice: 1000, confidence: 90 },
        ],
        undefined,
        undefined,
        undefined,
        expect.any(String)
      )
      expect(screen.getByText('Compra registrada correctamente')).toBeInTheDocument()
    })
  })

  it('returns to manual mode when back is pressed from voice', () => {
    render(<AddPurchase />)

    fireEvent.click(screen.getByText(/registrar por voz/i))
    expect(screen.getByTestId('voice-capture')).toBeInTheDocument()

    fireEvent.click(screen.getByTestId('voice-back'))

    expect(screen.getByText(/registrar por foto/i)).toBeInTheDocument()
    expect(screen.getByText(/registrar por voz/i)).toBeInTheDocument()
  })

  it('returns to voice mode when retry is pressed from review', async () => {
    render(<AddPurchase />)

    fireEvent.click(screen.getByText(/registrar por voz/i))
    fireEvent.click(screen.getByTestId('voice-done'))

    await waitFor(() => {
      expect(screen.getByText('Revisá los productos')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole('button', { name: /reintentar/i }))
    expect(screen.getByTestId('voice-capture')).toBeInTheDocument()
  })
})
