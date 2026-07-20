# Tareas — Mercado Inteligente v3

## v3 — Crecimiento

### Fase 1 — Categorización automática de productos
| # | Tarea | Titán | Estado |
|---|---|---|---|
| 1.1 | Definir categorías predefinidas (lácteos, panadería, carnes, etc.) | Tetis | pendiente |
| 1.2 | Crear servicio de categorización (`src/services/categories.ts`) — mapa de palabras clave → categoría | Prometeo | pendiente |
| 1.3 | Integrar categorización en flujo OCR (auto-asignar categoría al producto) | Prometeo | pendiente |
| 1.4 | Integrar categorización en flujo manual (sugerir categoría al escribir nombre) | Hefesto | pendiente |
| 1.5 | Mostrar categoría en lista de productos y historial | Hefesto | pendiente |
| 1.6 | Agregar filtro por categoría en historial | Hefesto | pendiente |
| 1.7 | Tests de categorización | Temis | pendiente |

### Fase 2 — Reportes y tendencias de gasto
| # | Tarea | Titán | Estado |
|---|---|---|---|
| 2.1 | Crear servicio de reportes (`src/services/reports.ts`) — gasto por categoría, tendencia mensual | Prometeo | pendiente |
| 2.2 | Crear página de Reportes (`src/pages/Reports.tsx`) | Hefesto | pendiente |
| 2.3 | Gráfico de gasto por categoría (pie chart o bar chart) | Hefesto | pendiente |
| 2.4 | Gráfico de tendencia mensual (línea con comparativa mes anterior) | Hefesto | pendiente |
| 2.5 | Tabla de resumen mensual (gasto, presupuesto, diferencia, top categoría) | Hefesto | pendiente |
| 2.6 | Agregar ruta `/reports` en App.tsx | Atlas | pendiente |
| 2.7 | Tests de reportes | Temis | pendiente |

### Fase 3 — Notificaciones push
| # | Tarea | Titán | Estado |
|---|---|---|---|
| 3.1 | Configurar Firebase Cloud Messaging (FCM) | Atlas | pendiente |
| 3.2 | Crear servicio de notificaciones (`src/services/notifications.ts`) — solicitar permiso, guardar token | Prometeo | pendiente |
| 3.3 | Crear lógica de alerta: presupuesto diario al 80% y 100% | Prometeo | pendiente |
| 3.4 | Crear componente de banner in-app para alertas (fallback si no hay permiso push) | Hefesto | pendiente |
| 3.5 | Integrar alertas en Dashboard (verificar al cargar datos) | Hefesto | pendiente |
| 3.6 | Tests de notificaciones | Temis | pendiente |

### Fase 4 — Compartir presupuesto familiar
| # | Tarea | Titán | Estado |
|---|---|---|---|
| 4.1 | Diseñar modelo de datos: `families/{familyId}` con miembros | Tetis | pendiente |
| 4.2 | Crear servicio de familias (`src/services/families.ts`) — crear, unirse, listar miembros | Prometeo | pendiente |
| 4.3 | Crear página de configuración familiar (`src/pages/Family.tsx`) | Hefesto | pendiente |
| 4.4 | Modificar compras para asociar a familyId | Prometeo | pendiente |
| 4.5 | Modificar presupuesto diario para ser compartido (lectura de familyId) | Prometeo | pendiente |
| 4.6 | Dashboard muestra compras de todos los miembros | Hefesto | pendiente |
| 4.7 | Firestore rules para acceso familiar | Crío | pendiente |
| 4.8 | Tests de familia | Temis | pendiente |

### Fase 5 — Exportar historial a CSV/PDF
| # | Tarea | Titán | Estado |
|---|---|---|---|
| 5.1 | Instalar librería de exportación (ej: jsPDF o html2canvas + jsPDF) | Atlas | pendiente |
| 5.2 | Crear servicio de exportación (`src/services/export.ts`) — generar CSV | Prometeo | pendiente |
| 5.3 | Crear servicio de exportación PDF con formato | Prometeo | pendiente |
| 5.4 | Agregar botón de exportar en historial (CSV) | Hefesto | pendiente |
| 5.5 | Agregar botón de exportar en reportes (PDF) | Hefesto | pendiente |
| 5.6 | Tests de exportación | Temis | pendiente |

### Fase 6 — Cierre v3
| # | Tarea | Titán | Estado |
|---|---|---|---|
| 6.1 | Auditoría de seguridad de nuevas features | Crío | pendiente |
| 6.2 | Tests de integración v3 | Temis | pendiente |
| 6.3 | Optimización de performance (code splitting, lazy loading) | Hiperión | pendiente |
| 6.4 | Revisión final de arquitectura v3 | Atlas | pendiente |
| 6.5 | Deploy v3 a producción | Jápeto | pendiente |

---

## Resumen

| Fase | Descripción | Riesgo | Dependencias |
|------|-------------|--------|--------------|
| 1 | Categorización automática | BAJO | Ninguna |
| 2 | Reportes y tendencias | BAJO | Fase 1 |
| 3 | Notificaciones push | MEDIO | Ninguna |
| 4 | Compartir presupuesto familiar | ALTO | Fases 1-2 |
| 5 | Exportar CSV/PDF | BAJO | Ninguna |
| 6 | Cierre v3 | MEDIO | Fases 1-5 |

---

## Orden de ejecución recomendado

```
Fase 1 ──→ Fase 2 ──→ Fase 4
Fase 3 (independiente)
Fase 5 (independiente)
          └──→ Fase 6
```

**Nota:** Fases 3 y 5 pueden ejecutarse en paralelo con las demás, ya que son independientes.
