import {
  collection,
  doc,
  addDoc,
  getDocs,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
  serverTimestamp,
} from 'firebase/firestore'
import { db, isConfigValid } from '@/config/firebase'
import type { Purchase, PurchaseItem } from '@/types'
import { getCurrentMonth, getCurrentDate } from '@/utils/date'

export async function addPurchase(
  userId: string,
  items: PurchaseItem[],
  receiptImageUrl?: string,
  storeId?: string,
  storeName?: string,
  purchaseDate?: string
): Promise<Purchase> {
  if (!db) throw new Error('Firebase no inicializado')
  
  const total = items.reduce((sum, item) => sum + item.totalPrice, 0)

  const purchaseData: Record<string, unknown> = {
    userId,
    items,
    total,
    storeId: storeId || '',
    storeName: storeName || 'Sin establecimiento',
    purchaseDate: purchaseDate || getCurrentDate(),
    createdAt: serverTimestamp(),
  }
  if (receiptImageUrl !== undefined) {
    purchaseData.receiptImageUrl = receiptImageUrl
  }

  const undefinedFields = Object.entries(purchaseData)
    .filter(([_, v]) => v === undefined)
    .map(([k]) => k)
  if (undefinedFields.length > 0) {
    console.error(`[purchases] Campo(s) undefined en purchaseData:`, undefinedFields, purchaseData)
  }

  const purchasesRef = collection(db, 'users', userId, 'purchases')
  console.log('[purchases] purchaseData:', JSON.stringify(purchaseData, (_, v) => v === undefined ? '__undefined__' : v))
  const docRef = await addDoc(purchasesRef, purchaseData)

  return {
    id: docRef.id,
    userId,
    storeId: storeId || '',
    storeName: storeName || 'Sin establecimiento',
    purchaseDate: purchaseDate || getCurrentDate(),
    items,
    total,
    receiptImageUrl,
    createdAt: new Date(),
  }
}

export async function getPurchases(userId: string, month?: string): Promise<Purchase[]> {
  if (!db || !isConfigValid) throw new Error('Firebase no inicializado')
  
  const targetMonth = month || getCurrentMonth()
  const [year, monthNum] = targetMonth.split('-').map(Number)

  const startDate = new Date(year!, monthNum! - 1, 1)
  const endDate = new Date(year!, monthNum!, 0, 23, 59, 59)

  const path = `users/${userId}/purchases`
  console.log('[purchases:getPurchases] UID READ:', userId, '| month:', targetMonth)
  console.log('[purchases:getPurchases] QUERY PATH:', path)
  console.log('[purchases:getPurchases] startDate:', startDate.toISOString(), 'endDate:', endDate.toISOString())

  const purchasesRef = collection(db, 'users', userId, 'purchases')
  const q = query(
    purchasesRef,
    where('createdAt', '>=', Timestamp.fromDate(startDate)),
    where('createdAt', '<=', Timestamp.fromDate(endDate)),
    orderBy('createdAt', 'desc')
  )

  const querySnapshot = await getDocs(q)
  console.log('[purchases:getPurchases] docs found:', querySnapshot.docs.length)
  querySnapshot.docs.forEach((d) => {
    console.log('[purchases:getPurchases] doc id:', d.id, 'createdAt:', d.data().createdAt)
  })

  return querySnapshot.docs.map((doc) => {
    const data = doc.data()
    return {
      id: doc.id,
      userId: data.userId,
      storeId: data.storeId || '',
      storeName: data.storeName || 'Sin establecimiento',
      purchaseDate: data.purchaseDate || data.createdAt?.toDate().toISOString().split('T')[0] || '',
      items: data.items,
      total: data.total,
      receiptImageUrl: data.receiptImageUrl,
      createdAt: data.createdAt?.toDate() || new Date(),
    }
  })
}

export async function deletePurchase(userId: string, purchaseId: string): Promise<void> {
  if (!db) throw new Error('Firebase no inicializado')
  
  const purchaseRef = doc(db, 'users', userId, 'purchases', purchaseId)
  await deleteDoc(purchaseRef)
}

export async function getTotalSpent(userId: string, month?: string): Promise<number> {
  const purchases = await getPurchases(userId, month)
  return purchases.reduce((sum, purchase) => sum + purchase.total, 0)
}

export async function getPurchasesByDateRange(
  userId: string,
  startDate: Date,
  endDate: Date
): Promise<Purchase[]> {
  if (!db || !isConfigValid) throw new Error('Firebase no inicializado')

  const purchasesRef = collection(db, 'users', userId, 'purchases')
  const q = query(
    purchasesRef,
    where('createdAt', '>=', Timestamp.fromDate(startDate)),
    where('createdAt', '<=', Timestamp.fromDate(endDate)),
    orderBy('createdAt', 'desc')
  )

  const querySnapshot = await getDocs(q)

  return querySnapshot.docs.map((doc) => {
    const data = doc.data()
    return {
      id: doc.id,
      userId: data.userId,
      storeId: data.storeId || '',
      storeName: data.storeName || 'Sin establecimiento',
      purchaseDate: data.purchaseDate || data.createdAt?.toDate().toISOString().split('T')[0] || '',
      items: data.items,
      total: data.total,
      receiptImageUrl: data.receiptImageUrl,
      createdAt: data.createdAt?.toDate() || new Date(),
    }
  })
}

export async function getTodayPurchases(userId: string, date?: string): Promise<Purchase[]> {
  if (!db || !isConfigValid) throw new Error('Firebase no inicializado')

  const targetDate = date || getCurrentDate()

  const purchasesRef = collection(db, 'users', userId, 'purchases')
  const q = query(
    purchasesRef,
    where('purchaseDate', '==', targetDate),
    orderBy('createdAt', 'desc')
  )

  const querySnapshot = await getDocs(q)

  return querySnapshot.docs.map((doc) => {
    const data = doc.data()
    return {
      id: doc.id,
      userId: data.userId,
      storeId: data.storeId || '',
      storeName: data.storeName || 'Sin establecimiento',
      purchaseDate: data.purchaseDate || data.createdAt?.toDate().toISOString().split('T')[0] || '',
      items: data.items,
      total: data.total,
      receiptImageUrl: data.receiptImageUrl,
      createdAt: data.createdAt?.toDate() || new Date(),
    }
  })
}

export async function getPurchasesByStore(
  userId: string,
  storeId: string,
  month?: string
): Promise<Purchase[]> {
  if (!db || !isConfigValid) throw new Error('Firebase no inicializado')

  const targetMonth = month || getCurrentMonth()
  const [year, monthNum] = targetMonth.split('-').map(Number)

  const startDate = new Date(year!, monthNum! - 1, 1)
  const endDate = new Date(year!, monthNum!, 0, 23, 59, 59)

  const purchasesRef = collection(db, 'users', userId, 'purchases')
  const q = query(
    purchasesRef,
    where('storeId', '==', storeId),
    where('createdAt', '>=', Timestamp.fromDate(startDate)),
    where('createdAt', '<=', Timestamp.fromDate(endDate)),
    orderBy('createdAt', 'desc')
  )

  const querySnapshot = await getDocs(q)

  return querySnapshot.docs.map((doc) => {
    const data = doc.data()
    return {
      id: doc.id,
      userId: data.userId,
      storeId: data.storeId || '',
      storeName: data.storeName || 'Sin establecimiento',
      purchaseDate: data.purchaseDate || data.createdAt?.toDate().toISOString().split('T')[0] || '',
      items: data.items,
      total: data.total,
      receiptImageUrl: data.receiptImageUrl,
      createdAt: data.createdAt?.toDate() || new Date(),
    }
  })
}

export async function getPurchasesGroupedByDate(
  userId: string,
  startDate: string,
  endDate: string
): Promise<Map<string, Purchase[]>> {
  if (!db || !isConfigValid) throw new Error('Firebase no inicializado')

  const [startYear, startMonth, startDay] = startDate.split('-').map(Number)
  const [endYear, endMonth, endDay] = endDate.split('-').map(Number)

  const start = new Date(startYear!, startMonth! - 1, startDay)
  const end = new Date(endYear!, endMonth! - 1, endDay!, 23, 59, 59)

  const purchasesRef = collection(db, 'users', userId, 'purchases')
  const q = query(
    purchasesRef,
    where('createdAt', '>=', Timestamp.fromDate(start)),
    where('createdAt', '<=', Timestamp.fromDate(end)),
    orderBy('createdAt', 'desc')
  )

  const querySnapshot = await getDocs(q)

  const grouped = new Map<string, Purchase[]>()

  querySnapshot.docs.forEach((doc) => {
    const data = doc.data()
    const purchase: Purchase = {
      id: doc.id,
      userId: data.userId,
      storeId: data.storeId || '',
      storeName: data.storeName || 'Sin establecimiento',
      purchaseDate: data.purchaseDate || data.createdAt?.toDate().toISOString().split('T')[0] || '',
      items: data.items,
      total: data.total,
      receiptImageUrl: data.receiptImageUrl,
      createdAt: data.createdAt?.toDate() || new Date(),
    }

    const dateKey = purchase.purchaseDate
    if (!grouped.has(dateKey)) {
      grouped.set(dateKey, [])
    }
    grouped.get(dateKey)!.push(purchase)
  })

  return grouped
}

export async function getPurchasesGroupedByStore(
  userId: string,
  startDate: string,
  endDate: string
): Promise<Map<string, Purchase[]>> {
  if (!db || !isConfigValid) throw new Error('Firebase no inicializado')

  const [startYear, startMonth, startDay] = startDate.split('-').map(Number)
  const [endYear, endMonth, endDay] = endDate.split('-').map(Number)

  const start = new Date(startYear!, startMonth! - 1, startDay)
  const end = new Date(endYear!, endMonth! - 1, endDay!, 23, 59, 59)

  const purchasesRef = collection(db, 'users', userId, 'purchases')
  const q = query(
    purchasesRef,
    where('createdAt', '>=', Timestamp.fromDate(start)),
    where('createdAt', '<=', Timestamp.fromDate(end)),
    orderBy('createdAt', 'desc')
  )

  const querySnapshot = await getDocs(q)

  const grouped = new Map<string, Purchase[]>()

  querySnapshot.docs.forEach((doc) => {
    const data = doc.data()
    const purchase: Purchase = {
      id: doc.id,
      userId: data.userId,
      storeId: data.storeId || '',
      storeName: data.storeName || 'Sin establecimiento',
      purchaseDate: data.purchaseDate || data.createdAt?.toDate().toISOString().split('T')[0] || '',
      items: data.items,
      total: data.total,
      receiptImageUrl: data.receiptImageUrl,
      createdAt: data.createdAt?.toDate() || new Date(),
    }

    const storeKey = purchase.storeId || '__no_store__'
    if (!grouped.has(storeKey)) {
      grouped.set(storeKey, [])
    }
    grouped.get(storeKey)!.push(purchase)
  })

  return grouped
}
