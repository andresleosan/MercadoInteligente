import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import FamilyPage from './Family'
import * as familiesService from '@/services/families'
import type { Family } from '@/types'

const mockUser = { uid: 'user-1', email: 'user1@test.com', displayName: 'Andrés' }

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    user: mockUser,
  }),
}))

vi.mock('@/services/families', () => ({
  getUserFamily: vi.fn(),
  createFamily: vi.fn(),
  joinFamilyByCode: vi.fn(),
  leaveFamily: vi.fn(),
}))

describe('FamilyPage Component', () => {
  const mockFamily: Family = {
    id: 'fam-1',
    name: 'Familia Ramírez',
    code: 'FAM-RMRZ',
    ownerId: 'user-1',
    members: [
      {
        uid: 'user-1',
        email: 'user1@test.com',
        displayName: 'Andrés',
        role: 'owner',
        joinedAt: new Date(),
      },
      {
        uid: 'user-2',
        email: 'user2@test.com',
        displayName: 'Laura',
        role: 'member',
        joinedAt: new Date(),
      },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders creation and join forms when user is not in a family', async () => {
    vi.mocked(familiesService.getUserFamily).mockResolvedValue(null)

    render(
      <MemoryRouter>
        <FamilyPage />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('Crear nuevo grupo familiar')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('Ej: Familia Pérez')).toBeInTheDocument()
    })
  })

  it('switches between create and join tabs', async () => {
    vi.mocked(familiesService.getUserFamily).mockResolvedValue(null)

    render(
      <MemoryRouter>
        <FamilyPage />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('Unirme con Código')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByText('Unirme con Código'))

    expect(screen.getByText('Unirse a un grupo existente')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Ej: FAM-9X2Y')).toBeInTheDocument()
  })

  it('creates family when form is submitted', async () => {
    vi.mocked(familiesService.getUserFamily).mockResolvedValue(null)
    vi.mocked(familiesService.createFamily).mockResolvedValue(mockFamily)

    render(
      <MemoryRouter>
        <FamilyPage />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Ej: Familia Pérez')).toBeInTheDocument()
    })

    const input = screen.getByPlaceholderText('Ej: Familia Pérez')
    fireEvent.change(input, { target: { value: 'Familia Ramírez' } })

    const submitBtn = screen.getByRole('button', { name: /Crear Grupo Familiar/i })
    fireEvent.click(submitBtn)

    await waitFor(() => {
      expect(familiesService.createFamily).toHaveBeenCalledWith(
        'user-1',
        'user1@test.com',
        'Familia Ramírez',
        'Andrés'
      )
      expect(screen.getByText('¡Grupo familiar creado exitosamente!')).toBeInTheDocument()
      expect(screen.getByText('Familia Ramírez')).toBeInTheDocument()
    })
  })

  it('renders active family details, invitation code and member list', async () => {
    vi.mocked(familiesService.getUserFamily).mockResolvedValue(mockFamily)

    render(
      <MemoryRouter>
        <FamilyPage />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('Familia Ramírez')).toBeInTheDocument()
      expect(screen.getByText('FAM-RMRZ')).toBeInTheDocument()
      expect(screen.getByText('Andrés')).toBeInTheDocument()
      expect(screen.getByText('Laura')).toBeInTheDocument()
      expect(screen.getByText('Propietario')).toBeInTheDocument()
      expect(screen.getByText('Miembro')).toBeInTheDocument()
    })
  })

  it('handles leaving the family', async () => {
    vi.mocked(familiesService.getUserFamily).mockResolvedValue(mockFamily)
    vi.mocked(familiesService.leaveFamily).mockResolvedValue(undefined)
    vi.spyOn(window, 'confirm').mockReturnValue(true)

    render(
      <MemoryRouter>
        <FamilyPage />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Salir/i })).toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole('button', { name: /Salir/i }))

    await waitFor(() => {
      expect(familiesService.leaveFamily).toHaveBeenCalledWith('user-1', 'fam-1')
      expect(screen.getByText('Has abandonado el grupo familiar')).toBeInTheDocument()
    })
  })
})
