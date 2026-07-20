import { getCategoryForProduct } from './categoryMapping'

const KEYWORD_MAP: Record<string, string> = {
  // Lácteos
  'leche': 'lacteos', 'leches': 'lacteos', 'queso': 'lacteos', 'yogur': 'lacteos',
  'manteca': 'lacteos', 'crema': 'lacteos', 'dulce-de-leche': 'lacteos',
  // Panadería
  'pan': 'panaderia', 'galletas': 'panaderia', 'facturas': 'panaderia',
  'bizcocho': 'panaderia', 'tortilla': 'panaderia',
  // Carnes
  'carne': 'carnes', 'pollo': 'carnes', 'cerdo': 'carnes', 'atun': 'carnes',
  'jamon': 'carnes', 'salchichas': 'carnes', 'chorizo': 'carnes',
  // Frutas y verduras
  'manzana': 'frutas-verduras', 'lechuga': 'frutas-verduras', 'tomate': 'frutas-verduras',
  'papa': 'frutas-verduras', 'cebolla': 'frutas-verduras', 'zanahoria': 'frutas-verduras',
  'naranja': 'frutas-verduras', 'banana': 'frutas-verduras', 'limon': 'frutas-verduras',
  // Bebidas
  'agua': 'bebidas', 'jugo': 'bebidas', 'coca': 'bebidas', 'cerveza': 'bebidas',
  'vino': 'bebidas', 'gaseosa': 'bebidas', 'cafe': 'bebidas',
  // Limpieza
  'lavandina': 'limpieza', 'detergente': 'limpieza', 'jabon': 'limpieza',
  'esponja': 'limpieza', 'bolsa': 'limpieza', 'papel-higienico': 'limpieza',
  // Higiene
  'shampoo': 'higiene', 'cepillo': 'higiene', 'pasta': 'higiene',
  'desodorante': 'higiene', 'toalla': 'higiene',
  // Snacks
  'papa-frita': 'snacks', 'mani': 'snacks', 'chocolate': 'snacks',
  'caramelo': 'snacks', 'golosinas': 'snacks',
}

export function normalizeProductName(name: string): string {
  return name.toLowerCase().trim()
}

export async function suggestCategory(
  userId: string,
  productName: string
): Promise<string | null> {
  const normalized = normalizeProductName(productName)

  // 1. Check user learning first
  const learned = await getCategoryForProduct(userId, normalized)
  if (learned) return learned

  // 2. Fallback to keyword map
  const words = normalized.split(/\s+/)
  for (const word of words) {
    const categoryId = KEYWORD_MAP[word]
    if (categoryId) return categoryId
  }

  // 3. No match
  return null
}
