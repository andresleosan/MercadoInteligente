# Design Spec: Rediseño UI/UX Dashboard Mercado Inteligente

**Fecha:** 2026-07-16
**Estado:** Aprobado
**Alcance:** Todo el proyecto (todas las páginas y componentes)

---

## 1. Objetivo

Transformar la interfaz actual en una experiencia moderna, premium, minimalista, oscura, tecnológica y financiera. Sensación deseada: "Estoy usando una aplicación profesional de gestión financiera."

## 2. Problema Actual

- Dos sistemas de colores en conflicto (dark tokens vs light Tailwind defaults)
- Contraste excesivo entre tarjetas oscuras y fondos blancos
- Sensación visual fragmentada
- Jerarquía visual débil
- Componentes que parecen formularios administrativos antiguos
- Espacios desaprovechados
- Falta de profundidad visual

## 3. Decisiones Tomadas

| Decisión | Elección | Razón |
|----------|----------|-------|
| Alcance | Todo el proyecto | Unificar aesthetic completamente |
| Tailwind config | Reemplazar tokens actuales | Consistencia con nueva paleta |
| Animaciones | CSS transitions | Más ligero, sin dependencia extra |
| Login/Register | Incluir en rediseño | Consistencia visual completa |
| Header | Mantener superior | Más simple, consistente con layout actual |
| Max-width | 1024px | Aprovechar espacio en desktop |
| Estrategia | Bottom-up (componentes primero) | Reutilizabilidad y consistencia |

---

## 4. Design Tokens

### 4.1 Paleta de colores

```js
// tailwind.config.js - colors
{
  'bg-base':       '#0B1120',  // Fondo principal
  'bg-surface':    '#111827',  // Cards primarias
  'bg-elevated':   '#1F2937',  // Cards secundarias, hover states
  'bg-header':     '#0B1120',  // Header (mismo que base)
  'border-subtle': 'rgba(255,255,255,0.08)',  // Bordes sutiles
  'text-primary':  '#F9FAFB',  // Texto principal
  'text-secondary':'#9CA3AF',  // Texto secundario
  'text-muted':    '#6B7280',  // Texto muted
  'accent-green':  '#10B981',  // Color primario
  'accent-success': '#22C55E',  // Color éxito
  'accent-amber':  '#F59E0B',  // Color alerta
  'accent-red':    '#EF4444',  // Error/danger
}
```

### 4.2 Sombras

```js
// tailwind.config.js - boxShadow
{
  'card':    '0 4px 6px -1px rgba(0,0,0,0.3), 0 2px 4px -2px rgba(0,0,0,0.3)',
  'elevated':'0 10px 15px -3px rgba(0,0,0,0.4), 0 4px 6px -4px rgba(0,0,0,0.3)',
  'glow':    '0 0 20px rgba(16,185,129,0.15)',
}
```

### 4.3 Border radius

```js
// tailwind.config.js - borderRadius
{
  'radius-sm': '8px',
  'radius-md': '12px',
  'radius-lg': '16px',
  'radius-xl': '20px',
}
```

### 4.4 Transiciones

```css
/* index.css */
.transition-fast { transition: all 150ms ease; }
.transition-normal { transition: all 200ms ease; }
.transition-slow { transition: all 300ms ease; }
```

---

## 5. Componentes UI Compartidos

Ubicación: `src/components/ui/`

### 5.1 DarkCard

Contenedor base para todas las cards.

```tsx
interface DarkCardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'primary' | 'secondary';
  hover?: boolean;
}
```

- `primary`: `bg-surface rounded-radius-xl shadow-card border border-border-subtle`
- `secondary`: `bg-elevated rounded-radius-lg shadow-card border border-border-subtle`
- `hover`: `hover:shadow-elevated hover:scale-[1.01] transition-fast`

### 5.2 DarkButton

Botón unificado.

```tsx
interface DarkButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit';
  className?: string;
}
```

- `primary`: `bg-gradient-to-r from-accent-green to-accent-success text-white hover:brightness-110`
- `secondary`: `bg-transparent border border-border-subtle text-text-primary hover:bg-elevated`
- `danger`: `bg-accent-red text-white hover:brightness-110`

### 5.3 DarkInput

Input oscuro unificado.

```tsx
interface DarkInputProps {
  label?: string;
  error?: string;
  prefix?: string;
  type?: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  className?: string;
}
```

- Contenedor: `bg-elevated border border-border-subtle rounded-radius-md`
- Focus: `focus:ring-2 focus:ring-accent-green focus:ring-offset-2 focus:ring-offset-bg-base`
- Label: `text-sm text-secondary mb-1`
- Error: `text-sm text-accent-red mt-1`
- Prefix: `text-muted` a la izquierda del input

### 5.4 KpiCard

Card de métrica.

```tsx
interface KpiCardProps {
  icon: string;
  value: string;
  label: string;
  color?: 'green' | 'amber' | 'red';
}
```

- Layout: flex-col, items-center
- Icono: 24px, emoji
- Valor: `text-3xl font-extrabold text-primary`
- Label: `text-sm text-secondary`
- Hover: `hover:scale-[1.02] hover:shadow-glow transition-fast`

### 5.5 ProgressBar

Bara de progreso animada.

```tsx
interface ProgressBarProps {
  percentage: number;
  color?: 'green' | 'amber' | 'red';
  showLabel?: boolean;
}
```

- Contenedor: `bg-elevated rounded-radius-full h-3 overflow-hidden`
- Fill: `bg-gradient-to-r from-accent-green to-accent-success h-full rounded-radius-full transition-all duration-500 ease-out`
- Label: overlay centrado `text-xs text-secondary`

### 5.6 EmptyState

Estado vacío para listas.

```tsx
interface EmptyStateProps {
  icon: string;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}
```

- Icono: 64px, centrado
- Título: `text-lg font-semibold text-primary`
- Descripción: `text-sm text-secondary`
- CTA: DarkButton primary (opcional)

### 5.7 MonthSelector

Selector de mes mejorado.

```tsx
interface MonthSelectorProps {
  currentMonth: Date;
  onMonthChange: (date: Date) => void;
}
```

- Contenedor: `bg-surface rounded-radius-lg p-4 flex items-center justify-between`
- Flechas: `bg-elevated rounded-radius-md p-2 hover:bg-border-subtle transition-fast`
- Mes/año: `text-xl font-semibold text-primary`
- Transición suave al cambiar mes

---

## 6. Layout por Página

### 6.1 Dashboard

```
Header (h-14, bg-header)
├── Logo + "Mercado Inteligente"
├── Install button (si disponible)
├── User email (text-secondary)
└── Logout button (DarkButton secondary sm)

Main (max-w-[1024px] mx-auto px-6 py-8)
├── DarkCard primary: Presupuesto
│   ├── "Presupuesto mensual" (text-xl font-semibold)
│   ├── Monto actual (text-4xl font-extrabold)
│   ├── DarkInput (prefijo $)
│   └── DarkButton primary: "Actualizar presupuesto"
│
├── DarkCard primary: Resumen del mes
│   ├── MonthSelector
│   ├── Grid 3 col (2 tablet, 1 mobile): KpiCard × 3
│   │   ├── 💰 Gastado (accent-amber)
│   │   ├── 📊 Presupuesto (accent-green)
│   │   └── ✅ Restante (accent-success)
│   └── ProgressBar
│
├── DarkCard primary: Historial de compras
│   ├── Si hay compras: lista de DarkCard secondary
│   │   ├── Fecha (text-secondary)
│   │   ├── Total (text-primary font-bold)
│   │   ├── Items (text-secondary text-sm)
│   │   └── DarkButton danger (eliminar)
│   └── Si no hay: EmptyState
│       ├── 🛒 (icono 64px)
│       ├── "Aún no hay compras registradas"
│       └── "Agrega tu primera compra..."
│
├── DarkCard primary: Registrar compra
│   └── AddPurchase (con dark theme)
│
└── DarkCard primary: Gráficos
    └── ChartsContent (con dark theme)
```

### 6.2 Login

```
Centered layout (max-w-[400px] mx-auto py-16 px-4)
├── Logo + "Mercado Inteligente" (centrado)
└── DarkCard primary
    ├── "Iniciar sesión" (text-2xl font-bold)
    ├── DarkInput: Email
    ├── DarkInput: Contraseña
    ├── DarkButton primary: "Entrar" (full width)
    └── Link: "¿No tenés cuenta? Registrate"
```

### 6.3 Register

Igual que Login pero con campos adicionales (si los hubiera).

### 6.4 AddPurchase

```
DarkCard primary
├── Modo Manual:
│   ├── Grid 12 col: producto, cantidad, precio unitario
│   ├── DarkInput × 3 por fila
│   ├── DarkButton danger (eliminar fila)
│   └── DarkButton primary: "Agregar producto"
│
├── Modo Foto:
│   └── OCRCapture (dark theme)
│
├── Modo Voz:
│   └── VoiceCapture (dark theme, micrófono rojo pulsante)
│
└── Modo Review:
    └── OCRReview (dark theme)
```

### 6.5 PurchaseHistory

```
DarkCard primary
├── Si hay compras:
│   └── Lista de DarkCard secondary
│       ├── Fecha (text-secondary)
│       ├── Total (text-primary font-bold)
│       ├── Items (text-secondary text-sm)
│       └── DarkButton danger (eliminar)
└── Si no hay:
    └── EmptyState
```

### 6.6 ChartsContent

```
DarkCard secondary
├── "Gastado vs Presupuesto" (BarChart + Line)
├── "Top 5 productos" (BarChart horizontal)
└── "Tendencia de gastos" (LineChart)
    ├── Ejes: text-secondary
    ├── Grid: border-subtle
    ├── Colores: accent-green, accent-amber, accent-red
    └── Tooltips: bg-elevated, border-subtle
```

---

## 7. Responsive Design

### Breakpoints

```js
// tailwind.config.js
screens: {
  'sm': '640px',
  'md': '768px',
  'lg': '1024px',
  'xl': '1280px',
}
```

### Comportamiento por componente

| Componente | Mobile (<768px) | Tablet (768-1024px) | Desktop (>1024px) |
|------------|-----------------|---------------------|-------------------|
| **Header** | Logo + hamburger | Logo + nav items | Logo + nav items |
| **Main** | px-4, max-w-full | px-6, max-w-[768px] | px-6, max-w-[1024px] |
| **KPI Cards** | 1 columna | 2 columnas | 3 columnas |
| **Presupuesto** | Stack vertical | Stack vertical | Horizontal (input + btn) |
| **Historial** | Full width | Full width | 2 columnas |
| **Charts** | Full width | Full width | 2 columnas |

### Reglas generales

- Sin overflow horizontal
- Touch targets mínimo 44x44px en mobile
- Texto mínimo 14px en mobile
- Espaciado: `gap-4` en mobile, `gap-6` en desktop
- Cards: `rounded-xl` en mobile, `rounded-2xl` en desktop

---

## 8. Accesibilidad

### 8.1 Contraste

| Elemento | Color texto | Color fondo | Ratio | WCAG |
|----------|-------------|-------------|-------|------|
| Texto principal | #F9FAFB | #0B1120 | ~15:1 | AAA ✅ |
| Texto secundario | #9CA3AF | #111827 | ~4.6:1 | AA ✅ |
| Texto muted | #6B7280 | #111827 | ~3.1:1 | AA Large ✅ |

### 8.2 Focus states

Todos los elementos interactivos:
```
focus:ring-2 focus:ring-accent-green focus:ring-offset-2 focus:ring-offset-bg-base
```

### 8.3 ARIA

- Botones sin texto: `aria-label`
- Iconos decorativos: `aria-hidden="true"`
- Estados: `aria-expanded`, `aria-selected`

### 8.4 Keyboard

- Tab order lógico
- Escape cierra modales/dropdowns
- Enter activa botones

### 8.5 Reduced motion

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 9. Archivos a Modificar

### 9.1 Configuración

- `tailwind.config.js` — Nueva paleta, sombras, radius, transiciones
- `src/index.css` — Transiciones utilitarias, variables CSS

### 9.2 Componentes UI (crear)

- `src/components/ui/DarkCard.tsx`
- `src/components/ui/DarkButton.tsx`
- `src/components/ui/DarkInput.tsx`
- `src/components/ui/KpiCard.tsx`
- `src/components/ui/ProgressBar.tsx`
- `src/components/ui/EmptyState.tsx`
- `src/components/ui/MonthSelector.tsx`

### 9.3 Páginas (refactorizar)

- `src/pages/Dashboard.tsx`
- `src/pages/Login.tsx`
- `src/pages/Register.tsx`
- `src/pages/AddPurchase.tsx`
- `src/pages/PurchaseHistory.tsx`
- `src/pages/Budget.tsx`

### 9.4 Componentes (refactorizar)

- `src/components/MonthNavigator.tsx` → reemplazar con MonthSelector
- `src/components/ChartsContent.tsx`
- `src/components/OCRCapture.tsx`
- `src/components/OCRReview.tsx`
- `src/components/ProductEditor.tsx`
- `src/components/VoiceCapture.tsx`
- `src/components/ProtectedRoute.tsx`

### 9.5 Tests (actualizar)

- Todos los tests existentes deben seguir pasando
- Actualizar selectors si es necesario

---

## 10. Restricciones

- NO modificar lógica de negocio
- NO modificar Firebase (services, hooks)
- NO modificar rutas (App.tsx routing)
- NO agregar dependencias nuevas (excepto si es necesario para accessibility)
- SOLO mejorar: Layout, Tailwind, Componentes visuales, UX, Accesibilidad, Responsive

---

## 11. Criterios de Aceptación

1. Todos los tests existentes pasan (132/132)
2. Build exitoso (`npm run build`)
3. Sin errores de TypeScript
4. Contraste WCAG AA en todos los textos
5. Focus visible en todos los elementos interactivos
6. Responsive correcto en mobile (375px), tablet (768px), desktop (1024px)
7. Sin overflow horizontal
8. Transiciones suaves (150-300ms)
9. Consistencia visual en todas las páginas
10. Empty states para listas vacías

---

## 12. Comparación Antes vs Después

### Antes
- Fondos blancos en cards oscuras
- Inputs grises claros
- Jerarquía visual débil
- Espaciado inconsistente
- Sin empty states
- Sin hover effects

### Después
- Todo oscuro, consistente
- Inputs oscuros con focus glow
- Jerarquía clara (text-4xl → text-xl → text-sm)
- Espaciado generoso (gap-6)
- Empty states elegantes
- Hover effects sutiles (scale, glow)
