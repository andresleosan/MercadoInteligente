import { useEffect } from 'react'
import type { ParsedItem } from '@/types'
import { useVoice } from '@/hooks/useVoice'

interface Props {
  onDone: (items: ParsedItem[]) => void
  onBack: () => void
}

export default function VoiceCapture({ onDone, onBack }: Props) {
  const { status, items, transcript, error, startListening, reset } = useVoice()

  useEffect(() => {
    if (status === 'done') {
      onDone(items)
    }
  }, [status, items, onDone])

  useEffect(() => {
    startListening()
    return () => { reset() }
  }, [startListening, reset])

  return (
    <div className="bg-white rounded-lg shadow p-6 text-center space-y-4">
      {status === 'idle' && (
        <p className="text-sm text-gray-600">Preparando microfono...</p>
      )}

      {status === 'listening' && (
        <>
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center animate-pulse">
              <span className="text-3xl">🎤</span>
            </div>
          </div>
          <p className="text-sm text-gray-600">Escuchando...</p>
          {transcript && (
            <p className="text-base text-gray-900 italic border rounded p-3 bg-gray-50">
              {transcript}
            </p>
          )}
        </>
      )}

      {status === 'parsing' && (
        <p className="text-sm text-gray-600">Procesando productos...</p>
      )}

      {status === 'done' && (
        <p className="text-sm text-green-600">Productos reconocidos</p>
      )}

      {status === 'error' && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-sm text-red-700">{error}</p>
          <div className="flex gap-2 mt-3">
            <button
              type="button"
              onClick={() => { reset(); startListening() }}
              className="flex-1 py-1.5 px-3 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50"
            >
              Reintentar
            </button>
            <button
              type="button"
              onClick={onBack}
              className="flex-1 py-1.5 px-3 border border-transparent rounded-md text-sm text-white bg-green-600 hover:bg-green-700"
            >
              Cargar manualmente
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
