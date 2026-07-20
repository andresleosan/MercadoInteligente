import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  query,
  where,
} from 'firebase/firestore'
import { db } from '@/config/firebase'
import type { CategoryMapping } from '@/types'

function normalizeProductName(name: string): string {
  return name.toLowerCase().trim()
}

export async function getCategoryForProduct(
  userId: string,
  productName: string
): Promise<string | null> {
  if (!db) throw new Error('Firebase no inicializado')

  const normalized = normalizeProductName(productName)
  const mappingsRef = collection(db, 'users', userId, 'categoryMappings')
  const q = query(mappingsRef, where('productName', '==', normalized))
  const snapshot = await getDocs(q)

  if (snapshot.empty) return null

  const firstDoc = snapshot.docs[0]
  return firstDoc?.data().categoryId ?? null
}

export async function saveCategoryMapping(
  userId: string,
  productName: string,
  categoryId: string
): Promise<void> {
  if (!db) throw new Error('Firebase no inicializado')

  const normalized = normalizeProductName(productName)
  const mappingsRef = collection(db, 'users', userId, 'categoryMappings')
  const q = query(mappingsRef, where('productName', '==', normalized))
  const snapshot = await getDocs(q)

  if (snapshot.empty) {
    await addDoc(mappingsRef, {
      productName: normalized,
      categoryId,
      userId,
      createdAt: new Date(),
    })
  } else {
    const existingDoc = snapshot.docs[0]
    const docRef = doc(db, 'users', userId, 'categoryMappings', existingDoc!.id)
    await updateDoc(docRef, { categoryId })
  }
}

export async function getMappingsByCategory(
  userId: string,
  categoryId: string
): Promise<CategoryMapping[]> {
  if (!db) throw new Error('Firebase no inicializado')

  const mappingsRef = collection(db, 'users', userId, 'categoryMappings')
  const q = query(mappingsRef, where('categoryId', '==', categoryId))
  const snapshot = await getDocs(q)

  return snapshot.docs.map((d) => ({
    id: d.id,
    ...d.data(),
  })) as CategoryMapping[]
}
