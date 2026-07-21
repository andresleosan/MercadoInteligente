### Task 10: Integrate CategorySelector in AddPurchase

**Files:**
- Modify: `src/pages/AddPurchase.tsx`

**Objetivo:** Integrar el componente CategorySelector en el formulario de registro de compras para que:
1. Al escribir el nombre del producto, se sugiera automáticamente la categoría
2. El usuario pueda cambiar la categoría antes de guardar
3. Se guarde la categoría con el PurchaseItem
4. Se guarde el mapping para learning del usuario

## Cambios necesarios

1. **Imports:** Añadir al inicio del archivo
```typescript
import { CategorySelector } from '@/components/CategorySelector'
import { suggestCategory } from '@/services/categorizer'
import { saveCategoryMapping } from '@/services/categoryMapping'
```

2. **Estado:** Añadir state para categorías por item
```typescript
const [itemCategories, setItemCategories] = useState<Record<number, string>>({})
```

3. **En el map de items:** Después del input "Producto", añadir CategorySelector. Modificar el onChange del input "Producto" para llamar suggestCategory con debounce.

4. **En handleSubmit:** Mapear validItems para incluir category y guardar mappings

## Notas importantes

- Mira `src/pages/AddPurchase.tsx` actual. Ya tiene importaciones de useAuth, useOCR, useStores, etc.
- El campo `category` ya está soportado en `PurchaseItem` (Tarea 1)
- Usa `user?.uid` para obtener el userId
- El suggestCategory debe llamarse solo si el nombre tiene al menos 3 caracteres
- Para evitar llamadas excesivas, usa un debounce simple o solo llama cuando el usuario deja de escribir

## Commit

```bash
git add src/pages/AddPurchase.tsx
git commit -m "feat: integrate CategorySelector in AddPurchase with auto-suggest"
```

## Importante

- No rompas la funcionalidad existente (modos photo, voice, review)
- El formulario ya tiene un layout de tarjetas apiladas (de refactor anterior) — añade CategorySelector dentro de cada tarjeta de item
- Después del input "Producto" y antes de la grilla "Cantidad/Precio unitario"
