### Task 11: Integrate CategorySelector in OCRReview

**Files:**
- Modify: `src/components/OCRReview.tsx`

**Objetivo:** Integrar el componente CategorySelector en el flujo de revisión OCR para que:
1. Al parsear productos del ticket, se sugiera automáticamente la categoría
2. El usuario pueda cambiar la categoría antes de guardar
3. Se guarde la categoría con cada PurchaseItem

## Cambios necesarios

1. **Imports:** Añadir
```typescript
import { CategorySelector } from '@/components/CategorySelector'
import { suggestCategory } from '@/services/categorizer'
import { saveCategoryMapping } from '@/services/categoryMapping'
```

2. **Estado:** Añadir state para categorías por item
```typescript
const [itemCategories, setItemCategories] = useState<Record<number, string>>({})
```

3. **useEffect:** Cuando los items cambian, sugerir categoría automáticamente
```typescript
useEffect(() => {
  if (userId && items.length > 0) {
    items.forEach((item, index) => {
      suggestCategory(userId, item.name).then(cat => {
        if (cat) setItemCategories(prev => ({ ...prev, [index]: cat }))
      })
    })
  }
}, [items, userId])
```

4. **En el render de items:** Añadir CategorySelector después del nombre del producto

5. **Al guardar:** Incluir category en los items Y guardar mapping con saveCategoryMapping

## Notas importantes

- Mira `src/components/OCRReview.tsx` actual para entender su estructura
- El componente recibe props como `items`, `imageUrl`, `userId`, `storeId`, `storeName`, `purchaseDate`, `onSaved`, `onRetry`
- El componente ya tiene lógica de review y edición de productos
- No rompas la funcionalidad existente
- El guardado debe incluir category en cada PurchaseItem

## Commit

```bash
git add src/components/OCRReview.tsx
git commit -m "feat: integrate CategorySelector in OCRReview with auto-suggest"
```
