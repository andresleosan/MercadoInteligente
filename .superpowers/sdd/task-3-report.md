# Task 3 Report: useVoice hook — orquestador

## Status: ✅ Complete

### Commits
- `0694a69` feat: useVoice hook -- orquestador de voz

### Files
- `src/hooks/useVoice.ts` — Hook implementation (83 lines)
- `src/hooks/useVoice.test.ts` — Test suite (97 lines)

### Process
1. ✅ Reading task brief
2. ✅ Writing test first → RED (module not found)
3. ✅ Writing minimal implementation → GREEN (5/5 passed)
4. ✅ Lint clean (0 errors)
5. ✅ Commit

### Interface
```
useVoice(): {
  status: VoiceStatus
  items: ParsedItem[]
  transcript: string
  error: string | null
  startListening: () => void
  reset: () => void
}
```

### Key design decisions
- Uses `refs` for transcript and status to avoid stale closures in `onEnd` callback
- `onEnd` transitions to `parsing` → `done`/`error` if there's a transcript and status was `listening`/`transcribing`
- `reset` stops listening if active, clears all state, returns to `idle`
- Empty parse results from `parseVoiceText` flow to `error` state with user-friendly message
