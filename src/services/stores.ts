import {
  collection,
  doc,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from '@/config/firebase'
import type { Store } from '@/types'

interface StoreData {
  name: string
  category?: string
  color?: string
  icon?: string
}

function validateStoreData(data: StoreData): void {
  if (!data.name || data.name.trim().length === 0) {
    throw new Error('El nombre del store es requerido')
  }
  if (data.name.length > 50) {
    throw new Error('El nombre del store no puede exceder 50 caracteres')
  }
  if (data.color && !/^#[0-9A-Fa-f]{6}$/.test(data.color)) {
    throw new Error('El color debe ser un hexadecimal válido (ej: #10B981)')
  }
}

export async function getStores(userId: string): Promise<Store[]> {
  if (!db) throw new Error('Firebase no inicializado')

  const storesRef = collection(db, 'users', userId, 'stores')
  const q = query(storesRef, orderBy('name', 'asc'))
  const querySnapshot = await getDocs(q)

  return querySnapshot.docs.map((doc) => {
    const data = doc.data()
    return {
      id: doc.id,
      userId,
      name: data.name,
      category: data.category,
      color: data.color,
      icon: data.icon,
      createdAt: data.createdAt?.toDate() || new Date(),
    }
  })
}

export async function createStore(
  userId: string,
  data: StoreData
): Promise<Store> {
  if (!db) throw new Error('Firebase no inicializado')

  validateStoreData(data)

  const storesRef = collection(db, 'users', userId, 'stores')
  const docRef = await addDoc(storesRef, {
    userId,
    name: data.name.trim(),
    category: data.category || null,
    color: data.color || null,
    icon: data.icon || null,
    createdAt: serverTimestamp(),
  })

  return {
    id: docRef.id,
    userId,
    name: data.name.trim(),
    category: data.category as Store['category'],
    color: data.color,
    icon: data.icon,
    createdAt: new Date(),
  }
}

export async function updateStore(
  userId: string,
  storeId: string,
  data: Partial<StoreData>
): Promise<void> {
  if (!db) throw new Error('Firebase no inicializado')

  if (data.name !== undefined) {
    validateStoreData({ name: data.name, ...data })
  }

  const storeRef = doc(db, 'users', userId, 'stores', storeId)
  const updateData: {
    name?: string
    category?: string | null
    color?: string | null
    icon?: string | null
  } = {}

  if (data.name !== undefined) updateData.name = data.name.trim()
  if (data.category !== undefined) updateData.category = data.category || null
  if (data.color !== undefined) updateData.color = data.color || null
  if (data.icon !== undefined) updateData.icon = data.icon || null

  if (Object.keys(updateData).length === 0) {
    return
  }

  await updateDoc(storeRef, updateData)
}

export async function deleteStore(
  userId: string,
  storeId: string
): Promise<void> {
  if (!db) throw new Error('Firebase no inicializado')

  const storeRef = doc(db, 'users', userId, 'stores', storeId)
  await deleteDoc(storeRef)
}
