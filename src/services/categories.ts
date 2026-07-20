import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
} from 'firebase/firestore'
import { db } from '@/config/firebase'
import type { Category } from '@/types'
import { DEFAULT_CATEGORIES } from './defaultCategories'

export async function getCategories(userId: string): Promise<Category[]> {
  if (!db) throw new Error('Firebase no inicializado')

  const categoriesRef = collection(db, 'users', userId, 'categories')
  const snapshot = await getDocs(categoriesRef)
  const customCategories = snapshot.docs.map((d) => ({
    id: d.id,
    ...d.data(),
  })) as Category[]

  return [...DEFAULT_CATEGORIES, ...customCategories]
}

export async function createCategory(
  userId: string,
  name: string,
  icon: string
): Promise<Category> {
  if (!db) throw new Error('Firebase no inicializado')

  const categoriesRef = collection(db, 'users', userId, 'categories')
  const docRef = await addDoc(categoriesRef, {
    name,
    icon,
    isDefault: false,
  })
  return { id: docRef.id, name, icon, isDefault: false }
}

export async function updateCategory(
  userId: string,
  id: string,
  data: Partial<Pick<Category, 'name' | 'icon'>>
): Promise<void> {
  if (!db) throw new Error('Firebase no inicializado')

  const categoryRef = doc(db, 'users', userId, 'categories', id)
  await updateDoc(categoryRef, data)
}

export async function deleteCategory(userId: string, id: string): Promise<void> {
  if (!db) throw new Error('Firebase no inicializado')

  const categoryRef = doc(db, 'users', userId, 'categories', id)
  await deleteDoc(categoryRef)
}
