# AI — Conocimiento de Agentes

Centraliza todo el conocimiento, contexto y memoria de los agentes IA del proyecto.

---

## Estructura

```
ai/
├── README.md              ← Este archivo (mapa maestro)
│
├── context/               ← Contexto del proyecto
│   └── PROJECT.md         ← Descripción completa del proyecto
│
├── memory/                ← Memoria de agentes
│   ├── STATUS.md          ← Estado actual del proyecto
│   └── LESSONS.md         ← Lecciones aprendidas
│
├── prompts/               ← Prompts de agentes
│   └── (prompts aquí)
│
├── skills/                ← Skills y briefs de tareas
│   ├── task-*-brief.md    ← Briefs de tareas
│   ├── task-*-diff.md     ← Diffs de implementación
│   ├── task-*-report.md   ← Reportes de tareas
│   └── progress.md        ← Progreso general
│
├── evaluations/           ← Evaluaciones de calidad
│   └── (evaluaciones aquí)
│
└── reports/               ← Reportes generados por agentes
    └── (reportes aquí)
```

---

## Uso por Agente

### Cronos (Orquestador)
- **Lee:** `context/PROJECT.md`, `memory/STATUS.md`
- **Actualiza:** `memory/STATUS.md`, `memory/LESSONS.md`
- **Genera:** `reports/`

### Atlas (Arquitecto)
- **Lee:** `context/PROJECT.md`
- **Referencia:** `docs/architecture/STACK.md`

### Prometeo (Backend)
- **Lee:** `context/PROJECT.md`
- **Referencia:** `docs/architecture/STACK.md`

### Hefesto (Frontend)
- **Lee:** `context/PROJECT.md`
- **Referencia:** `docs/architecture/STACK.md`

### Temis (QA)
- **Lee:** `context/PROJECT.md`
- **Referencia:** `docs/product/BRIEF.md`

### Crío (Seguridad)
- **Lee:** `context/PROJECT.md`
- **Referencia:** `docs/audits/AUDITORIA-SEGURIDAD.md`

---

## Flujo de Información

```
Proyecto → context/PROJECT.md
    ↓
Agentes → memory/STATUS.md
    ↓
Implementación → skills/task-*.md
    ↓
Resultados → reports/
    ↓
Aprendizaje → memory/LESSONS.md
```

---

## Mantenimiento

| Archivo | Frecuencia | Responsable |
|---------|------------|-------------|
| `context/PROJECT.md` | Al cambiar stack/features | Cronos |
| `memory/STATUS.md` | Al final de cada sesión | Cronos |
| `memory/LESSONS.md` | Al aprender algo nuevo | Cronos |
| `skills/` | Al crear/completar tareas | Cronos |
| `reports/` | Al generar reportes | Cronos |

---

## Referencias

| Recurso | Ubicación |
|---------|-----------|
| Documentación del proyecto | `docs/README.md` |
| Workflow de agentes | `docs/agency/AGENCY.md` |
| Knowledge graph | `graphify-out/` |
| Configuración OpenCode | `.opencode/` |

---

**Última actualización:** 2026-07-20
