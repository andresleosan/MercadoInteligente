interface ListeningOptions {
  onResult: (text: string, isFinal: boolean) => void
  onError?: (message: string) => void
  onEnd?: () => void
}

interface SpeechRecognitionResultLike {
  isFinal: boolean
  [index: number]: { transcript: string }
}

interface SpeechRecognitionResultEventLike {
  resultIndex: number
  results: ArrayLike<SpeechRecognitionResultLike>
}

interface SpeechRecognitionErrorEventLike {
  error: string
}

interface SpeechRecognitionInstanceLike {
  lang: string
  continuous: boolean
  interimResults: boolean
  onresult: ((event: SpeechRecognitionResultEventLike) => void) | null
  onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null
  onend: (() => void) | null
  start: () => void
  stop: () => void
}

type SpeechRecognitionConstructor = new () => SpeechRecognitionInstanceLike

interface SpeechRecognitionGlobal {
  SpeechRecognition?: SpeechRecognitionConstructor
  webkitSpeechRecognition?: SpeechRecognitionConstructor
}

const SILENCE_TIMEOUT_MS = 12000

export function startListening({ onResult, onError, onEnd }: ListeningOptions) {
  const speechGlobal = globalThis as typeof globalThis & SpeechRecognitionGlobal
  const SpeechRecognitionAPI = speechGlobal.SpeechRecognition ?? speechGlobal.webkitSpeechRecognition

  if (!SpeechRecognitionAPI) {
    onError?.('Voz no disponible en este navegador')
    return { stop: () => { /* La API no está disponible. */ } }
  }

  const recognition = new SpeechRecognitionAPI()
  recognition.lang = 'es-AR'
  recognition.continuous = true
  recognition.interimResults = true

  let silenceTimer: ReturnType<typeof setTimeout> | null = null
  let isStopped = false
  let hasHeardSpeech = false

  function resetSilenceTimer() {
    if (!hasHeardSpeech) return
    if (silenceTimer) clearTimeout(silenceTimer)
    if (isStopped) return
    silenceTimer = setTimeout(() => {
      stop()
    }, SILENCE_TIMEOUT_MS)
  }

  recognition.onresult = (event: SpeechRecognitionResultEventLike) => {
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const result = event.results[i]
      const alternative = result?.[0]
      if (!result || !alternative) continue

      const transcript = alternative.transcript.trim()
      if (transcript) {
        hasHeardSpeech = true
        onResult(transcript, result.isFinal)
        resetSilenceTimer()
      }
    }
  }

  recognition.onerror = (event: SpeechRecognitionErrorEventLike) => {
    if (event.error === 'not-allowed') {
      onError?.('Permiso de microfono denegado')
    } else if (event.error === 'no-speech') {
      onError?.('No escuchamos nada. Reintenta.')
    } else if (event.error === 'aborted') {
      // El usuario o el navegador detuvo el reconocimiento.
    } else {
      onError?.(`Error de reconocimiento: ${event.error}`)
    }
  }

  recognition.onend = () => {
    if (silenceTimer) clearTimeout(silenceTimer)
    onEnd?.()
  }

  function stop() {
    isStopped = true
    if (silenceTimer) clearTimeout(silenceTimer)
    try {
      recognition.stop()
    } catch {
      // La API puede lanzar si ya estaba detenida.
    }
  }

  recognition.start()

  return { stop }
}
