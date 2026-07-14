# Task 2 Report: voice service — Web Speech API wrapper

## Status: DONE

## Commit
- `23b8f8c` feat: voice service -- Web Speech API wrapper

## Files
- Created `src/services/voice.ts` — Web Speech API wrapper with silence timeout
- Created `src/services/voice.test.ts` — 4 unit tests

## Test Results
- 4/4 tests PASS
  - ✓ Crea SpeechRecognition con configuración correcta
  - ✓ onerror con not-allowed llama al callback de error
  - ✓ stop() detiene la grabación
  - ✓ Arroja error si SpeechRecognition no está disponible

## Implementation Notes
- Exports `startListening(options): { stop }` as specified
- Uses `globalThis.SpeechRecognition ?? globalThis.webkitSpeechRecognition`
- Includes silence timeout (2s) that auto-stops recognition
- Maps `not-allowed` → Spanish error message, `no-speech` → retry message, `aborted` → ignored
- No React dependencies — pure service
- Full suite green: all existing tests still pass
