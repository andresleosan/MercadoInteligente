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

function formatDateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

function normalizePurchaseItems(items: PurchaseItem[]): PurchaseItem[] {
  return items.map((item) => {
    const normalizedItem = { ...item }
    if (normalizedItem.category === undefined) {
      delete normalizedItem.category
    }
    return normalizedItem
  })
}

export async function addPurchase(
  userId: string,
  items: PurchaseItem[],
  receiptImageUrl?: string,
  storeId?: string,
  storeName?: string,
  purchaseDate?: string,
  discountPercent = 0,
  discountAmount = 0,
  familyId?: string,
  createdByEmail?: string
): Promise<Purchase> {
  if (!db) throw new Error('Firebase no inicializado')

  const normalizedItems = normalizePurchaseItems(items)
  const subtotal = normalizedItems.reduce((sum, item) => sum + item.totalPrice, 0)
  const safeDiscountAmount = Math.max(0, Math.min(subtotal, discountAmount))
  const total = Math.max(0, subtotal - safeDiscountAmount)

  const purchaseData: Record<string, unknown> = {
    userId,
    items: normalizedItems,
    subtotal,
    discountPercent,
    discountAmount: safeDiscountAmount,
    total,
    storeId: storeId || '',
    storeName: storeName || 'Sin establecimiento',
    purchaseDate: purchaseDate || getCurrentDate(),
    createdAt: serverTimestamp(),
  }
  if (receiptImageUrl !== undefined) {
    purchaseData.receiptImageUrl = receiptImageUrl
  }
  if (familyId) {
    purchaseData.familyId = familyId
  }
  if (createdByEmail) {
    purchaseData.createdByEmail = createdByEmail
  }

  const purchasesRef = familyId
    ? collection(db, 'families', familyId, 'purchases')
    : collection(db, 'users', userId, 'purchases')
  const docRef = await addDoc(purchasesRef, purchaseData)

  return {
    id: docRef.id,
    userId,
    familyId,
    createdByEmail,
    storeId: storeId || '',
    storeName: storeName || 'Sin establecimiento',
    purchaseDate: purchaseDate || getCurrentDate(),
    items: normalizedItems,
    subtotal,
    discountPercent,
    discountAmount: safeDiscountAmount,
    total,
    receiptImageUrl,
    createdAt: new Date(),
  }
}

export async function getPurchases(
  userId: string,
  month?: string,
  familyId?: string
): Promise<Purchase[]> {
  if (!db || !isConfigValid) throw new Error('Firebase no inicializado')
  
  const targetMonth = month || getCurrentMonth()
  const [year, monthNum] = targetMonth.split('-').map(Number)

  const startDate = new Date(year!, monthNum! - 1, 1)
  const endDate = new Date(year!, monthNum!, 1)
  const startDateString = formatDateKey(startDate)
  const endDateString = formatDateKey(endDate)

  const purchasesRef = familyId
    ? collection(db, 'families', familyId, 'purchases')
    : collection(db, 'users', userId, 'purchases')
  const q = query(
    purchasesRef,
    where('purchaseDate', '>=', startDateString),
    where('purchaseDate', '<', endDateString),
    orderBy('purchaseDate', 'desc')
  )

  const querySnapshot = await getDocs(q)

  return querySnapshot.docs.map((doc) => {
    const data = doc.data()
    return {
      id: doc.id,
      userId: data.userId,
      familyId: (data.familyId as string | undefined) || familyId,
      createdByEmail: data.createdByEmail as string | undefined,
      storeId: data.storeId || '',
      storeName: data.storeName || 'Sin establecimiento',
      purchaseDate: data.purchaseDate || data.createdAt?.toDate().toISOString().split('T')[0] || '',
      items: data.items,
      subtotal: data.subtotal,
      discountPercent: data.discountPercent,
      discountAmount: data.discountAmount,
      total: data.total,
      receiptImageUrl: data.receiptImageUrl,
      createdAt: data.createdAt?.toDate() || new Date(),
    }
  })
}

export async function deletePurchase(
  userId: string,
  purchaseId: string,
  familyId?: string
): Promise<void> {
  if (!db) throw new Error('Firebase no inicializado')
  
  const purchaseRef = familyId
    ? doc(db, 'families', familyId, 'purchases', purchaseId)
    : doc(db, 'users', userId, 'purchases', purchaseId)
  await deleteDoc(purchaseRef)
}

export async function getTotalSpent(
  userId: string,
  month?: string,
  familyId?: string
): Promise<number> {
  const purchases = await getPurchases(userId, month, familyId)
  return purchases.reduce((sum, purchase) => sum + purchase.total, 0)
}

export async function getPurchasesByDateRange(
  userId: string,
  startDate: Date,
  endDate: Date,
  familyId?: string
): Promise<Purchase[]> {
  if (!db || !isConfigValid) throw new Error('Firebase no inicializado')

  const startDateString = `${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, '0')}-${String(startDate.getDate()).padStart(2, '0')}`
  const endDateString = `${endDate.getFullYear()}-${String(endDate.getMonth() + 1).padStart(2, '0')}-${String(endDate.getDate()).padStart(2, '0')}`

  const purchasesRef = familyId
    ? collection(db, 'families', familyId, 'purchases')
    : collection(db, 'users', userId, 'purchases')
  const q = query(
    purchasesRef,
    where('purchaseDate', '>=', startDateString),
    where('purchaseDate', '<=', endDateString),
    orderBy('purchaseDate', 'desc')
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
      subtotal: data.subtotal,
      discountPercent: data.discountPercent,
      discountAmount: data.discountAmount,
      total: data.total,
      receiptImageUrl: data.receiptImageUrl,
      createdAt: data.createdAt?.toDate() || new Date(),
    }
  })
}

export async function getTodayPurchases(
  userId: string,
  date?: string,
  familyId?: string
): Promise<Purchase[]> {
  if (!db || !isConfigValid) throw new Error('Firebase no inicializado')

  const targetDate = date || getCurrentDate()

  const purchasesRef = familyId
    ? collection(db, 'families', familyId, 'purchases')
    : collection(db, 'users', userId, 'purchases')
  const q = query(
    purchasesRef,
    where('purchaseDate', '==', targetDate),
    orderBy('purchaseDate', 'desc')
  )

  const querySnapshot = await getDocs(q)

  return querySnapshot.docs.map((doc) => {
    const data = doc.data()
    return {
      id: doc.id,
      userId: data.userId,
      familyId: (data.familyId as string | undefined) || familyId,
      createdByEmail: data.createdByEmail as string | undefined,
      storeId: data.storeId || '',
      storeName: data.storeName || 'Sin establecimiento',
      purchaseDate: data.purchaseDate || data.createdAt?.toDate().toISOString().split('T')[0] || '',
      items: data.items,
      subtotal: data.subtotal,
      discountPercent: data.discountPercent,
      discountAmount: data.discountAmount,
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
  const endDate = new Date(year!, monthNum!, 1)
  const startDateString = formatDateKey(startDate)
  const endDateString = formatDateKey(endDate)

  const purchasesRef = collection(db, 'users', userId, 'purchases')
  const q = query(
    purchasesRef,
    where('storeId', '==', storeId),
    where('purchaseDate', '>=', startDateString),
    where('purchaseDate', '<', endDateString),
    orderBy('purchaseDate', 'desc')
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
      subtotal: data.subtotal,
      discountPercent: data.discountPercent,
      discountAmount: data.discountAmount,
      total: data.total,
      receiptImageUrl: data.receiptImageUrl,
      createdAt: data.createdAt?.toDate() || new Date(),
    }
  })
}

export async function getPurchasesGroupedByDate(
  userId: string,
  startDate: string,
  endDate: string,
  familyId?: string
): Promise<Map<string, Purchase[]>> {
  if (!db || !isConfigValid) throw new Error('Firebase no inicializado')

  const [startYear, startMonth, startDay] = startDate.split('-').map(Number)
  const [endYear, endMonth, endDay] = endDate.split('-').map(Number)

  const start = new Date(startYear!, startMonth! - 1, startDay)
  const end = new Date(endYear!, endMonth! - 1, endDay!, 23, 59, 59)

  const purchasesRef = familyId
    ? collection(db, 'families', familyId, 'purchases')
    : collection(db, 'users', userId, 'purchases')
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
      familyId: (data.familyId as string | undefined) || familyId,
      createdByEmail: data.createdByEmail as string | undefined,
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
  endDate: string,
  familyId?: string
): Promise<Map<string, Purchase[]>> {
  if (!db || !isConfigValid) throw new Error('Firebase no inicializado')

  const [startYear, startMonth, startDay] = startDate.split('-').map(Number)
  const [endYear, endMonth, endDay] = endDate.split('-').map(Number)

  const start = new Date(startYear!, startMonth! - 1, startDay)
  const end = new Date(endYear!, endMonth! - 1, endDay!, 23, 59, 59)

  const purchasesRef = familyId
    ? collection(db, 'families', familyId, 'purchases')
    : collection(db, 'users', userId, 'purchases')
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
