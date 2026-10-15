### Task 14: Add CategoryBadge to TodayPurchases

**Files:**
- Modify: `src/components/TodayPurchases.tsx`

**Objetivo:** Mostrar CategoryBadge al lado de cada producto en la lista de compras de hoy.

## Cambios necesarios

1. **Imports:**
```typescript
import { CategoryBadge } from '@/components/CategoryBadge'
import { useCategories } from '@/hooks/useCategories'
```

2. **Hook:** Usar useCategories
```typescript
const { categories } = useCategories(user?.uid ?? null)
```

3. **En el render de items:** Añadir CategoryBadge
```typescript
<div className="flex items-center gap-2">
  <span>{item.quantity}x {item.name}</span>
  {item.category && categories.find(c => c.id === item.category) && (
    <CategoryBadge category={categories.find(c => c.id === item.category)!} />
  )}
</div>
```

## Notas importantes

- Mira `src/components/TodayPurchases.tsx` actual
- El componente recibe `date` y `refreshKey` como props
- Necesitas obtener el userId - revisa cómo lo obtiene el componente (probablemente via useAuth)
- Las compras sin categoría se muestran sin badge

## Commit

```bash
git add src/components/TodayPurchases.tsx
git commit -m "feat: add CategoryBadge to TodayPurchases"
```
