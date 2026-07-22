import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AddPurchase from './AddPurchase'

const routerMocks = vi.hoisted(() => ({
  navigate: vi.fn(),
}))

const mocks = vi.hoisted(() => ({
  storesList: [] as Array<{ id: string; userId: string; name: string; createdAt: Date }>,
  createStoreMock: vi.fn(),
  addPurchaseMock: vi.fn(),
}))

vi.mock('@/hooks/useAuth', () => ({
  useAuth: vi.fn(() => ({ user: { uid: 'test-uid' }, loading: false })),
}))

vi.mock('react-router-dom', () => ({
  useNavigate: () => routerMocks.navigate,
}))

vi.mock('@/hooks/useStores', () => ({
  useStores: vi.fn(() => ({
    stores: mocks.storesList,
    loading: false,
    error: null,
    create: mocks.createStoreMock,
    update: vi.fn(),
    remove: vi.fn(),
    refresh: vi.fn(),
  })),
}))

vi.mock('@/services/purchases', () => ({
  addPurchase: mocks.addPurchaseMock,
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
  beforeEach(() => {
    localStorage.clear()
    routerMocks.navigate.mockReset()
    mocks.createStoreMock.mockReset()
    mocks.addPurchaseMock.mockReset()
    mocks.storesList.length = 0
    mocks.createStoreMock.mockResolvedValue({
      id: 'store-1',
      userId: 'test-uid',
      name: 'Éxito',
      createdAt: new Date(),
    })
    mocks.createStoreMock.mockImplementation(async (data) => {
      const store = {
        id: 'store-1',
        userId: 'test-uid',
        name: data.name,
        createdAt: new Date(),
      }
      mocks.storesList.push(store)
      return store
    })
    mocks.addPurchaseMock.mockResolvedValue({ id: 'purchase-1' })
  })

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
    expect(screen.getByDisplayValue('Leche')).toBeTruthy()
  })

  it('crea y asocia el establecimiento pendiente al guardar', async () => {
    render(<AddPurchase />)
    const user = userEvent.setup()

    await user.click(screen.getByRole('button', { name: /sin establecimiento/i }))
    await user.click(screen.getByRole('button', { name: /crear nuevo/i }))
    await user.type(screen.getByPlaceholderText('Nombre del establecimiento'), 'Éxito')
    await user.click(screen.getByRole('button', { name: 'Crear' }))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /éxito/i })).toBeInTheDocument()
    })

    await user.type(screen.getByPlaceholderText('Ej: Leche'), 'Leche')
    await user.clear(screen.getByPlaceholderText('1'))
    await user.type(screen.getByPlaceholderText('1'), '1')
    await user.type(screen.getByPlaceholderText('Precio'), '15000')
    await user.click(screen.getByRole('button', { name: /registrar compra/i }))

    expect(mocks.createStoreMock).toHaveBeenCalledWith({ name: 'Éxito' })
    expect(mocks.addPurchaseMock).toHaveBeenCalledWith(
      'test-uid',
      expect.arrayContaining([
        expect.objectContaining({ name: 'Leche', quantity: 1, unitPrice: 15000, totalPrice: 15000 }),
      ]),
      undefined,
      'store-1',
      'Éxito',
      '2026-07-21',
      0,
      0
    )

  })
})
