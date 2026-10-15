# Task 17: Refactorizar Componentes Menores

**Files:**
- Modify: `src/components/OCRCapture.tsx`
- Modify: `src/components/OCRReview.tsx`
- Modify: `src/components/ProductEditor.tsx`
- Modify: `src/components/VoiceCapture.tsx`
- Modify: `src/components/ProtectedRoute.tsx`

**Interfaces:**
- Consumes: DarkButton, DarkInput (Tasks 4-5), tokens de Tailwind
- Produce: Todos los componentes menores rediseñados con theme dark

## Steps

- [ ] **Step 1: Leer cada archivo**

```bash
cat src/components/OCRCapture.tsx
cat src/components/OCRReview.tsx
cat src/components/ProductEditor.tsx
cat src/components/VoiceCapture.tsx
cat src/components/ProtectedRoute.tsx
```

- [ ] **Step 2: Reemplazar colores en cada componente**

Update each component to use dark theme tokens:
- **OCRCapture:** Dark file input styling
- **OCRReview:** Dark review cards, yellow highlight for low confidence
- **ProductEditor:** Dark form inputs using DarkInput
- **VoiceCapture:** Dark mic button with pulse animation
- **ProtectedRoute:** Dark loading spinner

Keep all business logic unchanged in each component.

- [ ] **Step 3: Ejecutar todos los tests**

```bash
npx vitest run
```

Expected: Todos los tests pasan

- [ ] **Step 4: Commit**

```bash
git add src/components/OCRCapture.tsx src/components/OCRReview.tsx src/components/ProductEditor.tsx src/components/VoiceCapture.tsx src/components/ProtectedRoute.tsx
git commit -m "feat(ui): redesign minor components with dark theme

- OCRCapture: dark file input styling
- OCRReview: dark review cards, yellow highlight for low confidence
- ProductEditor: dark form inputs
- VoiceCapture: dark mic button with pulse animation
- ProtectedRoute: dark loading spinner"
```
