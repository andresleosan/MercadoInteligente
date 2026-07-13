import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { storage } from '@/config/firebase'

function getExtension(file: File): string {
  if (file.type === 'image/png') return 'png'
  if (file.type === 'image/webp') return 'webp'
  return 'jpg'
}

export async function uploadReceiptImage(
  userId: string,
  file: File,
  purchaseId: string
): Promise<string> {
  if (!storage) throw new Error('Storage no inicializado')

  const ext = getExtension(file)
  const path = `receipts/${userId}/${purchaseId}.${ext}`
  const storageRef = ref(storage, path)

  await uploadBytes(storageRef, file)
  return getDownloadURL(storageRef)
}
