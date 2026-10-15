# Tareas — Mercado Inteligente v3

## v3 — Crecimiento

### Fase 1 — Categorización automática de productos
| # | Tarea | Área | Estado |
|---|---|---|---|
| 1.1 | Definir categorías predefinidas (lácteos, panadería, carnes, etc.) | Datos | completada |
| 1.2 | Crear servicio de categorización (`src/services/categories.ts`) — mapa de palabras clave → categoría | Backend / Lógica | completada |
| 1.3 | Integrar categorización en flujo OCR (auto-asignar categoría al producto) | Backend / Lógica | completada |
| 1.4 | Integrar categorización en flujo manual (sugerir categoría al escribir nombre) | Frontend | completada |
| 1.5 | Mostrar categoría en lista de productos y historial | Frontend | completada |
| 1.6 | Agregar filtro por categoría en historial | Frontend | completada |
| 1.7 | Tests de categorización | QA | completada |

### Fase 2 — Reportes y tendencias de gasto
| # | Tarea | Área | Estado |
|---|---|---|---|
| 2.1 | Crear servicio de reportes (`src/services/reports.ts`) — gasto por categoría, tendencia mensual | Backend / Datos | completada |
| 2.2 | Crear página de Reportes (`src/pages/Reports.tsx`) | Frontend | completada |
| 2.3 | Gráfico de gasto por categoría (pie chart / donut chart) | Frontend | completada |
| 2.4 | Gráfico de tendencia mensual (evolución 6 meses vs presupuesto) | Frontend | completada |
| 2.5 | Tabla de resumen mensual (gasto, presupuesto, diferencia, top categoría) | Frontend | completada |
| 2.6 | Agregar ruta `/reports` en App.tsx y accesos rápidos en Dashboard | Arquitectura / UI | completada |
| 2.7 | Tests de reportes | QA | completada |

### Fase 3 — Notificaciones push
| # | Tarea | Área | Estado |
|---|---|---|---|
| 3.1 | Configurar Firebase Cloud Messaging (FCM) / Web Notification API | PWA / Infra | completada |
| 3.2 | Crear servicio de notificaciones (`src/services/notifications.ts`) — solicitar permiso, deduplicación | Backend / Lógica | completada |
| 3.3 | Crear lógica de alerta: presupuesto diario y mensual al 80% y 100% | Backend / Lógica | completada |
| 3.4 | Crear componente de banner in-app para alertas (fallback si no hay permiso push) | Frontend | completada |
| 3.5 | Integrar alertas en Dashboard (verificar al cargar datos) | Frontend | completada |
| 3.6 | Tests de notificaciones | QA | completada |

### Fase 4 — Compartir presupuesto familiar
| # | Tarea | Área | Estado |
|---|---|---|---|
| 4.1 | Diseñar modelo de datos: `families/{familyId}` con miembros | Arquitectura / Datos | completada |
| 4.2 | Crear servicio de familias (`src/services/families.ts`) — crear, unirse, listar miembros | Backend / Lógica | completada |
| 4.3 | Crear página de configuración familiar (`src/pages/Family.tsx`) | Frontend | completada |
| 4.4 | Modificar compras para asociar a familyId | Backend / Lógica | completada |
| 4.5 | Modificar presupuesto diario para ser compartido (lectura de familyId) | Backend / Lógica | completada |
| 4.6 | Dashboard muestra compras de todos los miembros | Frontend | completada |
| 4.7 | Firestore rules para acceso familiar | Seguridad / Backend | completada |
| 4.8 | Tests de familia | QA | completada |

### Fase 5 — Exportar historial a CSV/PDF
| # | Tarea | Área | Estado |
|---|---|---|---|
| 5.1 | Instalar librería de exportación (ej: jsPDF o html2canvas + jsPDF) | Dependencias | completada |
| 5.2 | Crear servicio de exportación (`src/services/export.ts`) — generar CSV | Backend / Lógica | completada |
| 5.3 | Crear servicio de exportación PDF con formato | Backend / Lógica | completada |
| 5.4 | Agregar botón de exportar en historial (CSV) | Frontend | completada |
| 5.5 | Agregar botón de exportar en reportes (PDF) | Frontend | completada |
| 5.6 | Tests de exportación | QA | completada |

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
