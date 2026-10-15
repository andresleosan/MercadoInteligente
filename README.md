# Mercado Inteligente

PWA para registro de compras de mercado con control de presupuesto, OCR y análisis de gasto.

## Características

- **Registro por foto:** OCR con Tesseract.js para extraer productos y precios
- **Registro por voz:** Reconocimiento de voz para dictar compras
- **Registro manual:** Formulario para ingreso directo
- **Control de presupuesto:** Presupuesto mensual y diario con alertas
- **Dashboard:** Gráficos de gasto por categoría y tendencia
- **Historial:** Filtro por mes, categoría y tienda
- **Exportar:** CSV y PDF del historial de compras

## Stack

- React 18 + TypeScript + Vite
- Tailwind CSS + vite-plugin-pwa
- Firebase (Auth, Firestore) + Supabase Storage para tickets
- Recharts (gráficos)
- Tesseract.js (OCR)
- Vitest + @testing-library/react (tests)

## Inicio rápido

```bash
# Instalar dependencias
pnpm install

# Configurar entorno
cp .env.example .env
# Editar .env con tus credenciales de Firebase

# Ejecutar en desarrollo
pnpm dev

# Ejecutar tests
pnpm test

# Build para producción
pnpm build
```

## Documentación

Ver [docs/README.md](docs/README.md) para el mapa completo de documentación.

## Conocimiento AI

Ver [ai/README.md](ai/README.md) para contexto, memoria y skills de agentes.

## Licencia

MIT
