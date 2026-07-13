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
  - **Storage:** almacenamiento de fotos de tickets
  - **Hosting:** despliegue estático gratuito
- **Por qué:** Stack definido por el usuario. 0 USD/mes — Firebase free tier cubre auth, 1GB Firestore, 5GB Storage, 10GB Hosting/mes.

## Base de datos
- **Motor:** Cloud Firestore (NoSQL, document-based)
- **Estructura prevista:**
  - `users/{uid}` — perfil del usuario
  - `users/{uid}/budgets/{month}` — presupuesto mensual
  - `users/{uid}/purchases/{purchaseId}` — compras registradas
- **Por qué:** Firestore es parte del ecosistema Firebase elegido. Su modelo de documentos encaja bien con la estructura jerárquica usuario → presupuesto → compras. Free tier suficiente para v1.

## Hosting / Despliegue
- **Servicio:** Firebase Hosting (gratuito, 10GB/mes)
- **CI/CD:** `firebase deploy` manual en v1. Se evalúa GitHub Actions para v2 si el proyecto crece.
- **Por qué:** Integración nativa con el stack Firebase. Despliegue con un comando.

## Testing
- **Framework:** Vitest (integración nativa con Vite)
- **Componentes:** @testing-library/react
- **¿Playwright MCP habilitado?:** No en v1 — el foco es testing unitario y de componentes. Se evalúa para v2 si hay flujos complejos de UI.

## Integraciones externas
- **Tesseract.js OCR** — corre 100% en el navegador, no es una API externa
- Sin otras integraciones en v1

## Gestión de secretos
- ¿`.gitignore` instalado y completado?: pendiente (se completa en A3)
- ¿`.env.example` documentado?: pendiente (se crea con el código)
- **Mecanismo:** Firebase config (API keys del lado del cliente, restringidas por dominio en Firebase Console). Sin secretos del lado del servidor en v1 (Firestore Security Rules reemplazan backend tradicional).

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
| Jápeto | No | `firebase deploy` manual es suficiente en v1 |

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
