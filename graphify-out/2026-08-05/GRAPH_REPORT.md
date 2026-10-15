# Graph Report - .  (2026-08-05)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 595 nodes · 1124 edges · 34 communities (31 shown, 3 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 6 edges (avg confidence: 0.65)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `a6c210d5`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- index.ts
- PurchaseHistory.tsx
- categories.test.ts
- devDependencies
- firebase.ts
- scripts
- analytics.ts
- bash
- Dashboard.tsx
- compilerOptions
- stores.ts
- categoryMapping.test.ts
- useOCR.ts
- compilerOptions
- helpers.ts
- dailyBudget.ts
- AddPurchase
- manifest.json
- storeBudget.ts
- MonthNavigator.tsx
- voice.test.ts
- run-e2e-full.mjs
- .opencode/opencode.json
- graphify.js
- vite-env.d.ts

## God Nodes (most connected - your core abstractions)
1. `compilerOptions` - 19 edges
2. `useAuth()` - 18 edges
3. `getCurrentDate()` - 15 edges
4. `compilerOptions` - 14 edges
5. `scripts` - 13 edges
6. `useCategories()` - 13 edges
7. `getCurrentMonth()` - 13 edges
8. `bash` - 12 edges
9. `DarkButton()` - 12 edges
10. `db` - 11 edges

## Surprising Connections (you probably didn't know these)
- `Dashboard()` --indirect_call--> `getCurrentDate()`  [INFERRED]
  src/pages/Dashboard.tsx → src/utils/date.ts
- `Dashboard()` --indirect_call--> `getCurrentMonth()`  [INFERRED]
  src/pages/Dashboard.tsx → src/utils/date.ts
- `CategoryBadgeProps` --references--> `Category`  [EXTRACTED]
  src/components/CategoryBadge.tsx → src/types/index.ts
- `DailyBudgetCard()` --calls--> `useDailyBudget()`  [EXTRACTED]
  src/components/DailyBudgetCard.tsx → src/hooks/useDailyBudget.ts
- `Props` --references--> `ParsedItem`  [EXTRACTED]
  src/components/OCRReview.tsx → src/types/index.ts

## Import Cycles
- None detected.

## Communities (34 total, 3 thin omitted)

### Community 0 - "index.ts"
Cohesion: 0.07
Nodes (40): OCRCapture(), Props, OCRReview(), Props, ProductEditor(), Props, StoreBadge(), StoreBadgeProps (+32 more)

### Community 1 - "PurchaseHistory.tsx"
Cohesion: 0.09
Nodes (34): DailyBudgetCard(), Props, ProtectedRoute(), ProtectedRouteProps, StoreAnalytics(), Props, TodayPurchases(), EmptyState() (+26 more)

### Community 2 - "categories.test.ts"
Cohesion: 0.08
Nodes (40): CATEGORY_COLORS, CategoryBadge(), CategoryBadgeProps, DEFAULT_COLORS, CategoryManager(), CategoryManagerProps, CategorySelector(), CategorySelectorProps (+32 more)

### Community 3 - "devDependencies"
Cohesion: 0.04
Nodes (47): autoprefixer, cross-env, eslint, @eslint/js, eslint-plugin-react-hooks, eslint-plugin-react-refresh, firebase-tools, globals (+39 more)

### Community 4 - "firebase.ts"
Cohesion: 0.08
Nodes (26): Analytics, App(), Dashboard, Login, Register, StoreManager, DarkCard(), DarkCardProps (+18 more)

### Community 5 - "scripts"
Cohesion: 0.06
Nodes (34): firebase, lucide-react, dependencies, firebase, lucide-react, react, react-dom, react-router-dom (+26 more)

### Community 6 - "analytics.ts"
Cohesion: 0.11
Nodes (27): ChartsContent(), MONTH_LABELS, monthToLabel(), PIE_COLORS, Props, FrequencyData, Props, StoreChartData (+19 more)

### Community 7 - "bash"
Cohesion: 0.06
Nodes (31): agent, Cronos V3, cat *credential*, cat *.env*, cat *secret*, env, git push --force*, history (+23 more)

### Community 8 - "Dashboard.tsx"
Cohesion: 0.10
Nodes (17): ChartsContent, ChartsSection(), Props, ExpandableCard(), ExpandableCardProps, KpiCard(), KpiCardProps, formatLabel() (+9 more)

### Community 9 - "compilerOptions"
Cohesion: 0.07
Nodes (29): DOM, DOM.Iterable, ES2020, src, src/**/*.spec.ts, src/**/*.spec.tsx, src/**/*.test.ts, src/**/*.test.tsx (+21 more)

### Community 10 - "stores.ts"
Cohesion: 0.24
Nodes (19): StoreData, useStores(), createStore(), deleteStore(), deserializeEmbeddedStore(), getStores(), isNotFound(), isPermissionDenied() (+11 more)

### Community 11 - "categoryMapping.test.ts"
Cohesion: 0.15
Nodes (16): KEYWORD_MAP, normalizeProductName(), suggestCategory(), getCategoryForProduct(), getMappingsByCategory(), normalizeProductName(), saveCategoryMapping(), dbState (+8 more)

### Community 12 - "useOCR.ts"
Cohesion: 0.21
Nodes (12): OCRStatus, useOCR(), OCRResult, runOCR(), compressImage(), uploadReceiptImage(), supabase, isLowConfidence() (+4 more)

### Community 13 - "compilerOptions"
Cohesion: 0.11
Nodes (17): ES2023, vite.config.ts, compilerOptions, allowImportingTsExtensions, isolatedModules, lib, module, moduleDetection (+9 more)

### Community 14 - "helpers.ts"
Cohesion: 0.42
Nodes (7): addManualPurchase(), clearFirestore(), createEmulatorUser(), generateTestEmail(), loginWithEmail(), registerUser(), setBudget()

### Community 15 - "dailyBudget.ts"
Cohesion: 0.36
Nodes (12): useDailyBudget(), getAllDailyBudgets(), getDailyBudget(), getDailyBudgetFromUserDoc(), isPermissionDeniedError(), normalizeDailyBudget(), setDailyBudget(), setDailyBudgetInUserDoc() (+4 more)

### Community 16 - "AddPurchase"
Cohesion: 0.17
Nodes (9): AddPurchase(), mocks, routerMocks, mockProcessTicket, mockReset, routerMocks, mockReset, mockStartListening (+1 more)

### Community 17 - "manifest.json"
Cohesion: 0.22
Nodes (8): background_color, description, display, icons, name, short_name, start_url, theme_color

### Community 18 - "storeBudget.ts"
Cohesion: 0.43
Nodes (7): getBudgetId(), getStoreBudgets(), getStoreBudgetsByStore(), setStoreBudget(), validateAmount(), validateDate(), StoreBudget

### Community 20 - "voice.test.ts"
Cohesion: 0.33
Nodes (4): mockAbort, mockSpeechRecognition, mockStart, mockStop

### Community 21 - "run-e2e-full.mjs"
Cohesion: 0.70
Nodes (4): isPortOpen(), main(), start(), waitForPort()

### Community 22 - ".opencode/opencode.json"
Cohesion: 0.50
Nodes (3): plugin, $schema, .opencode/plugins/graphify.js

## Knowledge Gaps
- **213 isolated node(s):** `$schema`, `.opencode/plugins/graphify.js`, `$schema`, `model`, `rm -rf *` (+208 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **3 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `useAuth()` connect `PurchaseHistory.tsx` to `index.ts`, `AddPurchase`, `firebase.ts`, `Dashboard.tsx`?**
  _High betweenness centrality (0.019) - this node is a cross-community bridge._
- **Why does `devDependencies` connect `devDependencies` to `scripts`?**
  _High betweenness centrality (0.015) - this node is a cross-community bridge._
- **Why does `db` connect `firebase.ts` to `PurchaseHistory.tsx`, `categories.test.ts`, `analytics.ts`, `stores.ts`, `categoryMapping.test.ts`, `useOCR.ts`, `dailyBudget.ts`, `storeBudget.ts`?**
  _High betweenness centrality (0.011) - this node is a cross-community bridge._
- **What connects `$schema`, `.opencode/plugins/graphify.js`, `$schema` to the rest of the system?**
  _213 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `index.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.06554019457245264 - nodes in this community are weakly interconnected._
- **Should `PurchaseHistory.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.08708272859216255 - nodes in this community are weakly interconnected._
- **Should `categories.test.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.07616892911010557 - nodes in this community are weakly interconnected._