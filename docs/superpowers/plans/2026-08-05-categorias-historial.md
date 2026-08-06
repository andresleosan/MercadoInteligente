# Categorías en compras e historial Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Formalizar v3-Fase 1.5 con tests que demuestren la visualización de categorías en compras del día y en el historial.

**Architecture:** No se modificará producción. Se agregarán tests de caracterización alrededor de `TodayPurchases`, se creará una suite aislada para `PurchaseHistory` y se actualizará el estado del roadmap solo después de la verificación completa. Los tests mockearán servicios Firebase, categorías y `CategoryBadge` para comprobar el contrato de renderizado sin depender de red ni Firestore.

**Tech Stack:** React 18, TypeScript estricto, Vitest, Testing Library, mocks de servicios existentes.

## Global Constraints

- No cambiar componentes de producción.
- No cambiar el modelo de Firestore ni ejecutar migraciones.
- No implementar el filtro de la tarea 1.6 en este ciclo.
- Un item sin `category` o con un id no resuelto debe seguir visible sin badge ni error.
- Mantener los tests aislados de Firebase y servicios remotos.

---

### Task 1: Cobertura de categorías en `TodayPurchases`

**Files:**
- Modify: `src/components/TodayPurchases.test.tsx`
- Reference: `src/components/TodayPurchases.tsx:126-145`
- Reference: `src/components/CategoryBadge.tsx:24-41`

**Interfaces:**
- Consumes: `getTodayPurchases(date)`, `useCategories()`, `CategoryBadge({ category })`.
- Produces: tests que prueban categoría resuelta, categoría ausente y agrupación existente.

- [ ] **Step 1: Exponer categorías en el mock del hook**

Cambiar el mock de `useCategories` para devolver una categoría estable:

```tsx
const categories = [{
  id: 'lacteos',
  name: 'Lácteos',
  icon: 'milk',
  isDefault: true,
}]

vi.mock('@/hooks/useCategories', () => ({
  useCategories: () => ({ categories, loading: false }),
}))
```

Cambiar el mock de `CategoryBadge` para exponer el contrato observado:

```tsx
vi.mock('@/components/CategoryBadge', () => ({
  CategoryBadge: ({ category }: { category: { id: string; name: string } }) => (
    <span data-testid={`category-badge-${category.id}`}>{category.name}</span>
  ),
}))
```

- [ ] **Step 2: Agregar el test de categoría visible**

Añadir `category: 'lacteos'` al item `Leche` del fixture y dejar `Pan` sin la propiedad `category`. Después de cargar, verificar el badge y el producto:

```tsx
expect(screen.getByText('Leche')).toBeInTheDocument()
expect(screen.getByTestId('category-badge-lacteos')).toHaveTextContent('Lácteos')
expect(screen.getByText('Pan')).toBeInTheDocument()
```

- [ ] **Step 3: Ejecutar la suite del componente**

Run: `npx vitest run src/components/TodayPurchases.test.tsx`

Expected: PASS; la funcionalidad ya existe y el nuevo test la formaliza.

- [ ] **Step 4: Agregar el caso sin categoría**

Usar el mismo item `Pan` sin `category` y verificar que el nombre continúa visible y que no existe un badge asociado a un id inexistente:

```tsx
expect(screen.getByText('Pan')).toBeInTheDocument()
expect(screen.queryByTestId('category-badge-panaderia')).not.toBeInTheDocument()
```

- [ ] **Step 5: Ejecutar nuevamente el test del componente**

Run: `npx vitest run src/components/TodayPurchases.test.tsx`

Expected: PASS sin errores de resolución de categorías.

---

### Task 2: Suite de caracterización para `PurchaseHistory`

**Files:**
- Create: `src/pages/PurchaseHistory.test.tsx`
- Reference: `src/pages/PurchaseHistory.tsx:144-157,198-298`

**Interfaces:**
- Consumes: `getPurchases`, `getPurchasesGroupedByDate`, `getPurchasesGroupedByStore`, `useCategories`, `CategorySelector` y `CategoryBadge`.
- Produces: cobertura de categorías en las vistas `date` y `store` sin tocar producción.

- [ ] **Step 1: Crear mocks deterministas del historial**

Crear el archivo con mocks para auth, categorías, servicios de compras, `CategorySelector` y `CategoryBadge`:

```tsx
vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({ user: { uid: 'test-uid' } }),
}))

vi.mock('@/hooks/useCategories', () => ({
  useCategories: () => ({
    categories: [{ id: 'lacteos', name: 'Lácteos', icon: 'milk', isDefault: true }],
  }),
}))

vi.mock('@/components/CategorySelector', () => ({
  CategorySelector: () => <div data-testid="history-category-selector" />,
}))

vi.mock('@/components/CategoryBadge', () => ({
  CategoryBadge: ({ category }: { category: { id: string; name: string } }) => (
    <span data-testid={`category-badge-${category.id}`}>{category.name}</span>
  ),
}))
```

Configurar los tres servicios de lectura para devolver el mismo `Purchase` con `Leche` categorizada y `Pan` sin categoría, usando `Map` para las respuestas agrupadas:

```tsx
const purchase = {
  id: 'purchase-1',
  userId: 'test-uid',
  storeId: 'store-1',
  storeName: 'Éxito',
  purchaseDate: '2026-07-22',
  items: [
    { name: 'Leche', quantity: 1, unitPrice: 1200, totalPrice: 1200, category: 'lacteos' },
    { name: 'Pan', quantity: 1, unitPrice: 800, totalPrice: 800 },
  ],
  total: 2000,
  createdAt: new Date(),
}

vi.mocked(getPurchases).mockResolvedValue([purchase])
vi.mocked(getPurchasesGroupedByDate).mockResolvedValue(new Map([['2026-07-22', [purchase]]]))
vi.mocked(getPurchasesGroupedByStore).mockResolvedValue(new Map([['store-1', [purchase]]]))
```

- [ ] **Step 2: Probar la vista por fecha**

Renderizar `<PurchaseHistory month="2026-07" />`, esperar el texto `Leche` y verificar:

```tsx
await waitFor(() => expect(screen.getByText('Leche')).toBeInTheDocument())
expect(screen.getByTestId('category-badge-lacteos')).toHaveTextContent('Lácteos')
expect(screen.getByText('Pan')).toBeInTheDocument()
expect(screen.getByTestId('history-category-selector')).toBeInTheDocument()
```

- [ ] **Step 3: Probar la vista por tienda**

Desde el mismo fixture, hacer clic en el botón `Por tienda` y verificar nuevamente el badge:

```tsx
await user.click(screen.getByRole('button', { name: 'Por tienda' }))
expect(screen.getByTestId('category-badge-lacteos')).toHaveTextContent('Lácteos')
```

- [ ] **Step 4: Probar un id no resuelto**

Usar un item con `category: 'categoria-inexistente'` y verificar que el item se muestra sin badge ni error:

```tsx
await waitFor(() => expect(screen.getByText('Leche')).toBeInTheDocument())
expect(screen.queryByTestId('category-badge-categoria-inexistente')).not.toBeInTheDocument()
expect(screen.queryByText(/error al cargar/i)).not.toBeInTheDocument()
```

- [ ] **Step 5: Ejecutar la suite nueva**

Run: `npx vitest run src/pages/PurchaseHistory.test.tsx`

Expected: PASS en fecha, tienda y categoría no resuelta.

---

### Task 3: Actualizar roadmap y cerrar verificación

**Files:**
- Modify: `docs/roadmap/tasks-v3.md:5-14`

- [ ] **Step 1: Marcar 1.5 como aprobada**

Cambiar únicamente la fila 1.5 de `pendiente` a `aprobada`. No modificar el estado de 1.6 en este ciclo.

- [ ] **Step 2: Ejecutar la suite completa**

Run: `npm run test -- --run`

Expected: todos los archivos y tests pasan.

- [ ] **Step 3: Ejecutar lint y build**

Run: `npm run lint` y `npm run build`

Expected: ambos comandos terminan correctamente; el warning existente de chunks mayores a `500 kB` puede permanecer documentado.

- [ ] **Step 4: Ejecutar E2E completo**

Run: `npm run test:e2e:full`

Expected: `45/45` pruebas pasan con emuladores Firebase locales.

- [ ] **Step 5: Revisar diff y confirmar que producción no cambió**

Run: `git diff --check`, `git status --short` y `git diff --name-only`

Expected: solo aparecen los tests, el roadmap y la documentación de esta tarea; no aparecen `TodayPurchases.tsx`, `PurchaseHistory.tsx` ni `CategoryBadge.tsx` como modificados.

- [ ] **Step 6: Commit local sin push**

```bash
git add src/components/TodayPurchases.test.tsx src/pages/PurchaseHistory.test.tsx docs/roadmap/tasks-v3.md
git commit -m "Formaliza categorías en historial"
```
