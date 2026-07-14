import { initializeApp } from 'firebase/app'
import { getAuth, connectAuthEmulator } from 'firebase/auth'
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore'
import { getStorage, connectStorageEmulator } from 'firebase/storage'

const REQUIRED_VARS = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID',
] as const

const missingVars = REQUIRED_VARS.filter(
  (key) => !import.meta.env[key as keyof ImportMeta['env']]
)

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || undefined,
}

const isConfigValid = missingVars.length === 0

if (!isConfigValid) {
  console.error(
    `Firebase config incompleta. Faltan: ${missingVars.join(', ')}`
  )
}

const app = isConfigValid ? initializeApp(firebaseConfig) : null

export const auth = app ? getAuth(app) : null
export const db = app ? getFirestore(app) : null
export const storage = app ? getStorage(app) : null
export default app
export { isConfigValid, missingVars }

const useEmulator = import.meta.env.VITE_USE_FIREBASE_EMULATOR === 'true'
if (useEmulator) {
  try {
    if (auth) {
      connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true })
    }
    if (db) {
      connectFirestoreEmulator(db, 'localhost', 8085)
    }
    if (storage) {
      connectStorageEmulator(storage, 'localhost', 9199)
    }
    console.info('Conectado a Firebase Emulator (auth@9099, firestore@8085, storage@9199)')
  } catch (e) {
    console.warn('No se pudo conectar a emuladores:', e)
  }
}
