# BRIEF — Mercado Inteligente

## Descripción
Aplicación web PWA que permite registrar compras de mercado mediante foto, voz o texto, calculando automáticamente el gasto acumulado contra un presupuesto definido por el usuario.

## Usuarios objetivo
Personas que quieren controlar y monitorear su gasto mensual en compras de mercado/supermercado.

## Features imprescindibles (v1)
1. **Presupuesto mensual** — el usuario define un monto mensual de gasto
2. **Registro por foto** — captura de ticket/factura con la cámara
3. **OCR automático** — extracción de productos y precios desde la imagen
4. **Cantidad de unidades** — registro de unidades por producto
5. **Total acumulado** — suma de todos los gastos del mes
6. **Presupuesto restante** — diferencia entre presupuesto y gasto acumulado
7. **Historial mensual** — registro de compras por mes
8. **Dashboard básico** — visualización de gasto vs. presupuesto
9. **PWA instalable** — instalable en el celular, funciona offline

## Restricciones
- **Stack**: React + TypeScript
- **Backend**: Firebase (Auth, Firestore, Storage)
- **Hosting**: Firebase Hosting
- **Presupuesto**: 0 USD/mes (solo tiers gratuitos)

## Referencias
Sin proyectos de referencia.

## Roadmap

### MVP (v1) — Flujo principal de punta a punta
1. **Auth** — registro/login con email+password y Google (Firebase Auth)
2. **Presupuesto mensual** — crear/editar presupuesto del mes actual
3. **Registro manual de compras** — agregar productos con nombre, precio y cantidad
4. **Total acumulado y presupuesto restante** — cálculo en tiempo real
5. **Historial de compras** — lista cronológica del mes actual
6. **Dashboard básico** — barra de progreso gasto vs. presupuesto

### v2 — Diferenciadores
- Registro por foto con OCR automático (Tesseract.js)
- PWA instalable con service worker offline
- Historial multi-mes con navegación
- Dashboard con gráficos (Recharts)
- Registro por voz (Web Speech API)

### v3 — Crecimiento
- Categorización automática de productos
- Reportes y tendencias de gasto
- Notificaciones push (presupuesto por agotarse)
- Compartir presupuesto familiar
- Exportar historial a CSV/PDF
