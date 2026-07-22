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

    render(
      <StoreSelector
        stores={[store]}
        selectedStore={null}
        onSelect={onSelect}
        onCreateInline={onCreateInline}
      />
    )

    const user = userEvent.setup()
    await user.selectOptions(screen.getByRole('combobox'), '__new__')
    await user.type(screen.getByPlaceholderText('Nombre del establecimiento'), 'Prueba Copilot')
    await user.click(screen.getByRole('button', { name: 'Crear' }))

    expect(await screen.findByText('Firebase no inicializado')).toBeInTheDocument()
    expect(onCreateInline).toHaveBeenCalledWith({ name: 'Prueba Copilot' })
    expect(onSelect).toHaveBeenCalledWith(null)
  })
})
