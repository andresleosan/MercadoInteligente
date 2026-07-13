import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  type User as FirebaseUser,
} from 'firebase/auth'
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db } from '@/config/firebase'
import type { User } from '@/types'

const googleProvider = new GoogleAuthProvider()

export async function registerWithEmail(email: string, password: string): Promise<User> {
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
  const credential = await signInWithEmailAndPassword(auth, email, password)
  return credential.user
}

export async function loginWithGoogle(): Promise<User> {
  const credential = await signInWithPopup(auth, googleProvider)
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
  }, { merge: true })

  return user
}

export async function logout(): Promise<void> {
  await signOut(auth)
}

export function onAuthStateChange(callback: (user: FirebaseUser | null) => void) {
  return onAuthStateChanged(auth, callback)
}
