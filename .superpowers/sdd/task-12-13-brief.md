### Tasks 12-13: CategoryBadge + Category Filter in PurchaseHistory

**Files:**
- Modify: `src/pages/PurchaseHistory.tsx`

**Objetivo:** 
1. Mostrar CategoryBadge al lado de cada producto (Tarea 12)
2. Añadir filtro por categoría arriba de la lista (Tarea 13)

## Cambios necesarios

### Tarea 12: CategoryBadge

1. **Imports:**
```typescript
import { CategoryBadge } from '@/components/CategoryBadge'
import { useCategories } from '@/hooks/useCategories'
```

2. **Hook:** Usar useCategories para obtener las categorías
```typescript
const { categories } = useCategories(user?.uid ?? null)
```

3. **En el render de items:** Añadir CategoryBadge después del nombre del producto
```typescript
<div className="flex items-center gap-2">
  <span>{item.quantity}x {item.name}</span>
  {item.category && categories.find(c => c.id === item.category) && (
    <CategoryBadge category={categories.find(c => c.id === item.category)!} />
  )}
</div>
```

### Tarea 13: Category Filter

1. **State:**
```typescript
const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
```

2. **Filtro dropdown arriba de la lista:**
```typescript
<div className="mb-4">
  <CategorySelector
    userId={user?.uid ?? ''}
    selectedCategoryId={selectedCategory ?? undefined}
    onSelect={setSelectedCategory}
  />
</div>
```

3. **Filtrar purchases:**
```typescript
const filteredPurchases = selectedCategory
  ? purchases.filter(p =>
      p.items.some(item => item.category === selectedCategory)
    )
  : purchases
```

## Notas importantes

- Mira `src/pages/PurchaseHistory.tsx` actual para entender su estructura
- El componente ya tiene props `month` y `version`
- Importa CategorySelector para el filtro
- Las compras sin categoría (legacy) se muestran sin badge
- El filtro "Sin categoría" en el dropdown debe mostrar todas las compras

## Commit

Haz un solo commit para ambas tareas:

```bash
git add src/pages/PurchaseHistory.tsx
git commit -m "feat: add CategoryBadge and category filter to PurchaseHistory"
```
