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

## Uso por Rol

### Orquestación
- **Lee:** `context/PROJECT.md`, `memory/STATUS.md`
- **Actualiza:** `memory/STATUS.md`, `memory/LESSONS.md`
- **Genera:** `reports/`

### Arquitectura
- **Lee:** `context/PROJECT.md`
- **Referencia:** `docs/architecture/STACK.md`

### Backend
- **Lee:** `context/PROJECT.md`
- **Referencia:** `docs/architecture/STACK.md`

### Frontend
- **Lee:** `context/PROJECT.md`
- **Referencia:** `docs/architecture/STACK.md`

### QA
- **Lee:** `context/PROJECT.md`
- **Referencia:** `docs/product/BRIEF.md`

### Seguridad
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
| `context/PROJECT.md` | Al cambiar stack/features | AI / Desarrollador |
| `memory/STATUS.md` | Al final de cada sesión | AI / Desarrollador |
| `memory/LESSONS.md` | Al aprender algo nuevo | AI / Desarrollador |
| `skills/` | Al crear/completar tareas | AI / Desarrollador |
| `reports/` | Al generar reportes | AI / Desarrollador |

---

## Referencias

| Recurso | Ubicación |
|---------|-----------|
| Documentación del proyecto | `docs/README.md` |
| Knowledge graph | `graphify-out/` |
| Configuración OpenCode | `.opencode/` |

---

**Última actualización:** 2026-07-20
