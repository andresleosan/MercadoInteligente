import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  type User as FirebaseUser,
} from 'firebase/auth'
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db, isConfigValid } from '@/config/firebase'
import type { User } from '@/types'

const googleProvider = new GoogleAuthProvider()

if (!isConfigValid) {
  console.error('Firebase no inicializado. Verificá las variables de entorno.')
}

export async function registerWithEmail(email: string, password: string): Promise<User> {
  if (!auth || !db) throw new Error('Firebase no inicializado')
  
  const credential = await createUserWithEmailAndPassword(auth, email, password)
  const firebaseUser = credential.user

  const user: User = {
    uid: firebaseUser.uid,
    email: firebaseUser.email!,
    displayName: firebaseUser.displayName,
    createdAt: new Date(),
  }

  await setDoc(doc(db, 'users', firebaseUser.uid), {
    ...user,
    createdAt: serverTimestamp(),
  })

  return user
}

export async function loginWithEmail(email: string, password: string): Promise<FirebaseUser> {
  if (!auth) throw new Error('Firebase no inicializado')
  
  const credential = await signInWithEmailAndPassword(auth, email, password)
  return credential.user
}

export async function loginWithGoogle(): Promise<void> {
  if (!auth) throw new Error('Firebase no inicializado')
  await signInWithRedirect(auth, googleProvider)
}

export async function getGoogleRedirectResult(): Promise<{ user: User } | null> {
  if (!auth || !db) return null

  const result = await getRedirectResult(auth)
  if (!result) return null

  const firebaseUser = result.user
  const user: User = {
    uid: firebaseUser.uid,
    email: firebaseUser.email!,
    displayName: firebaseUser.displayName,
    createdAt: new Date(),
  }

  await setDoc(doc(db, 'users', firebaseUser.uid), {
    ...user,
    createdAt: serverTimestamp(),
  }, { merge: true })

  return { user }
}

export async function logout(): Promise<void> {
  if (!auth) return
  await signOut(auth)
}

export function onAuthStateChange(callback: (user: FirebaseUser | null) => void) {
  if (!auth) {
    callback(null)
    return () => {}
  }
  return onAuthStateChanged(auth, callback)
}
