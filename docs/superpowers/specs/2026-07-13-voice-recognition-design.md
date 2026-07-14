# Registro por Voz — Design Spec

## Descripción
Agregar entrada de productos por voz en la pantalla de registro de compra, usando Web Speech API. El usuario habla una frase natural ("compré leche a 1200, pan a 800") y el sistema parsea productos/precios mostrándolos para revisión antes de guardar.

## Flujo de Usuario
1. Botón "🎤 Registrar por voz" en AddPurchase (tercer modo, junto a foto y manual)
2. Browser pide permiso de micrófono
3. Componente VoiceCapture muestra micrófono pulsando + transcripción en vivo
4. Usuario habla lista de compra. Silencio > 2s o botón "Listo" detiene la grabación
5. voiceParser.ts convierte texto a ParsedItem[]
6. VoiceReview muestra resultados editables (mismo patrón que OCRReview, reusa addPurchase)
7. Usuario confirma → se guarda.

## Arquitectura

### Nuevos archivos
```
src/services/voice.ts          — Web Speech API wrapper
src/services/voiceParser.ts    — texto → ParsedItem[]
src/hooks/useVoice.ts          — hook orquestador
src/components/VoiceCapture.tsx — micrófono + transcripción viva
src/components/VoiceReview.tsx  — resultados editables (reusa patrón OCRReview)
```

### Modificaciones
```
src/pages/AddPurchase.tsx       — +1 modo "voice" en state mode
```

### voice.ts — Web Speech API wrapper
- `startListening()` → crea `SpeechRecognition` con `lang='es-AR'`, `continuous=true`, `interimResults=true`
- Eventos: `onresult` (interim + final), `onend`, `onerror`
- Retorna un objeto con `stop()` y un callback `onTranscript(text: string, isFinal: boolean)`
- Timeout de silencio: si no hay resultados nuevos > 2s, detiene automáticamente
- Manejo de errores: not-allowed, no-speech, aborted, network
- Fallback: si SpeechRecognition no está disponible en el browser, mostrar mensaje "Voz no disponible en este navegador"

### voiceParser.ts — Parseador de frases
Flujo de parseo:
1. Split por `,`, `y`, `, y`
2. Cada segmento → regex que detecta patrones:
   - `"(cant) (producto) a (precio)"` — ej: "3 leches a 1200"
   - `"(producto) a (precio)"` — ej: "leche a 1200"
   - `"(producto) (precio)"` — ej: "pan 800"
3. Si no matchea ningún patrón, el segmento se marca como producto sin precio (unitPrice=0)
4. Output: `ParsedItem[]` con `confidence` basado en qué tan limpio fue el match

Reglas específicas:
- Cantidad default: 1
- Precio vs cantidad: números > 10 se interpretan como precio si hay "a" antes, o como cantidad si el número chico (<10) y sin "a"
- Ignorar palabras vacías: "compré", "compre", "comprar", "mercado", "supermercado", "fuimos", etc.

### useVoice.ts — Hook orquestador
```
type VoiceStatus = 'idle' | 'listening' | 'transcribing' | 'parsing' | 'done' | 'error'
```
Estados:
- `idle` → inicial
- `listening` → micrófono activo, capturando voz
- `transcribing` → SpeechRecognition finalizó, texto crudo obtenido
- `parsing` → voiceParser corriendo
- `done` → items parseados listos para review
- `error` → error (sin permisos, timeout, sin productos detectados)

Retorna: `{ status, items, transcript, error, startListening, reset }`

### VoiceCapture.tsx
- Botón circular con ícono de micrófono
- Cuando está grabando: animación de pulso, texto de transcripción en vivo (interim results)
- Botón "Detener" o "Listo"
- Mensajes de estado: "Escuchando...", "Procesando...", "Sin productos detectados"

### VoiceReview.tsx
- Reusa exacto el patrón de OCRReview pero sin imagen
- Muestra ParsedItem[] en tabla editable
- Botón "Guardar" (llama a addPurchase) y botón "Reintentar" (vuelve a voice)

### AddPurchase.tsx — Modo "voice"
- State `mode` extiende: `'manual' | 'photo' | 'review' | 'error' | 'voice' | 'voice-review'`
- Botón "🎤 Registrar por voz" al lado del de foto en modo manual
- Cuando `mode='voice'` → muestra `VoiceCapture`
- Cuando `mode='voice-review'` → muestra `VoiceReview`
- Al guardar/reintentar → vuelve a `manual`

## Testing

### voiceParser.test.ts
- "leche a 1200" → [{ name: "Leche", unitPrice: 1200, quantity: 1 }]
- "compré leche a 1200, pan a 800, y 3 huevos a 2500" → 3 items
- "leche 1200" (sin "a") → también debe matchear
- Test de palabras vacías filtradas
- Frase sin productos detectables → array vacío

### useVoice.test.ts
- Mocks de Web Speech API (simular SpeechRecognition)
- Test de ciclo completo: listening → transcribing → parsing → done
- Test de error: permisos denegados

### VoiceCapture.test.tsx
- Renderiza botón de micrófono
- Muestra transcripción en vivo
- Muestra estado "Voz no disponible" si no hay SpeechRecognition

### AddPurchase.test.tsx (integración)
- Botón de voz visible en modo manual
- Transición voice → voice-review

## Edge Cases
- Permiso denegado: mostrar mensaje claro y botón "Volver a manual"
- Sin productos detectados: mostrar "No reconocimos productos. Reintentar o cargar manualmente."
- Silencio prolongado (>5s sin detectar nada): detener y mostrar "No escuchamos nada"
- Texto largo (>200 chars): truncar para el display, parsear igual
- Números argentinos: soportar formato "1.200" o "1200" sin punto. El parseador elimina puntos de miles
- Palabras mal reconocidas por STT: el usuario puede corregir en VoiceReview (como en OCR)
