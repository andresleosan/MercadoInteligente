# Tareas — Mercado Inteligente v2

## v2 — Diferenciadores

### Fase 1 — PWA Instalable
| # | Tarea | Titán | Estado |
|---|---|---|---|
| 1.1 | Configurar vite-plugin-pwa con service worker | Atlas | aprobada |
| 1.2 | Crear manifest.json con iconos y metadata | Hefesto | aprobada |
| 1.3 | Agregar botón de instalación en la app | Hefesto | aprobada |
| 1.4 | Configurar estrategias de cache para offline | Atlas | aprobada |
| 1.5 | Tests de PWA (instalación, offline) | Temis | aprobada |

> **Verificado 2026-07-13:** `vite.config.ts` tiene `VitePWA` con `registerType: 'autoUpdate'`, `public/manifest.json` con iconos 192/512, `src/hooks/usePWAInstall.tsx` + botón en `Dashboard.tsx`, `src/pwa.test.ts` pasa. Build de Cloudflare Pages genera `dist/sw.js` + `dist/workbox-*.js` con precache de 7 entries.

### Fase 2 — OCR por Foto
| # | Tarea | Titán | Estado |
|---|---|---|---|
| 2.1 | Instalar y configurar Tesseract.js | Atlas | aprobada |
| 2.2 | Crear servicio de OCR (`src/services/ocr.ts`) | Prometeo | aprobada |
| 2.3 | Crear componente de captura de foto (cámara o galería) | Hefesto | aprobada |
| 2.4 | Procesar imagen y extraer productos/precios | Prometeo | aprobada |
| 2.5 | Mostrar resultados y permitir edición antes de guardar | Hefesto | aprobada |
| 2.6 | Tests de OCR | Temis | aprobada |

> **Verificado 2026-07-13:** Tesseract.js v5 con lazy-load + web worker, modelos spa+eng self-hosted en `public/tessdata/`, parser genérico con regex + filtro de confianza, hook `useOCR` orquestador, componentes `OCRCapture`/`OCRReview`/`ProductEditor`, integración en `AddPurchase.tsx` con 4 modos (manual/photo/review/error). 58/58 tests pasan, build de producción pasa.

### Fase 3 — Dashboard con Gráficos
| # | Tarea | Titán | Estado |
|---|---|---|---|
| 3.1 | Instalar Recharts | Atlas | aprobada |
| 3.2 | Crear gráfico de gastos por mes (barras + línea presupuesto) | Hefesto | aprobada |
| 3.3 | Crear gráfico de top 5 productos (barra horizontal, reemplaza pie chart) | Hefesto | aprobada |
| 3.4 | Crear gráfico de tendencia de gastos (línea) | Hefesto | aprobada |
| 3.5 | Integrar gráficos en Dashboard (colapsable + lazy-load) | Hefesto | aprobada |
| 3.6 | Tests de gráficos | Temis | aprobada |

> **Verificado 2026-07-13:** Recharts v2 instalado. `getPurchasesByDateRange` en `purchases.ts`, `getBudgetsByMonthRange` en `budget.ts`, `analytics.ts` con `getTotalSpentByMonth` + `getTopProducts`. `ChartsContent` con 3 gráficos: ComposedChart (barras gastado + línea presupuesto), BarChart horizontal (top 5 productos), LineChart (tendencia). `ChartsSection` colapsable con `React.lazy` (Recharts en chunk separado, 383 kB). Integrado en `Dashboard.tsx` entre resumen y grid. 88/88 tests pasan, build de producción pasa.

### Fase 4 — Historial Multi-Mes
| # | Tarea | Titán | Estado |
|---|---|---|---|
| 4.1 | Crear selector de mes/año | Hefesto | aprobada |
| 4.2 | Modificar queries para soportar cualquier mes | Prometeo | aprobada |
| 4.3 | Crear página de historial con navegación | Hefesto | aprobada |
| 4.4 | Mostrar resumen por mes (total, presupuesto, diferencia) | Hefesto | aprobada |
| 4.5 | Tests de historial multi-mes | Temis | aprobada |

> **Verificado 2026-07-13:** `MonthNavigator` con flechas ← → y label en español, `Dashboard` con `selectedMonth` sincronizado (presupuesto, total, historial), resumen 3 estados (normal/pasado/sin presupuesto), botón "Definir presupuesto" para meses sin budget, navegación libre (pasado y futuro), `isMounted` para cancelar queries stale. `Budget` y `PurchaseHistory` aceptan prop `month`. 71/71 tests pasan, build pasa.

### Fase 5 — Registro por Voz
| # | Tarea | Titán | Estado |
|---|---|---|---|
| 5.1 | Configurar Web Speech API | Atlas | pendiente |
| 5.2 | Crear servicio de reconocimiento de voz (`src/services/voice.ts`) | Prometeo | pendiente |
| 5.3 | Crear componente de entrada por voz | Hefesto | pendiente |
| 5.4 | Parsear texto reconocido a productos/precios | Prometeo | pendiente |
| 5.5 | Mostrar resultados y permitir edición | Hefesto | pendiente |
| 5.6 | Tests de reconocimiento de voz | Temis | pendiente |

### Fase 6 — Cierre v2
| # | Tarea | Titán | Estado |
|---|---|---|---|
| 6.1 | Auditoría de seguridad de nuevas features | Crío | pendiente |
| 6.2 | Tests de integración v2 | Temis | pendiente |
| 6.3 | Optimización de performance (code splitting, lazy loading) | Hiperión | pendiente |
| 6.4 | Revisión final de arquitectura v2 | Atlas | pendiente |
| 6.5 | Deploy v2 a producción | Jápeto | pendiente |
