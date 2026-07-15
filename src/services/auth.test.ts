import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  registerWithEmail,
  loginWithEmail,
  loginWithGoogle,
  getGoogleRedirectResult,
  logout,
  onAuthStateChange,
} from './auth'
import { auth, db, isConfigValid } from '@/config/firebase'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth'
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'

vi.mock('firebase/auth')
vi.mock('firebase/firestore')
vi.mock('@/config/firebase', () => ({
  auth: {},
  db: {},
  isConfigValid: true,
}))

describe('Auth Service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('registerWithEmail', () => {
    it('should create user and save to Firestore', async () => {
      const mockUser = {
        uid: 'test-uid',
        email: 'test@example.com',
        displayName: null,
      }
      
      vi.mocked(createUserWithEmailAndPassword).mockResolvedValue({
        user: mockUser,
      } as any)
      
      vi.mocked(setDoc).mockResolvedValue(undefined)

      const result = await registerWithEmail('test@example.com', 'password123')

      expect(createUserWithEmailAndPassword).toHaveBeenCalledWith(auth, 'test@example.com', 'password123')
      expect(setDoc).toHaveBeenCalled()
      expect(result.uid).toBe('test-uid')
      expect(result.email).toBe('test@example.com')
    })

    it('should throw error if Firebase not initialized', async () => {
      vi.mocked(createUserWithEmailAndPassword).mockImplementation(() => {
        throw new Error('Firebase no inicializado')
      })

      await expect(registerWithEmail('test@example.com', 'password123'))
        .rejects.toThrow()
    })
  })

  describe('loginWithEmail', () => {
    it('should sign in user', async () => {
      const mockUser = {
        uid: 'test-uid',
        email: 'test@example.com',
      }
      
      vi.mocked(signInWithEmailAndPassword).mockResolvedValue({
        user: mockUser,
      } as any)

      const result = await loginWithEmail('test@example.com', 'password123')

      expect(signInWithEmailAndPassword).toHaveBeenCalledWith(auth, 'test@example.com', 'password123')
      expect(result.uid).toBe('test-uid')
    })
  })

  describe('loginWithGoogle', () => {
    it('should sign in with Google popup and save to Firestore', async () => {
      const mockUser = {
        uid: 'test-uid',
        email: 'test@example.com',
        displayName: 'Test User',
      }

      vi.mocked(signInWithPopup).mockResolvedValue({
        user: mockUser,
      } as any)

      vi.mocked(setDoc).mockResolvedValue(undefined)

      await loginWithGoogle()

      expect(signInWithPopup).toHaveBeenCalled()
      expect(setDoc).toHaveBeenCalled()
    })
  })

  describe('getGoogleRedirectResult', () => {
    it('should return null (deprecated)', async () => {
      const result = await getGoogleRedirectResult()

      expect(result).toBeNull()
    })
  })

  describe('logout', () => {
    it('should sign out user', async () => {
      vi.mocked(signOut).mockResolvedValue(undefined)

      await logout()

      expect(signOut).toHaveBeenCalledWith(auth)
    })
  })

  describe('onAuthStateChange', () => {
    it('should call onAuthStateChanged', () => {
      const callback = vi.fn()
      const unsubscribe = vi.fn()
      
      vi.mocked(onAuthStateChanged).mockReturnValue(unsubscribe)

      const result = onAuthStateChange(callback)

      expect(onAuthStateChanged).toHaveBeenCalledWith(auth, callback)
      expect(result).toBe(unsubscribe)
    })
  })
})
