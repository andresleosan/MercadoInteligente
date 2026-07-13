# Spec — Fase 2: OCR por Foto

**Fecha:** 2026-07-13
**Proyecto:** Mercado Inteligente (v2)
**Autor:** Cronos (orquestación) + Andrés (aprobación)
**Estado:** Aprobado — listo para plan de implementación

## Contexto

Mercado Inteligente es una PWA de control de gastos de mercado. El MVP v1 (CRUD manual de compras) está desplegado en Cloudflare Pages. La v2 agrega diferenciadores; el primero es **OCR por foto** — el diferenciador central del producto ("Mercado Inteligente" = registrar por foto).

Stack relevante: React 18 + TypeScript + Vite, Firebase (Auth/Firestore/Storage), vite-plugin-pwa (offline-first), Vitest para testing.

## Objetivo

Permitir al usuario registrar una compra fotografiando el ticket del supermercado. Tesseract.js extrae texto del ticket, un parser genérico lo convierte en productos (nombre, precio, cantidad), el usuario revisa y edita antes de guardar. La imagen del ticket se guarda en Firebase Storage como evidencia.

## Decisiones de diseño (aprobadas)

1. **Alcance: híbrido.** Modo principal = OCR de ticket completo. Fallback = carga de producto individual manual. El usuario siempre puede editar/agregar/eliminar productos en la pantalla de revisión.
2. **Origen de imagen: cámara o galería.** `<input type="file" accept="image/*">` sin `capture` forzado — el SO ofrece ambas opciones.
3. **Ejecución: lazy-load + web worker.** Tesseract.js se carga bajo demanda (no en bundle inicial) y corre en un Web Worker para no bloquear la UI.
4. **Idioma: spa+eng.** Modelos multilingües para tickets argentinos reales (mezcla español + marcas en inglés). ~6MB, descarga one-time cacheada.
5. **Modelos: self-hosted.** Archivos `.traineddata` en `public/tessdata/`, servidos desde el mismo origin, precacheados por el service worker de vite-plugin-pwa. Primer uso offline funciona.
6. **Parsing: genérico por heurísticas.** Regex que busca patrón producto+precio por línea. Sin plantillas por cadena. Filtra líneas con score < 50 o que no matchean patrón. Detecta "Nx"/"xN" para cantidad. Usuario siempre edita.
7. **Imagen: guardar siempre.** Cada compra con OCR sube la imagen a Storage, URL referenciada en el documento de compra. Free tier 5GB suficiente para v2.
8. **Cantidad: híbrido.** Parser detecta "Nx"/"xN" explícito. Si no, default = 1. Usuario edita en revisión.
9. **Confianza: filtrar < 50 + resaltar 50-70.** Líneas con score < 50 se descartan. Campos con score 50-70 se resaltan en amarillo en la UI de revisión.
10. **Fallo completo: error + fallback inmediato.** Si OCR no extrae nada, mensaje "No pudimos leer el ticket. Reintentar o cargar manualmente." Carga manual lleva a `OCRReview` vacío listo para agregar a mano.

## Arquitectura

### Nuevos archivos

- `src/services/ocr.ts` — wrapper de Tesseract.js. Lazy-load del paquete, web worker, modelos `spa+eng` self-hosted desde `/tessdata/`. Retorna `{ text, words: [{ text, confidence }] }`.
- `src/services/ticketParser.ts` — parser genérico. Texto + scores → `ParsedItem[]`. Filtra score < 50 o no-match de patrón. Detecta "Nx"/"xN" para quantity. Marca score 50-70 como baja confianza.
- `src/services/storage.ts` — wrapper de Firebase Storage. Sube imagen a `users/{uid}/tickets/{purchaseId}.jpg`, retorna URL pública.
- `src/hooks/useOCR.ts` — orquesta el flujo: estados idle → uploading → ocr-running → parsing → done/error.
- `src/components/OCRCapture.tsx` — UI de captura: `<input type="file" accept="image/*">`. Cámara o galería.
- `src/components/OCRReview.tsx` — pantalla de revisión: lista productos, resalta baja confianza en amarillo, botones editar/eliminar/agregar, guardar.
- `src/components/ProductEditor.tsx` — editor de un producto (nombre, precio, cantidad). Reutilizable para edición de items parseados y carga manual individual.

### Archivos existentes que se modifican

- `src/types/index.ts` — `Purchase` agrega `imageUrl?: string`. `PurchaseItem` agrega `confidence?: number`.
- `src/pages/AddPurchase.tsx` — agrega botón "Registrar por foto" que abre `OCRCapture`.
- `src/services/purchases.ts` — `addPurchase` acepta `imageUrl` opcional.
- `public/tessdata/` — nueva carpeta con `spa.traineddata` + `eng.traineddata` (~6MB).

### Tipo nuevo: `ParsedItem`

```ts
interface ParsedItem {
  name: string
  unitPrice: number
  quantity: number
  totalPrice: number
  confidence: number  // 0-100, promedio de las palabras de la línea
}
```

`ParsedItem` se mapea a `PurchaseItem` al guardar (con `confidence` opcional).

## Flujo de uso

1. **AddPurchase** muestra botón "Registrar por foto" (junto al formulario manual existente).
2. Usuario toca el botón → **OCRCapture** se abre.
3. Usuario selecciona imagen (cámara o galería).
4. **useOCR hook:**
   - Sube imagen a Storage → obtiene `imageUrl`.
   - Lazy-load Tesseract.js + web worker.
   - Corre OCR con modelos `spa+eng` self-hosted.
   - ticketParser: texto → `ParsedItem[]`.
5. **OCRReview** muestra resultado:
   - Lista de productos parseados.
   - Campos con confianza 50-70 en amarillo.
   - Botones por producto: editar, eliminar.
   - Botón "Agregar producto" (abre `ProductEditor` vacío = modo manual).
   - Botón "Guardar compra".
6. Usuario edita/confirma → guarda compra con `addPurchase(items, imageUrl)`.
7. Vuelve a Dashboard.

### Flujo de error

Si OCR falla completamente (texto vacío, todo filtrado, worker crashea/timeout >30s):
- Mensaje: "No pudimos leer el ticket. Reintentar o cargar manualmente."
- Botón "Reintentar" → vuelve a OCRCapture.
- Botón "Cargar manualmente" → OCRReview vacío (0 productos, listo para agregar a mano).

## Modelo de datos

### `PurchaseItem` (ampliado)

```ts
interface PurchaseItem {
  name: string
  unitPrice: number
  quantity: number
  totalPrice: number
  confidence?: number  // 0-100, solo para items via OCR
}
```

### `Purchase` (ampliado)

```ts
interface Purchase {
  id: string
  items: PurchaseItem[]
  total: number
  createdAt: Date
  imageUrl?: string  // URL de Storage del ticket
}
```

### Firestore

Sin cambios de esquema — `imageUrl` y `confidence` viven dentro de documentos existentes (`users/{uid}/purchases/{purchaseId}`). No requiere migración.

### Storage

- Path: `users/{uid}/tickets/{purchaseId}.jpg` (o `.png` según formato original).
- `purchaseId` se genera con `doc(collection(db, ...))` antes de escribir el documento Firestore — es un ID auto-generado disponible antes del `setDoc`.
- Regla: owner-only (ya existe en `storage.rules`).

## Manejo de errores

| Escenario | Acción |
|---|---|
| Cámara no disponible (desktop, permiso denegado) | `<input>` solo ofrece galería. Sin error. |
| Imagen >10MB | Comprimir con canvas antes de subir. Warning: "Imagen optimizada". |
| Storage falla al subir | "No se pudo guardar la imagen. ¿Continuar sin foto?" → OCR corre sin `imageUrl`. |
| Tesseract.js no carga / worker crashea | "No pudimos leer el ticket. Reintentar o cargar manualmente." |
| OCR devuelve texto vacío o todo filtrado (score < 50) | "No reconocimos productos en esta imagen. Reintentar o cargar manualmente." |
| Parser no extrae productos válidos | Igual que OCR vacío. |
| Worker timeout (>30s) | Cancelar worker, error con reintentar/manual. |
| Firestore falla al guardar compra | "No se pudo guardar la compra. Intentá de nuevo." Productos parseados quedan en pantalla. |

**Principio:** el usuario nunca pierde el trabajo parcial. Si el OCR extrajo 5 productos y falla el guardado, los 5 siguen en `OCRReview` para reintentar.

## Testing

| Nivel | Qué cubre | Herramienta |
|---|---|---|
| Unit — `ticketParser` | Texto de muestra → `ParsedItem[]` esperado. Casos: ticket limpio, ticket con "2x", encabezados (filtrados), score bajo (filtrado), ticket vacío. | Vitest |
| Unit — `ocr.ts` | Mock de Tesseract.js. Verificar: lazy-load, modelos self-hosted, formato de retorno. | Vitest + vi.mock |
| Unit — `storage.ts` | Mock de Firebase Storage. Path correcto, URL, manejo de error. | Vitest + vi.mock |
| Unit — `useOCR` | Mock de ocr + parser + storage. Estados: idle → uploading → ocr-running → parsing → done/error. | Vitest + Testing Library |
| Component — `OCRCapture` | Render, input file, callback con imagen. | Testing Library |
| Component — `OCRReview` | Render con productos, resaltado de baja confianza, editar/eliminar/agregar, guardar. | Testing Library |
| Component — `ProductEditor` | Form vacío y pre-llenado, validación. | Testing Library |

**No se prueba en v2:** OCR real con Tesseract (depende de hardware/browser, flaky en CI). Se prueba manualmente en el navegador.

## Fuera de alcance (v2)

- Plantillas de parsing por cadena de supermercado (evaluar en v3).
- LLM para parsing de tickets (evaluar en v3).
- Purga automática de imágenes huérfanas en Storage (cuando usuario no guarda la compra).
- Soporte para tickets multi-página.
- Detección automática de la cadena de supermercado.
- Exportar imagen del ticket desde la UI (se accede vía URL de Storage si se necesita).
