import type { LucideIcon } from 'lucide-react'
import {
  Briefcase,
  Car,
  Coffee,
  Croissant,
  GraduationCap,
  Hammer,
  Home,
  Laptop,
  Milk,
  NotebookPen,
  Package,
  PawPrint,
  Pill,
  Salad,
  Scissors,
  Shirt,
  ShoppingCart,
  Sparkles,
  UtensilsCrossed,
} from 'lucide-react'

export type CategoryIconKey =
  | 'shopping-cart'
  | 'utensils-crossed'
  | 'pill'
  | 'hammer'
  | 'notebook-pen'
  | 'croissant'
  | 'laptop'
  | 'shirt'
  | 'paw-print'
  | 'home'
  | 'car'
  | 'briefcase'
  | 'scissors'
  | 'graduation-cap'
  | 'package'
  | 'milk'
  | 'coffee'
  | 'salad'
  | 'sparkles'

export interface CategoryIconOption {
  key: CategoryIconKey
  label: string
  Icon: LucideIcon
  aliases?: string[]
}

export const CATEGORY_ICON_OPTIONS: CategoryIconOption[] = [
  { key: 'shopping-cart', label: 'Supermercado', Icon: ShoppingCart, aliases: ['supermercado', 'carrito', 'compras', '🛒'] },
  { key: 'utensils-crossed', label: 'Restaurante', Icon: UtensilsCrossed, aliases: ['restaurante', 'comida', 'almuerzo', 'cena'] },
  { key: 'pill', label: 'Farmacia', Icon: Pill, aliases: ['farmacia', 'salud', 'medicina', '🧼'] },
  { key: 'hammer', label: 'Ferretería', Icon: Hammer, aliases: ['ferreteria', 'ferretería', 'herramientas', 'obra'] },
  { key: 'notebook-pen', label: 'Papelería', Icon: NotebookPen, aliases: ['papeleria', 'papelería', 'libretas', 'escritura'] },
  { key: 'croissant', label: 'Panadería', Icon: Croissant, aliases: ['panaderia', 'panadería', 'pan', 'bollería'] },
  { key: 'laptop', label: 'Tecnología', Icon: Laptop, aliases: ['tecnologia', 'tecnología', 'computadora', 'pc'] },
  { key: 'shirt', label: 'Ropa', Icon: Shirt, aliases: ['ropa', 'vestimenta', 'moda'] },
  { key: 'paw-print', label: 'Mascotas', Icon: PawPrint, aliases: ['mascotas', 'perros', 'gatos', 'animales'] },
  { key: 'home', label: 'Hogar', Icon: Home, aliases: ['hogar', 'casa', 'decoracion', 'decoración'] },
  { key: 'car', label: 'Transporte', Icon: Car, aliases: ['transporte', 'auto', 'vehículo', 'vehiculo'] },
  { key: 'briefcase', label: 'Servicios', Icon: Briefcase, aliases: ['servicios', 'trabajo', 'profesional'] },
  { key: 'scissors', label: 'Belleza', Icon: Scissors, aliases: ['belleza', 'estetica', 'estética', 'peluquería'] },
  { key: 'graduation-cap', label: 'Educación', Icon: GraduationCap, aliases: ['educacion', 'educación', 'escuela', 'estudio'] },
  { key: 'package', label: 'Otros', Icon: Package, aliases: ['otros', 'otro', 'general'] },
  { key: 'milk', label: 'Lácteos', Icon: Milk, aliases: ['lacteos', 'lácteos', 'leche', 'dairy'] },
  { key: 'coffee', label: 'Bebidas', Icon: Coffee, aliases: ['bebidas', 'cafe', 'café', 'refresco'] },
  { key: 'salad', label: 'Frutas y Verduras', Icon: Salad, aliases: ['frutas-verduras', 'frutas', 'verduras', 'frescos'] },
  { key: 'sparkles', label: 'Limpieza', Icon: Sparkles, aliases: ['limpieza', 'aseo', 'orden'] },
]

const CATEGORY_ICON_LOOKUP = new Map(CATEGORY_ICON_OPTIONS.map((option) => [option.key, option]))
const LEGACY_CATEGORY_ICON_LOOKUP = new Map<string, CategoryIconKey>([
  ['🛒', 'shopping-cart'],
  ['🏪', 'shopping-cart'],
  ['🏬', 'shopping-cart'],
  ['🍽️', 'utensils-crossed'],
  ['🍲', 'utensils-crossed'],
  ['🥛', 'milk'],
  ['🍞', 'croissant'],
  ['🥩', 'utensils-crossed'],
  ['🥬', 'salad'],
  ['🥤', 'coffee'],
  ['🧹', 'sparkles'],
  ['🧼', 'sparkles'],
  ['🍿', 'package'],
  ['📦', 'package'],
  ['🧊', 'package'],
  ['🐶', 'paw-print'],
  ['🏠', 'home'],
  ['💼', 'briefcase'],
  ['🎯', 'package'],
])

export const CATEGORY_ICON_BY_CATEGORY_ID: Record<string, CategoryIconKey> = {
  supermercado: 'shopping-cart',
  restaurante: 'utensils-crossed',
  farmacia: 'pill',
  ferreteria: 'hammer',
  'ferretería': 'hammer',
  papeleria: 'notebook-pen',
  'papelería': 'notebook-pen',
  panaderia: 'croissant',
  'panadería': 'croissant',
  tecnologia: 'laptop',
  'tecnología': 'laptop',
  ropa: 'shirt',
  mascotas: 'paw-print',
  hogar: 'home',
  transporte: 'car',
  servicios: 'briefcase',
  belleza: 'scissors',
  educacion: 'graduation-cap',
  'educación': 'graduation-cap',
  otros: 'package',
  otro: 'package',
  lacteos: 'milk',
  'lácteos': 'milk',
  bebidas: 'coffee',
  'frutas-verduras': 'salad',
  limpieza: 'sparkles',
  higiene: 'pill',
  snacks: 'package',
  carnes: 'utensils-crossed',
}

export const DEFAULT_CATEGORY_ICON_KEY: CategoryIconKey = 'package'

function normalizeSearchValue(value: string) {
  return value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim()
}

export function getCategoryIconKey(value?: string): CategoryIconKey {
  if (!value) return DEFAULT_CATEGORY_ICON_KEY

  const directMatch = CATEGORY_ICON_LOOKUP.has(value as CategoryIconKey)
    ? (value as CategoryIconKey)
    : LEGACY_CATEGORY_ICON_LOOKUP.get(value)

  if (directMatch) return directMatch

  return CATEGORY_ICON_BY_CATEGORY_ID[value] ?? DEFAULT_CATEGORY_ICON_KEY
}

export function getCategoryIconOption(value?: string): CategoryIconOption {
  return CATEGORY_ICON_LOOKUP.get(getCategoryIconKey(value)) ?? CATEGORY_ICON_LOOKUP.get(DEFAULT_CATEGORY_ICON_KEY)!
}

export function matchesCategoryIconSearch(option: CategoryIconOption, query: string) {
  const normalizedQuery = normalizeSearchValue(query)

  if (!normalizedQuery) return true

  const searchableValues = [option.key, option.label, ...(option.aliases ?? [])]

  return searchableValues.some((value) => normalizeSearchValue(value).includes(normalizedQuery))
}

interface CategoryIconProps {
  icon?: string
  size?: number
  className?: string
}

export function CategoryIcon({ icon, size = 18, className }: CategoryIconProps) {
  const { Icon } = getCategoryIconOption(icon)

  return <Icon size={size} aria-hidden="true" focusable="false" className={className} />
}