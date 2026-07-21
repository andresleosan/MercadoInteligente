# Plan de solución de la auditoría

Documento de trabajo para corregir los hallazgos más importantes detectados en la auditoría funcional del proyecto.

## 1. Bloqueo crítico de autenticación local

### Problema

La app no permite usar Auth con emuladores en navegador porque la CSP de `index.html` no autoriza `localhost:9099` ni `localhost:8085`.

### Evidencia

- [index.html](../../index.html#L7)
- Reproducción real en navegador con `VITE_USE_FIREBASE_EMULATOR=true`

### Solución

1. Extender `connect-src` para permitir `http://localhost:9099` y `http://localhost:8085` en desarrollo.
2. Mantener la restricción para producción.
3. Validar login y registro contra emuladores antes de desplegar.

### Verificación

- Registrar usuario nuevo en `/register`.
- Confirmar navegación a `/`.
- Ejecutar el e2e de autenticación contra emulador.

## 2. Inconsistencia de fechas en compras

### Problema

La UI guarda `purchaseDate`, pero historial y analítica filtran por `createdAt`, lo que oculta compras registradas con fecha manual.

### Evidencia

- [src/pages/AddPurchase.tsx](../../src/pages/AddPurchase.tsx#L195)
- [src/services/purchases.ts](../../src/services/purchases.ts#L35)
- [src/services/purchases.ts](../../src/services/purchases.ts#L83)
- [src/services/analytics.ts](../../src/services/analytics.ts#L35)

### Solución

1. Definir una sola fuente de verdad para el calendario de compras.
2. Si la fecha elegida por el usuario es la semántica de negocio, usar `purchaseDate` en historial y analítica mensual.
3. Dejar `createdAt` solo para ordenamiento y auditoría técnica.
4. Agregar pruebas para compras con fecha retroactiva.

### Verificación

- Crear una compra con fecha distinta al día actual.
- Confirmar que aparece en el mes correcto en historial y gráficos.

## 3. Desalineación de storage

### Problema

Los recibos se suben a Supabase, pero el proyecto declara reglas de Firebase Storage.

### Evidencia

- [src/services/storage.ts](../../src/services/storage.ts#L1)
- [storage.rules](../../storage.rules#L1)
- [README.md](../../README.md)

### Solución

1. Elegir un único proveedor para archivos de recibos.
2. Si se mantiene Supabase, documentarlo como dependencia oficial y eliminar la expectativa de Firebase Storage para ese flujo.
3. Si se migra a Firebase Storage, adaptar la implementación y las reglas.
4. Revisar políticas de acceso público/privado de los recibos.

### Verificación

- Subir un recibo desde OCR.
- Confirmar que la URL resultante es accesible solo según la política definida.

## 4. Off-by-one en gasto diario

### Problema

El cálculo de gasto diario itera un día de más.

### Evidencia

- [src/services/analytics.ts](../../src/services/analytics.ts#L181)

### Solución

1. Cambiar el bucle para cubrir exactamente `daysBack` días.
2. Añadir test unitario para el último día del rango.

### Verificación

- Comparar la serie generada con el rango esperado de 30 días.

## 5. Workflow de QA en Windows

### Problema

El script `test:e2e:full` no es confiable en Windows por la composición de comandos.

### Evidencia

- [package.json](../../package.json#L17)

### Solución

1. Separar el arranque de emuladores, Vite y Playwright en tareas independientes.
2. Si se mantiene un comando único, usar una estrategia portable para Windows y Unix.
3. Documentar el flujo recomendado de QA local.

### Verificación

- Correr emuladores.
- Correr la app.
- Ejecutar Playwright sin depender de un solo comando compuesto.

## Orden recomendado

1. Desbloquear CSP para emuladores.
2. Corregir la semántica de fecha de compras.
3. Alinear el storage con una única arquitectura.
4. Reparar el off-by-one de analítica.
5. Endurecer el workflow de QA en Windows.
