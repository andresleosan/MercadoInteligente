import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from '@/config/firebase'
import type { StoreBudget } from '@/types'

function validateDate(date: string): void {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw new Error('La fecha debe tener formato YYYY-MM-DD')
  }
}

function validateAmount(amount: number): void {
  if (typeof amount !== 'number' || isNaN(amount)) {
    throw new Error('El monto debe ser un número válido')
  }
  if (amount < 0) {
    throw new Error('El monto no puede ser negativo')
  }
  if (amount > 999999999) {
    throw new Error('El monto es demasiado grande')
  }
}

function getBudgetId(date: string, storeId: string): string {
  return `${date}_${storeId}`
}

export async function getStoreBudgets(
  userId: string,
  date: string
): Promise<StoreBudget[]> {
  if (!db) throw new Error('Firebase no inicializado')

  validateDate(date)

  const budgetsRef = collection(db, 'users', userId, 'storeBudgets')
  const q = query(budgetsRef, orderBy('date', 'desc'))
  const querySnapshot = await getDocs(q)

  return querySnapshot.docs
    .map((doc) => {
      const data = doc.data()
      return {
        id: doc.id,
        userId,
        date: data.date,
        storeId: data.storeId,
        storeName: data.storeName,
        amount: data.amount,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      }
    })
    .filter((budget) => budget.date === date)
}

export async function setStoreBudget(
  userId: string,
  date: string,
  storeId: string,
  storeName: string,
  amount: number
): Promise<StoreBudget> {
  if (!db) throw new Error('Firebase no inicializado')

  validateDate(date)
  validateAmount(amount)

  if (!storeId || storeId.trim().length === 0) {
    throw new Error('El storeId es requerido')
  }
  if (!storeName || storeName.trim().length === 0) {
    throw new Error('El storeName es requerido')
  }

  const budgetId = getBudgetId(date, storeId)
  const budgetRef = doc(db, 'users', userId, 'storeBudgets', budgetId)
  const existingBudget = await getDoc(budgetRef)

  const budgetData = {
    userId,
    date,
    storeId,
    storeName: storeName.trim(),
    amount,
    updatedAt: serverTimestamp(),
  }

  if (!existingBudget.exists()) {
    await setDoc(budgetRef, {
      ...budgetData,
      createdAt: serverTimestamp(),
    })
  } else {
    await setDoc(budgetRef, budgetData, { merge: true })
  }

  return {
    id: budgetId,
    userId,
    date,
    storeId,
    storeName: storeName.trim(),
    amount,
    createdAt: existingBudget.data()?.createdAt?.toDate() || new Date(),
    updatedAt: new Date(),
  }
}

export async function getStoreBudgetsByStore(
  userId: string,
  storeId: string,
  startDate: string,
  endDate: string
): Promise<StoreBudget[]> {
  if (!db) throw new Error('Firebase no inicializado')

  validateDate(startDate)
  validateDate(endDate)

  if (startDate > endDate) {
    throw new Error('startDate debe ser anterior o igual a endDate')
  }

  const budgetsRef = collection(db, 'users', userId, 'storeBudgets')
  const q = query(budgetsRef, orderBy('date', 'desc'))
  const querySnapshot = await getDocs(q)

  return querySnapshot.docs
    .map((doc) => {
      const data = doc.data()
      return {
        id: doc.id,
        userId,
        date: data.date,
        storeId: data.storeId,
        storeName: data.storeName,
        amount: data.amount,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      }
    })
    .filter(
      (budget) =>
        budget.storeId === storeId &&
        budget.date >= startDate &&
        budget.date <= endDate
    )
}
