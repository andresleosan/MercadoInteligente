import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { storage } from '@/config/firebase'

const MAX_WIDTH = 1920
const JPEG_QUALITY = 0.8

async function compressImage(file: File): Promise<Blob> {
  const img = await createImageBitmap(file)
  const { width: origW, height: origH } = img

  let w = origW
  let h = origH
  if (w > MAX_WIDTH) {
    h = Math.round((h / w) * MAX_WIDTH)
    w = MAX_WIDTH
  }

  const canvas = new OffscreenCanvas(w, h)
  const ctx = canvas.getContext('2d')!
  ctx.drawImage(img, 0, 0, w, h)

  const blob = await canvas.convertToBlob({ type: 'image/jpeg', quality: JPEG_QUALITY })
  img.close()
  return blob
}

export async function uploadReceiptImage(
  userId: string,
  file: File,
  purchaseId: string
): Promise<string> {
  if (!storage) throw new Error('Storage no inicializado')

  const compressed = await compressImage(file)
  const path = `receipts/${userId}/${purchaseId}.jpg`
  const storageRef = ref(storage, path)

  await uploadBytes(storageRef, compressed)
  return getDownloadURL(storageRef)
}
