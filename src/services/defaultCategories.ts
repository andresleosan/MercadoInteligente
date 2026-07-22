import type { Category } from '@/types'
import { getCategoryIconKey } from '@/config/categoryIcons'

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'lacteos', name: 'Lácteos', icon: getCategoryIconKey('lacteos'), isDefault: true },
  { id: 'panaderia', name: 'Panadería', icon: getCategoryIconKey('panaderia'), isDefault: true },
  { id: 'carnes', name: 'Carnes', icon: getCategoryIconKey('carnes'), isDefault: true },
  { id: 'frutas-verduras', name: 'Frutas y Verduras', icon: getCategoryIconKey('frutas-verduras'), isDefault: true },
  { id: 'bebidas', name: 'Bebidas', icon: getCategoryIconKey('bebidas'), isDefault: true },
  { id: 'limpieza', name: 'Limpieza', icon: getCategoryIconKey('limpieza'), isDefault: true },
  { id: 'higiene', name: 'Higiene', icon: getCategoryIconKey('higiene'), isDefault: true },
  { id: 'snacks', name: 'Snacks', icon: getCategoryIconKey('snacks'), isDefault: true },
  { id: 'otro', name: 'Otro', icon: getCategoryIconKey('otro'), isDefault: true },
]

export function getCategoryById(id: string): Category | undefined {
  return DEFAULT_CATEGORIES.find(cat => cat.id === id)
}
