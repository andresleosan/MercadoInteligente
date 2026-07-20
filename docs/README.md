# Documentación — Mercado Inteligente

Mapa completo de documentación del proyecto. Esta carpeta concentra toda la documentación técnica, de producto y de agencia.

---

## Estructura

```
docs/
├── README.md                    ← Este archivo (mapa maestro)
│
├── agency/                      ← Agencia Los Titanes
│   ├── AGENCY.md               ← Workflow y reglas de la agencia
│   ├── AGENTS.md               ← Configuración de graphify
│   └── titanes/                ← Perfiles de cada Titán
│       ├── atlas.md            ← Arquitectura y Stack
│       ├── coeus.md            ← CEO / Producto
│       ├── crio.md             ← Seguridad
│       ├── hefesto.md          ← Frontend
│       ├── prometeo.md         ← Backend
│       ├── temis.md            ← QA
│       └── tetis.md            ← Bases de Datos
│
├── architecture/                ← Decisiones técnicas
│   ├── STACK.md                ← Stack tecnológico (React, Firebase, etc.)
│   ├── REARQUITECTURA.md       ← Plan de rearquitectura v3
│   └── IMPACTO_COMPONENTES.md  ← Impacto de cambios en componentes
│
├── audits/                      ← Auditorías del proyecto
│   ├── AUDITORIA.md            ← Auditoría general (14 hallazgos)
│   └── AUDITORIA-SEGURIDAD.md  ← Auditoría de seguridad
│
├── development/                 ← Desarrollo y operaciones
│   ├── BUILD.md                ← Auditoría de build y calidad
│   ├── FIREBASE.md             ← Auditoría de Firebase
│   ├── LECCIONES.md            ← Lecciones aprendidas
│   └── MEJORAS.md              ← Mejoras de auditoría (8 items)
│
├── implementation/              ← Planes de implementación
│   ├── LOGIN_GOOGLE.md         ← Auditoría de Google Login
│   ├── MIGRACION_FIRESTORE.md  ← Migración de Firestore
│   └── PLAN_IMPLEMENTACION.md  ← Plan de implementación v2
│
├── product/                     ← Definición de producto
│   ├── BRIEF.md                ← Brief del proyecto y roadmap
│   └── PRODUCTOS.md            ← Auditoría de registro de productos
│
├── decisions/                   ← Architecture Decision Records
│   └── ADR-001-documentacion.md ← ADR de reorganización
│
├── reports/                     ← Reportes generados
│   ├── REPORTE-REORGANIZACION.md
│   └── REPORTE-OPTIMIZACION-FINAL.md
│
├── roadmap/                     ← Tareas y planificación
│   ├── tasks.md                ← Tareas v1 (completadas)
│   ├── tasks-v2.md             ← Tareas v2 (completadas)
│   ├── tasks-v3.md             ← Tareas v3 (planificación)
│   └── test-output.txt         ← Output de tests
│
└── superpowers/                 ← Skills de Superpowers
    ├── plans/                  ← Planes de implementación
    └── specs/                  ← Especificaciones de diseño
```

**Nota:** La carpeta `ai/` (conocimiento de agentes) está en la raíz del proyecto, no en docs/. Ver `ai/README.md` para más detalles.

---

## Archivos en Raíz

Los siguientes archivos permanecen en la raíz del proyecto:

| Archivo | Descripción |
|---------|-------------|
| `roadmap/tasks.md` | Tareas v1 (completadas) |
| `roadmap/tasks-v2.md` | Tareas v2 (completadas) |
| `roadmap/tasks-v3.md` | Tareas v3 (planificación) |
| `package.json` | Dependencias del proyecto |
| `vite.config.ts` | Configuración de Vite |
| `vitest.config.ts` | Configuración de tests |
| `tsconfig.json` | Configuración de TypeScript |
| `firebase.json` | Configuración de Firebase |
| `firestore.rules` | Reglas de Firestore |
| `firestore.indexes.json` | Índices de Firestore |

---

## Guía para Desarrolladores

### Por dónde empezar

1. **Entender el producto:** Leer `product/BRIEF.md`
2. **Entender el stack:** Leer `architecture/STACK.md`
3. **Entender el workflow:** Leer `agency/AGENCY.md`
4. **Ver tareas actuales:** Leer `roadmap/tasks-v3.md`

### Flujo de trabajo

1. Seleccionar tarea de `tasks-v3.md`
2. Implementar siguiendo el stack de `architecture/STACK.md`
3. Ejecutar ciclo de autocrítica (seguridad → pruebas → rendimiento)
4. Actualizar estado en `tasks-v3.md`
5. Documentar lecciones en `development/LECCIONES.md`

---

## Guía para Agentes IA

### Cronos (Orquestador)

- **Archivo principal:** `agency/AGENCY.md`
- **Workflow:** Ciclo de autocrítica completo
- **Skills:** Todas las skills del sistema
- **Responsabilidad:** Orquestar todas las fases del desarrollo

### Atlas (Arquitecto)

- **Perfil:** `agency/titanes/atlas.md`
- **Archivo de referencia:** `architecture/STACK.md`
- **Responsabilidad:** Decisiones de stack y arquitectura

### Prometeo (Backend)

- **Perfil:** `agency/titanes/prometeo.md`
- **Archivo de referencia:** `architecture/STACK.md`
- **Responsabilidad:** Lógica de negocio y capa de datos

### Hefesto (Frontend)

- **Perfil:** `agency/titanes/hefesto.md`
- **Archivo de referencia:** `architecture/STACK.md`
- **Responsabilidad:** Interfaz de usuario y experiencia visual

### Temis (QA)

- **Perfil:** `agency/titanes/temis.md`
- **Archivo de referencia:** `product/BRIEF.md`
- **Responsabilidad:** Pruebas y validación

### Crío (Seguridad)

- **Perfil:** `agency/titanes/crio.md`
- **Archivo de referencia:** `audits/AUDITORIA-SEGURIDAD.md`
- **Responsabilidad:** Auditoría de seguridad

### Tetis (Bases de Datos)

- **Perfil:** `agency/titanes/tetis.md`
- **Archivo de referencia:** `architecture/STACK.md`
- **Responsabilidad:** Modelo de datos y esquemas

### Coeus (Producto)

- **Perfil:** `agency/titanes/coeus.md`
- **Archivo de referencia:** `product/BRIEF.md`
- **Responsabilidad:** Requisitos y priorización

---

## Referencias Rápidas

| Necesito... | Voy a... |
|-------------|----------|
| Entender qué construir | `product/BRIEF.md` |
| Verificar stack técnico | `architecture/STACK.md` |
| Ver tareas pendientes | `roadmap/tasks-v3.md` |
| Revisar auditorías | `audits/AUDITORIA.md` |
| Ver mejoras aplicadas | `development/MEJORAS.md` |
| Aprender de errores | `development/LECCIONES.md` |
| Verificar build | `development/BUILD.md` |
| Configurar Firebase | `development/FIREBASE.md` |
| Plan de rearquitectura | `architecture/REARQUITECTURA.md` |

---

**Última actualización:** 2026-07-20
