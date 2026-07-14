# Task 7 Report: `OCRCapture.tsx` — UI de captura de imagen

## Status: DONE

## What I Implemented

A simple React component `OCRCapture` that renders a file input accepting images (camera or gallery). When a file is selected, it calls `onImageSelected(file)`. If no file is selected (e.g. user cancels), the callback is not invoked.

The component follows the same `htmlFor`/`id` label-association pattern as `ProductEditor.tsx` (Task 6), using a `sr-only` span for the accessible label text "Foto del ticket" so the visual UI shows only the styled file button while remaining accessible to `getByLabelText` and screen readers.

## TDD Evidence

### RED
Test written first at `src/components/OCRCapture.test.tsx`. First run failed because the implementation file did not exist:
```
Error: Failed to resolve import "./OCRCapture" from "src/components/OCRCapture.test.tsx". Does the file exist?
Test Files  1 failed (1)
```

### GREEN
After writing `src/components/OCRCapture.tsx`:
```
✓ src/components/OCRCapture.test.tsx (3 tests) 233ms
Test Files  1 passed (1)
     Tests  3 passed (3)
```

### Full suite + typecheck
- `npx tsc -b --noEmit` → clean, no output.
- `npx vitest run` → 10 test files, 52 tests, all passing. (stderr lines are intentional error-path logs from pre-existing auth/ocr tests, not failures.)

## Files Changed
- `src/components/OCRCapture.tsx` (new, 37 lines)
- `src/components/OCRCapture.test.tsx` (new, 35 lines)

## Commit
`618762d` — feat(ocr): componente OCRCapture (camara o galeria)

## Self-Review Findings

- **Completeness:** Component matches the brief's interface `<OCRCapture onImageSelected: (file: File) => void />`. All 3 test cases from the brief pass.
- **Quality:** Follows existing project conventions — `htmlFor`/`id` label association (same as ProductEditor), Tailwind classes, green brand color, `default export`, `interface Props`, typed `ChangeEvent` handler.
- **Discipline:** Test written first, verified RED, then implementation, verified GREEN. Only the two task files were staged (the unrelated modified design doc and `.superpowers/` directory were left unstaged).
- **Testing:** 3/3 new tests pass; 52/52 total suite pass; typecheck clean.

## Concerns
None. Minor note: the brief's reference implementation used a wrapping `<label>` without `htmlFor`/`id`; I added `htmlFor="ocr-capture-file"` and `id="ocr-capture-file"` per the task note's explicit instruction to match Task 6's ProductEditor pattern. Both approaches work with `getByLabelText`; the explicit association is more robust and consistent with the codebase.
