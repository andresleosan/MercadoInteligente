# UI/UX V2 — Mercado Inteligente

## Alcance

Rediseño completo de Dashboard, Login y Register. Eliminar apariencia CRUD genérica, convertir en app moderna con experiencia móvil profesional.

## Inspiración visual

- **Estructura y limpieza**: Notion
- **Fondo oscuro y header premium**: Revolut
- **Tarjetas elevadas con sombra**: Google Wallet
- **Micro-interacciones suaves**: TickTick
- **Sensación general**: Clean Premium — oscuro, pulcro, informativo

## Paleta de colores

| Token | Hex | Uso |
|-------|-----|-----|
| `bg-base` | `#0f0f12` | Fondo general (main) |
| `bg-surface` | `#1a1a23` | Fondo de tarjetas |
| `bg-elevated` | `#23232e` | Hover/active en tarjetas |
| `bg-header` | `#08080c` | Header superior |
| `border-subtle` | `#2a2a35` | Bordes de tarjetas e inputs |
| `text-primary` | `#f1f1f6` | Texto principal |
| `text-secondary` | `#8b8b9e` | Texto secundario / labels |
| `text-muted` | `#5c5c6e` | Subtítulos / metadata |
| `accent-green` | `#00a86b` | Botones, progress, éxito |
| `accent-amber` | `#f5a623` | Alertas, warns, destacados |
| `accent-red` | `#e5484d` | Errores, delete, exceso presupuesto |
| `overlay` | `#00000080` | Backdrop de modales |

## Tipografía

Sistema sans-serif nativa (sin Google Fonts externas):

```
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
             Oxygen, Ubuntu, Cantarell, sans-serif;
```

| Rol | Tamaño | Peso | Color |
|-----|--------|------|-------|
| Título card | 16px | 600 | `text-primary` |
| Valor numérico grande | 32px | 700 | `text-primary` |
| Valor numérico mediano | 20px | 600 | `text-primary` |
| Label / subtítulo | 13px | 400 | `text-secondary` |
| Metadata (fechas) | 12px | 400 | `text-muted` |
| Cuerpo | 14px | 400 | `text-primary` |

## Radii

| Token | Valor | Uso |
|-------|-------|-----|
| `radius-sm` | 8px | Inputs, botones chicos |
| `radius-md` | 12px | Cards, contenedores |
| `radius-lg` | 16px | Modales, header |

## Sombras

| Token | Valor |
|-------|-------|
| `shadow-card` | `0 2px 8px rgba(0,0,0,0.3)` |
| `shadow-elevated` | `0 4px 20px rgba(0,0,0,0.4)` |

## Layout del Dashboard

```
┌──────────────────────────────────────────┐
│  Header (bg-header)                       │
│  ← Mercado Inteligente  [PWA] [avatar] → │
├──────────────────────────────────────────┤
│  Main (bg-base, max-w-[640px], centered)  │
│                                          │
│  ┌─ ExpandableCard ────────────────────┐ │
│  │ ▼ Presupuesto (defaultExpanded)     │ │
│  │ [monto monthly / progress bar]      │ │
│  └──────────────────────────────────────┘ │
│                                          │
│  ┌─ ExpandableCard ────────────────────┐ │
│  │ ▼ Resumen del mes (defaultExpanded) │ │
│  │ [← MonthNavigator →]               │ │
│  │ Gastado / Presupuesto / Restante    │ │
│  │ Progress bar 75%                   │ │
│  └──────────────────────────────────────┘ │
│                                          │
│  ┌─ ExpandableCard ────────────────────┐ │
│  │ ▼ Historial de compras             │ │
│  │ [lista agrupada por fecha]         │ │
│  │ [refresh button]                   │ │
│  └──────────────────────────────────────┘ │
│                                          │
│  ┌─ ExpandableCard ────────────────────┐ │
│  │ ▼ Registrar compra                 │ │
│  │ [📷 Foto] [🎤 Voz] [✏️ Manual]     │ │
│  └──────────────────────────────────────┘ │
│                                          │
│  ┌─ ExpandableCard ────────────────────┐ │
│  │ ▼ Gráficos                          │ │
│  │ [Recharts]                          │ │
│  └──────────────────────────────────────┘ │
└──────────────────────────────────────────┘
```

- Gap entre cards: 16px
- Padding lateral: 16px (mobile), 48px+ (desktop)
- Ancho máximo: 640px, centrado

## Componentes a crear / modificar

### Nuevos

#### `src/components/ui/ExpandableCard.tsx`
```ts
interface ExpandableCardProps {
  title: string
  icon: React.ReactNode     // lucide-react icon
  defaultExpanded?: boolean
  children: React.ReactNode
}
```
- Click header → toggle expand/collapse
- Icono ChevronDown rota 180° cuando expandido (300ms)
- Contenido slide con max-height transition
- Fondo: `bg-surface`, borde `border-subtle`, shadow-card
- Estado mantenido por el padre (Dashboard usa useState para cada card)
- Múltiples cards pueden estar abiertos simultáneamente

### Modificaciones profundas

#### `src/pages/Dashboard.tsx`
- Refactor completo a nuevo layout
- Reemplazar estructura plana por ExpandableCards
- Reordenar: Presupuesto → Resumen → Historial → Registrar → Gráficos
- Agregar header premium con avatar/email, PWA install, logout
- Inline Budget.tsx dentro de card Presupuesto
- Inline AddPurchase.tsx dentro de card Registrar compra
- Inline PurchaseHistory.tsx dentro de card Historial
- Nuevo card Resumen del mes unifica MonthNavigator + summary + progress
- Mover ChartsSection.tsx al final

#### `src/pages/Login.tsx`
- Fondo bg-base, card central bg-surface
- Inputs estilo Revolut: bg `#252530`, border `border-subtle`, focus verde
- Botón primario accent-green
- Botón Google: fondo blanco, texto oscuro
- Logo + nombre app centrados arriba

#### `src/pages/Register.tsx`
- Misma estética que Login
- Campo extra "Confirmar contraseña"
- Link "Ya tengo cuenta" → /login

#### `tailwind.config.js`
- Agregar colores custom según paleta
- Agregar radii custom
- Agregar boxShadow custom
- Agregar fontFamily

#### `src/index.css`
- Agregar clases base para body (bg-base, text-primary, font-family)
- Agregar animaciones personalizadas (slideDown, rotate chevron)
- Agregar estilos de scrollbar para modo oscuro
- prefers-reduced-motion: respetado

## Interacciones

| Elemento | Comportamiento |
|----------|----------------|
| Header card | Click → icono rota 180°, slideDown 300ms ease |
| Botón primario | Hover: brightness 110%, Active: scale 0.98 |
| Inputs | Focus: border-green + box-shadow glow sutil |
| Transiciones generales | `transition-all duration-200 ease-in-out` |
| Barras de progreso | Ancho animado al cargar |
| Delete compra | Confirm dialog con overlay |

## Dependencias a agregar

- `lucide-react` — iconos SVG (ChevronDown, Wallet, TrendingUp, History, PlusCircle, BarChart3, Camera, Mic, Pencil, LogOut, Download, Trash2, X, Check, User, Calendar)

## Archivos modificados

- `src/pages/Dashboard.tsx` — refactor completo
- `src/pages/Login.tsx` — rediseño visual
- `src/pages/Register.tsx` — rediseño visual
- `tailwind.config.js` — agregar tokens de diseño
- `src/index.css` — estilos base, animaciones
- `package.json` — agregar lucide-react

## Archivos creados

- `src/components/ui/ExpandableCard.tsx` — componente reutilizable de card expandible

## Comportamientos adicionales

### Loading / Error global
- El Dashboard mantiene su estado `loading` y `error` actuales
- Loading: spinner animado centrado en el main (misma estética oscura, spinner verde)
- Error: banner dentro del main con bg `accent-red` sutil, texto en `text-primary`, ícono AlertCircle
- Ambos se muestran antes de renderizar las ExpandableCards

### showBudgetForm eliminado
- El toggle `showBudgetForm` del Dashboard actual se elimina
- Presupuesto se edita inline dentro de su ExpandableCard, sin cambiar a pantalla completa
- Budget.tsx se renderiza directamente como hijo de su card (no necesita modo "standalone" en Dashboard)

### Wrapping de secciones existentes
- Budget.tsx, AddPurchase.tsx, PurchaseHistory.tsx, ChartsContent.tsx mantienen su lógica interna intacta
- Cada una se envuelve en una ExpandableCard desde Dashboard.tsx
- ChartsSection.tsx se simplifica: su toggle expand/collapse lo maneja ExpandableCard, no su lógica interna

## No se modifican

- Servicios (auth, budget, purchases, analytics, ocr, etc.)
- Hooks (useAuth, useOCR, useVoice, usePWAInstall) — salvo imports de íconos si los usan
- Contextos (AuthContext)
- Tipos
- Tests existentes (pueden necesitar actualización de selectores si cambian clases, pero la lógica de negocio es la misma)
