# Graph Report - mercado-inteligente  (2026-07-14)

## Corpus Check
- 144 files · ~84,188 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 775 nodes · 869 edges · 97 communities (78 shown, 19 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 1 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `2f871107`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Dashboard.tsx
- index.ts
- compilerOptions
- compilerOptions
- FIREBASE.md — Auditoría de Firebase
- auth.ts
- 3. Calidad de Código
- Spec — Fase 3: Dashboard con Gráficos
- Spec — Fase 3: Dashboard con Gráficos
- Spec — Fase 4: Historial Multi-Mes
- Spec — Fase 2: OCR por Foto
- Arquitectura
- compilerOptions
- 2. Evidencia de Problemas
- 2. Evidencia de Problemas
- Fase 2: OCR por Foto — Implementation Plan
- Historial Task 6 - Report
- STACK — Mercado Inteligente
- AUDITORÍA — Mercado Inteligente
- Fase 3: Dashboard con Gráficos — Implementation Plan
- bash
- Task 4 Report — Modificar Dashboard.tsx (integrar MonthNavigator, selectedMonth, resumen 3 estados, botón definir presupuesto)
- Task 7 Report: `OCRCapture.tsx` — UI de captura de imagen
- BRIEF — Mercado Inteligente
- Fase 4: Historial Multi-Mes — Implementation Plan
- edit
- File Structure
- Task 3 Report — Modificar `PurchaseHistory.tsx` (aceptar prop `month`)
- Task 5 Report — Tests de integración del Dashboard multi-mes
- Task 1 Report: voiceParser — parsear texto a productos
- manifest.json
- MVP (v1)
- v2 — Diferenciadores
- Task 1 Report — MonthNavigator.tsx
- Task 2 Report — Modificar `Budget.tsx` (props `month` y `onSaved`)
- Status: ✅ Complete
- Task 6 Report — `ProductEditor.tsx`
- Task 8 Report — `OCRReview.tsx` (pantalla de revisión editable)
- Task 9 Report: Integrar OCR en `AddPurchase.tsx`
- Task 2 Report: voice service — Web Speech API wrapper
- Task 4: VoiceCapture Component — Report
- Estado: Completado ✅
- voice.test.ts
- opencode.json
- SDD Progress Ledger — Fase 3 Dashboard con Graficos
- graphify.js
- vite-env.d.ts
- final-review-diff.md
- historial-final-review-diff.md
- historial-task-1-diff.md
- historial-task-2-diff.md
- historial-task-3-diff.md
- historial-task-4-diff.md
- historial-task-5-diff.md
- SDD Progress Ledger — Fase 4 Historial Multi-Mes
- task-6-diff.md
- task-7-diff.md
- task-8-diff.md
- task-9-diff.md
- AGENTS.md
- graficos-task-1-brief.md
- graficos-task-2-brief.md
- historial-task-6-brief.md

## God Nodes (most connected - your core abstractions)
1. `compilerOptions` - 19 edges
2. `bash` - 14 edges
3. `compilerOptions` - 14 edges
4. `Fase 2: OCR por Foto — Implementation Plan` - 14 edges
5. `STACK — Mercado Inteligente` - 13 edges
6. `useAuth()` - 12 edges
7. `ParsedItem` - 12 edges
8. `Spec — Fase 4: Historial Multi-Mes` - 12 edges
9. `Fase 3: Dashboard con Gráficos — Implementation Plan` - 11 edges
10. `Spec — Fase 3: Dashboard con Gráficos` - 11 edges

## Surprising Connections (you probably didn't know these)
- `Props` --references--> `ParsedItem`  [EXTRACTED]
  src/components/VoiceCapture.tsx → src/types/index.ts
- `Props` --references--> `ParsedItem`  [EXTRACTED]
  src/components/OCRReview.tsx → src/types/index.ts
- `ProtectedRoute()` --calls--> `useAuth()`  [EXTRACTED]
  src/components/ProtectedRoute.tsx → src/contexts/AuthContext.tsx
- `VoiceCapture()` --calls--> `useVoice()`  [EXTRACTED]
  src/components/VoiceCapture.tsx → src/hooks/useVoice.ts
- `BudgetPage()` --calls--> `useAuth()`  [EXTRACTED]
  src/pages/Budget.tsx → src/contexts/AuthContext.tsx

## Import Cycles
- None detected.

## Communities (97 total, 19 thin omitted)

### Community 0 - "Dashboard.tsx"
Cohesion: 0.07
Nodes (35): ChartsContent(), MONTH_LABELS, monthToLabel(), Props, MONTHS, Props, OCRCapture(), Props (+27 more)

### Community 1 - "index.ts"
Cohesion: 0.15
Nodes (17): OCRReview(), Props, ProductEditor(), Props, OCRStatus, useOCR(), OCRResult, runOCR() (+9 more)

### Community 2 - "compilerOptions"
Cohesion: 0.16
Nodes (12): Props, { mockUseVoice }, VoiceCapture(), mockStartListening, mockStopListening, useVoice(), VoiceStatus, ListeningOptions (+4 more)

### Community 3 - "compilerOptions"
Cohesion: 0.07
Nodes (30): DOM, DOM.Iterable, ES2020, ./src/*, src/**/*.spec.ts, src/**/*.spec.tsx, src/**/*.test.ts, src/**/*.test.tsx (+22 more)

### Community 4 - "FIREBASE.md — Auditoría de Firebase"
Cohesion: 0.07
Nodes (28): 1.1 Inicialización (`src/config/firebase.ts`), 1.2 Variables de entorno (`.env`), 1.3 Emuladores (`src/config/firebase.ts:31-47`), 1. Configuración General, 2.1 Estado actual, 2.2 Problemas identificados, 2. Firebase Authentication, 3.1 Estructura de colecciones (+20 more)

### Community 5 - "auth.ts"
Cohesion: 0.11
Nodes (19): App(), Dashboard, Login, Register, ProtectedRoute(), ProtectedRouteProps, firebaseConfig, missingVars (+11 more)

### Community 6 - "3. Calidad de Código"
Cohesion: 0.08
Nodes (25): 1.1 Estado del Build, 1.2 Advertencias, 1. Build, 2.1 Archivos de test encontrados (21 tests), 2.2 Problemas con tests, 2. Tests, 3.1 TypeScript Config (`tsconfig.json`), 3.2 ESLint (+17 more)

### Community 7 - "Spec — Fase 3: Dashboard con Gráficos"
Cohesion: 0.09
Nodes (21): 1. Barras — Gastado vs Presupuesto (6 meses hasta el seleccionado), 2. Top 5 productos (mes seleccionado), 3. Línea — Tendencia de gastos (6 meses hasta el seleccionado), Archivos existentes que se modifican, Arquitectura, ChartsSection — colapsable y lazy-load, Contexto, Decisiones de diseño (aprobadas) (+13 more)

### Community 11 - "Spec — Fase 4: Historial Multi-Mes"
Cohesion: 0.11
Nodes (18): Archivos existentes que se modifican, Arquitectura, Cambios en Budget.tsx, Caso: mes futuro, Caso: mes pasado con presupuesto y compras, Caso: mes sin presupuesto, Componente MonthNavigator, Contexto (+10 more)

### Community 12 - "Spec — Fase 2: OCR por Foto"
Cohesion: 0.11
Nodes (18): Archivos existentes que se modifican, Arquitectura, Contexto, Decisiones de diseño (aprobadas), Firestore, Flujo de error, Flujo de uso, Fuera de alcance (v2) (+10 more)

### Community 13 - "Arquitectura"
Cohesion: 0.11
Nodes (18): AddPurchase.test.tsx (integración), AddPurchase.tsx — Modo "voice", Arquitectura, Descripción, Edge Cases, Flujo de Usuario, Modificaciones, Nuevos archivos (+10 more)

### Community 19 - "compilerOptions"
Cohesion: 0.11
Nodes (17): ES2023, vite.config.ts, compilerOptions, allowImportingTsExtensions, isolatedModules, lib, module, moduleDetection (+9 more)

### Community 21 - "2. Evidencia de Problemas"
Cohesion: 0.12
Nodes (15): 1.1 Inicio del flujo (`src/services/auth.ts:49-52`), 1.2 Procesamiento del redirect (`src/pages/Login.tsx:13-25`), 1.3 Manejo del resultado (`src/services/auth.ts:54-79`), 1.4 Verificación de auth (`src/hooks/useAuth.ts:5-18`), 1. Flujo Actual, 2.1 [CRÍTICO] No hay AuthProvider — race condition post-redirect, 2.2 [CRÍTICO] signInWithRedirect requiere configuración externa verificable, 2.3 [ALTO] Errores silenciosos sin feedback al usuario (+7 more)

### Community 22 - "2. Evidencia de Problemas"
Cohesion: 0.12
Nodes (15): 1.1 addPurchase (`src/services/purchases.ts:17-45`), 1.2 Manual submit (`src/pages/AddPurchase.tsx:55-77`), 1. Flujo Actual, 2.1 [CRÍTICO] Dependencia total de autenticación, 2.2 [ALTO] Sin refresco automático del Dashboard, 2.3 [ALTO] addPurchase no retorna datos de serverTimestamp, 2.4 [MEDIO] addPurchase ignora receiptImageUrl en modo manual, 2.5 [MEDIO] PurchaseHistory — loadPurchases definida dos veces (+7 more)

### Community 23 - "Fase 2: OCR por Foto — Implementation Plan"
Cohesion: 0.13
Nodes (14): Fase 2: OCR por Foto — Implementation Plan, File Structure, Global Constraints, Self-Review Checklist, Task 10: Smoke test manual + build final + deploy, Task 1: Tipo `ParsedItem` + ampliar `PurchaseItem` con `confidence`, Task 2: `ticketParser.ts` — parser genérico de texto a productos, Task 3: `storage.ts` — wrapper de Firebase Storage (+6 more)

### Community 27 - "Historial Task 6 - Report"
Cohesion: 0.13
Nodes (14): Archivos modificados, Commit, Fix aplicado, Fix aplicado, Historial Task 6 - Report, Issue 1 (Critical): onSaved no refrescaba el estado del Dashboard, Issue 2 (Important): Integration test faltante, Problema (+6 more)

### Community 30 - "STACK — Mercado Inteligente"
Cohesion: 0.14
Nodes (13): Backend, Base de datos, Convenciones de código, Entorno, Frontend, Gestión de secretos, Hosting / Despliegue, Integraciones externas (+5 more)

### Community 31 - "AUDITORÍA — Mercado Inteligente"
Cohesion: 0.17
Nodes (11): Análisis de Causa Raíz, Archivos Analizados (28), AUDITORÍA — Mercado Inteligente, Dependencias Críticas (package.json), Flujo de Autenticación Actual, Mapa de Arquitectura, Problema 1: Google Login no funciona, Problema 2: No se registran productos (+3 more)

### Community 32 - "Fase 3: Dashboard con Gráficos — Implementation Plan"
Cohesion: 0.17
Nodes (11): Fase 3: Dashboard con Gráficos — Implementation Plan, File Structure, Global Constraints, Self-Review Checklist, Task 1: `getPurchasesByDateRange` en `purchases.ts`, Task 2: `getBudgetsByMonthRange` en `budget.ts`, Task 3: `analytics.ts` — servicios de agregación, Task 4: Instalar Recharts + `ChartsContent.tsx` (+3 more)

### Community 38 - "bash"
Cohesion: 0.09
Nodes (22): *, cat *credential*, cat *.env*, cat *secret*, env, git push --force*, history, *migrate* (+14 more)

### Community 39 - "Task 4 Report — Modificar Dashboard.tsx (integrar MonthNavigator, selectedMonth, resumen 3 estados, botón definir presupuesto)"
Cohesion: 0.17
Nodes (11): Code-review fix — Gastado usa color neutral (no rojo), Commit, Concerns, Diff, Files changed, Files changed, Self-review findings, Task 4 Report — Modificar Dashboard.tsx (integrar MonthNavigator, selectedMonth, resumen 3 estados, botón definir presupuesto) (+3 more)

### Community 40 - "Task 7 Report: `OCRCapture.tsx` — UI de captura de imagen"
Cohesion: 0.17
Nodes (11): Commit, Concerns, Files Changed, Full suite + typecheck, GREEN, RED, Self-Review Findings, Status: DONE (+3 more)

### Community 41 - "BRIEF — Mercado Inteligente"
Cohesion: 0.18
Nodes (10): BRIEF — Mercado Inteligente, Descripción, Features imprescindibles (v1), MVP (v1) — Flujo principal de punta a punta, Referencias, Restricciones, Roadmap, Usuarios objetivo (+2 more)

### Community 42 - "Fase 4: Historial Multi-Mes — Implementation Plan"
Cohesion: 0.18
Nodes (10): Fase 4: Historial Multi-Mes — Implementation Plan, File Structure, Global Constraints, Self-Review Checklist, Task 1: `MonthNavigator.tsx` — componente de navegación de meses, Task 2: Modificar `Budget.tsx` — aceptar `month` y `onSaved` props, Task 3: Modificar `PurchaseHistory.tsx` — aceptar prop `month`, Task 4: Modificar `Dashboard.tsx` — integrar MonthNavigator, selectedMonth, resumen 3 números, botón definir presupuesto (+2 more)

### Community 48 - "edit"
Cohesion: 0.06
Nodes (46): agent, atlas, coeus, crio, cronos, hefesto, prometeo, temis (+38 more)

### Community 49 - "File Structure"
Cohesion: 0.20
Nodes (9): File Structure, Global Constraints, Registro por Voz — Implementation Plan, Task 1: voiceParser — parsear texto a productos, Task 2: voice service — Web Speech API wrapper, Task 3: useVoice hook — orquestador, Task 4: VoiceCapture component — micrófono y transcripción, Task 5: Integrar en AddPurchase — modo voz (+1 more)

### Community 55 - "Task 3 Report — Modificar `PurchaseHistory.tsx` (aceptar prop `month`)"
Cohesion: 0.20
Nodes (9): Commits, Concerns, Files changed, On the intentional `loadPurchases` duplication, Self-review findings, Status: DONE, Task 3 Report — Modificar `PurchaseHistory.tsx` (aceptar prop `month`), Typecheck / tests (+1 more)

### Community 56 - "Task 5 Report — Tests de integración del Dashboard multi-mes"
Cohesion: 0.20
Nodes (9): 1. Mock de `useAuth` con referencia estable (fix de flakiness), 2. Test del toggle fortalecido (verificación real del `showBudgetForm`), Adjustments made to the brief's test code, Commits, Concerns, Self-review findings, Task 5 Report — Tests de integración del Dashboard multi-mes, Test results (+1 more)

### Community 57 - "Task 1 Report: voiceParser — parsear texto a productos"
Cohesion: 0.20
Nodes (9): Files changed, GREEN phase, Issues or concerns, RED phase, Self-review findings, Task 1 Report: voiceParser — parsear texto a productos, TDD Evidence, What was implemented (+1 more)

### Community 63 - "manifest.json"
Cohesion: 0.22
Nodes (8): background_color, description, display, icons, name, short_name, start_url, theme_color

### Community 64 - "MVP (v1)"
Cohesion: 0.22
Nodes (8): Fase 1 — Fundación, Fase 2 — Auth, Fase 3 — Presupuesto, Fase 4 — Registro de compras, Fase 5 — Dashboard, Fase 6 — Cierre v1, MVP (v1), Tareas — Mercado Inteligente

### Community 65 - "v2 — Diferenciadores"
Cohesion: 0.22
Nodes (8): Fase 1 — PWA Instalable, Fase 2 — OCR por Foto, Fase 3 — Dashboard con Gráficos, Fase 4 — Historial Multi-Mes, Fase 5 — Registro por Voz, Fase 6 — Cierre v2, Tareas — Mercado Inteligente v2, v2 — Diferenciadores

### Community 72 - "Task 1 Report — MonthNavigator.tsx"
Cohesion: 0.25
Nodes (7): Concerns, Files changed, Self-review findings, Task 1 Report — MonthNavigator.tsx, TDD Evidence, Verification (post-implementation), What I implemented

### Community 73 - "Task 2 Report — Modificar `Budget.tsx` (props `month` y `onSaved`)"
Cohesion: 0.25
Nodes (7): Concerns, Files changed, Self-review findings, Task 2 Report — Modificar `Budget.tsx` (props `month` y `onSaved`), Test results, Typecheck results, What I implemented

### Community 74 - "Status: ✅ Complete"
Cohesion: 0.25
Nodes (7): Commits, Files, Interface, Key design decisions, Process, Status: ✅ Complete, Task 3 Report: useVoice hook — orquestador

### Community 75 - "Task 6 Report — `ProductEditor.tsx`"
Cohesion: 0.25
Nodes (7): Concerns / deviations from the brief, Files changed, Self-review findings, Task 6 Report — `ProductEditor.tsx`, TDD Evidence, Verification, What I implemented

### Community 76 - "Task 8 Report — `OCRReview.tsx` (pantalla de revisión editable)"
Cohesion: 0.25
Nodes (7): Concerns, Deviations from the brief's implementation (required to make the brief's tests pass), Files changed, Self-review findings, Task 8 Report — `OCRReview.tsx` (pantalla de revisión editable), TDD Evidence, What I implemented

### Community 77 - "Task 9 Report: Integrar OCR en `AddPurchase.tsx`"
Cohesion: 0.25
Nodes (7): Concerns, Deviations from the brief (with rationale), Files changed, Self-review findings, Task 9 Report: Integrar OCR en `AddPurchase.tsx`, Typecheck and build results, What I implemented

### Community 81 - "Task 2 Report: voice service — Web Speech API wrapper"
Cohesion: 0.29
Nodes (6): Commit, Files, Implementation Notes, Status: DONE, Task 2 Report: voice service — Web Speech API wrapper, Test Results

### Community 82 - "Task 4: VoiceCapture Component — Report"
Cohesion: 0.29
Nodes (6): Dev Notes, Files, Implementation Details, Summary, Task 4: VoiceCapture Component — Report, Test Results

### Community 83 - "Estado: Completado ✅"
Cohesion: 0.29
Nodes (6): Cambios realizados, Commits, Detalle de implementación, Estado: Completado ✅, Task 5: Integrar en AddPurchase — modo voz, Tests (TDD)

### Community 90 - "voice.test.ts"
Cohesion: 0.33
Nodes (4): mockAbort, mockSpeechRecognition, mockStart, mockStop

### Community 99 - "opencode.json"
Cohesion: 0.50
Nodes (3): plugin, $schema, .opencode/plugins/graphify.js

### Community 100 - "SDD Progress Ledger — Fase 3 Dashboard con Graficos"
Cohesion: 0.50
Nodes (3): Results, SDD Progress Ledger — Fase 3 Dashboard con Graficos, Tasks

## Knowledge Gaps
- **448 isolated node(s):** `$schema`, `.opencode/plugins/graphify.js`, `$schema`, `model`, `*` (+443 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **19 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `agent` connect `edit` to `bash`?**
  _High betweenness centrality (0.005) - this node is a cross-community bridge._
- **Why does `useAuth()` connect `Dashboard.tsx` to `auth.ts`?**
  _High betweenness centrality (0.003) - this node is a cross-community bridge._
- **Why does `bash` connect `bash` to `edit`?**
  _High betweenness centrality (0.002) - this node is a cross-community bridge._
- **What connects `$schema`, `.opencode/plugins/graphify.js`, `$schema` to the rest of the system?**
  _448 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Dashboard.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.07344632768361582 - nodes in this community are weakly interconnected._
- **Should `index.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.14814814814814814 - nodes in this community are weakly interconnected._
- **Should `compilerOptions` be split into smaller, more focused modules?**
  _Cohesion score 0.06666666666666667 - nodes in this community are weakly interconnected._