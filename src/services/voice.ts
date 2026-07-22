interface ListeningOptions {
  onResult: (text: string, isFinal: boolean) => void
  onError?: (message: string) => void
  onEnd?: () => void
}

const SILENCE_TIMEOUT_MS = 12000
const MAX_NO_SPEECH_RETRIES = 2

export function startListening({ onResult, onError, onEnd }: ListeningOptions) {
  const SpeechRecognitionAPI =
    (globalThis as any).SpeechRecognition ?? (globalThis as any).webkitSpeechRecognition

  if (!SpeechRecognitionAPI) {
    onError?.('Voz no disponible en este navegador')
    return { stop: () => {} }
  }

  const recognition = new SpeechRecognitionAPI()
  recognition.lang = 'es-AR'
  recognition.continuous = true
  recognition.interimResults = true

  let silenceTimer: ReturnType<typeof setTimeout> | null = null
  let isStopped = false
  let hasHeardSpeech = false
  let noSpeechRetries = 0

  function resetSilenceTimer() {
    if (!hasHeardSpeech) return
    if (silenceTimer) clearTimeout(silenceTimer)
    if (isStopped) return
    silenceTimer = setTimeout(() => {
      stop()
    }, SILENCE_TIMEOUT_MS)
  }

  recognition.onresult = (event: any) => {
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const transcript = event.results[i][0].transcript.trim()
      if (transcript) {
        hasHeardSpeech = true
        onResult(transcript, event.results[i].isFinal)
        resetSilenceTimer()
      }
    }
  }

  recognition.onerror = (event: any) => {
    if (event.error === 'not-allowed') {
      onError?.('Permiso de microfono denegado')
    } else if (event.error === 'no-speech') {
      if (!hasHeardSpeech && noSpeechRetries < MAX_NO_SPEECH_RETRIES) {
        noSpeechRetries += 1
        try {
          recognition.stop()
        } catch {
          onError?.('No escuchamos nada. Reintenta.')
        }
        return
      }
      onError?.('No escuchamos nada. Reintenta.')
    } else if (event.error === 'aborted') {
    } else {
      onError?.(`Error de reconocimiento: ${event.error}`)
    }
  }

  recognition.onend = () => {
    if (silenceTimer) clearTimeout(silenceTimer)
    if (!isStopped && !hasHeardSpeech && noSpeechRetries > 0 && noSpeechRetries <= MAX_NO_SPEECH_RETRIES) {
      try {
        recognition.start()
        return
      } catch {
        onError?.('No escuchamos nada. Reintenta.')
      }
    }
    onEnd?.()
  }

  function stop() {
    isStopped = true
    if (silenceTimer) clearTimeout(silenceTimer)
    try { recognition.stop() } catch { }
  }

  recognition.start()

  return { stop }
}
