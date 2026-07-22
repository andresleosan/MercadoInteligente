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

  it('permite seleccionar un establecimiento sin acciones inline', async () => {
    const onSelect = vi.fn()

    render(
      <StoreSelector
        stores={[store]}
        selectedStore={null}
        onSelect={onSelect}
      />
    )

    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: /sin establecimiento/i }))
    await user.click(screen.getByRole('button', { name: /ahorro/i }))

    expect(onSelect).toHaveBeenCalledWith(store)
    expect(screen.queryByRole('button', { name: /crear nuevo/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /editar ahorro/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: '×' })).not.toBeInTheDocument()
  })
})
