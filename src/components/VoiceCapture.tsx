import { useEffect } from 'react'
import type { ParsedItem } from '@/types'
import { useVoice } from '@/hooks/useVoice'
import { DarkButton } from '@/components/ui/DarkButton'

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
    <div className="bg-surface rounded-radius-xl border border-border-subtle shadow-card p-6 text-center space-y-4">
      {status === 'idle' && (
        <p className="text-sm text-text-secondary">Preparando microfono...</p>
      )}

      {status === 'listening' && (
        <>
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-full bg-accent-red/20 flex items-center justify-center animate-pulse">
              <span className="text-3xl">🎤</span>
            </div>
          </div>
          <p className="text-sm text-text-secondary">Escuchando...</p>
          <div className="space-y-1 rounded-radius-md border border-border-subtle bg-elevated/70 px-3 py-2 text-left">
            <p className="text-xs text-text-muted">Ejemplo de frase</p>
            <p className="text-sm text-text-primary">Di: 3 Arroz a 5000</p>
            <p className="text-sm text-text-primary">Di: 3 Arroz a 5000 con 5 % de descuento</p>
          </div>
          {transcript && (
            <p className="text-base text-text-primary italic border border-border-subtle rounded-radius-md p-3 bg-elevated">
              {transcript}
            </p>
          )}
        </>
      )}

      {status === 'parsing' && (
        <p className="text-sm text-text-secondary">Procesando productos...</p>
      )}

      {status === 'done' && (
        <p className="text-sm text-accent-green">Productos reconocidos</p>
      )}

      {status === 'error' && (
        <div className="bg-accent-red/10 border border-accent-red/30 rounded-radius-md p-4">
          <p className="text-sm text-accent-red">{error}</p>
          <div className="flex gap-2 mt-3">
            <DarkButton
              variant="secondary"
              size="sm"
              onClick={() => { reset(); startListening() }}
              className="flex-1"
            >
              Reintentar
            </DarkButton>
            <DarkButton
              variant="primary"
              size="sm"
              onClick={onBack}
              className="flex-1"
            >
              Cargar manualmente
            </DarkButton>
          </div>
        </div>
      )}
    </div>
  )
}
