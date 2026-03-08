
# Frontend — Commercial KPI Dashboard

## Propósito

Este frontend implementa un dashboard comercial para visualizar KPIs, tendencias y rankings, consumiendo exclusivamente la API del backend. El objetivo es ofrecer una interfaz clara, responsiva y robusta para la toma de decisiones basada en datos.

## Stack Tecnológico

- **Next.js 16**: Framework React para SSR y SSG, con soporte para Cache Components.
- **TypeScript**: Tipado estático y contratos robustos.
- **Tailwind CSS v4**: Estilos utilitarios y diseño responsivo.
- **TanStack Table**: Renderizado y ordenamiento de tablas.
- **Recharts**: Visualización de series temporales y comparativas.
- **Zustand**: Gestión de estado para UI (sidebar, filtros).

## Decisiones de negocio y técnicas

- **Arquitectura screaming**: Separación clara entre dominio (dashboard) y componentes transversales (`shared`). El código específico de negocio reside en `features/dashboard`.
- **Filtros globales por URL**: Los filtros (rango de fechas, estado, categoría, región) se gestionan por query string y se comparten entre vistas, garantizando consistencia y navegación fluida.
- **Cache Components**: La metadata (estados, categorías) se cachea con `cacheLife("hours")` y tags, evitando llamadas redundantes y permitiendo invalidación controlada.
- **Tolerancia a fallos**: Cada bloque de datos (KPIs, tendencia, rankings) maneja errores de API de forma aislada, mostrando estados de error sin romper la ruta completa.
- **Dark mode persistente**: El modo de visualización se selecciona y persiste en localStorage, con script temprano para evitar flash visual.

## Estructura del proyecto

- `src/app/(dashboard)`: Vistas principales (`overview`, `rankings`), layout, error boundary.
- `src/features/dashboard`: Lógica de negocio, API tipada, componentes de visualización, filtros, utilidades.
- `src/shared`: Componentes transversales (skeleton, error panel, theme toggle), configuración y store de UI.

## Integración con backend

- Endpoints consumidos: `/kpis`, `/trend/revenue`, `/rankings/products`, `/meta/order-statuses`, `/meta/customer-states`, `/meta/product-categories`.
- Cliente tipado en `src/features/dashboard/api/dashboard-api.ts`, con timeout y manejo de errores para SSR.

## Filtros y navegación

- Filtros aplicados: `from`, `to`, `customer_state`, `order_status`, `product_category_name`, `grain`, `metric`, `limit`.
- El sidebar y la navegación preservan los filtros actuales, permitiendo compartir estado entre vistas.
- El formulario de filtros se sincroniza con la URL y permite reinicio al estado inicial.


## Tablas y visualización de datos

Se implementaron dos tipos de tablas según el volumen y la lógica requerida:

- **TanStack Table**: Utilizada en la vista de rankings (`src/features/dashboard/components/rankings/ranking-table.tsx`) y auditoría, permite ordenamiento, paginación y manejo avanzado de datos. Es adecuada para conjuntos de datos medianos a grandes donde se requiere interacción y lógica de UI.
- **Tabla nativa simple**: Usada en la vista de tendencia cuando el usuario selecciona la opción "Tabla" (`src/features/dashboard/components/overview/trend-section.tsx`). Esta tabla no implementa lógica adicional, ya que el volumen de datos es bajo y se prioriza la simplicidad y velocidad de renderizado.

Esta decisión permite optimizar la experiencia según el caso de uso: TanStack Table para rankings/auditoría y tabla nativa para visualización rápida de series temporales.

## UX y diseño

- Skeletons y `Suspense` para loading en bloques de datos.
- Responsive global: sidebar colapsable, header adaptable, controles apilables en móvil/tablet.
- Selector de visualización en tendencia (gráfico/tabla), con chart combinado (Revenue + Orders).

## Manejo de errores

- Error boundaries por ruta (`src/app/(dashboard)/error.tsx`).
- Panel de error ocultable y opción de reintentar.
- Debug API: panel de inspección activable por query param (`debug_api=1`).

## Variables de entorno

- Configuración validada en `src/shared/config/env.ts`.
- Variables: `NEXT_PUBLIC_API_URL`, `NEXT_SERVER_API_URL` (SSR en Docker), `NEXT_PUBLIC_FRONTEND_PORT`.

## Comandos principales

Desde la carpeta `frontend`:

```bash
pnpm dev      # Desarrollo local
pnpm lint     # Linting
pnpm build    # Build de producción
```

