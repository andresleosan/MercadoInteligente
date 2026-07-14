import { useState, useCallback, useRef } from 'react'
import type { ParsedItem } from '@/types'
import { startListening } from '@/services/voice'
import { parseVoiceText } from '@/services/voiceParser'

export type VoiceStatus = 'idle' | 'listening' | 'transcribing' | 'parsing' | 'done' | 'error'

export function useVoice() {
  const [status, setStatus] = useState<VoiceStatus>('idle')
  const [items, setItems] = useState<ParsedItem[]>([])
  const [transcript, setTranscript] = useState('')
  const [error, setError] = useState<string | null>(null)
  const stopRef = useRef<() => void>(() => {})
  const transcriptRef = useRef('')
  const statusRef = useRef(status)
  statusRef.current = status

  const reset = useCallback(() => {
    stopRef.current()
    stopRef.current = () => {}
    transcriptRef.current = ''
    setStatus('idle')
    setItems([])
    setTranscript('')
    setError(null)
  }, [])

  const handleStart = useCallback(() => {
    setStatus('listening')
    setError(null)
    setItems([])
    setTranscript('')
    transcriptRef.current = ''

    const { stop } = startListening({
      onResult: (text: string, isFinal: boolean) => {
        transcriptRef.current = text
        setTranscript(text)
        if (isFinal) {
          setStatus('parsing')
          const parsed = parseVoiceText(text)
          if (parsed.length === 0) {
            setError('No reconocimos productos. Reintenta o carga manualmente.')
            setStatus('error')
          } else {
            setItems(parsed)
            setStatus('done')
          }
        }
      },
      onError: (msg: string) => {
        setError(msg)
        setStatus('error')
      },
      onEnd: () => {
        const currentTranscript = transcriptRef.current
        const currentStatus = statusRef.current
        if ((currentStatus === 'listening' || currentStatus === 'transcribing') && currentTranscript) {
          setStatus('parsing')
          const parsed = parseVoiceText(currentTranscript)
          if (parsed.length === 0) {
            setError('No reconocimos productos. Reintenta o carga manualmente.')
            setStatus('error')
          } else {
            setItems(parsed)
            setStatus('done')
          }
        }
      },
    })
    stopRef.current = stop
  }, [])

  return {
    status,
    items,
    transcript,
    error,
    startListening: handleStart,
    reset,
  }
}
