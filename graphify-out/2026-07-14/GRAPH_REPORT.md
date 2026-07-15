# Graph Report - mercado-inteligente  (2026-07-14)

## Corpus Check
- 279 files · ~162,984 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1436 nodes · 1628 edges · 203 communities (167 shown, 36 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 2 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `32c05317`
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
- AddPurchase.tsx
- Dashboard.tsx
- Spec — Fase 4: Historial Multi-Mes
- Spec — Fase 2: OCR por Foto
- Arquitectura
- Spec — Fase 4: Historial Multi-Mes
- Spec — Fase 2: OCR por Foto
- Arquitectura
- useVoice.ts
- compilerOptions
- compilerOptions
- useOCR.ts
- 2. Evidencia de Problemas
- 2. Evidencia de Problemas
- Fase 2: OCR por Foto — Implementation Plan
- Fase 2: OCR por Foto — Implementation Plan
- analytics.ts
- Historial Task 6 - Report
- Historial Task 6 - Report
- auth.ts
- STACK — Mercado Inteligente
- STACK — Mercado Inteligente
- AUDITORÍA — Mercado Inteligente
- Fase 3: Dashboard con Gráficos — Implementation Plan
- Fase 3: Dashboard con Gráficos — Implementation Plan
- bash
- OCRReview.tsx
- Task 4 Report — Modificar Dashboard.tsx (integrar MonthNavigator, selectedMonth, resumen 3 estados, botón definir presupuesto)
- Task 7 Report: `OCRCapture.tsx` — UI de captura de imagen
- bash
- Task 4 Report — Modificar Dashboard.tsx (integrar MonthNavigator, selectedMonth, resumen 3 estados, botón definir presupuesto)
- Task 7 Report: `OCRCapture.tsx` — UI de captura de imagen
- BRIEF — Mercado Inteligente
- Fase 4: Historial Multi-Mes — Implementation Plan
- BRIEF — Mercado Inteligente
- Fase 4: Historial Multi-Mes — Implementation Plan
- opencode.json
- edit
- opencode.json
- edit
- File Structure
- File Structure
- purchases.ts
- Task 3 Report — Modificar `PurchaseHistory.tsx` (aceptar prop `month`)
- Task 5 Report — Tests de integración del Dashboard multi-mes
- Task 1 Report: voiceParser — parsear texto a productos
- Task 3 Report — Modificar `PurchaseHistory.tsx` (aceptar prop `month`)
- Task 5 Report — Tests de integración del Dashboard multi-mes
- Task 1 Report: voiceParser — parsear texto a productos
- agent
- manifest.json
- MVP (v1)
- v2 — Diferenciadores
- agent
- manifest.json
- MVP (v1)
- v2 — Diferenciadores
- Task 1 Report — MonthNavigator.tsx
- Task 2 Report — Modificar `Budget.tsx` (props `month` y `onSaved`)
- Status: ✅ Complete
- Task 6 Report — `ProductEditor.tsx`
- Task 8 Report — `OCRReview.tsx` (pantalla de revisión editable)
- Task 9 Report: Integrar OCR en `AddPurchase.tsx`
- Task 1 Report — MonthNavigator.tsx
- Task 2 Report — Modificar `Budget.tsx` (props `month` y `onSaved`)
- Status: ✅ Complete
- Task 6 Report — `ProductEditor.tsx`
- Task 8 Report — `OCRReview.tsx` (pantalla de revisión editable)
- Task 9 Report: Integrar OCR en `AddPurchase.tsx`
- Task 2 Report: voice service — Web Speech API wrapper
- Task 4: VoiceCapture Component — Report
- Estado: Completado ✅
- Task 2 Report: voice service — Web Speech API wrapper
- Task 4: VoiceCapture Component — Report
- Estado: Completado ✅
- crio
- tetis
- MonthNavigator.tsx
- voice.test.ts
- crio
- tetis
- voice.test.ts
- hefesto
- prometeo
- ChartsSection.tsx
- hefesto
- prometeo
- atlas
- SDD Progress Ledger — Fase 3 Dashboard con Graficos
- atlas
- opencode.json
- SDD Progress Ledger — Fase 3 Dashboard con Graficos
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
- graficos-task-1-brief.md
- graficos-task-2-brief.md
- historial-task-6-brief.md

## God Nodes (most connected - your core abstractions)
1. `compilerOptions` - 19 edges
2. `compilerOptions` - 19 edges
3. `bash` - 14 edges
4. `compilerOptions` - 14 edges
5. `bash` - 14 edges
6. `compilerOptions` - 14 edges
7. `Fase 2: OCR por Foto — Implementation Plan` - 14 edges
8. `Fase 2: OCR por Foto — Implementation Plan` - 14 edges
9. `STACK — Mercado Inteligente` - 13 edges
10. `STACK — Mercado Inteligente` - 13 edges

## Surprising Connections (you probably didn't know these)
- `BudgetPage()` --calls--> `useAuth()`  [EXTRACTED]
  MercadoInteligente/src/pages/Budget.tsx → MercadoInteligente/src/hooks/useAuth.ts
- `Props` --references--> `ParsedItem`  [EXTRACTED]
  MercadoInteligente/src/components/OCRReview.tsx → MercadoInteligente/src/types/index.ts
- `Props` --references--> `ParsedItem`  [EXTRACTED]
  MercadoInteligente/src/components/VoiceCapture.tsx → MercadoInteligente/src/types/index.ts
- `VoiceCapture()` --calls--> `useVoice()`  [EXTRACTED]
  MercadoInteligente/src/components/VoiceCapture.tsx → MercadoInteligente/src/hooks/useVoice.ts
- `Dashboard()` --calls--> `useAuth()`  [EXTRACTED]
  MercadoInteligente/src/pages/Dashboard.tsx → MercadoInteligente/src/hooks/useAuth.ts

## Import Cycles
- None detected.

## Communities (203 total, 36 thin omitted)

### Community 0 - "Dashboard.tsx"
Cohesion: 0.07
Nodes (35): ChartsContent(), MONTH_LABELS, monthToLabel(), Props, ChartsContent, Props, MONTHS, Props (+27 more)

### Community 1 - "index.ts"
Cohesion: 0.08
Nodes (32): OCRCapture(), Props, OCRReview(), Props, ProductEditor(), Props, Props, { mockUseVoice } (+24 more)

### Community 2 - "compilerOptions"
Cohesion: 0.07
Nodes (30): compilerOptions, allowImportingTsExtensions, baseUrl, isolatedModules, jsx, lib, module, moduleDetection (+22 more)

### Community 3 - "compilerOptions"
Cohesion: 0.07
Nodes (30): compilerOptions, allowImportingTsExtensions, baseUrl, isolatedModules, jsx, lib, module, moduleDetection (+22 more)

### Community 4 - "FIREBASE.md — Auditoría de Firebase"
Cohesion: 0.07
Nodes (28): 1.1 Inicialización (`src/config/firebase.ts`), 1.2 Variables de entorno (`.env`), 1.3 Emuladores (`src/config/firebase.ts:31-47`), 1. Configuración General, 2.1 Estado actual, 2.2 Problemas identificados, 2. Firebase Authentication, 3.1 Estructura de colecciones (+20 more)

### Community 5 - "auth.ts"
Cohesion: 0.12
Nodes (18): App(), Dashboard, Login, Register, firebaseConfig, missingVars, REQUIRED_VARS, AuthContext (+10 more)

### Community 6 - "3. Calidad de Código"
Cohesion: 0.08
Nodes (25): 1.1 Estado del Build, 1.2 Advertencias, 1. Build, 2.1 Archivos de test encontrados (21 tests), 2.2 Problemas con tests, 2. Tests, 3.1 TypeScript Config (`tsconfig.json`), 3.2 ESLint (+17 more)

### Community 7 - "Spec — Fase 3: Dashboard con Gráficos"
Cohesion: 0.09
Nodes (21): 1. Barras — Gastado vs Presupuesto (6 meses hasta el seleccionado), 2. Top 5 productos (mes seleccionado), 3. Línea — Tendencia de gastos (6 meses hasta el seleccionado), Archivos existentes que se modifican, Arquitectura, ChartsSection — colapsable y lazy-load, Contexto, Decisiones de diseño (aprobadas) (+13 more)

### Community 8 - "Spec — Fase 3: Dashboard con Gráficos"
Cohesion: 0.09
Nodes (21): 1. Barras — Gastado vs Presupuesto (6 meses hasta el seleccionado), 2. Top 5 productos (mes seleccionado), 3. Línea — Tendencia de gastos (6 meses hasta el seleccionado), Archivos existentes que se modifican, Arquitectura, ChartsSection — colapsable y lazy-load, Contexto, Decisiones de diseño (aprobadas) (+13 more)

### Community 9 - "AddPurchase.tsx"
Cohesion: 0.15
Nodes (10): Dashboard, Login, Register, OCRCapture(), Props, ProtectedRoute(), ProtectedRouteProps, useAuth() (+2 more)

### Community 10 - "Dashboard.tsx"
Cohesion: 0.19
Nodes (11): BeforeInstallPromptEvent, usePWAInstall(), BudgetPage(), Props, Dashboard(), getAllBudgets(), getBudget(), setBudget() (+3 more)

### Community 11 - "Spec — Fase 4: Historial Multi-Mes"
Cohesion: 0.11
Nodes (18): Archivos existentes que se modifican, Arquitectura, Cambios en Budget.tsx, Caso: mes futuro, Caso: mes pasado con presupuesto y compras, Caso: mes sin presupuesto, Componente MonthNavigator, Contexto (+10 more)

### Community 12 - "Spec — Fase 2: OCR por Foto"
Cohesion: 0.11
Nodes (18): Archivos existentes que se modifican, Arquitectura, Contexto, Decisiones de diseño (aprobadas), Firestore, Flujo de error, Flujo de uso, Fuera de alcance (v2) (+10 more)

### Community 13 - "Arquitectura"
Cohesion: 0.11
Nodes (18): AddPurchase.test.tsx (integración), AddPurchase.tsx — Modo "voice", Arquitectura, Descripción, Edge Cases, Flujo de Usuario, Modificaciones, Nuevos archivos (+10 more)

### Community 14 - "Spec — Fase 4: Historial Multi-Mes"
Cohesion: 0.11
Nodes (18): Archivos existentes que se modifican, Arquitectura, Cambios en Budget.tsx, Caso: mes futuro, Caso: mes pasado con presupuesto y compras, Caso: mes sin presupuesto, Componente MonthNavigator, Contexto (+10 more)

### Community 15 - "Spec — Fase 2: OCR por Foto"
Cohesion: 0.11
Nodes (18): Archivos existentes que se modifican, Arquitectura, Contexto, Decisiones de diseño (aprobadas), Firestore, Flujo de error, Flujo de uso, Fuera de alcance (v2) (+10 more)

### Community 16 - "Arquitectura"
Cohesion: 0.11
Nodes (18): AddPurchase.test.tsx (integración), AddPurchase.tsx — Modo "voice", Arquitectura, Descripción, Edge Cases, Flujo de Usuario, Modificaciones, Nuevos archivos (+10 more)

### Community 17 - "useVoice.ts"
Cohesion: 0.18
Nodes (11): { mockUseVoice }, VoiceCapture(), mockStartListening, mockStopListening, useVoice(), VoiceStatus, ListeningOptions, startListening() (+3 more)

### Community 18 - "compilerOptions"
Cohesion: 0.11
Nodes (17): compilerOptions, allowImportingTsExtensions, isolatedModules, lib, module, moduleDetection, moduleResolution, noEmit (+9 more)

### Community 19 - "compilerOptions"
Cohesion: 0.11
Nodes (17): compilerOptions, allowImportingTsExtensions, isolatedModules, lib, module, moduleDetection, moduleResolution, noEmit (+9 more)

### Community 20 - "useOCR.ts"
Cohesion: 0.24
Nodes (10): OCRStatus, useOCR(), OCRResult, runOCR(), compressImage(), uploadReceiptImage(), lineConfidence(), parsePrice() (+2 more)

### Community 21 - "2. Evidencia de Problemas"
Cohesion: 0.12
Nodes (15): 1.1 Inicio del flujo (`src/services/auth.ts:49-52`), 1.2 Procesamiento del redirect (`src/pages/Login.tsx:13-25`), 1.3 Manejo del resultado (`src/services/auth.ts:54-79`), 1.4 Verificación de auth (`src/hooks/useAuth.ts:5-18`), 1. Flujo Actual, 2.1 [CRÍTICO] No hay AuthProvider — race condition post-redirect, 2.2 [CRÍTICO] signInWithRedirect requiere configuración externa verificable, 2.3 [ALTO] Errores silenciosos sin feedback al usuario (+7 more)

### Community 22 - "2. Evidencia de Problemas"
Cohesion: 0.12
Nodes (15): 1.1 addPurchase (`src/services/purchases.ts:17-45`), 1.2 Manual submit (`src/pages/AddPurchase.tsx:55-77`), 1. Flujo Actual, 2.1 [CRÍTICO] Dependencia total de autenticación, 2.2 [ALTO] Sin refresco automático del Dashboard, 2.3 [ALTO] addPurchase no retorna datos de serverTimestamp, 2.4 [MEDIO] addPurchase ignora receiptImageUrl en modo manual, 2.5 [MEDIO] PurchaseHistory — loadPurchases definida dos veces (+7 more)

### Community 23 - "Fase 2: OCR por Foto — Implementation Plan"
Cohesion: 0.13
Nodes (14): Fase 2: OCR por Foto — Implementation Plan, File Structure, Global Constraints, Self-Review Checklist, Task 10: Smoke test manual + build final + deploy, Task 1: Tipo `ParsedItem` + ampliar `PurchaseItem` con `confidence`, Task 2: `ticketParser.ts` — parser genérico de texto a productos, Task 3: `storage.ts` — wrapper de Firebase Storage (+6 more)

### Community 24 - "Fase 2: OCR por Foto — Implementation Plan"
Cohesion: 0.13
Nodes (14): Fase 2: OCR por Foto — Implementation Plan, File Structure, Global Constraints, Self-Review Checklist, Task 10: Smoke test manual + build final + deploy, Task 1: Tipo `ParsedItem` + ampliar `PurchaseItem` con `confidence`, Task 2: `ticketParser.ts` — parser genérico de texto a productos, Task 3: `storage.ts` — wrapper de Firebase Storage (+6 more)

### Community 25 - "analytics.ts"
Cohesion: 0.23
Nodes (11): ChartsContent(), MONTH_LABELS, monthToLabel(), Props, getTopProducts(), getTotalSpentByMonth(), MonthData, ProductData (+3 more)

### Community 26 - "Historial Task 6 - Report"
Cohesion: 0.13
Nodes (14): Archivos modificados, Commit, Fix aplicado, Fix aplicado, Historial Task 6 - Report, Issue 1 (Critical): onSaved no refrescaba el estado del Dashboard, Issue 2 (Important): Integration test faltante, Problema (+6 more)

### Community 27 - "Historial Task 6 - Report"
Cohesion: 0.13
Nodes (14): Archivos modificados, Commit, Fix aplicado, Fix aplicado, Historial Task 6 - Report, Issue 1 (Critical): onSaved no refrescaba el estado del Dashboard, Issue 2 (Important): Integration test faltante, Problema (+6 more)

### Community 28 - "auth.ts"
Cohesion: 0.30
Nodes (7): firebaseConfig, getGoogleRedirectResult(), googleProvider, loginWithEmail(), loginWithGoogle(), logout(), registerWithEmail()

### Community 29 - "STACK — Mercado Inteligente"
Cohesion: 0.14
Nodes (13): Backend, Base de datos, Convenciones de código, Entorno, Frontend, Gestión de secretos, Hosting / Despliegue, Integraciones externas (+5 more)

### Community 30 - "STACK — Mercado Inteligente"
Cohesion: 0.14
Nodes (13): Backend, Base de datos, Convenciones de código, Entorno, Frontend, Gestión de secretos, Hosting / Despliegue, Integraciones externas (+5 more)

### Community 31 - "AUDITORÍA — Mercado Inteligente"
Cohesion: 0.17
Nodes (11): Análisis de Causa Raíz, Archivos Analizados (28), AUDITORÍA — Mercado Inteligente, Dependencias Críticas (package.json), Flujo de Autenticación Actual, Mapa de Arquitectura, Problema 1: Google Login no funciona, Problema 2: No se registran productos (+3 more)

### Community 32 - "Fase 3: Dashboard con Gráficos — Implementation Plan"
Cohesion: 0.17
Nodes (11): Fase 3: Dashboard con Gráficos — Implementation Plan, File Structure, Global Constraints, Self-Review Checklist, Task 1: `getPurchasesByDateRange` en `purchases.ts`, Task 2: `getBudgetsByMonthRange` en `budget.ts`, Task 3: `analytics.ts` — servicios de agregación, Task 4: Instalar Recharts + `ChartsContent.tsx` (+3 more)

### Community 33 - "Fase 3: Dashboard con Gráficos — Implementation Plan"
Cohesion: 0.17
Nodes (11): Fase 3: Dashboard con Gráficos — Implementation Plan, File Structure, Global Constraints, Self-Review Checklist, Task 1: `getPurchasesByDateRange` en `purchases.ts`, Task 2: `getBudgetsByMonthRange` en `budget.ts`, Task 3: `analytics.ts` — servicios de agregación, Task 4: Instalar Recharts + `ChartsContent.tsx` (+3 more)

### Community 34 - "bash"
Cohesion: 0.17
Nodes (12): *, cat *credential*, cat *.env*, cat *secret*, env, git push --force*, history, *migrate* (+4 more)

### Community 35 - "OCRReview.tsx"
Cohesion: 0.29
Nodes (8): OCRReview(), Props, ProductEditor(), Props, Props, isLowConfidence(), ParsedItem, PurchaseItem

### Community 36 - "Task 4 Report — Modificar Dashboard.tsx (integrar MonthNavigator, selectedMonth, resumen 3 estados, botón definir presupuesto)"
Cohesion: 0.17
Nodes (11): Code-review fix — Gastado usa color neutral (no rojo), Commit, Concerns, Diff, Files changed, Files changed, Self-review findings, Task 4 Report — Modificar Dashboard.tsx (integrar MonthNavigator, selectedMonth, resumen 3 estados, botón definir presupuesto) (+3 more)

### Community 37 - "Task 7 Report: `OCRCapture.tsx` — UI de captura de imagen"
Cohesion: 0.17
Nodes (11): Commit, Concerns, Files Changed, Full suite + typecheck, GREEN, RED, Self-Review Findings, Status: DONE (+3 more)

### Community 38 - "bash"
Cohesion: 0.17
Nodes (12): *, cat *credential*, cat *.env*, cat *secret*, env, git push --force*, history, *migrate* (+4 more)

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

### Community 43 - "BRIEF — Mercado Inteligente"
Cohesion: 0.18
Nodes (10): BRIEF — Mercado Inteligente, Descripción, Features imprescindibles (v1), MVP (v1) — Flujo principal de punta a punta, Referencias, Restricciones, Roadmap, Usuarios objetivo (+2 more)

### Community 44 - "Fase 4: Historial Multi-Mes — Implementation Plan"
Cohesion: 0.18
Nodes (10): Fase 4: Historial Multi-Mes — Implementation Plan, File Structure, Global Constraints, Self-Review Checklist, Task 1: `MonthNavigator.tsx` — componente de navegación de meses, Task 2: Modificar `Budget.tsx` — aceptar `month` y `onSaved` props, Task 3: Modificar `PurchaseHistory.tsx` — aceptar prop `month`, Task 4: Modificar `Dashboard.tsx` — integrar MonthNavigator, selectedMonth, resumen 3 números, botón definir presupuesto (+2 more)

### Community 45 - "opencode.json"
Cohesion: 0.18
Nodes (10): npx, @playwright/mcp@latest, mcp, playwright, model, permission, command, enabled (+2 more)

### Community 46 - "edit"
Cohesion: 0.29
Nodes (11): temis, tools, tools, tools, description, mode, model, tools (+3 more)

### Community 47 - "opencode.json"
Cohesion: 0.18
Nodes (10): npx, @playwright/mcp@latest, mcp, playwright, model, permission, command, enabled (+2 more)

### Community 48 - "edit"
Cohesion: 0.29
Nodes (11): temis, tools, tools, tools, description, mode, model, tools (+3 more)

### Community 49 - "File Structure"
Cohesion: 0.20
Nodes (9): File Structure, Global Constraints, Registro por Voz — Implementation Plan, Task 1: voiceParser — parsear texto a productos, Task 2: voice service — Web Speech API wrapper, Task 3: useVoice hook — orquestador, Task 4: VoiceCapture component — micrófono y transcripción, Task 5: Integrar en AddPurchase — modo voz (+1 more)

### Community 50 - "File Structure"
Cohesion: 0.20
Nodes (9): File Structure, Global Constraints, Registro por Voz — Implementation Plan, Task 1: voiceParser — parsear texto a productos, Task 2: voice service — Web Speech API wrapper, Task 3: useVoice hook — orquestador, Task 4: VoiceCapture component — micrófono y transcripción, Task 5: Integrar en AddPurchase — modo voz (+1 more)

### Community 51 - "purchases.ts"
Cohesion: 0.38
Nodes (7): Props, PurchaseHistory(), addPurchase(), deletePurchase(), getPurchases(), getTotalSpent(), Purchase

### Community 52 - "Task 3 Report — Modificar `PurchaseHistory.tsx` (aceptar prop `month`)"
Cohesion: 0.20
Nodes (9): Commits, Concerns, Files changed, On the intentional `loadPurchases` duplication, Self-review findings, Status: DONE, Task 3 Report — Modificar `PurchaseHistory.tsx` (aceptar prop `month`), Typecheck / tests (+1 more)

### Community 53 - "Task 5 Report — Tests de integración del Dashboard multi-mes"
Cohesion: 0.20
Nodes (9): 1. Mock de `useAuth` con referencia estable (fix de flakiness), 2. Test del toggle fortalecido (verificación real del `showBudgetForm`), Adjustments made to the brief's test code, Commits, Concerns, Self-review findings, Task 5 Report — Tests de integración del Dashboard multi-mes, Test results (+1 more)

### Community 54 - "Task 1 Report: voiceParser — parsear texto a productos"
Cohesion: 0.20
Nodes (9): Files changed, GREEN phase, Issues or concerns, RED phase, Self-review findings, Task 1 Report: voiceParser — parsear texto a productos, TDD Evidence, What was implemented (+1 more)

### Community 55 - "Task 3 Report — Modificar `PurchaseHistory.tsx` (aceptar prop `month`)"
Cohesion: 0.20
Nodes (9): Commits, Concerns, Files changed, On the intentional `loadPurchases` duplication, Self-review findings, Status: DONE, Task 3 Report — Modificar `PurchaseHistory.tsx` (aceptar prop `month`), Typecheck / tests (+1 more)

### Community 56 - "Task 5 Report — Tests de integración del Dashboard multi-mes"
Cohesion: 0.20
Nodes (9): 1. Mock de `useAuth` con referencia estable (fix de flakiness), 2. Test del toggle fortalecido (verificación real del `showBudgetForm`), Adjustments made to the brief's test code, Commits, Concerns, Self-review findings, Task 5 Report — Tests de integración del Dashboard multi-mes, Test results (+1 more)

### Community 57 - "Task 1 Report: voiceParser — parsear texto a productos"
Cohesion: 0.20
Nodes (9): Files changed, GREEN phase, Issues or concerns, RED phase, Self-review findings, Task 1 Report: voiceParser — parsear texto a productos, TDD Evidence, What was implemented (+1 more)

### Community 58 - "agent"
Cohesion: 0.22
Nodes (9): agent, coeus, cronos, description, mode, model, description, mode (+1 more)

### Community 59 - "manifest.json"
Cohesion: 0.22
Nodes (8): background_color, description, display, icons, name, short_name, start_url, theme_color

### Community 60 - "MVP (v1)"
Cohesion: 0.22
Nodes (8): Fase 1 — Fundación, Fase 2 — Auth, Fase 3 — Presupuesto, Fase 4 — Registro de compras, Fase 5 — Dashboard, Fase 6 — Cierre v1, MVP (v1), Tareas — Mercado Inteligente

### Community 61 - "v2 — Diferenciadores"
Cohesion: 0.22
Nodes (8): Fase 1 — PWA Instalable, Fase 2 — OCR por Foto, Fase 3 — Dashboard con Gráficos, Fase 4 — Historial Multi-Mes, Fase 5 — Registro por Voz, Fase 6 — Cierre v2, Tareas — Mercado Inteligente v2, v2 — Diferenciadores

### Community 62 - "agent"
Cohesion: 0.22
Nodes (9): agent, coeus, cronos, description, mode, model, description, mode (+1 more)

### Community 63 - "manifest.json"
Cohesion: 0.22
Nodes (8): background_color, description, display, icons, name, short_name, start_url, theme_color

### Community 64 - "MVP (v1)"
Cohesion: 0.22
Nodes (8): Fase 1 — Fundación, Fase 2 — Auth, Fase 3 — Presupuesto, Fase 4 — Registro de compras, Fase 5 — Dashboard, Fase 6 — Cierre v1, MVP (v1), Tareas — Mercado Inteligente

### Community 65 - "v2 — Diferenciadores"
Cohesion: 0.22
Nodes (8): Fase 1 — PWA Instalable, Fase 2 — OCR por Foto, Fase 3 — Dashboard con Gráficos, Fase 4 — Historial Multi-Mes, Fase 5 — Registro por Voz, Fase 6 — Cierre v2, Tareas — Mercado Inteligente v2, v2 — Diferenciadores

### Community 66 - "Task 1 Report — MonthNavigator.tsx"
Cohesion: 0.25
Nodes (7): Concerns, Files changed, Self-review findings, Task 1 Report — MonthNavigator.tsx, TDD Evidence, Verification (post-implementation), What I implemented

### Community 67 - "Task 2 Report — Modificar `Budget.tsx` (props `month` y `onSaved`)"
Cohesion: 0.25
Nodes (7): Concerns, Files changed, Self-review findings, Task 2 Report — Modificar `Budget.tsx` (props `month` y `onSaved`), Test results, Typecheck results, What I implemented

### Community 68 - "Status: ✅ Complete"
Cohesion: 0.25
Nodes (7): Commits, Files, Interface, Key design decisions, Process, Status: ✅ Complete, Task 3 Report: useVoice hook — orquestador

### Community 69 - "Task 6 Report — `ProductEditor.tsx`"
Cohesion: 0.25
Nodes (7): Concerns / deviations from the brief, Files changed, Self-review findings, Task 6 Report — `ProductEditor.tsx`, TDD Evidence, Verification, What I implemented

### Community 70 - "Task 8 Report — `OCRReview.tsx` (pantalla de revisión editable)"
Cohesion: 0.25
Nodes (7): Concerns, Deviations from the brief's implementation (required to make the brief's tests pass), Files changed, Self-review findings, Task 8 Report — `OCRReview.tsx` (pantalla de revisión editable), TDD Evidence, What I implemented

### Community 71 - "Task 9 Report: Integrar OCR en `AddPurchase.tsx`"
Cohesion: 0.25
Nodes (7): Concerns, Deviations from the brief (with rationale), Files changed, Self-review findings, Task 9 Report: Integrar OCR en `AddPurchase.tsx`, Typecheck and build results, What I implemented

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

### Community 78 - "Task 2 Report: voice service — Web Speech API wrapper"
Cohesion: 0.29
Nodes (6): Commit, Files, Implementation Notes, Status: DONE, Task 2 Report: voice service — Web Speech API wrapper, Test Results

### Community 79 - "Task 4: VoiceCapture Component — Report"
Cohesion: 0.29
Nodes (6): Dev Notes, Files, Implementation Details, Summary, Task 4: VoiceCapture Component — Report, Test Results

### Community 80 - "Estado: Completado ✅"
Cohesion: 0.29
Nodes (6): Cambios realizados, Commits, Detalle de implementación, Estado: Completado ✅, Task 5: Integrar en AddPurchase — modo voz, Tests (TDD)

### Community 81 - "Task 2 Report: voice service — Web Speech API wrapper"
Cohesion: 0.29
Nodes (6): Commit, Files, Implementation Notes, Status: DONE, Task 2 Report: voice service — Web Speech API wrapper, Test Results

### Community 82 - "Task 4: VoiceCapture Component — Report"
Cohesion: 0.29
Nodes (6): Dev Notes, Files, Implementation Details, Summary, Task 4: VoiceCapture Component — Report, Test Results

### Community 83 - "Estado: Completado ✅"
Cohesion: 0.29
Nodes (6): Cambios realizados, Commits, Detalle de implementación, Estado: Completado ✅, Task 5: Integrar en AddPurchase — modo voz, Tests (TDD)

### Community 84 - "crio"
Cohesion: 0.33
Nodes (6): crio, description, mode, model, permission, tools

### Community 85 - "tetis"
Cohesion: 0.33
Nodes (6): tetis, description, mode, model, permission, tools

### Community 87 - "voice.test.ts"
Cohesion: 0.33
Nodes (4): mockAbort, mockSpeechRecognition, mockStart, mockStop

### Community 88 - "crio"
Cohesion: 0.33
Nodes (6): crio, description, mode, model, permission, tools

### Community 89 - "tetis"
Cohesion: 0.33
Nodes (6): tetis, description, mode, model, permission, tools

### Community 90 - "voice.test.ts"
Cohesion: 0.33
Nodes (4): mockAbort, mockSpeechRecognition, mockStart, mockStop

### Community 91 - "hefesto"
Cohesion: 0.40
Nodes (5): hefesto, description, mode, model, tools

### Community 92 - "prometeo"
Cohesion: 0.40
Nodes (5): prometeo, description, mode, model, tools

### Community 94 - "hefesto"
Cohesion: 0.40
Nodes (5): hefesto, description, mode, model, tools

### Community 95 - "prometeo"
Cohesion: 0.40
Nodes (5): prometeo, description, mode, model, tools

### Community 96 - "atlas"
Cohesion: 0.50
Nodes (4): atlas, description, mode, model

### Community 97 - "SDD Progress Ledger — Fase 3 Dashboard con Graficos"
Cohesion: 0.50
Nodes (3): Results, SDD Progress Ledger — Fase 3 Dashboard con Graficos, Tasks

### Community 98 - "atlas"
Cohesion: 0.50
Nodes (4): atlas, description, mode, model

### Community 99 - "opencode.json"
Cohesion: 0.50
Nodes (3): plugin, $schema, .opencode/plugins/graphify.js

### Community 100 - "SDD Progress Ledger — Fase 3 Dashboard con Graficos"
Cohesion: 0.50
Nodes (3): Results, SDD Progress Ledger — Fase 3 Dashboard con Graficos, Tasks

## Knowledge Gaps
- **820 isolated node(s):** `$schema`, `.opencode/plugins/graphify.js`, `$schema`, `model`, `*` (+815 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **36 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `agent` connect `agent` to `atlas`, `opencode.json`, `edit`, `crio`, `tetis`, `hefesto`, `prometeo`?**
  _High betweenness centrality (0.002) - this node is a cross-community bridge._
- **Why does `agent` connect `agent` to `atlas`, `opencode.json`, `edit`, `crio`, `tetis`, `hefesto`, `prometeo`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Why does `useAuth()` connect `AddPurchase.tsx` to `Dashboard.tsx`, `purchases.ts`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **What connects `$schema`, `.opencode/plugins/graphify.js`, `$schema` to the rest of the system?**
  _820 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Dashboard.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.06721215663354763 - nodes in this community are weakly interconnected._
- **Should `index.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.07676767676767676 - nodes in this community are weakly interconnected._
- **Should `compilerOptions` be split into smaller, more focused modules?**
  _Cohesion score 0.06666666666666667 - nodes in this community are weakly interconnected._