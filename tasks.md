# Tareas — Mercado Inteligente

## MVP (v1)

### Fase 1 — Fundación
| # | Tarea | Titán | Estado |
|---|---|---|---|
| 1.1 | Inicializar proyecto con Vite + React + TypeScript + Tailwind CSS | Atlas | aprobada |
| 1.2 | Configurar Firebase (Auth, Firestore, Storage) y crear `src/services/firebase.ts` | Atlas + Prometeo | aprobada |
| 1.3 | Configurar `.gitignore` completo para el stack | Atlas | aprobada |
| 1.4 | Definir esquema Firestore y tipos TypeScript (`src/types/`) | Tetis | aprobada |
| 1.5 | Configurar Vitest + Testing Library | Atlas | aprobada |

### Fase 2 — Auth
| # | Tarea | Titán | Estado |
|---|---|---|---|
| 2.1 | Implementar servicio de autenticación (`src/services/auth.ts`) — login, registro, logout con email/password y Google | Prometeo | aprobada |
| 2.2 | Crear páginas de Login y Registro | Hefesto | aprobada |
| 2.3 | Implementar ruta protegida (redirect a login si no hay sesión) | Hefesto + Prometeo | aprobada |
| 2.4 | Auditoría de seguridad de auth | Crío | aprobada |
| 2.5 | Tests de auth | Temis | aprobada |

### Fase 3 — Presupuesto
| # | Tarea | Titán | Estado |
|---|---|---|---|
| 3.1 | Implementar servicio de presupuesto (`src/services/budget.ts`) — crear, leer, actualizar presupuesto mensual | Prometeo | aprobada |
| 3.2 | Crear página/componente de configuración de presupuesto mensual | Hefesto | aprobada |
| 3.3 | Tests de presupuesto | Temis | aprobada |

### Fase 4 — Registro de compras
| # | Tarea | Titán | Estado |
|---|---|---|---|
| 4.1 | Implementar servicio de compras (`src/services/purchases.ts`) — agregar, listar, eliminar compras | Prometeo | aprobada |
| 4.2 | Crear formulario de registro manual de compra (nombre, precio, cantidad) | Hefesto | aprobada |
| 4.3 | Crear lista de compras del mes (historial) | Hefesto | aprobada |
| 4.4 | Tests de registro de compras | Temis | aprobada |

### Fase 5 — Dashboard
| # | Tarea | Titán | Estado |
|---|---|---|---|
| 5.1 | Calcular total acumulado y presupuesto restante en tiempo real | Prometeo + Hefesto | aprobada |
| 5.2 | Crear componente de barra de progreso (gasto vs. presupuesto) | Hefesto | aprobada |
| 5.3 | Crear página de Dashboard | Hefesto | aprobada |
| 5.4 | Tests de dashboard | Temis | aprobada |

### Fase 6 — Cierre v1
| # | Tarea | Titán | Estado |
|---|---|---|---|
| 6.1 | Auditoría de seguridad completa (Firestore Rules, inputs, dependencias) | Crío | aprobada |
| 6.2 | Tests de integración — flujo completo (registro → login → presupuesto → compra → dashboard) | Temis | aprobada |
| 6.3 | Revisión final de arquitectura | Atlas | aprobada |
| 6.4 | Deploy a Firebase Hosting | Jápeto | completada |
