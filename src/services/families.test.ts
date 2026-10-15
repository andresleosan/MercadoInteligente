import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  generateFamilyCode,
  createFamily,
  getFamily,
  getFamilyByCode,
  getUserFamily,
  joinFamilyByCode,
  leaveFamily,
} from './families'
import {
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
} from 'firebase/firestore'

vi.mock('firebase/firestore', () => ({
  collection: vi.fn((_db, name) => ({ id: name, path: name })),
  doc: vi.fn((_db, ...args) => ({ id: args[args.length - 1], path: args.join('/') })),
  addDoc: vi.fn(),
  getDoc: vi.fn(),
  getDocs: vi.fn(),
  updateDoc: vi.fn(),
  deleteDoc: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  serverTimestamp: vi.fn(() => ({ toDate: () => new Date() })),
}))

vi.mock('@/config/firebase', () => ({
  db: {},
  isConfigValid: true,
}))

describe('Families Service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('generateFamilyCode', () => {
    it('generates a code with FAM- prefix and 4 uppercase chars', () => {
      const code = generateFamilyCode()
      expect(code).toMatch(/^FAM-[23456789ABCDEFGHJKLMNPQRSTUVWXYZ]{4}$/)
    })
  })

  describe('createFamily', () => {
    it('throws error if family name is too short', async () => {
      await expect(createFamily('user-1', 'test@test.com', ' ')).rejects.toThrow(
        'El nombre de la familia debe tener al menos 2 caracteres'
      )
    })

    it('creates family and assigns owner', async () => {
      vi.mocked(addDoc).mockResolvedValue({ id: 'family-123' } as any)
      vi.mocked(updateDoc).mockResolvedValue(undefined as any)

      const family = await createFamily('user-1', 'test@test.com', 'Familia Pérez', 'Andrés')

      expect(addDoc).toHaveBeenCalled()
      expect(family.id).toBe('family-123')
      expect(family.name).toBe('Familia Pérez')
      expect(family.ownerId).toBe('user-1')
      expect(family.members).toHaveLength(1)
      expect(family.members[0]?.role).toBe('owner')
      expect(family.members[0]?.displayName).toBe('Andrés')
    })
  })

  describe('getFamily', () => {
    it('returns null if familyId is empty or not found', async () => {
      vi.mocked(getDoc).mockResolvedValue({ exists: () => false } as any)
      const res = await getFamily('non-existent')
      expect(res).toBeNull()
    })

    it('returns parsed family if found', async () => {
      vi.mocked(getDoc).mockResolvedValue({
        exists: () => true,
        id: 'family-1',
        data: () => ({
          name: 'Los Gómez',
          code: 'FAM-ABCD',
          ownerId: 'user-1',
          members: [
            { uid: 'user-1', email: 'owner@test.com', role: 'owner', joinedAt: new Date() },
          ],
        }),
      } as any)

      const res = await getFamily('family-1')
      expect(res).not.toBeNull()
      expect(res?.name).toBe('Los Gómez')
      expect(res?.code).toBe('FAM-ABCD')
      expect(res?.members).toHaveLength(1)
    })
  })

  describe('getFamilyByCode', () => {
    it('returns null if not found', async () => {
      vi.mocked(getDocs).mockResolvedValue({ empty: true, docs: [] } as any)
      const res = await getFamilyByCode('FAM-XXXX')
      expect(res).toBeNull()
    })

    it('returns family if match is found', async () => {
      vi.mocked(getDocs).mockResolvedValue({
        empty: false,
        docs: [
          {
            id: 'fam-found',
            data: () => ({
              name: 'Familia Encontrada',
              code: 'FAM-1234',
              ownerId: 'u1',
              members: [{ uid: 'u1', email: 'u1@test.com', role: 'owner' }],
            }),
          },
        ],
      } as any)

      const res = await getFamilyByCode('fam-1234')
      expect(res).not.toBeNull()
      expect(res?.id).toBe('fam-found')
      expect(res?.name).toBe('Familia Encontrada')
    })
  })

  describe('getUserFamily', () => {
    it('returns family linked to user profile', async () => {
      vi.mocked(getDoc).mockImplementation((ref: any) => {
        if (ref.path && ref.path.includes('users')) {
          return Promise.resolve({
            exists: () => true,
            data: () => ({ familyId: 'fam-linked' }),
          } as any)
        }
        return Promise.resolve({
          exists: () => true,
          id: 'fam-linked',
          data: () => ({
            name: 'Familia Link',
            code: 'FAM-LINK',
            ownerId: 'user-1',
            members: [{ uid: 'user-1', email: 'user@test.com', role: 'owner' }],
          }),
        } as any)
      })

      const fam = await getUserFamily('user-1')
      expect(fam).not.toBeNull()
      expect(fam?.id).toBe('fam-linked')
    })
  })

  describe('joinFamilyByCode', () => {
    it('throws error if code does not exist', async () => {
      vi.mocked(getDocs).mockResolvedValue({ empty: true, docs: [] } as any)

      await expect(
        joinFamilyByCode('user-2', 'user2@test.com', 'FAM-NOPE')
      ).rejects.toThrow('Código de familia no encontrado')
    })

    it('adds new member if code is valid', async () => {
      vi.mocked(getDocs).mockResolvedValue({
        empty: false,
        docs: [
          {
            id: 'fam-target',
            data: () => ({
              name: 'Familia Smith',
              code: 'FAM-SMTH',
              ownerId: 'user-1',
              members: [{ uid: 'user-1', email: 'u1@test.com', role: 'owner' }],
            }),
          },
        ],
      } as any)
      vi.mocked(updateDoc).mockResolvedValue(undefined as any)

      const updated = await joinFamilyByCode('user-2', 'u2@test.com', 'FAM-SMTH', 'John')
      expect(updated.members).toHaveLength(2)
      expect(updated.members[1]?.uid).toBe('user-2')
      expect(updated.members[1]?.role).toBe('member')
      expect(updateDoc).toHaveBeenCalled()
    })
  })

  describe('leaveFamily', () => {
    it('deletes family when last remaining member leaves', async () => {
      vi.mocked(getDoc).mockResolvedValue({
        exists: () => true,
        id: 'fam-1',
        data: () => ({
          name: 'Solo Family',
          ownerId: 'user-1',
          members: [{ uid: 'user-1', email: 'u1@test.com', role: 'owner' }],
        }),
      } as any)
      vi.mocked(deleteDoc).mockResolvedValue(undefined as any)
      vi.mocked(updateDoc).mockResolvedValue(undefined as any)

      await leaveFamily('user-1', 'fam-1')
      expect(deleteDoc).toHaveBeenCalled()
    })

    it('promotes next member to owner if owner leaves with members remaining', async () => {
      vi.mocked(getDoc).mockResolvedValue({
        exists: () => true,
        id: 'fam-1',
        data: () => ({
          name: 'Multi Family',
          ownerId: 'user-1',
          members: [
            { uid: 'user-1', email: 'u1@test.com', role: 'owner' },
            { uid: 'user-2', email: 'u2@test.com', role: 'member' },
          ],
        }),
      } as any)
      vi.mocked(updateDoc).mockResolvedValue(undefined as any)

      await leaveFamily('user-1', 'fam-1')
      expect(updateDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          ownerId: 'user-2',
        })
      )
    })
  })
})
