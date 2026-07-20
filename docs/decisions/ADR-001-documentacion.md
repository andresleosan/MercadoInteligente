# ADR-001: Reorganización de Documentación del Repositorio

**Fecha:** 2026-07-20
**Estado:** Aceptada
**Decisor:** Andrés Santiago (Product Owner)
**Agente ejecutor:** Cronos (Agencia Los Titanes)

---

## Contexto

El proyecto Mercado Inteligente había acumulado 16 archivos de documentación .md en la raíz del repositorio, junto con configuraciones, carpetas de agentes y artefactos generados. Esto causaba:

- Ruido visual significativo al navegar la raíz
- Dificultad para identificar archivos de configuración vs. documentación
- Falta de estructura profesional para escalabilidad
- Referencias rotas entre documentos
- Mezcla de documentación operativa, técnica y de producto

---

## Decisión

Reorganizar toda la documentación en una estructura jerárquica bajo `docs/` con subcarpetas temáticas, manteniendo solo archivos esenciales de desarrollo en la raíz.

### Estructura adoptada:

```
docs/
├── agency/          # Agencia Los Titanes (workflow, perfiles)
├── architecture/    # Decisiones técnicas (stack, rearquitectura)
├── audits/          # Auditorías del proyecto
├── development/     # Desarrollo y operaciones (build, firebase, lecciones)
├── implementation/  # Planes de implementación
├── product/         # Definición de producto (brief, productos)
├── reports/         # Reportes generados
├── decisions/       # Architecture Decision Records (ADR)
├── roadmap/         # Tareas y planificación
└── superpowers/     # Skills de Superpowers
```

### Archivos en raíz (solo esenciales):

- `README.md` — Punto de entrada principal
- `package.json` — Dependencias
- `vite.config.ts` — Configuración de build
- `vitest.config.ts` — Configuración de tests
- `tsconfig.json` — TypeScript
- `firebase.json` — Firebase
- `firestore.rules` — Reglas de Firestore
- `firestore.indexes.json` — Índices
- Configuraciones de herramientas (eslint, postcss, tailwind, etc.)

---

## Consecuencias Positivas

1. **Raíz limpia:** De 42+ entradas a ~20 entradas esenciales
2. **Navegación intuitiva:** Cada tipo de documentación tiene su lugar
3. **Escalabilidad:** Nueva documentación se agrega en la subcarpeta correcta
4. **Referencias consistentes:** Todos los enlaces actualizados y verificados
5. **Build y tests:** Funcionando correctamente después de la reorganización
6. **Profesionalismo:** Estructura estándar para proyectos enterprise

---

## Consecuencias Negativas

1. **Ruptura de enlaces existentes:** Referencias en documentos externos podrían romperse
2. **Curva de aprendizaje:** Desarrolladores nuevos deben familiarizarse con la estructura
3. **Mantenimiento:** Requiere discipline para mantener la estructura organizada

---

## Criterios para Futuras Decisiones

1. **Documentación nueva:** Siempre en `docs/` subcarpeta apropiada
2. **Archivos temporales:** Nunca en raíz, usar `docs/reports/` o `.tmp/`
3. **Configuraciones:** Solo en raíz si son requeridas por herramientas de build
4. **Artefactos generados:** En `docs/reports/` o carpetas específicas
5. **Agentes IA:** Configuración en `.opencode/`, documentación en `docs/agency/`

---

## Referencias

- [docs/README.md](../README.md) — Mapa maestro de documentación
- [docs/reports/REPORTE-REORGANIZACION.md](../reports/REPORTE-REORGANIZACION.md) — Reporte detallado
