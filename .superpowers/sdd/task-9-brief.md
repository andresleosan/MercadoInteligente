## Task 9: Integrar OCR en `AddPurchase.tsx`

**Files:**
- Modify: `src/pages/AddPurchase.tsx`

**Interfaces:**
- Consumes: `useOCR`, `OCRCapture`, `OCRReview` de Tasks 5, 7, 8.

- [ ] **Step 1: Modificar `AddPurchase.tsx`**

Agregar imports al inicio del archivo:

```ts
import OCRCapture from '@/components/OCRCapture'
import OCRReview from '@/components/OCRReview'
import { useOCR } from '@/hooks/useOCR'
import { useNavigate } from 'react-router-dom'
```

Dentro del componente `AddPurchase`, agregar estado y hook:

```ts
const navigate = useNavigate()
const { user } = useAuth()
const [mode, setMode] = useState<'manual' | 'photo' | 'review' | 'error'>('manual')
const ocr = useOCR(user?.uid ?? null)

async function handleImageSelected(file: File) {
  await ocr.processTicket(file)
  if (ocr.status === 'done') setMode('review')
  else if (ocr.status === 'error') setMode('error')
}
```

Agregar UI antes del `<form>` existente, dentro del `<div className="bg-white rounded-lg shadow p-6">`:

```tsx
{mode === 'manual' && (
  <div className="mb-6">
    <button
      type="button"
      onClick={() => setMode('photo')}
      className="w-full py-2 px-4 border border-green-600 rounded-md text-sm font-medium text-green-700 hover:bg-green-50"
    >
      ðŸ“· Registrar por foto
    </button>
  </div>
)}

{mode === 'photo' && (
  <div className="mb-6">
    <OCRCapture onImageSelected={handleImageSelected} />
    {ocr.status === 'uploading' && <p className="text-sm text-gray-600 mt-2">Subiendo imagen...</p>}
    {ocr.status === 'ocr-running' && (
      <p className="text-sm text-gray-600 mt-2">Leyendo ticket... (esto puede tardar unos segundos)</p>
    )}
    {ocr.status === 'parsing' && <p className="text-sm text-gray-600 mt-2">Procesando productos...</p>}
    <button
      type="button"
      onClick={() => setMode('manual')}
      className="mt-2 text-sm text-gray-500 hover:text-gray-700"
    >
      â† Volver a carga manual
    </button>
  </div>
)}

{mode === 'review' && (
  <div className="mb-6">
    <OCRReview
      items={ocr.items}
      imageUrl={ocr.imageUrl}
      userId={user!.uid}
      onSaved={() => {
        ocr.reset()
        setMode('manual')
        setMessage('Compra registrada correctamente')
      }}
      onRetry={() => {
        ocr.reset()
        setMode('photo')
      }}
    />
  </div>
)}

{mode === 'error' && (
  <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
    <p className="text-sm text-red-700">{ocr.error}</p>
    <div className="flex gap-2 mt-3">
      <button
        type="button"
        onClick={() => {
          ocr.reset()
          setMode('photo')
        }}
        className="flex-1 py-1.5 px-3 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50"
      >
        Reintentar
      </button>
      <button
        type="button"
        onClick={() => {
          ocr.reset()
          setMode('review')
        }}
        className="flex-1 py-1.5 px-3 border border-transparent rounded-md text-sm text-white bg-green-600 hover:bg-green-700"
      >
        Cargar manualmente
      </button>
    </div>
  </div>
)}
```

El form manual existente se mantiene igual (siempre visible para el modo manual).

- [ ] **Step 2: Verify typecheck passes**

Run: `npx tsc -b --noEmit`
Expected: PASS.

- [ ] **Step 3: Verify build passes**

Run: `npm run build`
Expected: PASS (con dist/ generado).

- [ ] **Step 4: Commit**

```bash
git add src/pages/AddPurchase.tsx
git commit -m "feat(ocr): integrar flujo OCR en AddPurchase (foto + manual + error)"
```
