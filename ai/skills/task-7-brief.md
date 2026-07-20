## Task 7: `OCRCapture.tsx` â€” UI de captura de imagen

**Files:**
- Create: `src/components/OCRCapture.tsx`
- Test: `src/components/OCRCapture.test.tsx`

**Interfaces:**
- Produces: `<OCRCapture onImageSelected: (file: File) => void />`.

- [ ] **Step 1: Write the failing test**

Crear `src/components/OCRCapture.test.tsx`:

```tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import OCRCapture from './OCRCapture'

describe('OCRCapture', () => {
  it('should render a file input accepting images', () => {
    render(<OCRCapture onImageSelected={vi.fn()} />)
    const input = screen.getByLabelText(/foto del ticket/i) as HTMLInputElement
    expect(input.type).toBe('file')
    expect(input.accept).toBe('image/*')
  })

  it('should call onImageSelected when a file is selected', () => {
    const onImageSelected = vi.fn()
    render(<OCRCapture onImageSelected={onImageSelected} />)

    const file = new File(['dummy'], 'ticket.jpg', { type: 'image/jpeg' })
    const input = screen.getByLabelText(/foto del ticket/i)
    fireEvent.change(input, { target: { files: [file] } })

    expect(onImageSelected).toHaveBeenCalledWith(file)
  })

  it('should not call onImageSelected if no file selected', () => {
    const onImageSelected = vi.fn()
    render(<OCRCapture onImageSelected={onImageSelected} />)

    const input = screen.getByLabelText(/foto del ticket/i)
    fireEvent.change(input, { target: { files: [] } })

    expect(onImageSelected).not.toHaveBeenCalled()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/OCRCapture.test.tsx`
Expected: FAIL.

- [ ] **Step 3: Write minimal implementation**

Crear `src/components/OCRCapture.tsx`:

```tsx
import { useRef, type ChangeEvent } from 'react'

interface Props {
  onImageSelected: (file: File) => void
}

export default function OCRCapture({ onImageSelected }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) onImageSelected(file)
  }

  return (
    <div className="bg-white rounded-lg shadow p-6 text-center">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Registrar por foto</h2>
      <p className="text-sm text-gray-600 mb-4">
        TomÃ¡ una foto del ticket o subÃ­ una imagen de la galerÃ­a.
      </p>
      <label className="block">
        <span className="sr-only">Foto del ticket</span>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={handleChange}
          className="block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-md file:border-0
            file:text-sm file:font-medium
            file:bg-green-600 file:text-white
            hover:file:bg-green-700 file:cursor-pointer"
        />
      </label>
    </div>
  )
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/components/OCRCapture.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/OCRCapture.tsx src/components/OCRCapture.test.tsx
git commit -m "feat(ocr): componente OCRCapture (camara o galeria)"
```
