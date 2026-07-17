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
import type { DailyBudget } from '@/types'

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

export async function getDailyBudget(
  userId: string,
  date: string
): Promise<DailyBudget | null> {
  if (!db) throw new Error('Firebase no inicializado')

  validateDate(date)

  const budgetRef = doc(db, 'users', userId, 'dailyBudgets', date)
  const budgetSnap = await getDoc(budgetRef)

  if (!budgetSnap.exists()) {
    return null
  }

  const data = budgetSnap.data()
  return {
    id: budgetSnap.id,
    userId,
    date: data.date,
    amount: data.amount,
    createdAt: data.createdAt?.toDate() || new Date(),
    updatedAt: data.updatedAt?.toDate() || new Date(),
  }
}

export async function setDailyBudget(
  userId: string,
  date: string,
  amount: number
): Promise<DailyBudget> {
  if (!db) throw new Error('Firebase no inicializado')

  validateDate(date)
  validateAmount(amount)

  const budgetRef = doc(db, 'users', userId, 'dailyBudgets', date)
  const existingBudget = await getDoc(budgetRef)

  const budgetData = {
    userId,
    date,
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
    id: date,
    userId,
    date,
    amount,
    createdAt: existingBudget.data()?.createdAt?.toDate() || new Date(),
    updatedAt: new Date(),
  }
}

export async function getAllDailyBudgets(
  userId: string,
  startDate: string,
  endDate: string
): Promise<DailyBudget[]> {
  if (!db) throw new Error('Firebase no inicializado')

  validateDate(startDate)
  validateDate(endDate)

  if (startDate > endDate) {
    throw new Error('startDate debe ser anterior o igual a endDate')
  }

  const budgetsRef = collection(db, 'users', userId, 'dailyBudgets')
  const q = query(budgetsRef, orderBy('date', 'desc'))
  const querySnapshot = await getDocs(q)

  return querySnapshot.docs
    .map((doc) => {
      const data = doc.data()
      return {
        id: doc.id,
        userId,
        date: data.date,
        amount: data.amount,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      }
    })
    .filter((budget) => budget.date >= startDate && budget.date <= endDate)
}
