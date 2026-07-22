import type { Category } from '@/types'
import { CATEGORY_ICON_BY_CATEGORY_ID } from '@/config/categoryIcons'

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'lacteos', name: 'Lácteos', icon: CATEGORY_ICON_BY_CATEGORY_ID.lacteos, isDefault: true },
  { id: 'panaderia', name: 'Panadería', icon: CATEGORY_ICON_BY_CATEGORY_ID.panaderia, isDefault: true },
  { id: 'carnes', name: 'Carnes', icon: CATEGORY_ICON_BY_CATEGORY_ID.carnes, isDefault: true },
  { id: 'frutas-verduras', name: 'Frutas y Verduras', icon: CATEGORY_ICON_BY_CATEGORY_ID['frutas-verduras'], isDefault: true },
  { id: 'bebidas', name: 'Bebidas', icon: CATEGORY_ICON_BY_CATEGORY_ID.bebidas, isDefault: true },
  { id: 'limpieza', name: 'Limpieza', icon: CATEGORY_ICON_BY_CATEGORY_ID.limpieza, isDefault: true },
  { id: 'higiene', name: 'Higiene', icon: CATEGORY_ICON_BY_CATEGORY_ID.higiene, isDefault: true },
  { id: 'snacks', name: 'Snacks', icon: CATEGORY_ICON_BY_CATEGORY_ID.snacks, isDefault: true },
  { id: 'otro', name: 'Otro', icon: CATEGORY_ICON_BY_CATEGORY_ID.otro, isDefault: true },
]

export function getCategoryById(id: string): Category | undefined {
  return DEFAULT_CATEGORIES.find(cat => cat.id === id)
}
