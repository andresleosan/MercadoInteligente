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
import { getCurrentMonth } from '@/utils/date'

export async function addPurchase(
  userId: string,
  items: PurchaseItem[],
  receiptImageUrl?: string
): Promise<Purchase> {
  if (!db) throw new Error('Firebase no inicializado')
  
  const total = items.reduce((sum, item) => sum + item.totalPrice, 0)

  const purchaseData = {
    userId,
    items,
    total,
    receiptImageUrl,
    createdAt: serverTimestamp(),
  }

  const purchasesRef = collection(db, 'users', userId, 'purchases')
  const docRef = await addDoc(purchasesRef, purchaseData)

  return {
    id: docRef.id,
    userId,
    items,
    total,
    receiptImageUrl,
    createdAt: new Date(),
  }
}

export async function getPurchases(userId: string, month?: string): Promise<Purchase[]> {
  if (!db || !isConfigValid) return []
  
  const targetMonth = month || getCurrentMonth()
  const [year, monthNum] = targetMonth.split('-').map(Number)

  const startDate = new Date(year!, monthNum! - 1, 1)
  const endDate = new Date(year!, monthNum!, 0, 23, 59, 59)

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
