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
import { db, isConfigValid } from '@/config/firebase'
import type { Budget } from '@/types'

function getCurrentMonth(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

export async function getBudget(userId: string, month?: string): Promise<Budget | null> {
  if (!db || !isConfigValid) return null
  
  const targetMonth = month || getCurrentMonth()
  const budgetRef = doc(db, 'users', userId, 'budgets', targetMonth)
  const budgetSnap = await getDoc(budgetRef)

  if (!budgetSnap.exists()) {
    return null
  }

  const data = budgetSnap.data()
  return {
    id: budgetSnap.id,
    userId: data.userId,
    month: data.month,
    amount: data.amount,
    createdAt: data.createdAt?.toDate() || new Date(),
    updatedAt: data.updatedAt?.toDate() || new Date(),
  }
}

export async function setBudget(userId: string, amount: number, month?: string): Promise<Budget> {
  if (!db) throw new Error('Firebase no inicializado')
  
  const targetMonth = month || getCurrentMonth()
  const budgetRef = doc(db, 'users', userId, 'budgets', targetMonth)

  const budgetData = {
    userId,
    month: targetMonth,
    amount,
    updatedAt: serverTimestamp(),
  }

  const existingBudget = await getDoc(budgetRef)
  if (!existingBudget.exists()) {
    await setDoc(budgetRef, {
      ...budgetData,
      createdAt: serverTimestamp(),
    })
  } else {
    await setDoc(budgetRef, budgetData, { merge: true })
  }

  return {
    id: targetMonth,
    userId,
    month: targetMonth,
    amount,
    createdAt: existingBudget.data()?.createdAt?.toDate() || new Date(),
    updatedAt: new Date(),
  }
}

export async function getAllBudgets(userId: string): Promise<Budget[]> {
  if (!db || !isConfigValid) return []
  
  const budgetsRef = collection(db, 'users', userId, 'budgets')
  const q = query(budgetsRef, orderBy('month', 'desc'))
  const querySnapshot = await getDocs(q)

  return querySnapshot.docs.map((doc) => {
    const data = doc.data()
    return {
      id: doc.id,
      userId: data.userId,
      month: data.month,
      amount: data.amount,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    }
  })
}
