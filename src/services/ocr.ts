import type { Word } from './ticketParser'

export interface OCRResult {
  text: string
  words: Word[]
}

const OCR_TIMEOUT_MS = 30000

export async function runOCR(imageFile: File): Promise<OCRResult> {
  const { createWorker, OEM } = await import('tesseract.js')

  const langPath = `${import.meta.env.BASE_URL}tessdata`

  let timeoutId: ReturnType<typeof setTimeout> | undefined
  const TIMEOUT_SENTINEL = Symbol('ocr-timeout')

  const workerInitPromise = createWorker('spa+eng', OEM.LSTM_ONLY, {
    langPath,
    workerPath: 'https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/worker.min.js',
    corePath: 'https://cdn.jsdelivr.net/npm/tesseract.js-core@5',
  })

  const initTimeoutPromise = new Promise<typeof TIMEOUT_SENTINEL>((resolve) => {
    timeoutId = setTimeout(() => resolve(TIMEOUT_SENTINEL), OCR_TIMEOUT_MS)
  })

  const initResult = await Promise.race([workerInitPromise, initTimeoutPromise])
  if (initResult === TIMEOUT_SENTINEL) {
    throw new Error('OCR timeout — worker initialization failed')
  }
  const worker = initResult

  const timeoutPromise = new Promise<typeof TIMEOUT_SENTINEL>((resolve) => {
    timeoutId = setTimeout(() => resolve(TIMEOUT_SENTINEL), OCR_TIMEOUT_MS)
  })

  try {
    await worker.setParameters({
      tessedit_char_whitelist: '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ.,$xX ',
    })

    const result = await Promise.race([worker.recognize(imageFile), timeoutPromise])
    if (result === TIMEOUT_SENTINEL) {
      throw new Error('OCR timeout')
    }
    const { text, words } = result.data

    return {
      text: text || '',
      words: (words || []).map((w) => ({
        text: w.text,
        confidence: w.confidence,
        bbox: w.bbox,
      })),
    }
  } finally {
    if (timeoutId) clearTimeout(timeoutId)
    await worker.terminate()
  }
}
