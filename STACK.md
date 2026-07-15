# STACK — Mercado Inteligente

## Resumen
PWA de control de gastos de mercado con React + TypeScript + Firebase, registro por foto con OCR y presupuesto mensual.

## Nivel del proyecto
**2 — Medio**
- CRUD completo con autenticación, base de datos, PWA offline, OCR y dashboard
- No es empresarial (sin multi-tenancy, sin transacciones financieras reales, sin módulos complejos)
- **¿Workflow completo de Superpowers activado?:** No — skills puntuales donde aporten valor (`test-driven-development` para lógica crítica, `verification-before-completion` para cierre de tareas)

## Entorno
- Versión de OpenCode: no verificada en esta sesión (comando `opencode --version` sin respuesta)
- ¿Coincide con la versión verificada del core (v1.17.15)?: pendiente de confirmar
- Superpowers: disponible globalmente, se activa puntualmente según tarea
- **Ejecución continua (Capa 2):** `@bybrawe/opencode-loop@0.5.15` — plugin de continuación automática para Nivel 2, instalado globalmente con versión fijada

## Frontend
- **Tecnología:** React 18 + TypeScript + Vite
- **PWA:** vite-plugin-pwa (service worker, manifest, offline)
- **OCR:** Tesseract.js (corre en el navegador, 0 costo)
- **Gráficos:** Recharts (dashboard de gasto vs. presupuesto)
- **Routing:** React Router v6
- **Estilos:** Tailwind CSS (productividad + diseño mobile-first)
- **Por qué:** Stack definido por el usuario. Vite es el bundler estándar moderno para React. Tesseract.js permite OCR sin backend ni costo. Tailwind acelera el desarrollo mobile-first (PWA se usa principalmente desde el celular).

## Backend
- **Tecnología:** Firebase
  - **Auth:** autenticación de usuarios (email/password, Google)
  - **Firestore:** base de datos NoSQL para presupuestos, compras y productos
  - ~~**Storage:** almacenamiento de fotos de tickets~~ → migrado a Supabase Storage (v2)
- **Por qué:** Stack definido por el usuario. 0 USD/mes — Firebase free tier cubre auth, 1GB Firestore, 5GB Storage. Hosting migrado a Cloudflare Pages (ver sección Hosting / Despliegue).

## Base de datos
- **Motor:** Cloud Firestore (NoSQL, document-based)
- **Estructura prevista:**
  - `users/{uid}` — perfil del usuario
  - `users/{uid}/budgets/{month}` — presupuesto mensual
  - `users/{uid}/purchases/{purchaseId}` — compras registradas
- **Por qué:** Firestore es parte del ecosistema Firebase elegido. Su modelo de documentos encaja bien con la estructura jerárquica usuario → presupuesto → compras. Free tier suficiente para v1.

## Hosting / Despliegue
- **Servicio:** Cloudflare Pages (gratuito, ancho de banda ilimitado, builds automáticos desde Git)
- **CI/CD:** Cloudflare Pages auto-deploy desde `master` en GitHub. Build command: `npm run build`, output: `dist/`. Sin archivo de config en el repo (configurado vía dashboard de Cloudflare).
- **Headers:** Sin COOP/COEP personalizados. `signInWithPopup` funciona con BCG unrestricted (default).
- **Migración:** Originalmente planificado para Firebase Hosting (v1). Migrado a Cloudflare Pages por mayor ancho de banda y build automático desde Git. `firebase.json` se mantiene para Firestore/Storage rules y emulators; la sección `hosting` ya no se usa para deploy.
- **Por qué:** Cloudflare Pages es gratuito con ancho de banda ilimitado y CI/CD nativo desde GitHub, sin configuración de workflows manual. Firebase Hosting sigue siendo el backend (Auth/Firestore/Storage), solo el hosting estático migró.

## Testing
- **Framework:** Vitest (integración nativa con Vite)
- **Componentes:** @testing-library/react
- **¿Playwright MCP habilitado?:** No en v1 — el foco es testing unitario y de componentes. Se evalúa para v2 si hay flujos complejos de UI.

## Integraciones externas
- **Tesseract.js OCR** — corre 100% en el navegador, no es una API externa
- **Supabase Storage** — almacenamiento de fotos de tickets (reemplazó Firebase Storage)

## Gestión de secretos
- ¿`.gitignore` instalado y completado?: sí
- ¿`.env.example` documentado?: sí
- **Mecanismo:** Firebase config (API keys del lado del cliente, restringidas por dominio en Firebase Console) + Supabase anon key (restringida por RLS). Sin secretos del lado del servidor.

## Titanes activos para este proyecto
| Titán | Participa | Motivo |
|---|---|---|
| Cronos | Sí | Orquestador |
| Ceo | Sí | Priorización y alcance |
| Atlas | Sí | Arquitectura y estructura |
| Prometeo | Sí | Lógica de negocio, Firebase integration |
| Hefesto | Sí | UI React, PWA, responsive |
| Tetis | Sí | Diseño de esquema Firestore |
| Temis | Sí | Pruebas con Vitest |
| Crío | Sí | Auth, Firestore Security Rules |
| Océano | No | Sin integraciones externas en v1 (Tesseract.js corre local) |
| Hiperión | No | Optimización no es prioridad en v1 |
| Jápeto | Sí | Deploy a Cloudflare Pages (auto-deploy desde Git) |

## Convenciones de código
- **Estilo:** ESLint + Prettier (configuración estándar de Vite + React)
- **Estructura de carpetas:**
  ```
  src/
  ├── components/    # componentes UI reutilizables
  ├── pages/         # vistas principales (Dashboard, Registro, Historial)
  ├── hooks/         # custom hooks
  ├── services/      # wrappers de Firebase (auth, firestore, storage)
  ├── utils/         # utilidades (OCR, cálculos, formato)
  ├── types/         # tipos TypeScript
  └── config/        # configuración de Firebase y app
  ```
- **Nomenclatura:** PascalCase para componentes, camelCase para funciones/variables, kebab-case para archivos de utilidades
