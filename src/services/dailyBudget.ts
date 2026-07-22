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

const DAILY_BUDGETS_FIELD = 'dailyBudgets'

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

function isPermissionDeniedError(err: unknown): boolean {
  return err instanceof Error && (
    err.message.includes('Missing or insufficient permissions') ||
    // FirebaseError in the browser exposes a code string for permission failures.
    (err as { code?: string }).code === 'permission-denied'
  )
}

function toDate(value: unknown): Date {
  if (value instanceof Date) {
    return value
  }

  if (value && typeof value === 'object' && 'toDate' in value && typeof (value as { toDate: () => Date }).toDate === 'function') {
    return (value as { toDate: () => Date }).toDate()
  }

  return new Date()
}

function normalizeDailyBudget(userId: string, date: string, data: Record<string, unknown>): DailyBudget {
  return {
    id: date,
    userId: String(data.userId ?? userId),
    date: String(data.date ?? date),
    amount: Number(data.amount ?? 0),
    createdAt: toDate(data.createdAt),
    updatedAt: toDate(data.updatedAt),
  }
}

async function getDailyBudgetFromUserDoc(userId: string, date: string): Promise<DailyBudget | null> {
  const userSnap = await getDoc(doc(db!, 'users', userId))
  if (!userSnap.exists()) {
    return null
  }

  const data = userSnap.data() as Record<string, unknown>
  const dailyBudgets = data[DAILY_BUDGETS_FIELD] as Record<string, Record<string, unknown>> | undefined
  const budgetData = dailyBudgets?.[date]

  return budgetData ? normalizeDailyBudget(userId, date, budgetData) : null
}

async function setDailyBudgetInUserDoc(
  userId: string,
  date: string,
  amount: number
): Promise<DailyBudget> {
  const existingBudget = await getDailyBudgetFromUserDoc(userId, date)
  const budgetRef = doc(db!, 'users', userId)

  const budgetData = {
    userId,
    date,
    amount,
    updatedAt: serverTimestamp(),
  }

  await setDoc(
    budgetRef,
    {
      [DAILY_BUDGETS_FIELD]: {
        [date]: existingBudget
          ? {
              ...existingBudget,
              amount,
              updatedAt: serverTimestamp(),
            }
          : {
              ...budgetData,
              createdAt: serverTimestamp(),
            },
      },
    },
    { merge: true }
  )

  return existingBudget
    ? {
        ...existingBudget,
        amount,
        updatedAt: new Date(),
      }
    : {
        id: date,
        userId,
        date,
        amount,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
}

export async function getDailyBudget(
  userId: string,
  date: string
): Promise<DailyBudget | null> {
  if (!db) throw new Error('Firebase no inicializado')

  validateDate(date)

  const budgetRef = doc(db, 'users', userId, 'dailyBudgets', date)

  try {
    const budgetSnap = await getDoc(budgetRef)

    if (budgetSnap.exists()) {
      const data = budgetSnap.data() as Record<string, unknown>
      return normalizeDailyBudget(userId, date, data)
    }
  } catch (err) {
    if (!isPermissionDeniedError(err)) {
      throw err
    }
  }

  return getDailyBudgetFromUserDoc(userId, date)
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
  let existingBudget: Awaited<ReturnType<typeof getDoc>> | null = null

  try {
    existingBudget = await getDoc(budgetRef)
  } catch (err) {
    if (isPermissionDeniedError(err)) {
      return setDailyBudgetInUserDoc(userId, date, amount)
    }

    throw err
  }

  const budgetData = {
    userId,
    date,
    amount,
    updatedAt: serverTimestamp(),
  }

  if (!existingBudget.exists()) {
    try {
      await setDoc(budgetRef, {
        ...budgetData,
        createdAt: serverTimestamp(),
      })
    } catch (err) {
      if (!isPermissionDeniedError(err)) {
        throw err
      }

      return setDailyBudgetInUserDoc(userId, date, amount)
    }
  } else {
    try {
      await setDoc(budgetRef, budgetData, { merge: true })
    } catch (err) {
      if (!isPermissionDeniedError(err)) {
        throw err
      }

      return setDailyBudgetInUserDoc(userId, date, amount)
    }
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
  try {
    const q = query(budgetsRef, orderBy('date', 'desc'))
    const querySnapshot = await getDocs(q)

    return querySnapshot.docs
      .map((doc) => {
        const data = doc.data() as Record<string, unknown>
        return normalizeDailyBudget(userId, doc.id, data)
      })
      .filter((budget) => budget.date >= startDate && budget.date <= endDate)
  } catch (err) {
    if (!isPermissionDeniedError(err)) {
      throw err
    }

    const userSnap = await getDoc(doc(db, 'users', userId))
    if (!userSnap.exists()) {
      return []
    }

    const data = userSnap.data() as Record<string, unknown>
    const dailyBudgets = data[DAILY_BUDGETS_FIELD] as Record<string, Record<string, unknown>> | undefined

    if (!dailyBudgets) {
      return []
    }

    return Object.entries(dailyBudgets)
      .map(([budgetDate, budgetData]) => normalizeDailyBudget(userId, budgetDate, budgetData))
      .filter((budget) => budget.date >= startDate && budget.date <= endDate)
  }
}
