# Task 16: Refactorizar ChartsContent

**Files:**
- Modify: `src/components/ChartsContent.tsx`

**Interfaces:**
- Consumes: Tokens de Tailwind (bg-surface, bg-elevated, text-secondary, border-subtle, accent-green, accent-amber, accent-red)
- Produce: ChartsContent rediseñado con theme dark

## Steps

- [ ] **Step 1: Leer el archivo actual**

```bash
cat src/components/ChartsContent.tsx
```

- [ ] **Step 2: Reemplazar colores de charts y estilos**

Update the ChartsContent component to use:
- Dark background for chart containers (bg-surface or bg-elevated)
- Updated axis and grid colors (text-secondary, border-subtle)
- Accent colors for data series (accent-green, accent-amber, accent-red)
- Dark tooltips (bg-elevated, border-subtle)
- Keep all chart logic unchanged (recharts configuration, data processing)

- [ ] **Step 3: Ejecutar tests**

```bash
npx vitest run src/components/ChartsContent.test.tsx
```

Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add src/components/ChartsContent.tsx
git commit -m "feat(ui): redesign ChartsContent with dark theme

- Dark background for chart containers
- Updated axis and grid colors
- Accent colors for data series
- Dark tooltips
- Consistent with overall dark theme"
```
