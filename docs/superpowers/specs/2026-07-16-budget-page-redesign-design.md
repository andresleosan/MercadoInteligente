# Budget Page Redesign — Dark Theme

## Alcance
Refactorizar `src/pages/Budget.tsx` para usar componentes dark (DarkCard, DarkInput, DarkButton) y alinear con la paleta de colores oscura definida en UI/UX V2.

## Current State
- White card with gray borders and shadow
- Standard HTML input with green focus ring
- Green button with white text
- Simple vertical layout with p-6 padding
- Loading spinner with green border
- Error/success messages in red/green text

## Target State
- DarkCard primary container with p-6 padding
- DarkInput for budget amount with label, placeholder, required, type="number"
- DarkButton primary (gradient green) for submit
- Keep all business logic unchanged (budget service, state management, error handling)
- Maintain responsive layout (max-w-sm centered)
- Keep loading spinner as-is (works fine)
- Ensure error/success messages use appropriate dark theme text colors

## Component Usage Pattern
Follow Login/Register pattern:
```jsx
<DarkCard className="p-6">
  <form onSubmit={handleSubmit} className="space-y-4">
    <DarkInput
      label="Monto mensual"
      type="number"
      value={amount}
      onChange={(e) => setAmount(e.target.value)}
      placeholder="Ej: 50000"
      className="w-full"
      min="0"
      step="100"
      required
    />
    {message && (
      <p className={`text-sm ${message.includes('Error') ? 'text-accent-red' : 'text-accent-green'}`}>
        {message}
      </p>
    )}
    <DarkButton
      type="submit"
      disabled={saving}
      className="w-full flex items-center justify-center gap-2"
    >
      {saving ? 'Guardando...' : budget ? 'Actualizar presupuesto' : 'Crear presupuesto'}
    </DarkButton>
  </form>
</DarkCard>
```

## Visual Consistency
- Use same color tokens: text-primary, text-secondary, text-muted, accent-green, accent-red
- DarkCard provides bg-surface, border-subtle, shadow-card
- DarkInput provides bg-elevated, border-subtle, focus:ring-accent-green
- DarkButton provides gradient green primary style

## Edge Cases
- Loading state: keep existing spinner (animate-spin rounded-full h-8 w-8 border-b-2 border-green-600)
- Error/success messages: change text colors from text-red-600/text-green-600 to text-accent-red/text-accent-green
- Button disabled state: DarkButton handles opacity-50 cursor-not-allowed
- Current budget display: keep as text with font-semibold, ensure text colors match dark theme

## Business Logic Unchanged
- All state management (useState, useEffect)
- Budget service calls (getBudget, setBudget)
- Form handling (handleSubmit)
- Error handling (try/catch)
- Loading/saving states

## Testing
- Run existing test suite: `npx vitest run`
- No specific Budget.test.tsx exists
- Expect all tests to pass (no regressions)

## Commit
feat(ui): redesign BudgetPage with dark theme
- DarkCard primary container
- DarkInput for budget amount
- DarkButton primary for update
- Premium financial form layout