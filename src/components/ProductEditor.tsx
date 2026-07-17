import { useState, type FormEvent } from 'react'
import type { ParsedItem, PurchaseItem } from '@/types'
import { DarkInput } from '@/components/ui/DarkInput'
import { DarkButton } from '@/components/ui/DarkButton'

interface Props {
  initialItem?: ParsedItem | PurchaseItem
  onSave: (item: PurchaseItem) => void
  onCancel: () => void
}

export default function ProductEditor({ initialItem, onSave, onCancel }: Props) {
  const [name, setName] = useState(initialItem?.name ?? '')
  const [quantity, setQuantity] = useState(initialItem?.quantity ?? 0)
  const [unitPrice, setUnitPrice] = useState(initialItem?.unitPrice ?? 0)

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!name.trim() || quantity <= 0 || unitPrice <= 0) return
    onSave({
      name: name.trim(),
      quantity,
      unitPrice,
      totalPrice: quantity * unitPrice,
      confidence: initialItem?.confidence,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="bg-surface rounded-radius-xl border border-border-subtle shadow-card p-4 space-y-3">
      <DarkInput
        id="product-editor-name"
        label="Producto"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Ej: Leche"
      />
      <div className="grid grid-cols-2 gap-3">
        <DarkInput
          id="product-editor-quantity"
          label="Cant."
          type="number"
          value={quantity || ''}
          onChange={(e) => setQuantity(Number(e.target.value))}
          placeholder="1"
        />
        <DarkInput
          id="product-editor-unit-price"
          label="Precio unit."
          type="number"
          value={unitPrice || ''}
          onChange={(e) => setUnitPrice(Number(e.target.value))}
          placeholder="Precio"
        />
      </div>
      <div className="flex gap-2 pt-2">
        <DarkButton type="submit" variant="primary" size="sm" className="flex-1">
          Guardar
        </DarkButton>
        <DarkButton type="button" variant="secondary" size="sm" onClick={onCancel} className="flex-1">
          Cancelar
        </DarkButton>
      </div>
    </form>
  )
}
