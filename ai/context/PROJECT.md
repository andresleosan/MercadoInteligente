# Contexto del Proyecto — Mercado Inteligente

**Última actualización:** 2026-07-20

---

## Identidad del Proyecto

| Campo | Valor |
|-------|-------|
| Nombre | Mercado Inteligente |
| Tipo | PWA (Progressive Web App) |
| Stack | React 18 + TypeScript + Vite + Firebase |
| Nivel | 2 (App web funcional) |
| Versión Agencia | v3.3.3 |
| Estado | v2 completada, v3 en planificación |

---

## Descripción

PWA que permite registrar compras de mercado mediante foto (OCR), voz o texto, calculando automáticamente el gasto acumulado contra un presupuesto definido por el usuario.

---

## Stack Tecnológico

### Frontend
- React 18 + TypeScript
- Vite (build tool)
- Tailwind CSS
- vite-plugin-pwa (PWA)
- Recharts (gráficos)
- Tesseract.js (OCR)
- Lucide React (iconos)

### Backend (Firebase)
- Firebase Auth (email/password, Google)
- Cloud Firestore (base de datos)
- Firebase Storage (imágenes)
- Firebase Hosting (despliegue)

### Testing
- Vitest + @testing-library/react
- Playwright (E2E, deshabilitado v1)

### Agentes IA
- OpenCode (orchestrator)
- Agencia Los Titanes v3.3.3
- Graphify (knowledge graph)

---

## Estructura de Datos

```
users/{uid}
├── budgets/{month}
│   ├── monthly: number
│   └── daily: number
└── purchases/{purchaseId}
    ├── items: array
    ├── total: number
    ├── storeId: string
    ├── storeName: string
    ├── purchaseDate: string
    ├── createdAt: timestamp
    └── receiptImageUrl: string (opcional)
```

---

## Features Completadas (v1-v2)

- [x] Auth con Google y email/password
- [x] Registro manual de compras
- [x] OCR con Tesseract.js
- [x] Reconocimiento de voz
- [x] Dashboard con gráficos
- [x] Control de presupuesto mensual/diario
- [x] Historial con filtros
- [x] Gestión de tiendas
- [x] PWA con service worker

---

## Features Planificadas (v3)

- [ ] Categorización automática de productos
- [ ] Reportes y tendencias de gasto
- [ ] Notificaciones push (presupuesto)
- [ ] Compartir presupuesto familiar
- [ ] Exportar historial a CSV/PDF

---

## Agentes Disponibles

| Agente | Rol | Perfil |
|--------|-----|--------|
| Cronos | Orquestador | `.opencode/agents/cronos.md` |
| Atlas | Arquitecto | `docs/agency/titanes/atlas.md` |
| Prometeo | Backend | `docs/agency/titanes/prometeo.md` |
| Hefesto | Frontend | `docs/agency/titanes/hefesto.md` |
| Temis | QA | `docs/agency/titanes/temis.md` |
| Crío | Seguridad | `docs/agency/titanes/crio.md` |
| Tetis | Bases de datos | `docs/agency/titanes/tetis.md` |
| Coeus | Producto | `docs/agency/titanes/coeus.md` |

---

## Comandos Útiles

```bash
# Desarrollo
npm run dev

# Tests
npm run test

# Build
npm run build

# Knowledge graph
graphify update .
graphify query "<pregunta>"
```

---

## Referencias Rápidas

| Necesito... | Voy a... |
|-------------|----------|
| Entender el producto | `docs/product/BRIEF.md` |
| Verificar stack | `docs/architecture/STACK.md` |
| Ver tareas | `docs/roadmap/tasks-v3.md` |
| Workflow agentes | `docs/agency/AGENCY.md` |
| Estado actual | `ai/memory/STATUS.md` |
