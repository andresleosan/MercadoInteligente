# Task 5: Integrar en AddPurchase — modo voz

## Estado: Completado ✅

### Cambios realizados

**Archivos modificados:**
- `src/pages/AddPurchase.tsx` — integración de VoiceCapture y modos voice

**Archivos creados:**
- `src/pages/AddPurchase.test.tsx` — tests de integración

### Detalle de implementación

En `AddPurchase.tsx`:
1. **Importaciones:** Se agregó `VoiceCapture` desde `@/components/VoiceCapture` y `ParsedItem` desde `@/types`
2. **Tipo de modo extendido:** `'manual' | 'photo' | 'review' | 'error' | 'voice' | 'voice-review'`
3. **Estado `voiceItems`:** `useState<ParsedItem[]>([])`
4. **Botón de voz:** Botón púrpura "🎤 Registrar por voz" junto al botón de foto en modo manual
5. **Modo `voice`:** Renderiza `VoiceCapture` con callbacks `onDone` (→ voice-review) y `onBack` (→ manual)
6. **Modo `voice-review`:** Renderiza `OCRReview` con `imageUrl={null}` y los items obtenidos por voz

### Tests (TDD)

1. **renderiza botones de foto y voz en modo manual** — verifica que ambos botones están presentes
2. **al hacer clic en voz, cambia a modo voice** — verifica transición a VoiceCapture
3. **vuelve a manual con boton Volver desde voz** — verifica flujo completo: voz → voice-review con items

### Commits

```
921237f feat: integrar voz en AddPurchase -- nuevos modos voice y voice-review
```
