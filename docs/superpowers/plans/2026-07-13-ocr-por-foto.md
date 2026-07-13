# Fase 2: OCR por Foto — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Permitir al usuario registrar una compra fotografiando el ticket del supermercado, con Tesseract.js extrayendo productos/precios, revisión editable, y guardado de la imagen en Firebase Storage.

**Architecture:** Flujo híbrido — OCR de ticket completo (modo principal) + carga manual de producto individual (fallback). Tesseract.js corre en Web Worker con lazy-load, modelos `spa+eng` self-hosted. Parser genérico por heurísticas (regex). Imagen del ticket siempre se guarda en Storage.

**Tech Stack:** React 18 + TypeScript + Vite, Firebase (Firestore/Storage), Tesseract.js (OCR), vitest + @testing-library/react (testing).

## Global Constraints

- Nomenclatura: PascalCase componentes, camelCase funciones/variables, kebab-case utilidades.
- Estilos: Tailwind CSS, mobile-first, colores verde (`green-600`/`green-700`) como primario, `gray-*` para texto/fondos, `red-600` para eliminar, `yellow-*` para resaltar baja confianza.
- Path alias: `@/` mapea a `./src/` (configurado en `vite.config.ts` y `tsconfig.json`).
- Firebase: usar instancias exportadas desde `@/config/firebase` (`db`, `storage`, `isConfigValid`). Storage path: `receipts/{userId}/{purchaseId}` (regla existente en `storage.rules`).
- Tests: Vitest + vi.mock para Firebase/Tesseract. Sin OCR real en CI (flaky). Pattern de test basado en `src/services/budget.test.ts` (vi.mock('firebase/firestore'), vi.mock('@/config/firebase')).
- Build: `npm run build` = `tsc -b && vite build`. Los `.test.ts` están excluidos del typecheck de build (tsconfig.json actualizado).
- Commits: prefijos `feat:`, `fix:`, `test:`, `chore:`, `docs:`. Español en mensajes.
- `Purchase` ya tiene `receiptImageUrl?: string` y `addPurchase` ya acepta `receiptImageUrl` — no modificar la firma, solo pasar el valor cuando corresponde.

---

## File Structure

| Archivo | Responsabilidad | Acción |
|---|---|---|
| `src/types/index.ts` | Agregar `confidence?: number` a `PurchaseItem`. Agregar tipo `ParsedItem`. | Modificar |
| `src/services/ticketParser.ts` | Parser genérico: texto + scores → `ParsedItem[]`. Filtra score < 50, detecta "Nx", marca 50-70 baja confianza. | Crear |
| `src/services/ticketParser.test.ts` | Tests del parser: ticket limpio, "2x", encabezados filtrados, score bajo, ticket vacío. | Crear |
| `src/services/storage.ts` | Wrapper Firebase Storage: `uploadReceiptImage(userId, file)` → URL. | Crear |
| `src/services/storage.test.ts` | Tests de storage: path correcto, URL, manejo de error. | Crear |
| `src/services/ocr.ts` | Wrapper Tesseract.js: lazy-load + web worker + modelos self-hosted. `runOCR(imageFile)` → `{ text, words }`. | Crear |
| `src/services/ocr.test.ts` | Tests de ocr: mock Tesseract, lazy-load, path de modelos self-hosted, formato de retorno. | Crear |
| `src/hooks/useOCR.ts` | Orquesta: `useOCR()` → estados + `processTicket(file)`. | Crear |
| `src/hooks/useOCR.test.ts` | Tests del hook: estados idle→uploading→ocr→parsing→done/error. | Crear |
| `src/components/ProductEditor.tsx` | Form de un producto (nombre, cantidad, precio). Modos: creación vacía / edición pre-llenada. | Crear |
| `src/components/ProductEditor.test.tsx` | Tests: render vacío, render pre-llenado, validación. | Crear |
| `src/components/OCRCapture.tsx` | UI captura: `<input type="file" accept="image/*">`. Llama `onImageSelected(file)`. | Crear |
| `src/components/OCRCapture.test.tsx` | Tests: render, input file, callback. | Crear |
| `src/components/OCRReview.tsx` | Pantalla revisión: lista productos, resalta baja confianza, editar/eliminar/agregar, guardar. | Crear |
| `src/components/OCRReview.test.tsx` | Tests: render con productos, resaltado, editar/eliminar/agregar, guardar. | Crear |
| `src/pages/AddPurchase.tsx` | Agregar botón "Registrar por foto" que abre el flujo OCR. | Modificar |
| `public/tessdata/` | Modelos `spa.traineddata` + `eng.traineddata` (~6MB). | Crear |
| `vite.config.ts` | Configurar `assetsInclude` para `.traineddata` (que Vite los sirva). | Modificar |

---

## Task 1: Tipo `ParsedItem` + ampliar `PurchaseItem` con `confidence`

**Files:**
- Modify: `src/types/index.ts`

**Interfaces:**
- Produces: `ParsedItem` (tipo nuevo, usado por `ticketParser.ts` y `useOCR.ts`). `PurchaseItem.confidence?: number` (usado por `purchases.ts` y `OCRReview.tsx`).

- [ ] **Step 1: Agregar `confidence` a `PurchaseItem` y definir `ParsedItem`**

Reemplazar el contenido de `src/types/index.ts` agregando `confidence?: number` a `PurchaseItem` (línea 17-22) y un nuevo tipo `ParsedItem` al final del archivo:

```ts
export interface PurchaseItem {
  name: string
  quantity: number
  unitPrice: number
  totalPrice: number
  confidence?: number
}

export interface ParsedItem {
  name: string
  unitPrice: number
  quantity: number
  totalPrice: number
  confidence: number
}
```

- [ ] **Step 2: Verificar typecheck**

Run: `npx tsc -b --noEmit`
Expected: PASS sin errores. Si `purchases.ts` ya usaba `PurchaseItem` sin `confidence`, no rompe porque es opcional.

- [ ] **Step 3: Commit**

```bash
git add src/types/index.ts
git commit -m "feat(ocr): agregar confidence a PurchaseItem y tipo ParsedItem"
```

---

## Task 2: `ticketParser.ts` — parser genérico de texto a productos

**Files:**
- Create: `src/services/ticketParser.ts`
- Test: `src/services/ticketParser.test.ts`

**Interfaces:**
- Consumes: `ParsedItem` de `@/types`.
- Produces: `parseTicket(text: string, words?: Word[]): ParsedItem[]` donde `Word = { text: string; confidence: number; bbox?: { x0: number; y0: number; x1: number; y1: number } }`. Exporta también `isLowConfidence(score: number): boolean` (true si 50 ≤ score < 70).

**Patrón de parsing:**
- Dividir texto en líneas por `\n`.
- Por cada línea, matchear regex `^(.+?)[\s\t]+(\d+[.,]\d{2})$` (nombre + precio al final). También aceptar formato "2x" o "x2" al inicio: `^(\d+)\s*[xX]\s*(.+?)[\s\t]+(\d+[.,]\d{2})$`.
- Si la línea no matchea ningún patrón → descartar (encabezados, totales, promociones).
- Score de la línea = promedio de `confidence` de las palabras que caen en esa línea (si se pasa `words`). Si no se pasa `words`, score = 100.
- Filtrar líneas con score < 50.
- Formato de precio: reemplazar `,` con `.` antes de parsear a número.
- `unitPrice` = precio parseado. `quantity` = N del "Nx" o 1. `totalPrice` = `unitPrice * quantity`.

- [ ] **Step 1: Write the failing test**

Crear `src/services/ticketParser.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { parseTicket, isLowConfidence } from './ticketParser'

describe('ticketParser', () => {
  describe('parseTicket', () => {
    it('should parse a clean ticket line', () => {
      const text = 'Leche entera 1L          450.00'
      const result = parseTicket(text)
      expect(result).toHaveLength(1)
      expect(result[0].name).toBe('Leche entera 1L')
      expect(result[0].unitPrice).toBe(450)
      expect(result[0].quantity).toBe(1)
      expect(result[0].totalPrice).toBe(450)
    })

    it('should parse line with comma decimal separator', () => {
      const text = 'Pan integral            120,50'
      const result = parseTicket(text)
      expect(result).toHaveLength(1)
      expect(result[0].unitPrice).toBe(120.5)
    })

    it('should detect "2x" quantity prefix', () => {
      const text = '2x Fideos tirabuzon      180.00'
      const result = parseTicket(text)
      expect(result).toHaveLength(1)
      expect(result[0].quantity).toBe(2)
      expect(result[0].name).toBe('Fideos tirabuzon')
      expect(result[0].unitPrice).toBe(180)
      expect(result[0].totalPrice).toBe(360)
    })

    it('should detect "x2" suffix quantity', () => {
      const text = 'Yogur durazno x2         200.00'
      const result = parseTicket(text)
      expect(result).toHaveLength(1)
      expect(result[0].quantity).toBe(2)
      expect(result[0].totalPrice).toBe(400)
    })

    it('should filter out non-product lines (headers, totals)', () => {
      const text = [
        'SUPERMERCADO COTO',
        'Fecha: 13/07/2026',
        'Leche entera 1L          450.00',
        'Pan integral             120,50',
        'TOTAL                    570.50',
        'Gracias por su compra',
      ].join('\n')
      const result = parseTicket(text)
      expect(result).toHaveLength(2)
      expect(result[0].name).toBe('Leche entera 1L')
      expect(result[1].name).toBe('Pan integral')
    })

    it('should return empty array for empty text', () => {
      expect(parseTicket('')).toHaveLength(0)
      expect(parseTicket('\n\n\n')).toHaveLength(0)
    })

    it('should filter lines with confidence < 50 when words provided', () => {
      const text = 'Leche entera 1L          450.00\nFideos          180.00'
      const words = [
        { text: 'Leche', confidence: 90, bbox: { x0: 0, y0: 0, x1: 50, y1: 20 } },
        { text: 'entera', confidence: 85, bbox: { x0: 60, y0: 0, x1: 120, y1: 20 } },
        { text: '1L', confidence: 80, bbox: { x0: 130, y0: 0, x1: 150, y1: 20 } },
        { text: '450.00', confidence: 88, bbox: { x0: 200, y0: 0, x1: 250, y1: 20 } },
        { text: 'Fideos', confidence: 30, bbox: { x0: 0, y0: 30, x1: 60, y1: 50 } },
        { text: '180.00', confidence: 25, bbox: { x0: 200, y0: 30, x1: 250, y1: 50 } },
      ]
      const result = parseTicket(text, words)
      expect(result).toHaveLength(1)
      expect(result[0].name).toBe('Leche entera 1L')
    })

    it('should assign confidence to each parsed item', () => {
      const text = 'Leche entera 1L          450.00'
      const words = [
        { text: 'Leche', confidence: 90, bbox: { x0: 0, y0: 0, x1: 50, y1: 20 } },
        { text: 'entera', confidence: 80, bbox: { x0: 60, y0: 0, x1: 120, y1: 20 } },
        { text: '1L', confidence: 70, bbox: { x0: 130, y0: 0, x1: 150, y1: 20 } },
        { text: '450.00', confidence: 60, bbox: { x0: 200, y0: 0, x1: 250, y1: 20 } },
      ]
      const result = parseTicket(text, words)
      expect(result[0].confidence).toBe(75)
    })
  })

  describe('isLowConfidence', () => {
    it('should return true for scores between 50 and 69', () => {
      expect(isLowConfidence(50)).toBe(true)
      expect(isLowConfidence(60)).toBe(true)
      expect(isLowConfidence(69)).toBe(true)
    })
    it('should return false for scores < 50 or >= 70', () => {
      expect(isLowConfidence(49)).toBe(false)
      expect(isLowConfidence(70)).toBe(false)
      expect(isLowConfidence(90)).toBe(false)
    })
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/services/ticketParser.test.ts`
Expected: FAIL con `Cannot find module './ticketParser'` o `parseTicket is not a function`.

- [ ] **Step 3: Write minimal implementation**

Crear `src/services/ticketParser.ts`:

```ts
import type { ParsedItem } from '@/types'

export interface Word {
  text: string
  confidence: number
  bbox?: { x0: number; y0: number; x1: number; y1: number }
}

const PRODUCT_LINE_REGEX = /^(.+?)[\s\t]+(\d+[.,]\d{2})$/
const QUANTITY_PREFIX_REGEX = /^(\d+)\s*[xX]\s*(.+?)[\s\t]+(\d+[.,]\d{2})$/
const QUANTITY_SUFFIX_REGEX = /^(.+?)\s+[xX](\d+)[\s\t]+(\d+[.,]\d{2})$/

function parsePrice(raw: string): number {
  return parseFloat(raw.replace(',', '.'))
}

function lineConfidence(lineText: string, words: Word[] | undefined): number {
  if (!words || words.length === 0) return 100
  const lineWords = words.filter((w) => lineText.includes(w.text))
  if (lineWords.length === 0) return 100
  const sum = lineWords.reduce((acc, w) => acc + w.confidence, 0)
  return Math.round(sum / lineWords.length)
}

export function isLowConfidence(score: number): boolean {
  return score >= 50 && score < 70
}

export function parseTicket(text: string, words?: Word[]): ParsedItem[] {
  const lines = text.split('\n').map((l) => l.trim()).filter((l) => l.length > 0)
  const items: ParsedItem[] = []

  for (const line of lines) {
    const score = lineConfidence(line, words)
    if (score < 50) continue

    let quantity = 1
    let name = ''
    let unitPrice = 0

    const prefixMatch = line.match(QUANTITY_PREFIX_REGEX)
    const suffixMatch = line.match(QUANTITY_SUFFIX_REGEX)
    const simpleMatch = line.match(PRODUCT_LINE_REGEX)

    if (prefixMatch) {
      quantity = parseInt(prefixMatch[1]!, 10)
      name = prefixMatch[2]!.trim()
      unitPrice = parsePrice(prefixMatch[3]!)
    } else if (suffixMatch) {
      name = suffixMatch[1]!.trim()
      quantity = parseInt(suffixMatch[2]!, 10)
      unitPrice = parsePrice(suffixMatch[3]!)
    } else if (simpleMatch) {
      name = simpleMatch[1]!.trim()
      unitPrice = parsePrice(simpleMatch[2]!)
    } else {
      continue
    }

    items.push({
      name,
      unitPrice,
      quantity,
      totalPrice: unitPrice * quantity,
      confidence: score,
    })
  }

  return items
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/services/ticketParser.test.ts`
Expected: PASS — todos los casos.

- [ ] **Step 5: Commit**

```bash
git add src/services/ticketParser.ts src/services/ticketParser.test.ts
git commit -m "feat(ocr): parser generico de tickets (regex + filtro de confianza)"
```

---

## Task 3: `storage.ts` — wrapper de Firebase Storage

**Files:**
- Create: `src/services/storage.ts`
- Test: `src/services/storage.test.ts`

**Interfaces:**
- Consumes: `storage` de `@/config/firebase` (puede ser `null` si config inválida).
- Produces: `uploadReceiptImage(userId: string, file: File, purchaseId: string): Promise<string>` — retorna URL pública. Lanza `Error('Storage no inicializado')` si `storage` es null.

- [ ] **Step 1: Write the failing test**

Crear `src/services/storage.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { uploadReceiptImage } from './storage'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'

vi.mock('firebase/storage')
vi.mock('@/config/firebase', () => ({
  storage: {},
  isConfigValid: true,
}))

describe('Storage Service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should upload image and return URL', async () => {
    vi.mocked(uploadBytes).mockResolvedValue({} as any)
    vi.mocked(getDownloadURL).mockResolvedValue('https://firebasestorage.googleapis.com/receipts/user-1/abc.jpg')

    const file = new File(['dummy'], 'ticket.jpg', { type: 'image/jpeg' })
    const url = await uploadReceiptImage('user-1', file, 'purchase-123')

    expect(ref).toHaveBeenCalledWith(expect.anything(), 'receipts/user-1/purchase-123.jpg')
    expect(uploadBytes).toHaveBeenCalled()
    expect(url).toBe('https://firebasestorage.googleapis.com/receipts/user-1/abc.jpg')
  })

  it('should use .png extension for png files', async () => {
    vi.mocked(uploadBytes).mockResolvedValue({} as any)
    vi.mocked(getDownloadURL).mockResolvedValue('https://firebasestorage.googleapis.com/receipts/user-1/abc.png')

    const file = new File(['dummy'], 'ticket.png', { type: 'image/png' })
    await uploadReceiptImage('user-1', file, 'purchase-456')

    expect(ref).toHaveBeenCalledWith(expect.anything(), 'receipts/user-1/purchase-456.png')
  })

  it('should throw if storage not initialized', async () => {
    vi.resetModules()
    vi.doMock('@/config/firebase', () => ({ storage: null, isConfigValid: false }))
    const { uploadReceiptImage: fn } = await import('./storage')
    const file = new File(['dummy'], 'ticket.jpg', { type: 'image/jpeg' })
    await expect(fn('user-1', file, 'purchase-789')).rejects.toThrow('Storage no inicializado')
    vi.doUnmock('@/config/firebase')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/services/storage.test.ts`
Expected: FAIL con `Cannot find module './storage'`.

- [ ] **Step 3: Write minimal implementation**

Crear `src/services/storage.ts`:

```ts
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { storage } from '@/config/firebase'

function getExtension(file: File): string {
  if (file.type === 'image/png') return 'png'
  if (file.type === 'image/webp') return 'webp'
  return 'jpg'
}

export async function uploadReceiptImage(
  userId: string,
  file: File,
  purchaseId: string
): Promise<string> {
  if (!storage) throw new Error('Storage no inicializado')

  const ext = getExtension(file)
  const path = `receipts/${userId}/${purchaseId}.${ext}`
  const storageRef = ref(storage, path)

  await uploadBytes(storageRef, file)
  return getDownloadURL(storageRef)
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/services/storage.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/services/storage.ts src/services/storage.test.ts
git commit -m "feat(ocr): wrapper de Firebase Storage para subir imagenes de tickets"
```

---

## Task 4: `ocr.ts` — wrapper de Tesseract.js con lazy-load + web worker + modelos self-hosted

**Files:**
- Create: `src/services/ocr.ts`
- Test: `src/services/ocr.test.ts`
- Create: `public/tessdata/` (carpeta, modelos se descargan en Task 4b)

**Interfaces:**
- Consumes: Tesseract.js (dinámico import), modelos en `/tessdata/spa.traineddata` y `/tessdata/eng.traineddata`.
- Produces: `runOCR(imageFile: File): Promise<{ text: string; words: Word[] }>` donde `Word` viene de `@/services/ticketParser`. Timeout 30s.

- [ ] **Step 1: Write the failing test**

Crear `src/services/ocr.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('tesseract.js', () => ({
  createWorker: vi.fn(),
}))

describe('OCR Service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should run OCR and return text + words', async () => {
    const { createWorker } = await import('tesseract.js')
    const mockRecognize = vi.fn().mockResolvedValue({
      data: {
        text: 'Leche entera 1L          450.00',
        words: [
          { text: 'Leche', confidence: 90, bbox: { x0: 0, y0: 0, x1: 50, y1: 20 } },
          { text: 'entera', confidence: 85, bbox: { x0: 60, y0: 0, x1: 120, y1: 20 } },
        ],
      },
    })
    const mockTerminate = vi.fn().mockResolvedValue(undefined)
    const mockLoad = vi.fn().mockResolvedValue(undefined)
    const mockLoadLanguage = vi.fn().mockResolvedValue(undefined)
    const mockInitialize = vi.fn().mockResolvedValue(undefined)
    const mockSetParameters = vi.fn().mockResolvedValue(undefined)

    vi.mocked(createWorker).mockResolvedValue({
      recognize: mockRecognize,
      terminate: mockTerminate,
      load: mockLoad,
      loadLanguage: mockLoadLanguage,
      initialize: mockInitialize,
      setParameters: mockSetParameters,
    } as any)

    const { runOCR } = await import('./ocr')
    const file = new File(['dummy'], 'ticket.jpg', { type: 'image/jpeg' })
    const result = await runOCR(file)

    expect(result.text).toContain('Leche')
    expect(result.words).toHaveLength(2)
    expect(result.words[0].text).toBe('Leche')
    expect(result.words[0].confidence).toBe(90)
    expect(mockTerminate).toHaveBeenCalled()
  })

  it('should use self-hosted models from /tessdata/', async () => {
    const { createWorker } = await import('tesseract.js')
    vi.mocked(createWorker).mockResolvedValue({
      recognize: vi.fn().mockResolvedValue({ data: { text: '', words: [] } }),
      terminate: vi.fn().mockResolvedValue(undefined),
      load: vi.fn().mockResolvedValue(undefined),
      loadLanguage: vi.fn(),
      initialize: vi.fn(),
      setParameters: vi.fn(),
    } as any)

    const { runOCR } = await import('./ocr')
    const file = new File(['dummy'], 'ticket.jpg', { type: 'image/jpeg' })
    await runOCR(file)

    expect(createWorker).toHaveBeenCalledWith(
      expect.objectContaining({
        langPath: expect.stringContaining('/tessdata'),
        workerPath: expect.any(String),
        corePath: expect.any(String),
      })
    )
  })

  it('should timeout after 30 seconds', async () => {
    const { createWorker } = await import('tesseract.js')
    const mockRecognize = vi.fn().mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve({ data: { text: '', words: [] } }), 35000))
    )
    vi.mocked(createWorker).mockResolvedValue({
      recognize: mockRecognize,
      terminate: vi.fn().mockResolvedValue(undefined),
      load: vi.fn().mockResolvedValue(undefined),
      loadLanguage: vi.fn(),
      initialize: vi.fn(),
      setParameters: vi.fn(),
    } as any)

    const { runOCR } = await import('./ocr')
    const file = new File(['dummy'], 'ticket.jpg', { type: 'image/jpeg' })
    vi.useFakeTimers()
    const promise = runOCR(file)
    vi.advanceTimersByTime(31000)
    await expect(promise).rejects.toThrow('OCR timeout')
    vi.useRealTimers()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/services/ocr.test.ts`
Expected: FAIL con `Cannot find module './ocr'`.

- [ ] **Step 3: Write minimal implementation**

Crear `src/services/ocr.ts`:

```ts
import type { Word } from './ticketParser'

export interface OCRResult {
  text: string
  words: Word[]
}

const OCR_TIMEOUT_MS = 30000

export async function runOCR(imageFile: File): Promise<OCRResult> {
  const { createWorker } = await import('tesseract.js')

  const langPath = `${import.meta.env.BASE_URL}tessdata`

  const worker = await createWorker({
    langPath,
    workerPath: 'https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/worker.min.js',
    corePath: 'https://cdn.jsdelivr.net/npm/tesseract.js-core@5',
  })

  let timeoutId: ReturnType<typeof setTimeout> | undefined
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error('OCR timeout')), OCR_TIMEOUT_MS)
  })

  try {
    await worker.load()
    await worker.loadLanguage('spa+eng')
    await worker.initialize('spa+eng')
    await worker.setParameters({
      tessedit_char_whitelist: '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ.,$xX ',
    })

    const result = await Promise.race([worker.recognize(imageFile), timeoutPromise])
    const { text, words } = (result as any).data

    return {
      text: text || '',
      words: (words || []).map((w: any) => ({
        text: w.text,
        confidence: w.confidence,
        bbox: w.bbox,
      })),
    }
  } finally {
    if (timeoutId) clearTimeout(timeoutId)
    await worker.terminate()
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/services/ocr.test.ts`
Expected: PASS.

- [ ] **Step 5: Install tesseract.js + descargar modelos self-hosted**

```bash
npm install tesseract.js@^5
```

Descargar modelos a `public/tessdata/`:

```bash
mkdir public/tessdata
curl -L -o public/tessdata/spa.traineddata.gz https://github.com/tesseract-ocr/tessdata_fast/raw/main/spa.traineddata.gz
curl -L -o public/tessdata/eng.traineddata.gz https://github.com/tesseract-ocr/tessdata_fast/raw/main/eng.traineddata.gz
```

Nota: Tesseract.js puede leer `.gz` directamente. Si la URL falla, alternativa: `tessdata_best` repo. Verificar que los archivos existen con `ls public/tessdata/`.

- [ ] **Step 6: Configurar Vite para servir `.traineddata.gz` como assets**

En `vite.config.ts`, dentro del objeto retornado (después de `server`), agregar:

```ts
    assetsInclude: ['**/*.traineddata.gz'],
```

- [ ] **Step 7: Commit**

```bash
git add src/services/ocr.ts src/services/ocr.test.ts package.json package-lock.json public/tessdata/ vite.config.ts
git commit -m "feat(ocr): wrapper Tesseract.js con lazy-load, web worker y modelos self-hosted"
```

---

## Task 5: `useOCR.ts` — hook orquestador del flujo OCR

**Files:**
- Create: `src/hooks/useOCR.ts`
- Test: `src/hooks/useOCR.test.ts`

**Interfaces:**
- Consumes: `uploadReceiptImage` de `@/services/storage`, `runOCR` de `@/services/ocr`, `parseTicket` de `@/services/ticketParser`.
- Produces: `useOCR(userId: string | null)` → `{ status: 'idle' | 'uploading' | 'ocr-running' | 'parsing' | 'done' | 'error', items: ParsedItem[], imageUrl: string | null, error: string | null, processTicket: (file: File) => Promise<void>, reset: () => void }`.

- [ ] **Step 1: Write the failing test**

Crear `src/hooks/useOCR.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'

vi.mock('@/services/storage', () => ({
  uploadReceiptImage: vi.fn().mockResolvedValue('https://storage.googleapis.com/receipts/user-1/abc.jpg'),
}))
vi.mock('@/services/ocr', () => ({
  runOCR: vi.fn().mockResolvedValue({
    text: 'Leche entera 1L          450.00\nPan integral            120,50',
    words: [
      { text: 'Leche', confidence: 90, bbox: { x0: 0, y0: 0, x1: 50, y1: 20 } },
      { text: 'entera', confidence: 85, bbox: { x0: 60, y0: 0, x1: 120, y1: 20 } },
      { text: '1L', confidence: 80, bbox: { x0: 130, y0: 0, x1: 150, y1: 20 } },
      { text: '450.00', confidence: 88, bbox: { x0: 200, y0: 0, x1: 250, y1: 20 } },
      { text: 'Pan', confidence: 75, bbox: { x0: 0, y0: 30, x1: 30, y1: 50 } },
      { text: 'integral', confidence: 70, bbox: { x0: 40, y0: 30, x1: 100, y1: 50 } },
      { text: '120,50', confidence: 72, bbox: { x0: 200, y0: 30, x1: 250, y1: 50 } },
    ],
  }),
}))

describe('useOCR', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should start in idle state', () => {
    const { result } = renderHook(() => {
      const { useOCR } = require('@/hooks/useOCR')
      return useOCR('user-1')
    })
    expect(result.current.status).toBe('idle')
    expect(result.current.items).toHaveLength(0)
    expect(result.current.imageUrl).toBeNull()
    expect(result.current.error).toBeNull()
  })

  it('should flow through uploading → ocr-running → parsing → done', async () => {
    const { result } = renderHook(() => {
      const { useOCR } = require('@/hooks/useOCR')
      return useOCR('user-1')
    })

    const file = new File(['dummy'], 'ticket.jpg', { type: 'image/jpeg' })
    await act(async () => {
      await result.current.processTicket(file)
    })

    expect(result.current.status).toBe('done')
    expect(result.current.items).toHaveLength(2)
    expect(result.current.items[0].name).toBe('Leche entera 1L')
    expect(result.current.imageUrl).toBe('https://storage.googleapis.com/receipts/user-1/abc.jpg')
  })

  it('should set error state if OCR fails', async () => {
    const { runOCR } = await import('@/services/ocr')
    vi.mocked(runOCR).mockRejectedValueOnce(new Error('OCR timeout'))

    const { result } = renderHook(() => {
      const { useOCR } = require('@/hooks/useOCR')
      return useOCR('user-1')
    })

    const file = new File(['dummy'], 'ticket.jpg', { type: 'image/jpeg' })
    await act(async () => {
      await result.current.processTicket(file)
    })

    expect(result.current.status).toBe('error')
    expect(result.current.error).toContain('No pudimos leer el ticket')
  })

  it('should do nothing if userId is null', async () => {
    const { result } = renderHook(() => {
      const { useOCR } = require('@/hooks/useOCR')
      return useOCR(null)
    })

    const file = new File(['dummy'], 'ticket.jpg', { type: 'image/jpeg' })
    await act(async () => {
      await result.current.processTicket(file)
    })

    expect(result.current.status).toBe('error')
    expect(result.current.error).toContain('usuario')
  })

  it('should reset to idle', async () => {
    const { result } = renderHook(() => {
      const { useOCR } = require('@/hooks/useOCR')
      return useOCR('user-1')
    })

    const file = new File(['dummy'], 'ticket.jpg', { type: 'image/jpeg' })
    await act(async () => {
      await result.current.processTicket(file)
    })
    expect(result.current.status).toBe('done')

    act(() => {
      result.current.reset()
    })
    expect(result.current.status).toBe('idle')
    expect(result.current.items).toHaveLength(0)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/hooks/useOCR.test.ts`
Expected: FAIL con `Cannot find module '@/hooks/useOCR'`.

- [ ] **Step 3: Write minimal implementation**

Crear `src/hooks/useOCR.ts`:

```ts
import { useState, useCallback } from 'react'
import type { ParsedItem } from '@/types'
import { uploadReceiptImage } from '@/services/storage'
import { runOCR } from '@/services/ocr'
import { parseTicket } from '@/services/ticketParser'
import { doc, collection } from 'firebase/firestore'
import { db } from '@/config/firebase'

export type OCRStatus = 'idle' | 'uploading' | 'ocr-running' | 'parsing' | 'done' | 'error'

export function useOCR(userId: string | null) {
  const [status, setStatus] = useState<OCRStatus>('idle')
  const [items, setItems] = useState<ParsedItem[]>([])
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const processTicket = useCallback(
    async (file: File) => {
      if (!userId) {
        setStatus('error')
        setError('No hay usuario autenticado')
        return
      }

      setStatus('uploading')
      setError(null)
      setItems([])

      try {
        const purchaseId = db
          ? doc(collection(db, 'users', userId, 'purchases')).id
          : `tmp-${Date.now()}`

        let uploadedUrl: string | null = null
        try {
          uploadedUrl = await uploadReceiptImage(userId, file, purchaseId)
          setImageUrl(uploadedUrl)
        } catch (e) {
          console.error('Storage upload failed:', e)
        }

        setStatus('ocr-running')
        const ocrResult = await runOCR(file)

        setStatus('parsing')
        const parsed = parseTicket(ocrResult.text, ocrResult.words)

        if (parsed.length === 0) {
          setStatus('error')
          setError('No reconocimos productos en esta imagen. Reintentar o cargar manualmente.')
          return
        }

        setItems(parsed)
        setStatus('done')
      } catch (e: any) {
        console.error('OCR failed:', e)
        setStatus('error')
        setError('No pudimos leer el ticket. Reintentar o cargar manualmente.')
      }
    },
    [userId]
  )

  const reset = useCallback(() => {
    setStatus('idle')
    setItems([])
    setImageUrl(null)
    setError(null)
  }, [])

  return { status, items, imageUrl, error, processTicket, reset }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/hooks/useOCR.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/hooks/useOCR.ts src/hooks/useOCR.test.ts
git commit -m "feat(ocr): hook useOCR orquestador del flujo OCR completo"
```

---

## Task 6: `ProductEditor.tsx` — form de un producto

**Files:**
- Create: `src/components/ProductEditor.tsx`
- Test: `src/components/ProductEditor.test.tsx`

**Interfaces:**
- Consumes: `ParsedItem` y `PurchaseItem` de `@/types`.
- Produces: componente `<ProductEditor initialItem?: ParsedItem | PurchaseItem; onSave: (item: PurchaseItem) => void; onCancel: () => void />`.

- [ ] **Step 1: Write the failing test**

Crear `src/components/ProductEditor.test.tsx`:

```tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import ProductEditor from './ProductEditor'

describe('ProductEditor', () => {
  it('should render empty form when no initialItem', () => {
    render(<ProductEditor onSave={vi.fn()} onCancel={vi.fn()} />)
    expect(screen.getByLabelText(/producto/i)).toHaveValue('')
    expect(screen.getByLabelText(/cant/i)).toHaveValue(1)
    expect(screen.getByLabelText(/precio unit/i)).toHaveValue(0)
  })

  it('should render pre-filled form when initialItem provided', () => {
    render(
      <ProductEditor
        initialItem={{ name: 'Leche', quantity: 2, unitPrice: 450, totalPrice: 900, confidence: 85 }}
        onSave={vi.fn()}
        onCancel={vi.fn()}
      />
    )
    expect(screen.getByLabelText(/producto/i)).toHaveValue('Leche')
    expect(screen.getByLabelText(/cant/i)).toHaveValue(2)
    expect(screen.getByLabelText(/precio unit/i)).toHaveValue(450)
  })

  it('should calculate totalPrice on save', () => {
    const onSave = vi.fn()
    render(<ProductEditor onSave={onSave} onCancel={vi.fn()} />)

    fireEvent.change(screen.getByLabelText(/producto/i), { target: { value: 'Fideos' } })
    fireEvent.change(screen.getByLabelText(/cant/i), { target: { value: '3' } })
    fireEvent.change(screen.getByLabelText(/precio unit/i), { target: { value: '200' } })
    fireEvent.click(screen.getByRole('button', { name: /guardar/i }))

    expect(onSave).toHaveBeenCalledWith({
      name: 'Fideos',
      quantity: 3,
      unitPrice: 200,
      totalPrice: 600,
      confidence: undefined,
    })
  })

  it('should not save if name is empty', () => {
    const onSave = vi.fn()
    render(<ProductEditor onSave={onSave} onCancel={vi.fn()} />)
    fireEvent.change(screen.getByLabelText(/cant/i), { target: { value: '2' } })
    fireEvent.change(screen.getByLabelText(/precio unit/i), { target: { value: '100' } })
    fireEvent.click(screen.getByRole('button', { name: /guardar/i }))
    expect(onSave).not.toHaveBeenCalled()
  })

  it('should call onCancel when cancel button clicked', () => {
    const onCancel = vi.fn()
    render(<ProductEditor onSave={vi.fn()} onCancel={onCancel} />)
    fireEvent.click(screen.getByRole('button', { name: /cancelar/i }))
    expect(onCancel).toHaveBeenCalled()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/ProductEditor.test.tsx`
Expected: FAIL con `Cannot find module './ProductEditor'`.

- [ ] **Step 3: Write minimal implementation**

Crear `src/components/ProductEditor.tsx`:

```tsx
import { useState, type FormEvent } from 'react'
import type { ParsedItem, PurchaseItem } from '@/types'

interface Props {
  initialItem?: ParsedItem | PurchaseItem
  onSave: (item: PurchaseItem) => void
  onCancel: () => void
}

export default function ProductEditor({ initialItem, onSave, onCancel }: Props) {
  const [name, setName] = useState(initialItem?.name ?? '')
  const [quantity, setQuantity] = useState(initialItem?.quantity ?? 1)
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
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-4 space-y-3">
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Producto</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="block w-full px-2 py-1.5 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
          placeholder="Ej: Leche"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Cant.</label>
          <input
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            className="block w-full px-2 py-1.5 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Precio unit.</label>
          <input
            type="number"
            min="0"
            step="10"
            value={unitPrice}
            onChange={(e) => setUnitPrice(Number(e.target.value))}
            className="block w-full px-2 py-1.5 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
          />
        </div>
      </div>
      <div className="flex gap-2 pt-2">
        <button
          type="submit"
          className="flex-1 py-1.5 px-3 border border-transparent rounded-md text-sm font-medium text-white bg-green-600 hover:bg-green-700"
        >
          Guardar
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-1.5 px-3 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Cancelar
        </button>
      </div>
    </form>
  )
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/components/ProductEditor.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/ProductEditor.tsx src/components/ProductEditor.test.tsx
git commit -m "feat(ocr): componente ProductEditor reutilizable (creacion y edicion)"
```

---

## Task 7: `OCRCapture.tsx` — UI de captura de imagen

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
        Tomá una foto del ticket o subí una imagen de la galería.
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

---

## Task 8: `OCRReview.tsx` — pantalla de revisión editable

**Files:**
- Create: `src/components/OCRReview.tsx`
- Test: `src/components/OCRReview.test.tsx`

**Interfaces:**
- Consumes: `useOCR` hook, `ProductEditor`, `ParsedItem`/`PurchaseItem` de `@/types`, `isLowConfidence` de `@/services/ticketParser`, `addPurchase` de `@/services/purchases`.
- Produces: `<OCRReview items={ParsedItem[]} imageUrl={string|null} userId={string} onSaved={() => void} onRetry={() => void} />`.

- [ ] **Step 1: Write the failing test**

Crear `src/components/OCRReview.test.tsx`:

```tsx
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import OCRReview from './OCRReview'

vi.mock('@/services/purchases', () => ({
  addPurchase: vi.fn().mockResolvedValue({ id: 'new-id' }),
}))

describe('OCRReview', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render parsed items', () => {
    render(
      <OCRReview
        items={[
          { name: 'Leche', quantity: 1, unitPrice: 450, totalPrice: 450, confidence: 90 },
          { name: 'Pan', quantity: 2, unitPrice: 100, totalPrice: 200, confidence: 60 },
        ]}
        imageUrl="https://example.com/ticket.jpg"
        userId="user-1"
        onSaved={vi.fn()}
        onRetry={vi.fn()}
      />
    )
    expect(screen.getByText('Leche')).toBeInTheDocument()
    expect(screen.getByText('Pan')).toBeInTheDocument()
  })

  it('should highlight low confidence items in yellow', () => {
    render(
      <OCRReview
        items={[
          { name: 'Leche', quantity: 1, unitPrice: 450, totalPrice: 450, confidence: 90 },
          { name: 'Pan', quantity: 2, unitPrice: 100, totalPrice: 200, confidence: 60 },
        ]}
        imageUrl={null}
        userId="user-1"
        onSaved={vi.fn()}
        onRetry={vi.fn()}
      />
    )
    const lecheRow = screen.getByText('Leche').closest('div')
    const panRow = screen.getByText('Pan').closest('div')
    expect(lecheRow?.className).not.toContain('bg-yellow')
    expect(panRow?.className).toContain('bg-yellow')
  })

  it('should remove item when eliminar clicked', () => {
    render(
      <OCRReview
        items={[
          { name: 'Leche', quantity: 1, unitPrice: 450, totalPrice: 450, confidence: 90 },
        ]}
        imageUrl={null}
        userId="user-1"
        onSaved={vi.fn()}
        onRetry={vi.fn()}
      />
    )
    fireEvent.click(screen.getByRole('button', { name: /eliminar/i }))
    expect(screen.queryByText('Leche')).not.toBeInTheDocument()
  })

  it('should add a manual product via ProductEditor', () => {
    render(
      <OCRReview
        items={[]}
        imageUrl={null}
        userId="user-1"
        onSaved={vi.fn()}
        onRetry={vi.fn()}
      />
    )
    fireEvent.click(screen.getByRole('button', { name: /agregar producto/i }))
    fireEvent.change(screen.getByLabelText(/producto/i), { target: { value: 'Huevos' } })
    fireEvent.change(screen.getByLabelText(/cant/i), { target: { value: '12' } })
    fireEvent.change(screen.getByLabelText(/precio unit/i), { target: { value: '50' } })
    fireEvent.click(screen.getByRole('button', { name: /guardar/i }))
    expect(screen.getByText('Huevos')).toBeInTheDocument()
  })

  it('should call addPurchase and onSaved when guardar compra clicked', async () => {
    const onSaved = vi.fn()
    const { addPurchase } = await import('@/services/purchases')
    render(
      <OCRReview
        items={[
          { name: 'Leche', quantity: 1, unitPrice: 450, totalPrice: 450, confidence: 90 },
        ]}
        imageUrl="https://example.com/ticket.jpg"
        userId="user-1"
        onSaved={onSaved}
        onRetry={vi.fn()}
      />
    )
    fireEvent.click(screen.getByRole('button', { name: /guardar compra/i }))
    await new Promise((r) => setTimeout(r, 0))
    expect(addPurchase).toHaveBeenCalledWith(
      'user-1',
      [{ name: 'Leche', quantity: 1, unitPrice: 450, totalPrice: 450, confidence: 90 }],
      'https://example.com/ticket.jpg'
    )
    expect(onSaved).toHaveBeenCalled()
  })

  it('should call onRetry when reintentar clicked', () => {
    const onRetry = vi.fn()
    render(
      <OCRReview
        items={[]}
        imageUrl={null}
        userId="user-1"
        onSaved={vi.fn()}
        onRetry={onRetry}
      />
    )
    fireEvent.click(screen.getByRole('button', { name: /reintentar/i }))
    expect(onRetry).toHaveBeenCalled()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/OCRReview.test.tsx`
Expected: FAIL.

- [ ] **Step 3: Write minimal implementation**

Crear `src/components/OCRReview.tsx`:

```tsx
import { useState } from 'react'
import type { ParsedItem, PurchaseItem } from '@/types'
import { isLowConfidence } from '@/services/ticketParser'
import { addPurchase } from '@/services/purchases'
import ProductEditor from './ProductEditor'

interface Props {
  items: ParsedItem[]
  imageUrl: string | null
  userId: string
  onSaved: () => void
  onRetry: () => void
}

export default function OCRReview({ items: initialItems, imageUrl, userId, onSaved, onRetry }: Props) {
  const [items, setItems] = useState<PurchaseItem[]>(initialItems)
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [adding, setAdding] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  function removeItem(index: number) {
    setItems(items.filter((_, i) => i !== index))
  }

  function saveEdit(updated: PurchaseItem) {
    if (editingIndex === null) return
    const newItems = [...items]
    newItems[editingIndex] = updated
    setItems(newItems)
    setEditingIndex(null)
  }

  function addManual(newItem: PurchaseItem) {
    setItems([...items, newItem])
    setAdding(false)
  }

  async function handleSavePurchase() {
    if (items.length === 0) {
      setError('Agregá al menos un producto')
      return
    }
    setSaving(true)
    setError('')
    try {
      await addPurchase(userId, items, imageUrl ?? undefined)
      onSaved()
    } catch (e) {
      setError('No se pudo guardar la compra. Intentá de nuevo.')
    } finally {
      setSaving(false)
    }
  }

  const total = items.reduce((sum, item) => sum + item.totalPrice, 0)

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Revisá los productos</h2>

        {items.length === 0 && !adding && (
          <p className="text-sm text-gray-600 mb-4">
            No reconocimos productos. Podés cargarlos manualmente o reintentar.
          </p>
        )}

        <div className="space-y-2">
          {items.map((item, index) => (
            <div
              key={index}
              className={`flex justify-between items-center p-2 rounded ${
                item.confidence !== undefined && isLowConfidence(item.confidence) ? 'bg-yellow-50 border border-yellow-200' : ''
              }`}
            >
              <div>
                <p className="text-sm font-medium text-gray-900">{item.name}</p>
                <p className="text-xs text-gray-500">
                  {item.quantity}x ${item.unitPrice.toLocaleString()} = ${item.totalPrice.toLocaleString()}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setEditingIndex(index)}
                  className="text-xs text-blue-600 hover:text-blue-800"
                >
                  Editar
                </button>
                <button
                  onClick={() => removeItem(index)}
                  className="text-xs text-red-600 hover:text-red-800"
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>

        {editingIndex !== null && (
          <div className="mt-4">
            <ProductEditor
              initialItem={items[editingIndex]}
              onSave={saveEdit}
              onCancel={() => setEditingIndex(null)}
            />
          </div>
        )}

        {adding && (
          <div className="mt-4">
            <ProductEditor onSave={addManual} onCancel={() => setAdding(false)} />
          </div>
        )}

        {!adding && editingIndex === null && (
          <button
            onClick={() => setAdding(true)}
            className="mt-4 text-sm text-green-600 hover:text-green-800"
          >
            + Agregar producto
          </button>
        )}
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        <p className="text-lg font-semibold text-gray-900">Total: ${total.toLocaleString()}</p>
        {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
      </div>

      <div className="flex gap-2">
        <button
          onClick={handleSavePurchase}
          disabled={saving || items.length === 0}
          className="flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
        >
          {saving ? 'Guardando...' : 'Guardar compra'}
        </button>
        <button
          onClick={onRetry}
          className="flex-1 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Reintentar
        </button>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/components/OCRReview.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/OCRReview.tsx src/components/OCRReview.test.tsx
git commit -m "feat(ocr): componente OCRReview - revision editable con resaltado de confianza"
```

---

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
      📷 Registrar por foto
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
      ← Volver a carga manual
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

---

## Task 10: Smoke test manual + build final + deploy

**Files:** ninguno (verificación manual)

- [ ] **Step 1: Correr todos los tests**

Run: `npx vitest run`
Expected: PASS — todos los archivos de test.

- [ ] **Step 2: Build de producción**

Run: `npm run build`
Expected: PASS. Verificar que `dist/tessdata/*.traineddata.gz` exista.

- [ ] **Step 3: Smoke test local**

Run: `npm run dev`
Verificar manualmente en el navegador:
1. Login.
2. Ir a "Registrar compra".
3. Click "Registrar por foto".
4. Subir una foto de un ticket real.
5. Esperar OCR (2-5s).
6. Ver productos parseados en pantalla de revisión.
7. Editar uno, eliminar otro, agregar uno manual.
8. Guardar compra.
9. Verificar que aparece en Dashboard y PurchaseHistory.

- [ ] **Step 4: Deploy a Cloudflare Pages**

Push a `master`:
```bash
git push origin master
```
Cloudflare Pages auto-deploya. Verificar en el dashboard de Cloudflare que el build pasa y el deploy queda en producción.

- [ ] **Step 5: Verificar en producción**

Abrir la URL de Cloudflare Pages. Repetir el smoke test del Step 3 en producción. Reportar cualquier diferencia.

- [ ] **Step 6: Actualizar `tasks-v2.md`**

Marcar las tareas 2.1-2.6 de la Fase 2 como `aprobada`:

```md
### Fase 2 — OCR por Foto
| # | Tarea | Titán | Estado |
|---|---|---|---|
| 2.1 | Instalar y configurar Tesseract.js | Atlas | aprobada |
| 2.2 | Crear servicio de OCR (`src/services/ocr.ts`) | Prometeo | aprobada |
| 2.3 | Crear componente de captura de foto (cámara o galería) | Hefesto | aprobada |
| 2.4 | Procesar imagen y extraer productos/precios | Prometeo | aprobada |
| 2.5 | Mostrar resultados y permitir edición antes de guardar | Hefesto | aprobada |
| 2.6 | Tests de OCR | Temis | aprobada |
```

- [ ] **Step 7: Commit final**

```bash
git add tasks-v2.md
git commit -m "docs: Fase 2 OCR aprobada y desplegada"
git push origin master
```

---

## Self-Review Checklist

- **Spec coverage:**
  - Híbrido (ticket + manual): Task 8 (OCRReview con ProductEditor para agregar manual) ✓
  - Cámara o galería: Task 7 (`accept="image/*"` sin `capture`) ✓
  - Lazy-load + web worker: Task 4 (`import('tesseract.js')` dinámico, `createWorker`) ✓
  - spa+eng: Task 4 (`loadLanguage('spa+eng')`) ✓
  - Self-hosted: Task 4 (`langPath: /tessdata`, modelos en `public/tessdata/`) ✓
  - Parser genérico: Task 2 (regex, sin plantillas por cadena) ✓
  - Filtrar score < 50: Task 2 (`if (score < 50) continue`) ✓
  - Resaltar 50-70: Task 8 (`isLowConfidence` → `bg-yellow-50`) ✓
  - Imagen siempre guardada: Task 5 (`uploadReceiptImage` antes de OCR) ✓
  - Cantidad "Nx"/"xN": Task 2 (`QUANTITY_PREFIX_REGEX`, `QUANTITY_SUFFIX_REGEX`) ✓
  - Error + fallback: Task 9 (modo error con reintentar + cargar manualmente) ✓
  - Timeout 30s: Task 4 (`OCR_TIMEOUT_MS`, `Promise.race`) ✓
  - Storage path `receipts/{userId}/{purchaseId}`: Task 3 ✓
  - `confidence` en `PurchaseItem`: Task 1 ✓

- **Placeholders:** Ninguno. Todos los pasos tienen código completo.

- **Type consistency:**
  - `ParsedItem` definido en Task 1, usado en Tasks 2, 5, 8 ✓
  - `Word` definido en Task 2, usado en Tasks 4, 5 ✓
  - `runOCR` retorna `OCRResult` con `text` + `words: Word[]` — usado en Task 5 ✓
  - `uploadReceiptImage(userId, file, purchaseId)` — usado en Task 5 ✓
  - `useOCR` retorna `{ status, items, imageUrl, error, processTicket, reset }` — usado en Task 9 ✓
  - `ProductEditor` props `initialItem?, onSave, onCancel` — usado en Task 8 ✓
  - `OCRReview` props `items, imageUrl, userId, onSaved, onRetry` — usado en Task 9 ✓
