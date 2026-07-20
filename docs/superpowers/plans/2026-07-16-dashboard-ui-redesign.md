# Rediseño UI/UX Dashboard Mercado Inteligente - Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rediseñar toda la interfaz del proyecto con un theme dark premium, moderno y consistente, reemplazando los dos sistemas de colores en conflicto por uno unificado.

**Architecture:** Bottom-up: primero actualizar tokens (Tailwind config + CSS), luego crear componentes UI compartidos (DarkCard, DarkButton, DarkInput, KpiCard, ProgressBar, EmptyState, MonthSelector), finalmente refactorizar todas las páginas y componentes existentes para usar los nuevos componentes y tokens.

**Tech Stack:** React 18 + TypeScript + Tailwind CSS + CSS transitions

## Global Constraints

- NO modificar lógica de negocio, Firebase services, hooks, ni rutas (App.tsx routing)
- NO agregar dependencias nuevas
- SOLO mejorar: Layout, Tailwind, Componentes visuales, UX, Accesibilidad, Responsive
- Todos los 132 tests existentes deben seguir pasando
- Build exitoso (`npm run build`) sin errores de TypeScript
- Contraste WCAG AA en todos los textos
- Responsive: mobile (375px), tablet (768px), desktop (1024px)

---

## File Structure

### Configuración (modificar)
- `tailwind.config.js` — Nueva paleta, sombras, radius, screens
- `src/index.css` — Transiciones utilitarias, variables CSS

### Componentes UI (crear en `src/components/ui/`)
- `DarkCard.tsx` — Contenedor base para cards
- `DarkButton.tsx` — Botón unificado
- `DarkInput.tsx` — Input oscuro unificado
- `KpiCard.tsx` — Card de métrica
- `ProgressBar.tsx` — Bara de progreso animada
- `EmptyState.tsx` — Estado vacío para listas
- `MonthSelector.tsx` — Selector de mes mejorado

### Páginas (refactorizar en `src/pages/`)
- `Dashboard.tsx` — Página principal
- `Login.tsx` — Login
- `Register.tsx` — Registro
- `Budget.tsx` — Presupuesto
- `AddPurchase.tsx` — Agregar compra
- `PurchaseHistory.tsx` — Historial

### Componentes (refactorizar en `src/components/`)
- `ChartsContent.tsx` — Gráficos recharts
- `OCRCapture.tsx` — Captura OCR
- `OCRReview.tsx` — Review OCR
- `ProductEditor.tsx` — Editor de productos
- `VoiceCapture.tsx` — Captura de voz
- `ProtectedRoute.tsx` — Ruta protegida

---

### Task 1: Actualizar Tailwind Config

**Files:**
- Modify: `tailwind.config.js`

**Interfaces:**
- Consumes: Ninguna (primera tarea)
- Produce: Tokens de color, sombras, radius, screens disponibles para todos los componentes

- [ ] **Step 1: Leer el archivo actual**

```bash
cat tailwind.config.js
```

- [ ] **Step 2: Reemplazar la sección `theme.extend.colors`**

```js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'bg-base':       '#0B1120',
        'bg-surface':    '#111827',
        'bg-elevated':   '#1F2937',
        'bg-header':     '#0B1120',
        'border-subtle': 'rgba(255,255,255,0.08)',
        'text-primary':  '#F9FAFB',
        'text-secondary':'#9CA3AF',
        'text-muted':    '#6B7280',
        'accent-green':  '#10B981',
        'accent-success':'#22C55E',
        'accent-amber':  '#F59E0B',
        'accent-red':    '#EF4444',
      },
      boxShadow: {
        'card':     '0 4px 6px -1px rgba(0,0,0,0.3), 0 2px 4px -2px rgba(0,0,0,0.3)',
        'elevated': '0 10px 15px -3px rgba(0,0,0,0.4), 0 4px 6px -4px rgba(0,0,0,0.3)',
        'glow':     '0 0 20px rgba(16,185,129,0.15)',
      },
      borderRadius: {
        'radius-sm': '8px',
        'radius-md': '12px',
        'radius-lg': '16px',
        'radius-xl': '20px',
      },
      screens: {
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
      },
      animation: {
        'slide-down': 'slide-down 300ms ease-out',
        'slide-up':   'slide-up 200ms ease-in',
        'chevron':    'chevron 300ms ease',
      },
      keyframes: {
        'slide-down': {
          '0%':   { opacity: '0', maxHeight: '0' },
          '100%': { opacity: '1', maxHeight: '1000px' },
        },
        'slide-up': {
          '0%':   { opacity: '1', maxHeight: '1000px' },
          '100%': { opacity: '0', maxHeight: '0' },
        },
        'chevron': {
          '0%':   { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(180deg)' },
        },
      },
    },
  },
  plugins: [],
  safelist: [
    'animate-slide-down',
    'animate-slide-up',
    'animate-chevron',
  ],
}
```

- [ ] **Step 3: Verificar que el build no falla**

```bash
npm run build 2>&1 | head -20
```

Expected: Build exitoso (puede haber warnings de chunks, eso es normal)

- [ ] **Step 4: Commit**

```bash
git add tailwind.config.js
git commit -m "feat(ui): update Tailwind config with dark theme tokens

- Replace color palette with new dark theme (#0B1120, #111827, #1F2937)
- Add custom shadows (card, elevated, glow)
- Add border radius tokens (radius-sm/md/lg/xl)
- Add responsive screens (sm/md/lg/xl)
- Move keyframes to theme.extend for better organization"
```

---

### Task 2: Actualizar Global CSS

**Files:**
- Modify: `src/index.css`

**Interfaces:**
- Consumes: Tokens de Tailwind configurados en Task 1
- Produce: Clases utilitarias de transición disponibles

- [ ] **Step 1: Leer el archivo actual**

```bash
cat src/index.css
```

- [ ] **Step 2: Agregar clases de transición utilitarias al final del archivo**

```css
/* Transiciones utilitarias */
@layer utilities {
  .transition-fast { transition: all 150ms ease; }
  .transition-normal { transition: all 200ms ease; }
  .transition-slow { transition: all 300ms ease; }
}
```

- [ ] **Step 3: Verificar que el build no falla**

```bash
npm run build 2>&1 | head -20
```

Expected: Build exitoso

- [ ] **Step 4: Commit**

```bash
git add src/index.css
git commit -m "feat(ui): add utility transition classes

- transition-fast: 150ms ease
- transition-normal: 200ms ease
- transition-slow: 300ms ease"
```

---

### Task 3: Crear DarkCard Component

**Files:**
- Create: `src/components/ui/DarkCard.tsx`
- Create: `src/components/ui/DarkCard.test.tsx`

**Interfaces:**
- Consumes: Tokens de Tailwind (bg-surface, bg-elevated, border-subtle, shadow-card, shadow-elevated, radius-xl, radius-lg)
- Produce: `<DarkCard variant="primary|secondary" hover className>` disponible para todas las páginas

- [ ] **Step 1: Crear el test**

```tsx
// src/components/ui/DarkCard.test.tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { DarkCard } from './DarkCard'

describe('DarkCard', () => {
  it('renders children', () => {
    render(<DarkCard><span>Content</span></DarkCard>)
    expect(screen.getByText('Content')).toBeInTheDocument()
  })

  it('applies primary variant styles by default', () => {
    render(<DarkCard data-testid="card">Content</DarkCard>)
    const card = screen.getByTestId('card')
    expect(card.className).toContain('bg-surface')
    expect(card.className).toContain('rounded-radius-xl')
  })

  it('applies secondary variant styles', () => {
    render(<DarkCard variant="secondary" data-testid="card">Content</DarkCard>)
    const card = screen.getByTestId('card')
    expect(card.className).toContain('bg-elevated')
    expect(card.className).toContain('rounded-radius-lg')
  })

  it('applies hover styles when hover=true', () => {
    render(<DarkCard hover data-testid="card">Content</DarkCard>)
    const card = screen.getByTestId('card')
    expect(card.className).toContain('hover:shadow-elevated')
    expect(card.className).toContain('hover:scale-[1.01]')
  })

  it('applies custom className', () => {
    render(<DarkCard className="custom-class" data-testid="card">Content</DarkCard>)
    const card = screen.getByTestId('card')
    expect(card.className).toContain('custom-class')
  })
})
```

- [ ] **Step 2: Ejecutar test y verificar que falla**

```bash
npx vitest run src/components/ui/DarkCard.test.tsx
```

Expected: FAIL — "Cannot find module './DarkCard'"

- [ ] **Step 3: Crear el componente**

```tsx
// src/components/ui/DarkCard.tsx
import React from 'react'

interface DarkCardProps {
  children: React.ReactNode
  className?: string
  variant?: 'primary' | 'secondary'
  hover?: boolean
}

export function DarkCard({
  children,
  className = '',
  variant = 'primary',
  hover = false,
  ...props
}: DarkCardProps & React.HTMLAttributes<HTMLDivElement>) {
  const baseStyles = 'border border-border-subtle shadow-card transition-fast'

  const variants = {
    primary: 'bg-surface rounded-radius-xl',
    secondary: 'bg-elevated rounded-radius-lg',
  }

  const hoverStyles = hover
    ? 'hover:shadow-elevated hover:scale-[1.01] cursor-pointer'
    : ''

  return (
    <div
      className={`${baseStyles} ${variants[variant]} ${hoverStyles} ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}
```

- [ ] **Step 4: Ejecutar test y verificar que pasa**

```bash
npx vitest run src/components/ui/DarkCard.test.tsx
```

Expected: PASS (5 tests)

- [ ] **Step 5: Commit**

```bash
git add src/components/ui/DarkCard.tsx src/components/ui/DarkCard.test.tsx
git commit -m "feat(ui): add DarkCard component

- Variants: primary (bg-surface) and secondary (bg-elevated)
- Optional hover effect with scale and shadow
- Custom className support
- 5 tests passing"
```

---

### Task 4: Crear DarkButton Component

**Files:**
- Create: `src/components/ui/DarkButton.tsx`
- Create: `src/components/ui/DarkButton.test.tsx`

**Interfaces:**
- Consumes: Tokens de Tailwind (accent-green, accent-success, accent-red, border-subtle, bg-elevated, radius-md)
- Produce: `<DarkButton variant="primary|secondary|danger" size="sm|md|lg">` disponible para todas las páginas

- [ ] **Step 1: Crear el test**

```tsx
// src/components/ui/DarkButton.test.tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { DarkButton } from './DarkButton'

describe('DarkButton', () => {
  it('renders children', () => {
    render(<DarkButton>Click me</DarkButton>)
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })

  it('calls onClick when clicked', () => {
    const onClick = vi.fn()
    render(<DarkButton onClick={onClick}>Click</DarkButton>)
    fireEvent.click(screen.getByText('Click'))
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('applies primary variant styles by default', () => {
    render(<DarkButton data-testid="btn">Click</DarkButton>)
    const btn = screen.getByTestId('btn')
    expect(btn.className).toContain('from-accent-green')
    expect(btn.className).toContain('to-accent-success')
  })

  it('applies secondary variant styles', () => {
    render(<DarkButton variant="secondary" data-testid="btn">Click</DarkButton>)
    const btn = screen.getByTestId('btn')
    expect(btn.className).toContain('bg-transparent')
    expect(btn.className).toContain('border-border-subtle')
  })

  it('applies danger variant styles', () => {
    render(<DarkButton variant="danger" data-testid="btn">Click</DarkButton>)
    const btn = screen.getByTestId('btn')
    expect(btn.className).toContain('bg-accent-red')
  })

  it('applies size sm', () => {
    render(<DarkButton size="sm" data-testid="btn">Click</DarkButton>)
    const btn = screen.getByTestId('btn')
    expect(btn.className).toContain('px-3')
    expect(btn.className).toContain('py-1.5')
    expect(btn.className).toContain('text-sm')
  })

  it('applies size md by default', () => {
    render(<DarkButton data-testid="btn">Click</DarkButton>)
    const btn = screen.getByTestId('btn')
    expect(btn.className).toContain('px-4')
    expect(btn.className).toContain('py-2')
    expect(btn.className).toContain('text-sm')
  })

  it('applies size lg', () => {
    render(<DarkButton size="lg" data-testid="btn">Click</DarkButton>)
    const btn = screen.getByTestId('btn')
    expect(btn.className).toContain('px-6')
    expect(btn.className).toContain('py-3')
    expect(btn.className).toContain('text-base')
  })

  it('is disabled when disabled prop is true', () => {
    render(<DarkButton disabled data-testid="btn">Click</DarkButton>)
    const btn = screen.getByTestId('btn')
    expect(btn).toBeDisabled()
    expect(btn.className).toContain('opacity-50')
    expect(btn.className).toContain('cursor-not-allowed')
  })
})
```

- [ ] **Step 2: Ejecutar test y verificar que falla**

```bash
npx vitest run src/components/ui/DarkButton.test.tsx
```

Expected: FAIL — "Cannot find module './DarkButton'"

- [ ] **Step 3: Crear el componente**

```tsx
// src/components/ui/DarkButton.tsx
import React from 'react'

interface DarkButtonProps {
  children: React.ReactNode
  variant?: 'primary' | 'secondary' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  onClick?: () => void
  type?: 'button' | 'submit'
  className?: string
}

export function DarkButton({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  onClick,
  type = 'button',
  className = '',
  ...props
}: DarkButtonProps & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const baseStyles = 'font-medium rounded-radius-md transition-fast focus:ring-2 focus:ring-accent-green focus:ring-offset-2 focus:ring-offset-bg-base'

  const variants = {
    primary: 'bg-gradient-to-r from-accent-green to-accent-success text-white hover:brightness-110',
    secondary: 'bg-transparent border border-border-subtle text-text-primary hover:bg-elevated',
    danger: 'bg-accent-red text-white hover:brightness-110',
  }

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  }

  const disabledStyles = disabled ? 'opacity-50 cursor-not-allowed' : ''

  return (
    <button
      type={type}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${disabledStyles} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
```

- [ ] **Step 4: Ejecutar test y verificar que pasa**

```bash
npx vitest run src/components/ui/DarkButton.test.tsx
```

Expected: PASS (10 tests)

- [ ] **Step 5: Commit**

```bash
git add src/components/ui/DarkButton.tsx src/components/ui/DarkButton.test.tsx
git commit -m "feat(ui): add DarkButton component

- Variants: primary (gradient), secondary (outline), danger (red)
- Sizes: sm, md, lg
- Disabled state with opacity
- Focus ring for accessibility
- 10 tests passing"
```

---

### Task 5: Crear DarkInput Component

**Files:**
- Create: `src/components/ui/DarkInput.tsx`
- Create: `src/components/ui/DarkInput.test.tsx`

**Interfaces:**
- Consumes: Tokens de Tailwind (bg-elevated, border-subtle, text-primary, text-secondary, text-muted, accent-green, accent-red, radius-md)
- Produce: `<DarkInput label error prefix type value onChange placeholder>` disponible para todas las páginas

- [ ] **Step 1: Crear el test**

```tsx
// src/components/ui/DarkInput.test.tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { DarkInput } from './DarkInput'

describe('DarkInput', () => {
  it('renders input', () => {
    render(<DarkInput value="" onChange={vi.fn()} />)
    expect(screen.getByRole('textbox')).toBeInTheDocument()
  })

  it('renders label when provided', () => {
    render(<DarkInput label="Email" value="" onChange={vi.fn()} />)
    expect(screen.getByText('Email')).toBeInTheDocument()
  })

  it('renders prefix when provided', () => {
    render(<DarkInput prefix="$" value="" onChange={vi.fn()} />)
    expect(screen.getByText('$')).toBeInTheDocument()
  })

  it('calls onChange when typing', () => {
    const onChange = vi.fn()
    render(<DarkInput value="" onChange={onChange} />)
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'test' } })
    expect(onChange).toHaveBeenCalledTimes(1)
  })

  it('renders error when provided', () => {
    render(<DarkInput error="Required" value="" onChange={vi.fn()} />)
    expect(screen.getByText('Required')).toBeInTheDocument()
  })

  it('applies error styles to input', () => {
    render(<DarkInput error="Invalid" value="" onChange={vi.fn()} data-testid="input" />)
    const input = screen.getByTestId('input')
    expect(input.className).toContain('border-accent-red')
  })

  it('applies placeholder', () => {
    render(<DarkInput placeholder="Enter email" value="" onChange={vi.fn()} />)
    expect(screen.getByPlaceholderText('Enter email')).toBeInTheDocument()
  })

  it('applies custom className', () => {
    render(<DarkInput className="custom" value="" onChange={vi.fn()} data-testid="input" />)
    const input = screen.getByTestId('input')
    expect(input.className).toContain('custom')
  })
})
```

- [ ] **Step 2: Ejecutar test y verificar que falla**

```bash
npx vitest run src/components/ui/DarkInput.test.tsx
```

Expected: FAIL — "Cannot find module './DarkInput'"

- [ ] **Step 3: Crear el componente**

```tsx
// src/components/ui/DarkInput.tsx
import React from 'react'

interface DarkInputProps {
  label?: string
  error?: string
  prefix?: string
  type?: string
  value: string | number
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  placeholder?: string
  className?: string
}

export function DarkInput({
  label,
  error,
  prefix,
  type = 'text',
  value,
  onChange,
  placeholder,
  className = '',
  ...props
}: DarkInputProps & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className={`flex flex-col ${className}`}>
      {label && (
        <label className="text-sm text-text-secondary mb-1">{label}</label>
      )}
      <div className="flex items-center">
        {prefix && (
          <span className="text-text-muted mr-2">{prefix}</span>
        )}
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`flex-1 bg-bg-elevated border ${
            error ? 'border-accent-red' : 'border-border-subtle'
          } rounded-radius-md px-3 py-2 text-text-primary placeholder-text-muted
          focus:ring-2 focus:ring-accent-green focus:ring-offset-2 focus:ring-offset-bg-base
          focus:outline-none transition-fast`}
          {...props}
        />
      </div>
      {error && (
        <span className="text-sm text-accent-red mt-1">{error}</span>
      )}
    </div>
  )
}
```

- [ ] **Step 4: Ejecutar test y verificar que pasa**

```bash
npx vitest run src/components/ui/DarkInput.test.tsx
```

Expected: PASS (8 tests)

- [ ] **Step 5: Commit**

```bash
git add src/components/ui/DarkInput.tsx src/components/ui/DarkInput.test.tsx
git commit -m "feat(ui): add DarkInput component

- Label, prefix, error support
- Dark background with subtle border
- Focus ring with green accent
- Error state with red border
- 8 tests passing"
```

---

### Task 6: Crear KpiCard Component

**Files:**
- Create: `src/components/ui/KpiCard.tsx`
- Create: `src/components/ui/KpiCard.test.tsx`

**Interfaces:**
- Consumes: Tokens de Tailwind (bg-surface, text-primary, text-secondary, accent-green, accent-amber, accent-red, radius-lg, shadow-glow)
- Produce: `<KpiCard icon value label color>` disponible para Dashboard

- [ ] **Step 1: Crear el test**

```tsx
// src/components/ui/KpiCard.test.tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { KpiCard } from './KpiCard'

describe('KpiCard', () => {
  it('renders icon, value, and label', () => {
    render(<KpiCard icon="💰" value="$65.500" label="Gastado" />)
    expect(screen.getByText('💰')).toBeInTheDocument()
    expect(screen.getByText('$65.500')).toBeInTheDocument()
    expect(screen.getByText('Gastado')).toBeInTheDocument()
  })

  it('applies green color by default', () => {
    render(<KpiCard icon="💰" value="$0" label="Test" data-testid="card" />)
    const card = screen.getByTestId('card')
    expect(card.className).toContain('bg-surface')
  })

  it('applies amber color', () => {
    render(<KpiCard icon="💰" value="$0" label="Test" color="amber" data-testid="card" />)
    const card = screen.getByTestId('card')
    expect(card.className).toContain('border-accent-amber/30')
  })

  it('applies red color', () => {
    render(<KpiCard icon="💰" value="$0" label="Test" color="red" data-testid="card" />)
    const card = screen.getByTestId('card')
    expect(card.className).toContain('border-accent-red/30')
  })

  it('applies hover styles', () => {
    render(<KpiCard icon="💰" value="$0" label="Test" data-testid="card" />)
    const card = screen.getByTestId('card')
    expect(card.className).toContain('hover:scale-[1.02]')
    expect(card.className).toContain('hover:shadow-glow')
  })
})
```

- [ ] **Step 2: Ejecutar test y verificar que falla**

```bash
npx vitest run src/components/ui/KpiCard.test.tsx
```

Expected: FAIL — "Cannot find module './KpiCard'"

- [ ] **Step 3: Crear el componente**

```tsx
// src/components/ui/KpiCard.tsx
import React from 'react'

interface KpiCardProps {
  icon: string
  value: string
  label: string
  color?: 'green' | 'amber' | 'red'
}

export function KpiCard({
  icon,
  value,
  label,
  color = 'green',
  ...props
}: KpiCardProps & React.HTMLAttributes<HTMLDivElement>) {
  const colorBorders = {
    green: 'border-accent-green/30',
    amber: 'border-accent-amber/30',
    red: 'border-accent-red/30',
  }

  return (
    <div
      className={`bg-surface border ${colorBorders[color]} rounded-radius-lg p-4
      flex flex-col items-center gap-2
      hover:scale-[1.02] hover:shadow-glow transition-fast cursor-default`}
      {...props}
    >
      <span className="text-2xl">{icon}</span>
      <span className="text-3xl font-extrabold text-text-primary">{value}</span>
      <span className="text-sm text-text-secondary">{label}</span>
    </div>
  )
}
```

- [ ] **Step 4: Ejecutar test y verificar que pasa**

```bash
npx vitest run src/components/ui/KpiCard.test.tsx
```

Expected: PASS (5 tests)

- [ ] **Step 5: Commit**

```bash
git add src/components/ui/KpiCard.tsx src/components/ui/KpiCard.test.tsx
git commit -m "feat(ui): add KpiCard component

- Icon, value, label layout
- Color variants: green, amber, red (border accent)
- Hover scale and glow effect
- 5 tests passing"
```

---

### Task 7: Crear ProgressBar Component

**Files:**
- Create: `src/components/ui/ProgressBar.tsx`
- Create: `src/components/ui/ProgressBar.test.tsx`

**Interfaces:**
- Consumes: Tokens de Tailwind (bg-elevated, accent-green, accent-success, radius-full)
- Produce: `<ProgressBar percentage color showLabel>` disponible para Dashboard

- [ ] **Step 1: Crear el test**

```tsx
// src/components/ui/ProgressBar.test.tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ProgressBar } from './ProgressBar'

describe('ProgressBar', () => {
  it('renders with percentage label when showLabel=true', () => {
    render(<ProgressBar percentage={50} showLabel />)
    expect(screen.getByText('50%')).toBeInTheDocument()
  })

  it('does not render label when showLabel=false', () => {
    render(<ProgressBar percentage={50} />)
    expect(screen.queryByText('50%')).not.toBeInTheDocument()
  })

  it('applies correct width to fill bar', () => {
    render(<ProgressBar percentage={75} data-testid="fill" />)
    const fill = screen.getByTestId('fill')
    expect(fill.style.width).toBe('75%')
  })

  it('applies green gradient by default', () => {
    render(<ProgressBar percentage={50} data-testid="fill" />)
    const fill = screen.getByTestId('fill')
    expect(fill.className).toContain('from-accent-green')
    expect(fill.className).toContain('to-accent-success')
  })

  it('applies amber color', () => {
    render(<ProgressBar percentage={50} color="amber" data-testid="fill" />)
    const fill = screen.getByTestId('fill')
    expect(fill.className).toContain('bg-accent-amber')
  })

  it('applies red color', () => {
    render(<ProgressBar percentage={50} color="red" data-testid="fill" />)
    const fill = screen.getByTestId('fill')
    expect(fill.className).toContain('bg-accent-red')
  })
})
```

- [ ] **Step 2: Ejecutar test y verificar que falla**

```bash
npx vitest run src/components/ui/ProgressBar.test.tsx
```

Expected: FAIL — "Cannot find module './ProgressBar'"

- [ ] **Step 3: Crear el componente**

```tsx
// src/components/ui/ProgressBar.tsx
import React from 'react'

interface ProgressBarProps {
  percentage: number
  color?: 'green' | 'amber' | 'red'
  showLabel?: boolean
}

export function ProgressBar({
  percentage,
  color = 'green',
  showLabel = false,
  ...props
}: ProgressBarProps & React.HTMLAttributes<HTMLDivElement>) {
  const clampedPercentage = Math.min(100, Math.max(0, percentage))

  const colorStyles = {
    green: 'bg-gradient-to-r from-accent-green to-accent-success',
    amber: 'bg-accent-amber',
    red: 'bg-accent-red',
  }

  return (
    <div className="relative" {...props}>
      {showLabel && (
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs text-text-secondary">{clampedPercentage.toFixed(1)}% del presupuesto utilizado</span>
        </div>
      )}
      <div className="bg-bg-elevated rounded-radius-full h-3 overflow-hidden">
        <div
          data-testid={props['data-testid'] ? `${props['data-testid']}-fill` : undefined}
          className={`${colorStyles[color]} h-full rounded-radius-full transition-all duration-500 ease-out`}
          style={{ width: `${clampedPercentage}%` }}
        />
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Ejecutar test y verificar que pasa**

```bash
npx vitest run src/components/ui/ProgressBar.test.tsx
```

Expected: PASS (6 tests)

- [ ] **Step 5: Commit**

```bash
git add src/components/ui/ProgressBar.tsx src/components/ui/ProgressBar.test.tsx
git commit -m "feat(ui): add ProgressBar component

- Animated fill with CSS transition (500ms)
- Color variants: green (gradient), amber, red
- Optional percentage label
- Clamped percentage (0-100)
- 6 tests passing"
```

---

### Task 8: Crear EmptyState Component

**Files:**
- Create: `src/components/ui/EmptyState.tsx`
- Create: `src/components/ui/EmptyState.test.tsx`

**Interfaces:**
- Consumes: Tokens de Tailwind (text-primary, text-secondary), DarkButton
- Produce: `<EmptyState icon title description action>` disponible para PurchaseHistory

- [ ] **Step 1: Crear el test**

```tsx
// src/components/ui/EmptyState.test.tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { EmptyState } from './EmptyState'

describe('EmptyState', () => {
  it('renders icon, title, and description', () => {
    render(<EmptyState icon="🛒" title="No items" description="Add something" />)
    expect(screen.getByText('🛒')).toBeInTheDocument()
    expect(screen.getByText('No items')).toBeInTheDocument()
    expect(screen.getByText('Add something')).toBeInTheDocument()
  })

  it('renders CTA button when action is provided', () => {
    const onClick = vi.fn()
    render(
      <EmptyState
        icon="🛒"
        title="No items"
        description="Add something"
        action={{ label: 'Add item', onClick }}
      />
    )
    const btn = screen.getByText('Add item')
    expect(btn).toBeInTheDocument()
    fireEvent.click(btn)
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('does not render CTA button when action is not provided', () => {
    render(<EmptyState icon="🛒" title="No items" description="Add something" />)
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Ejecutar test y verificar que falla**

```bash
npx vitest run src/components/ui/EmptyState.test.tsx
```

Expected: FAIL — "Cannot find module './EmptyState'"

- [ ] **Step 3: Crear el componente**

```tsx
// src/components/ui/EmptyState.tsx
import React from 'react'
import { DarkButton } from './DarkButton'

interface EmptyStateProps {
  icon: string
  title: string
  description: string
  action?: {
    label: string
    onClick: () => void
  }
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <span className="text-6xl mb-4">{icon}</span>
      <h3 className="text-lg font-semibold text-text-primary mb-2">{title}</h3>
      <p className="text-sm text-text-secondary text-center max-w-sm mb-6">{description}</p>
      {action && (
        <DarkButton onClick={action.onClick}>{action.label}</DarkButton>
      )}
    </div>
  )
}
```

- [ ] **Step 4: Ejecutar test y verificar que pasa**

```bash
npx vitest run src/components/ui/EmptyState.test.tsx
```

Expected: PASS (3 tests)

- [ ] **Step 5: Commit**

```bash
git add src/components/ui/EmptyState.tsx src/components/ui/EmptyState.test.tsx
git commit -m "feat(ui): add EmptyState component

- Large icon, title, description layout
- Optional CTA button using DarkButton
- Centered, padded design
- 3 tests passing"
```

---

### Task 9: Crear MonthSelector Component

**Files:**
- Create: `src/components/ui/MonthSelector.tsx`
- Create: `src/components/ui/MonthSelector.test.tsx`

**Interfaces:**
- Consumes: Tokens de Tailwind (bg-surface, bg-elevated, border-subtle, text-primary, radius-lg, radius-md), utilidad `shiftMonth` de `src/utils/date.ts`
- Produce: `<MonthSelector currentMonth onMonthChange>` disponible para Dashboard

- [ ] **Step 1: Crear el test**

```tsx
// src/components/ui/MonthSelector.test.tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MonthSelector } from './MonthSelector'

describe('MonthSelector', () => {
  const baseDate = new Date(2026, 6, 1) // Julio 2026

  it('renders current month and year', () => {
    render(<MonthSelector currentMonth={baseDate} onMonthChange={vi.fn()} />)
    expect(screen.getByText('Julio 2026')).toBeInTheDocument()
  })

  it('calls onMonthChange with previous month when left arrow clicked', () => {
    const onChange = vi.fn()
    render(<MonthSelector currentMonth={baseDate} onMonthChange={onChange} />)
    fireEvent.click(screen.getByLabelText('Mes anterior'))
    expect(onChange).toHaveBeenCalledWith(new Date(2026, 5, 1))
  })

  it('calls onMonthChange with next month when right arrow clicked', () => {
    const onChange = vi.fn()
    render(<MonthSelector currentMonth={baseDate} onMonthChange={onChange} />)
    fireEvent.click(screen.getByLabelText('Mes siguiente'))
    expect(onChange).toHaveBeenCalledWith(new Date(2026, 7, 1))
  })

  it('applies dark theme styles', () => {
    render(<MonthSelector currentMonth={baseDate} onMonthChange={vi.fn()} data-testid="container" />)
    const container = screen.getByTestId('container')
    expect(container.className).toContain('bg-surface')
    expect(container.className).toContain('rounded-radius-lg')
  })
})
```

- [ ] **Step 2: Ejecutar test y verificar que falla**

```bash
npx vitest run src/components/ui/MonthSelector.test.tsx
```

Expected: FAIL — "Cannot find module './MonthSelector'"

- [ ] **Step 3: Crear el componente**

```tsx
// src/components/ui/MonthSelector.tsx
import React from 'react'

const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
]

interface MonthSelectorProps {
  currentMonth: Date
  onMonthChange: (date: Date) => void
}

function shiftMonth(date: Date, delta: number): Date {
  const newDate = new Date(date)
  newDate.setMonth(newDate.getMonth() + delta)
  return newDate
}

function formatLabel(date: Date): string {
  return `${MONTH_NAMES[date.getMonth()]} ${date.getFullYear()}`
}

export function MonthSelector({
  currentMonth,
  onMonthChange,
  ...props
}: MonthSelectorProps & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`bg-bg-surface rounded-radius-lg p-4 flex items-center justify-between ${props.className || ''}`}
      {...props}
    >
      <button
        type="button"
        aria-label="Mes anterior"
        onClick={() => onMonthChange(shiftMonth(currentMonth, -1))}
        className="bg-bg-elevated rounded-radius-md p-2 hover:bg-border-subtle transition-fast text-text-primary focus:ring-2 focus:ring-accent-green focus:ring-offset-2 focus:ring-offset-bg-base"
      >
        ←
      </button>
      <span className="text-xl font-semibold text-text-primary">
        {formatLabel(currentMonth)}
      </span>
      <button
        type="button"
        aria-label="Mes siguiente"
        onClick={() => onMonthChange(shiftMonth(currentMonth, 1))}
        className="bg-bg-elevated rounded-radius-md p-2 hover:bg-border-subtle transition-fast text-text-primary focus:ring-2 focus:ring-accent-green focus:ring-offset-2 focus:ring-offset-bg-base"
      >
        →
      </button>
    </div>
  )
}
```

- [ ] **Step 4: Ejecutar test y verificar que pasa**

```bash
npx vitest run src/components/ui/MonthSelector.test.tsx
```

Expected: PASS (4 tests)

- [ ] **Step 5: Commit**

```bash
git add src/components/ui/MonthSelector.tsx src/components/ui/MonthSelector.test.tsx
git commit -m "feat(ui): add MonthSelector component

- Dark themed month navigation
- Spanish month names
- Accessible aria-labels on arrows
- Hover and focus effects
- 4 tests passing"
```

---

### Task 10: Refactorizar Dashboard Page

**Files:**
- Modify: `src/pages/Dashboard.tsx`

**Interfaces:**
- Consumes: DarkCard, DarkButton, DarkInput, KpiCard, ProgressBar, EmptyState, MonthSelector (Tasks 3-9)
- Produce: Dashboard rediseñado con theme dark consistente

- [ ] **Step 1: Leer el archivo actual**

```bash
cat src/pages/Dashboard.tsx
```

- [ ] **Step 2: Reemplazar imports y estructura**

Reemplazar toda la sección de imports y el componente Dashboard completo. El nuevo componente usa los componentes UI creados en las tareas anteriores.

- [ ] **Step 3: Ejecutar tests del Dashboard**

```bash
npx vitest run src/pages/Dashboard.test.tsx
```

Expected: Todos los tests pasan (actualizar selectors si es necesario)

- [ ] **Step 4: Ejecutar build**

```bash
npm run build 2>&1 | head -20
```

Expected: Build exitoso

- [ ] **Step 5: Commit**

```bash
git add src/pages/Dashboard.tsx
git commit -m "feat(ui): redesign Dashboard with dark theme

- Use DarkCard, DarkButton, DarkInput, KpiCard, ProgressBar, EmptyState, MonthSelector
- Premium financial dashboard layout
- KPI cards with hover animations
- Animated progress bar
- Elegant empty state for purchase history
- Responsive: 3 cols desktop, 2 tablet, 1 mobile"
```

---

### Task 11: Refactorizar Login Page

**Files:**
- Modify: `src/pages/Login.tsx`
- Modify: `src/pages/Login.test.tsx` (actualizar selectors)

**Interfaces:**
- Consumes: DarkCard, DarkButton, DarkInput (Tasks 3-5)
- Produce: Login rediseñado con theme dark

- [ ] **Step 1: Leer el archivo actual**

```bash
cat src/pages/Login.tsx
cat src/pages/Login.test.tsx
```

- [ ] **Step 2: Reemplazar imports y estructura de Login.tsx**

- [ ] **Step 3: Actualizar test selectors si es necesario**

- [ ] **Step 4: Ejecutar tests**

```bash
npx vitest run src/pages/Login.test.tsx
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/pages/Login.tsx src/pages/Login.test.tsx
git commit -m "feat(ui): redesign Login with dark theme

- DarkCard centered layout
- DarkInput for email and password
- DarkButton primary for submit
- Consistent with overall dark theme"
```

---

### Task 12: Refactorizar Register Page

**Files:**
- Modify: `src/pages/Register.tsx`
- Modify: `src/pages/Register.test.tsx` (actualizar selectors)

**Interfaces:**
- Consumes: DarkCard, DarkButton, DarkInput (Tasks 3-5)
- Produce: Register rediseñado con theme dark

- [ ] **Step 1: Leer el archivo actual**

```bash
cat src/pages/Register.tsx
cat src/pages/Register.test.tsx
```

- [ ] **Step 2: Reemplazar imports y estructura de Register.tsx**

- [ ] **Step 3: Actualizar test selectors si es necesario**

- [ ] **Step 4: Ejecutar tests**

```bash
npx vitest run src/pages/Register.test.tsx
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/pages/Register.tsx src/pages/Register.test.tsx
git commit -m "feat(ui): redesign Register with dark theme

- Same layout as Login for consistency
- DarkCard, DarkInput, DarkButton
- Consistent with overall dark theme"
```

---

### Task 13: Refactorizar Budget Page

**Files:**
- Modify: `src/pages/Budget.tsx`

**Interfaces:**
- Consumes: DarkCard, DarkButton, DarkInput (Tasks 3-5)
- Produce: BudgetPage rediseñado con theme dark

- [ ] **Step 1: Leer el archivo actual**

```bash
cat src/pages/Budget.tsx
```

- [ ] **Step 2: Reemplazar imports y estructura**

- [ ] **Step 3: Ejecutar tests**

```bash
npx vitest run src/pages/Budget.test.tsx
```

Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add src/pages/Budget.tsx
git commit -m "feat(ui): redesign BudgetPage with dark theme

- DarkCard primary container
- DarkInput for budget amount
- DarkButton primary for update
- Premium financial form layout"
```

---

### Task 14: Refactorizar AddPurchase Page

**Files:**
- Modify: `src/pages/AddPurchase.tsx`

**Interfaces:**
- Consumes: DarkCard, DarkButton, DarkInput (Tasks 3-5)
- Produce: AddPurchase rediseñado con theme dark

- [ ] **Step 1: Leer el archivo actual**

```bash
cat src/pages/AddPurchase.tsx
```

- [ ] **Step 2: Reemplazar imports y estructura**

- [ ] **Step 3: Ejecutar tests**

```bash
npx vitest run src/pages/AddPurchase.test.tsx
```

Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add src/pages/AddPurchase.tsx
git commit -m "feat(ui): redesign AddPurchase with dark theme

- DarkCard container
- DarkInput for product fields
- DarkButton variants for actions
- Consistent dark theme for all modes (manual, photo, voice, review)"
```

---

### Task 15: Refactorizar PurchaseHistory Page

**Files:**
- Modify: `src/pages/PurchaseHistory.tsx`

**Interfaces:**
- Consumes: DarkCard, DarkButton, EmptyState (Tasks 3, 4, 8)
- Produce: PurchaseHistory rediseñado con theme dark y empty state

- [ ] **Step 1: Leer el archivo actual**

```bash
cat src/pages/PurchaseHistory.tsx
```

- [ ] **Step 2: Reemplazar imports y estructura**

- [ ] **Step 3: Ejecutar tests**

```bash
npx vitest run src/pages/PurchaseHistory.test.tsx
```

Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add src/pages/PurchaseHistory.tsx
git commit -m "feat(ui): redesign PurchaseHistory with dark theme

- DarkCard primary container
- DarkCard secondary for each purchase item
- EmptyState when no purchases
- DarkButton danger for delete
- Consistent dark theme"
```

---

### Task 16: Refactorizar ChartsContent

**Files:**
- Modify: `src/components/ChartsContent.tsx`

**Interfaces:**
- Consumes: Tokens de Tailwind (bg-surface, bg-elevated, text-secondary, border-subtle, accent-green, accent-amber, accent-red)
- Produce: ChartsContent rediseñado con theme dark

- [ ] **Step 1: Leer el archivo actual**

```bash
cat src/components/ChartsContent.tsx
```

- [ ] **Step 2: Reemplazar colores de charts y estilos**

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

---

### Task 17: Refactorizar Componentes Menores

**Files:**
- Modify: `src/components/OCRCapture.tsx`
- Modify: `src/components/OCRReview.tsx`
- Modify: `src/components/ProductEditor.tsx`
- Modify: `src/components/VoiceCapture.tsx`
- Modify: `src/components/ProtectedRoute.tsx`

**Interfaces:**
- Consumes: DarkButton, DarkInput (Tasks 4-5), tokens de Tailwind
- Produce: Todos los componentes menores rediseñados con theme dark

- [ ] **Step 1: Leer cada archivo**

```bash
cat src/components/OCRCapture.tsx
cat src/components/OCRReview.tsx
cat src/components/ProductEditor.tsx
cat src/components/VoiceCapture.tsx
cat src/components/ProtectedRoute.tsx
```

- [ ] **Step 2: Reemplazar colores en cada componente**

- [ ] **Step 3: Ejecutar todos los tests**

```bash
npx vitest run
```

Expected: Todos los tests pasan (132/132)

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

---

### Task 18: Verificación Final

**Files:**
- Modify:ninguno (solo verificación)

**Interfaces:**
- Consumes: Todos los cambios anteriores
- Produce: Confirmación de que todo funciona correctamente

- [ ] **Step 1: Ejecutar todos los tests**

```bash
npx vitest run
```

Expected: 132/132 tests passing

- [ ] **Step 2: Ejecutar build de producción**

```bash
npm run build
```

Expected: Build exitoso sin errores de TypeScript

- [ ] **Step 3: Verificar que no hay clases Tailwind default residuales**

```bash
grep -r "bg-white" src/ --include="*.tsx" --include="*.ts"
grep -r "text-gray-" src/ --include="*.tsx" --include="*.ts"
grep -r "border-gray-" src/ --include="*.tsx" --include="*.ts"
```

Expected: Ningún resultado (o solo en archivos de test que no se modificaron)

- [ ] **Step 4: Commit final**

```bash
git add -A
git commit -m "chore(ui): final verification of dark theme redesign

- All 132 tests passing
- Build successful
- No residual light theme classes
- Consistent dark theme across all pages and components"
```

---

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-07-16-dashboard-ui-redesign.md`.

**Two execution options:**

**1. Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints

**Which approach?**
