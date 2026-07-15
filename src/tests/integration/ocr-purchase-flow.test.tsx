import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import AddPurchase from '@/pages/AddPurchase'

vi.mock('@/hooks/useAuth', () => ({
  useAuth: vi.fn(() => ({ user: { uid: 'test-uid' }, loading: false })),
}))

const mockProcessTicket = vi.fn()
const mockReset = vi.fn()

vi.mock('@/hooks/useOCR', () => ({
  useOCR: vi.fn(() => ({
    status: 'idle',
    items: [],
    imageUrl: null,
    error: null,
    processTicket: mockProcessTicket,
    reset: mockReset,
  })),
}))

vi.mock('@/services/purchases', () => ({
  addPurchase: vi.fn().mockResolvedValue({ id: 'new-id' }),
}))

describe('OCR → Purchase Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('transitions idle → photo mode → done → review when user clicks photo button and OCR completes', async () => {
    const mockUseOCR = (await import('@/hooks/useOCR')).useOCR

    vi.mocked(mockUseOCR).mockReturnValue({
      status: 'idle',
      items: [],
      imageUrl: null,
      error: null,
      processTicket: mockProcessTicket,
      reset: mockReset,
    })

    const { rerender } = render(<AddPurchase />)

    fireEvent.click(screen.getByText(/registrar por foto/i))

    vi.mocked(mockUseOCR).mockReturnValue({
      status: 'done',
      items: [{ name: 'Leche', unitPrice: 450, quantity: 1, totalPrice: 450, confidence: 90 }],
      imageUrl: 'https://example.com/ticket.jpg',
      error: null,
      processTicket: mockProcessTicket,
      reset: mockReset,
    })

    rerender(<AddPurchase />)

    await waitFor(() => {
      expect(screen.getByText('Revisá los productos')).toBeInTheDocument()
      expect(screen.getByText('Leche')).toBeInTheDocument()
    })
  })

  it('shows error state when OCR fails with retry and manual options', async () => {
    const mockUseOCR = (await import('@/hooks/useOCR')).useOCR

    vi.mocked(mockUseOCR).mockReturnValue({
      status: 'idle',
      items: [],
      imageUrl: null,
      error: null,
      processTicket: mockProcessTicket,
      reset: mockReset,
    })

    render(<AddPurchase />)

    fireEvent.click(screen.getByText(/registrar por foto/i))

    vi.mocked(mockUseOCR).mockReturnValue({
      status: 'error',
      items: [],
      imageUrl: null,
      error: 'No pudimos leer el ticket. Reintentar o cargar manualmente.',
      processTicket: mockProcessTicket,
      reset: mockReset,
    })

    const { rerender } = render(<AddPurchase />)

    expect(screen.getByText(/No pudimos leer el ticket/i)).toBeTruthy()
    expect(screen.getByText('Reintentar')).toBeTruthy()
    expect(screen.getByText('Cargar manualmente')).toBeTruthy()

    rerender(<AddPurchase />)
  })

  it('saves purchase from OCR review and shows success message', async () => {
    const { addPurchase } = await import('@/services/purchases')
    const mockUseOCR = (await import('@/hooks/useOCR')).useOCR

    vi.mocked(mockUseOCR).mockReturnValue({
      status: 'done',
      items: [
        { name: 'Leche', unitPrice: 450, quantity: 1, totalPrice: 450, confidence: 90 },
        { name: 'Pan', unitPrice: 100, quantity: 2, totalPrice: 200, confidence: 60 },
      ],
      imageUrl: 'https://example.com/ticket.jpg',
      error: null,
      processTicket: mockProcessTicket,
      reset: mockReset,
    })

    render(<AddPurchase />)

    await waitFor(() => {
      expect(screen.getByText('Revisá los productos')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole('button', { name: /guardar compra/i }))

    await waitFor(() => {
      expect(addPurchase).toHaveBeenCalledWith(
        'test-uid',
        [
          { name: 'Leche', unitPrice: 450, quantity: 1, totalPrice: 450, confidence: 90 },
          { name: 'Pan', unitPrice: 100, quantity: 2, totalPrice: 200, confidence: 60 },
        ],
        'https://example.com/ticket.jpg'
      )
      expect(mockReset).toHaveBeenCalled()
      expect(screen.getByText('Compra registrada correctamente')).toBeInTheDocument()
    })
  })
})
