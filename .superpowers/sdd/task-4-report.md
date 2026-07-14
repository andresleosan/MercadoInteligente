# Task 4: VoiceCapture Component — Report

## Summary
Created `VoiceCapture.tsx` and `VoiceCapture.test.tsx` via TDD (RED → GREEN → commit).

## Files
- `src/components/VoiceCapture.tsx` — visual component that consumes `useVoice` hook
- `src/components/VoiceCapture.test.tsx` — 4 passing tests

## Test Results
```
✓ src/components/VoiceCapture.test.tsx (4 tests)
  ✓ renderiza estado idle
  ✓ muestra transcripcion cuando cambia el texto
  ✓ llama onDone cuando status es done
  ✓ muestra mensaje de error
```

## Implementation Details
- Displays microphone UI with states: idle → listening → parsing → done → error
- Uses `useEffect` to auto-start listening on mount and call `onDone` when status turns `done`
- Cleanup via `reset()` on unmount
- Error state shows "Reintentar" and "Cargar manualmente" buttons

## Dev Notes
- Test had to use `vi.hoisted()` for the mock variable since `vi.mock` is hoisted
- Replaced `require('@/hooks/useVoice')` (failed on `@/` alias at runtime) with `mockUseVoice` reference
- Idle test checks for `<p>Preparando microfono...</p>` instead of a button (no button in idle per spec)
