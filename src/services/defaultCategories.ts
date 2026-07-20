import type { Category } from '@/types'

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'lacteos', name: 'Lácteos', icon: '🥛', isDefault: true },
  { id: 'panaderia', name: 'Panadería', icon: '🍞', isDefault: true },
  { id: 'carnes', name: 'Carnes', icon: '🥩', isDefault: true },
  { id: 'frutas-verduras', name: 'Frutas y Verduras', icon: '🥬', isDefault: true },
  { id: 'bebidas', name: 'Bebidas', icon: '🥤', isDefault: true },
  { id: 'limpieza', name: 'Limpieza', icon: '🧹', isDefault: true },
  { id: 'higiene', name: 'Higiene', icon: '🧼', isDefault: true },
  { id: 'snacks', name: 'Snacks', icon: '🍿', isDefault: true },
  { id: 'otro', name: 'Otro', icon: '📦', isDefault: true },
]

export function getCategoryById(id: string): Category | undefined {
  return DEFAULT_CATEGORIES.find(cat => cat.id === id)
}
