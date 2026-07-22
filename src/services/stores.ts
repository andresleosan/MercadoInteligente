import {
  collection,
  doc,
  addDoc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  arrayUnion,
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

interface EmbeddedStoreData {
  id: string
  userId: string
  name: string
  category?: Store['category']
  color?: string
  icon?: string
  createdAt: string
}

const USER_STORES_FIELD = 'storeEntries'

function requireDb() {
  if (!db) throw new Error('Firebase no inicializado')
  return db
}

function isPermissionDenied(error: unknown): boolean {
  return typeof error === 'object' && error !== null && 'code' in error && (error as { code?: string }).code === 'permission-denied'
}

function isNotFound(error: unknown): boolean {
  return typeof error === 'object' && error !== null && 'code' in error && (error as { code?: string }).code === 'not-found'
}

function serializeEmbeddedStore(store: Store): EmbeddedStoreData {
  const serialized: EmbeddedStoreData = {
    id: store.id,
    userId: store.userId,
    name: store.name,
    createdAt: store.createdAt.toISOString(),
  }

  if (store.category !== undefined) serialized.category = store.category
  if (store.color !== undefined) serialized.color = store.color
  if (store.icon !== undefined) serialized.icon = store.icon

  return serialized
}

function deserializeEmbeddedStore(data: EmbeddedStoreData): Store {
  return {
    id: data.id,
    userId: data.userId,
    name: data.name,
    category: data.category,
    color: data.color,
    icon: data.icon,
    createdAt: new Date(data.createdAt),
  }
}

async function readEmbeddedStores(userId: string): Promise<Store[]> {
  const userDocRef = doc(requireDb(), 'users', userId)
  const snapshot = await getDoc(userDocRef)

  if (!snapshot.exists()) return []

  const rawEntries = snapshot.data()?.[USER_STORES_FIELD]
  if (!Array.isArray(rawEntries)) return []

  return rawEntries
    .filter((entry): entry is EmbeddedStoreData => Boolean(entry && typeof entry === 'object' && 'id' in entry && 'name' in entry && 'createdAt' in entry))
    .map(deserializeEmbeddedStore)
}

async function writeEmbeddedStore(userId: string, store: Store): Promise<void> {
  const userDocRef = doc(requireDb(), 'users', userId)
  await setDoc(
    userDocRef,
    {
      [USER_STORES_FIELD]: arrayUnion(serializeEmbeddedStore(store)),
    },
    { merge: true }
  )
}

async function replaceEmbeddedStore(userId: string, store: Store): Promise<void> {
  const userDocRef = doc(requireDb(), 'users', userId)
  const existingStores = await readEmbeddedStores(userId)
  const nextStores = existingStores.some((entry) => entry.id === store.id)
    ? existingStores.map((entry) => entry.id === store.id ? store : entry)
    : [...existingStores, store]

  await setDoc(
    userDocRef,
    {
      [USER_STORES_FIELD]: nextStores.map(serializeEmbeddedStore),
    },
    { merge: true }
  )
}

async function removeEmbeddedStore(userId: string, storeId: string): Promise<void> {
  const userDocRef = doc(requireDb(), 'users', userId)
  const existingStores = await readEmbeddedStores(userId)
  const nextStores = existingStores.filter((entry) => entry.id !== storeId)

  await setDoc(
    userDocRef,
    {
      [USER_STORES_FIELD]: nextStores.map(serializeEmbeddedStore),
    },
    { merge: true }
  )
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

function normalizeCategory(category?: string): Store['category'] | undefined {
  if (!category) return undefined
  if (category === 'supermercado' || category === 'tienda' || category === 'barrio' || category === 'otro') {
    return category
  }
  return undefined
}

function normalizeString(value?: string | null): string | undefined {
  return value || undefined
}

export async function getStores(userId: string): Promise<Store[]> {
  if (!db) throw new Error('Firebase no inicializado')

  const storeMap = new Map<string, Store>()

  try {
    const storesRef = collection(db, 'users', userId, 'stores')
    const q = query(storesRef, orderBy('name', 'asc'))
    const querySnapshot = await getDocs(q)

    querySnapshot.docs.map((doc) => {
      const data = doc.data()
      storeMap.set(doc.id, {
        id: doc.id,
        userId,
        name: data.name,
        category: data.category || undefined,
        color: data.color,
        icon: data.icon,
        createdAt: data.createdAt?.toDate() || new Date(),
      })
    })
  } catch (error) {
    if (!isPermissionDenied(error) && !isNotFound(error)) {
      throw error
    }
  }

  const embeddedStores = await readEmbeddedStores(userId)
  embeddedStores.forEach((store) => {
    if (!storeMap.has(store.id)) {
      storeMap.set(store.id, store)
    }
  })

  return Array.from(storeMap.values()).sort((a, b) => a.name.localeCompare(b.name))
}

export async function createStore(
  userId: string,
  data: StoreData
): Promise<Store> {
  if (!db) throw new Error('Firebase no inicializado')

  validateStoreData(data)

  const storesRef = collection(db, 'users', userId, 'stores')
  const nextStore: Store = {
    id: '',
    userId,
    name: data.name.trim(),
    category: normalizeCategory(data.category),
    color: data.color,
    icon: data.icon,
    createdAt: new Date(),
  }

  try {
    const docRef = await addDoc(storesRef, {
      userId,
      name: nextStore.name,
      category: data.category || null,
      color: data.color || null,
      icon: data.icon || null,
      createdAt: serverTimestamp(),
    })

    return {
      ...nextStore,
      id: docRef.id,
    }
  } catch (error) {
    if (!isPermissionDenied(error)) {
      throw error
    }

    const fallbackStore = {
      ...nextStore,
      id: globalThis.crypto?.randomUUID?.() ?? `store-${Date.now()}`,
    }

    await writeEmbeddedStore(userId, fallbackStore)
    return fallbackStore
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
    category?: Store['category'] | null
    color?: string | null
    icon?: string | null
  } = {}

  if (data.name !== undefined) updateData.name = data.name.trim()
  if (data.category !== undefined) updateData.category = normalizeCategory(data.category) || null
  if (data.color !== undefined) updateData.color = data.color || null
  if (data.icon !== undefined) updateData.icon = data.icon || null

  if (Object.keys(updateData).length === 0) {
    return
  }

  try {
    await updateDoc(storeRef, updateData)
  } catch (error) {
    if (!isPermissionDenied(error)) {
      throw error
    }

    const existingStores = await readEmbeddedStores(userId)
    const existingStore = existingStores.find((store) => store.id === storeId)

    if (!existingStore) {
      throw error
    }

    await replaceEmbeddedStore(userId, {
      ...existingStore,
      ...updateData,
      name: updateData.name !== undefined ? updateData.name.trim() : existingStore.name,
      category: updateData.category !== undefined ? updateData.category || undefined : existingStore.category,
      color: updateData.color !== undefined ? normalizeString(updateData.color) : existingStore.color,
      icon: updateData.icon !== undefined ? normalizeString(updateData.icon) : existingStore.icon,
    })
  }
}

export async function deleteStore(
  userId: string,
  storeId: string
): Promise<void> {
  if (!db) throw new Error('Firebase no inicializado')

  const storeRef = doc(db, 'users', userId, 'stores', storeId)
  try {
    await deleteDoc(storeRef)
  } catch (error) {
    if (!isPermissionDenied(error)) {
      throw error
    }

    await removeEmbeddedStore(userId, storeId)
  }
}
