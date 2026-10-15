import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { BudgetAlertBanner } from './BudgetAlertBanner'
import * as notificationsService from '@/services/notifications'
import type { BudgetAlert } from '@/services/notifications'

vi.mock('@/services/notifications', async () => {
  const actual = await vi.importActual('@/services/notifications')
  return {
    ...actual,
    isNotificationSupported: vi.fn(),
    getNotificationPermission: vi.fn(),
    requestNotificationPermission: vi.fn(),
  }
})

describe('BudgetAlertBanner Component', () => {
  const mockDismiss = vi.fn()

  const warningAlert: BudgetAlert = {
    id: 'daily-2026-07-20-80',
    scope: 'daily',
    level: 'warning',
    percentage: 85,
    spent: 85,
    budget: 100,
    remaining: 15,
    title: '⚡ Alerta: 80% del Presupuesto Diario',
    message: 'Has consumido el 85% de tu presupuesto.',
    dateOrMonth: '2026-07-20',
  }

  const dangerAlert: BudgetAlert = {
    id: 'monthly-2026-07-100',
    scope: 'monthly',
    level: 'danger',
    percentage: 110,
    spent: 1100,
    budget: 1000,
    remaining: -100,
    title: '⚠️ Presupuesto Mensual Agotado',
    message: 'Has superado el 100% de tu presupuesto.',
    dateOrMonth: '2026-07',
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(notificationsService.isNotificationSupported).mockReturnValue(true)
    vi.mocked(notificationsService.getNotificationPermission).mockReturnValue('granted')
  })

  it('renders nothing when there are no alerts', () => {
    const { container } = render(
      <BudgetAlertBanner alerts={[]} onDismiss={mockDismiss} />
    )
    expect(container.firstChild).toBeNull()
  })

  it('renders warning and danger alerts with correct titles and messages', () => {
    render(
      <BudgetAlertBanner alerts={[warningAlert, dangerAlert]} onDismiss={mockDismiss} />
    )

    expect(screen.getByText('⚡ Alerta: 80% del Presupuesto Diario')).toBeInTheDocument()
    expect(screen.getByText('Has consumido el 85% de tu presupuesto.')).toBeInTheDocument()

    expect(screen.getByText('⚠️ Presupuesto Mensual Agotado')).toBeInTheDocument()
    expect(screen.getByText('Has superado el 100% de tu presupuesto.')).toBeInTheDocument()
  })

  it('calls onDismiss when close button is clicked', () => {
    render(
      <BudgetAlertBanner alerts={[warningAlert]} onDismiss={mockDismiss} />
    )

    const dismissBtn = screen.getByLabelText(/Descartar alerta/i)
    fireEvent.click(dismissBtn)

    expect(mockDismiss).toHaveBeenCalledWith('daily-2026-07-20-80')
  })

  it('renders prompt to enable push notifications when permission is default', () => {
    vi.mocked(notificationsService.getNotificationPermission).mockReturnValue('default')

    render(
      <BudgetAlertBanner alerts={[warningAlert]} onDismiss={mockDismiss} />
    )

    expect(
      screen.getByText(/¿Deseas recibir avisos directos cuando tu presupuesto esté por agotarse?/i)
    ).toBeInTheDocument()
    expect(screen.getByText('Activar avisos')).toBeInTheDocument()
  })

  it('requests permission when Activar avisos button is clicked', async () => {
    vi.mocked(notificationsService.getNotificationPermission).mockReturnValue('default')
    vi.mocked(notificationsService.requestNotificationPermission).mockResolvedValue('granted')

    render(
      <BudgetAlertBanner alerts={[warningAlert]} onDismiss={mockDismiss} />
    )

    const enableBtn = screen.getByText('Activar avisos')
    await act(async () => {
      fireEvent.click(enableBtn)
    })

    expect(notificationsService.requestNotificationPermission).toHaveBeenCalled()
  })
})
