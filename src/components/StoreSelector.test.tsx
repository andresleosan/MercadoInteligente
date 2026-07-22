import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import StoreSelector from './StoreSelector'
import type { Store } from '@/types'

describe('StoreSelector', () => {
  const store: Store = {
    id: 'store-1',
    userId: 'user-1',
    name: 'Ahorro',
    createdAt: new Date(),
  }

  it('muestra el error cuando falla la creación inline', async () => {
    const onSelect = vi.fn()
    const onCreateInline = vi.fn().mockRejectedValue(new Error('Firebase no inicializado'))
    const onUpdateStore = vi.fn()
    const onDeleteStore = vi.fn()

    render(
      <StoreSelector
        stores={[store]}
        selectedStore={null}
        onSelect={onSelect}
        onCreateInline={onCreateInline}
        onUpdateStore={onUpdateStore}
        onDeleteStore={onDeleteStore}
      />
    )

    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: /sin establecimiento/i }))
    await user.click(screen.getByRole('button', { name: /crear nuevo/i }))
    await user.type(screen.getByPlaceholderText('Nombre del establecimiento'), 'Prueba Copilot')
    await user.click(screen.getByRole('button', { name: 'Crear' }))

    expect(await screen.findByText('Firebase no inicializado')).toBeInTheDocument()
    expect(onCreateInline).toHaveBeenCalledWith({ name: 'Prueba Copilot' })
    expect(onSelect).not.toHaveBeenCalled()
  })

  it('permite editar y eliminar un establecimiento desde el desplegable', async () => {
    const onSelect = vi.fn()
    const onCreateInline = vi.fn()
    const onUpdateStore = vi.fn().mockResolvedValue(undefined)
    const onDeleteStore = vi.fn().mockResolvedValue(undefined)

    const confirmMock = vi.spyOn(window, 'confirm').mockReturnValue(true)

    render(
      <StoreSelector
        stores={[store]}
        selectedStore={store}
        onSelect={onSelect}
        onCreateInline={onCreateInline}
        onUpdateStore={onUpdateStore}
        onDeleteStore={onDeleteStore}
      />
    )

    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: /ahorro/i }))
    await user.click(screen.getByRole('button', { name: /editar ahorro/i }))
    const input = screen.getByPlaceholderText('Nuevo nombre')
    await user.clear(input)
    await user.type(input, 'Ahorro Plus')
    await user.click(screen.getByRole('button', { name: /guardar/i }))

    expect(onUpdateStore).toHaveBeenCalledWith('store-1', { name: 'Ahorro Plus' })

    await user.click(screen.getByRole('button', { name: '×' }))

    expect(confirmMock).toHaveBeenCalled()
    expect(onDeleteStore).toHaveBeenCalledWith('store-1')

    confirmMock.mockRestore()
  })
})
