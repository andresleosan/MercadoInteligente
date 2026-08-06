# Categorización manual Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Completar v3-Fase 1.4 haciendo que el formulario manual sugiera y persista categorías de productos.

**Architecture:** `AddPurchase` conservará la categoría en cada `PurchaseItem` y delegará la sugerencia en `suggestCategory`. La consulta se ejecutará con debounce de 300 ms, se invalidarán resultados obsoletos y `CategorySelector` permitirá corregir la sugerencia. No se cambia el contrato de Firestore ni se duplican reglas de categorización.

**Tech Stack:** React 18, TypeScript estricto, Vitest, Testing Library, Firebase/Firestore existente.

## Global Constraints

- Reutilizar `suggestCategory(userId, productName)` como única fuente de sugerencias.
- Nombre vacío o menor de tres caracteres: limpiar la categoría y no consultar.
- Producto desconocido: mantener `Sin categoría`.
- Los errores de sugerencia no deben bloquear el registro.
- No modificar los flujos OCR, voz ni el modelo de Firestore.
- No agregar dependencias nuevas.

---

### Task 1: Tests del flujo manual categorizado

**Files:**
- Modify: `src/pages/AddPurchase.test.tsx`
- Test: `src/pages/AddPurchase.test.tsx`

**Interfaces:**
- Consumes: `AddPurchase`, `suggestCategory`, `addPurchase`.
- Produces: evidencia de sugerencia, limpieza y persistencia de `PurchaseItem.category`.

- [ ] **Step 1: Agregar mocks explícitos**

Mockear `@/services/categorizer` con `suggestCategory: vi.fn()` y `@/components/CategorySelector` con un botón de prueba que exponga `selectedCategoryId` y ejecute `onSelect`. Mantener el mock de `addPurchase` existente.

- [ ] **Step 2: Escribir el test de sugerencia automática**

Agregar un test que configure `suggestCategory` para resolver `lacteos`, escriba `Leche` en el campo `Producto` y espere que el selector reciba `selectedCategoryId="lacteos"`.

- [ ] **Step 3: Ejecutar el test y confirmar RED**

Run: `npx vitest run src/pages/AddPurchase.test.tsx -t "sugiere categoría"`

Expected: FAIL porque el formulario manual todavía no consulta `suggestCategory`.

- [ ] **Step 4: Agregar el test de persistencia y limpieza**

Verificar que, después de completar cantidad y precio y registrar la compra, `addPurchase` recibe un item con `category: 'lacteos'`. Después borrar el nombre y esperar que `suggestCategory` no se invoque para el valor vacío y que el selector vuelva a `Sin categoría`.

- [ ] **Step 5: Ejecutar los tests y confirmar RED**

Run: `npx vitest run src/pages/AddPurchase.test.tsx -t "categoría"`

Expected: FAIL por ausencia de integración manual.

---

### Task 2: Sugerencia debounced en `AddPurchase`

**Files:**
- Modify: `src/pages/AddPurchase.tsx:1-225,514-610`
- Test: `src/pages/AddPurchase.test.tsx`

**Interfaces:**
- Consumes: `suggestCategory(userId: string, productName: string): Promise<string | null>`.
- Produces: `PurchaseItem.category?: string` en las compras manuales.

- [ ] **Step 1: Agregar estado y refs de sugerencia**

Importar `suggestCategory` y crear un ref de versión por índice junto con el timer existente. La versión impedirá que una respuesta vieja sobrescriba el nombre actual.

- [ ] **Step 2: Implementar la función de programación**

Crear una función local `scheduleCategorySuggestion(index: number, productName: string)` que:

```ts
function scheduleCategorySuggestion(index: number, productName: string) {
  const currentTimer = debounceTimersRef.current[index]
  if (currentTimer) clearTimeout(currentTimer)

  const normalizedName = productName.trim()
  if (normalizedName.length < 3 || !user) {
    setItems(prev => prev.map((item, itemIndex) =>
      itemIndex === index ? { ...item, category: undefined } : item
    ))
    return
  }

  debounceTimersRef.current[index] = setTimeout(async () => {
    try {
      const category = await suggestCategory(user.uid, normalizedName)
      setItems(prev => prev.map((item, itemIndex) =>
        itemIndex === index ? { ...item, category: category ?? undefined } : item
      ))
    } catch (error) {
      console.error('Error sugiriendo categoría:', error)
    }
  }, 300)
}
```

La implementación debe añadir una versión/guardia de respuesta para evitar resultados obsoletos cuando el usuario cambia rápidamente de producto.

- [ ] **Step 3: Conectar la función al nombre manual**

Actualizar `updateItem` para llamar a `scheduleCategorySuggestion` solo cuando `field === 'name'`, limpiando la categoría actual mientras el nuevo nombre se evalúa. Mantener intactos los cálculos de `totalPrice`.

- [ ] **Step 4: Conectar `CategorySelector` a cada fila manual**

Importar `CategorySelector` y renderizarlo debajo de cada fila con `userId={user.uid}`. Su `onSelect` actualizará solo `items[index].category`, usando `undefined` para `null`.

- [ ] **Step 5: Reindexar timers al eliminar filas**

Cancelar los timers pendientes al eliminar una fila y limpiar el ref de versiones para que una respuesta antigua no se aplique a otra fila.

- [ ] **Step 6: Ejecutar el test de componente y confirmar GREEN**

Run: `npx vitest run src/pages/AddPurchase.test.tsx -t "categoría"`

Expected: PASS con la sugerencia, limpieza y persistencia verificadas.

- [ ] **Step 7: Ejecutar regresiones cercanas**

Run: `npx vitest run src/pages/AddPurchase.test.tsx src/tests/integration/voice-purchase-flow.test.tsx src/components/OCRReview.test.tsx`

Expected: todos los tests PASS; los flujos voz/OCR no deben llamar a la nueva lógica manual.

---

### Task 3: Verificación y documentación de estado

**Files:**
- Modify: `docs/roadmap/tasks-v3.md:5-14`
- Modify: `docs/product/BRIEF.md` si el backlog de v3 requiere reflejar el avance

- [ ] **Step 1: Ejecutar la suite completa**

Run: `npm run test -- --run`

Expected: todos los archivos y tests pasan.

- [ ] **Step 2: Ejecutar lint y build**

Run: `npm run lint` y `npm run build`

Expected: ambos comandos terminan correctamente; se documenta cualquier warning de chunk existente.

- [ ] **Step 3: Ejecutar E2E completo**

Run: `npm run test:e2e:full`

Expected: 45/45 pruebas pasan con emuladores Firebase locales.

- [ ] **Step 4: Actualizar estados reales de Fase 1**

Marcar 1.4 y 1.7 como `aprobada` solo después de la evidencia anterior. Mantener las tareas de Fase 1 cuya implementación no se verificó en esta sesión, y las fases 2-6, como `pendiente`.

- [ ] **Step 5: Revisar diff final**

Run: `git diff --check` y `git status --short`

Expected: solo archivos de esta tarea modificados y sin errores de whitespace.
