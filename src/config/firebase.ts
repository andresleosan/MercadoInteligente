import { initializeApp } from 'firebase/app'
import { getAuth, connectAuthEmulator } from 'firebase/auth'
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || undefined,
}

const isConfigValid = firebaseConfig.apiKey && firebaseConfig.projectId

if (!isConfigValid) {
  console.error('Firebase config incompleta. Verificá las variables de entorno en Cloudflare Pages.')
}

const app = isConfigValid ? initializeApp(firebaseConfig) : null

export const auth = app ? getAuth(app) : null
export const db = app ? getFirestore(app) : null
export const storage = app ? getStorage(app) : null
export default app
export { isConfigValid }

// If running in local dev with emulator, connect SDKs to emulators
const useEmulator = import.meta.env.VITE_USE_FIREBASE_EMULATOR === 'true'
if (useEmulator) {
  try {
    if (auth) {
      // Auth emulator default port 9099
      connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true })
    }
    if (db) {
      // Firestore emulator default port 8080
      connectFirestoreEmulator(db, 'localhost', 8080)
    }
    // Note: Storage emulator not configured here; add if needed
    console.info('Conectado a Firebase Emulator (auth@9099, firestore@8080)')
  } catch (e) {
    console.warn('No se pudo conectar a emuladores:', e)
  }
}
