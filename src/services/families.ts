import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  serverTimestamp,
} from 'firebase/firestore'
import { db, isConfigValid } from '@/config/firebase'
import type { Family, FamilyMember } from '@/types'

function toDate(value: unknown): Date {
  if (value instanceof Date) {
    return value
  }
  if (value && typeof value === 'object' && 'toDate' in value && typeof (value as { toDate: () => Date }).toDate === 'function') {
    return (value as { toDate: () => Date }).toDate()
  }
  return new Date()
}

export function generateFamilyCode(): string {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ' // sin 0, 1, I, O para evitar confusión
  let randomPart = ''
  for (let i = 0; i < 4; i++) {
    randomPart += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return `FAM-${randomPart}`
}

function normalizeFamily(id: string, data: Record<string, unknown>): Family {
  const rawMembers = Array.isArray(data.members) ? data.members : []
  const members: FamilyMember[] = rawMembers.map((m: Record<string, unknown>) => ({
    uid: String(m.uid || ''),
    email: String(m.email || ''),
    displayName: m.displayName ? String(m.displayName) : null,
    role: (m.role === 'owner' ? 'owner' : 'member') as 'owner' | 'member',
    joinedAt: toDate(m.joinedAt),
  }))

  return {
    id,
    name: String(data.name || 'Mi Familia'),
    code: String(data.code || ''),
    ownerId: String(data.ownerId || ''),
    members,
    createdAt: toDate(data.createdAt),
    updatedAt: toDate(data.updatedAt),
  }
}

/**
 * Crea un nuevo grupo familiar asignando al creador como 'owner'.
 */
export async function createFamily(
  userId: string,
  userEmail: string,
  familyName: string,
  displayName?: string | null
): Promise<Family> {
  if (!db || !isConfigValid) throw new Error('Firebase no inicializado')

  const trimmedName = familyName.trim()
  if (trimmedName.length < 2) {
    throw new Error('El nombre de la familia debe tener al menos 2 caracteres')
  }

  const code = generateFamilyCode()
  const initialMember: FamilyMember = {
    uid: userId,
    email: userEmail,
    displayName: displayName || null,
    role: 'owner',
    joinedAt: new Date(),
  }

  const familyData = {
    name: trimmedName,
    code,
    ownerId: userId,
    members: [
      {
        uid: initialMember.uid,
        email: initialMember.email,
        displayName: initialMember.displayName,
        role: initialMember.role,
        joinedAt: new Date(),
      },
    ],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }

  const familiesRef = collection(db, 'families')
  const docRef = await addDoc(familiesRef, familyData)

  // Asignar familyId al usuario
  const userRef = doc(db, 'users', userId)
  await updateDoc(userRef, { familyId: docRef.id }).catch(async () => {
    // Si updateDoc falla (ej: documento de usuario aún no creado con setDoc), crearlo o ignorar
  })

  return {
    id: docRef.id,
    name: trimmedName,
    code,
    ownerId: userId,
    members: [initialMember],
    createdAt: new Date(),
    updatedAt: new Date(),
  }
}

/**
 * Obtiene la información de una familia por su ID.
 */
export async function getFamily(familyId: string): Promise<Family | null> {
  if (!db || !isConfigValid) throw new Error('Firebase no inicializado')
  if (!familyId) return null

  const familyRef = doc(db, 'families', familyId)
  const snap = await getDoc(familyRef)

  if (!snap.exists()) return null
  return normalizeFamily(snap.id, snap.data() as Record<string, unknown>)
}

/**
 * Busca una familia por su código de invitación.
 */
export async function getFamilyByCode(code: string): Promise<Family | null> {
  if (!db || !isConfigValid) throw new Error('Firebase no inicializado')
  const cleanCode = code.trim().toUpperCase()
  if (!cleanCode) return null

  const q = query(collection(db, 'families'), where('code', '==', cleanCode))
  const snap = await getDocs(q)

  if (snap.empty) return null
  const firstDoc = snap.docs[0]!
  return normalizeFamily(firstDoc.id, firstDoc.data() as Record<string, unknown>)
}

/**
 * Obtiene la familia a la que pertenece un usuario.
 */
export async function getUserFamily(userId: string): Promise<Family | null> {
  if (!db || !isConfigValid) throw new Error('Firebase no inicializado')
  if (!userId) return null

  const userRef = doc(db, 'users', userId)
  const userSnap = await getDoc(userRef)

  if (userSnap.exists()) {
    const userData = userSnap.data() as Record<string, unknown>
    if (userData.familyId && typeof userData.familyId === 'string') {
      const family = await getFamily(userData.familyId)
      if (family) return family
    }
  }

  // Fallback: buscar si el usuario está en el array `members` de alguna familia
  const q = query(collection(db, 'families'))
  const snap = await getDocs(q)
  for (const docItem of snap.docs) {
    const family = normalizeFamily(docItem.id, docItem.data() as Record<string, unknown>)
    if (family.members.some((m) => m.uid === userId)) {
      // Sincronizar el familyId en users/{userId}
      await updateDoc(userRef, { familyId: family.id }).catch(() => null)
      return family
    }
  }

  return null
}

/**
 * Permite a un usuario unirse a una familia existente mediante un código de invitación.
 */
export async function joinFamilyByCode(
  userId: string,
  userEmail: string,
  code: string,
  displayName?: string | null
): Promise<Family> {
  if (!db || !isConfigValid) throw new Error('Firebase no inicializado')

  const family = await getFamilyByCode(code)
  if (!family) {
    throw new Error('Código de familia no encontrado. Verificá el código e intentá de nuevo.')
  }

  const alreadyMember = family.members.some((m) => m.uid === userId)
  if (alreadyMember) {
    // Ya es miembro, sincronizar y retornar
    const userRef = doc(db, 'users', userId)
    await updateDoc(userRef, { familyId: family.id }).catch(() => null)
    return family
  }

  const newMember: FamilyMember = {
    uid: userId,
    email: userEmail,
    displayName: displayName || null,
    role: 'member',
    joinedAt: new Date(),
  }

  const updatedMembers = [
    ...family.members,
    {
      uid: newMember.uid,
      email: newMember.email,
      displayName: newMember.displayName,
      role: newMember.role,
      joinedAt: newMember.joinedAt,
    },
  ]

  const familyRef = doc(db, 'families', family.id)
  await updateDoc(familyRef, {
    members: updatedMembers,
    updatedAt: serverTimestamp(),
  })

  const userRef = doc(db, 'users', userId)
  await updateDoc(userRef, { familyId: family.id }).catch(() => null)

  return {
    ...family,
    members: [...family.members, newMember],
    updatedAt: new Date(),
  }
}

/**
 * Permite a un miembro abandonar la familia.
 */
export async function leaveFamily(userId: string, familyId: string): Promise<void> {
  if (!db || !isConfigValid) throw new Error('Firebase no inicializado')

  const family = await getFamily(familyId)
  if (!family) return

  const remainingMembers = family.members.filter((m) => m.uid !== userId)

  const familyRef = doc(db, 'families', familyId)
  if (remainingMembers.length === 0) {
    // Nadie queda en la familia, eliminarla
    await deleteDoc(familyRef)
  } else {
    // Si quien se fue era owner, promover al primer miembro restante
    let nextOwnerId = family.ownerId
    if (family.ownerId === userId) {
      remainingMembers[0]!.role = 'owner'
      nextOwnerId = remainingMembers[0]!.uid
    }

    await updateDoc(familyRef, {
      ownerId: nextOwnerId,
      members: remainingMembers.map((m) => ({
        uid: m.uid,
        email: m.email,
        displayName: m.displayName || null,
        role: m.role,
        joinedAt: m.joinedAt,
      })),
      updatedAt: serverTimestamp(),
    })
  }

  // Quitar familyId del usuario
  const userRef = doc(db, 'users', userId)
  await updateDoc(userRef, { familyId: null }).catch(() => null)
}

