import { supabase } from '@/services/supabase'

const BUCKET = 'receipts'
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
  if (!supabase) throw new Error('Storage no inicializado')

  const compressed = await compressImage(file)
  const path = `${userId}/${purchaseId}.jpg`

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, compressed, { contentType: 'image/jpeg', upsert: true })

  if (error) throw error

  const { data: { publicUrl } } = supabase.storage
    .from(BUCKET)
    .getPublicUrl(path)

  return publicUrl
}
