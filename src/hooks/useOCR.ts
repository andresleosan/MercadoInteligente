import { useState, useCallback } from 'react'
import type { ParsedItem } from '@/types'
import { uploadReceiptImage } from '@/services/storage'
import { runOCR } from '@/services/ocr'
import { parseTicket } from '@/services/ticketParser'
import { doc, collection } from 'firebase/firestore'
import { db } from '@/config/firebase'

export type OCRStatus = 'idle' | 'uploading' | 'ocr-running' | 'parsing' | 'done' | 'error'

export function useOCR(userId: string | null) {
  const [status, setStatus] = useState<OCRStatus>('idle')
  const [items, setItems] = useState<ParsedItem[]>([])
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const processTicket = useCallback(
    async (file: File) => {
      if (!userId) {
        setStatus('error')
        setError('No hay usuario autenticado')
        return
      }

      setStatus('uploading')
      setError(null)
      setItems([])

      try {
        const purchaseId = db
          ? doc(collection(db, 'users', userId, 'purchases')).id
          : `tmp-${Date.now()}`

        let uploadedUrl: string | null = null
        try {
          uploadedUrl = await uploadReceiptImage(userId, file, purchaseId)
          setImageUrl(uploadedUrl)
        } catch (e) {
          console.error('Storage upload failed:', e)
        }

        setStatus('ocr-running')
        const ocrResult = await runOCR(file)

        setStatus('parsing')
        const parsed = parseTicket(ocrResult.text, ocrResult.words)

        if (parsed.length === 0) {
          setStatus('error')
          setError('No reconocimos productos en esta imagen. Reintentar o cargar manualmente.')
          return
        }

        setItems(parsed)
        setStatus('done')
      } catch (e) {
        console.error('OCR failed:', e)
        setStatus('error')
        setError('No pudimos leer el ticket. Reintentar o cargar manualmente.')
      }
    },
    [userId]
  )

  const reset = useCallback(() => {
    setStatus('idle')
    setItems([])
    setImageUrl(null)
    setError(null)
  }, [])

  return { status, items, imageUrl, error, processTicket, reset }
}
