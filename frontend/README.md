# Frontend — Commercial KPI Dashboard

Frontend en Next.js 16 + TypeScript + Tailwind v4 para visualizar KPIs comerciales desde el backend.

## Fase implementada

Se completó la base funcional del dashboard con enfoque de arquitectura screaming:

- Shell principal con sidebar y navegación
- Rutas de negocio separadas (`Overview` y `Rankings`)
- Capa de acceso a datos tipada para API backend
- Filtros globales por URL
- Render con `Suspense` + skeletons (sin texto de "cargando" en bloques)
- Dark mode (`light` / `dark` / `system`) con persistencia

## Arquitectura (screaming)

```text
src/
  app/
    (dashboard)/
      error.tsx
      layout.tsx
      overview/page.tsx
      rankings/page.tsx
    layout.tsx
    page.tsx
    globals.css
  shared/
    components/
      route-error-panel.tsx
      skeleton.tsx
      theme-toggle.tsx
    config/
      env.ts
    hooks/
      use-store.ts
    providers/
      theme-provider.tsx
    store/
      theme.store.ts
  features/
    dashboard/
      api/
        dashboard-api.ts
      components/
        api-debug-panel.tsx
        dashboard-sidebar.tsx
        data-block-error.tsx
        global-filters-form.tsx
        global-filters-skeleton.tsx
      config/
        routes.ts
      lib/
        dashboard-filters.ts
        format.ts
      types/
        dashboard.ts
    overview/
      components/
        kpi-section.tsx
        kpi-section-skeleton.tsx
        trend-section.tsx
        trend-section-skeleton.tsx
    rankings/
      components/
        ranking-table.tsx
        ranking-table-skeleton.tsx
```

## Rutas implementadas

- `/overview`: KPIs + tendencia (Revenue/Orders)
- `/rankings`: tabla de top productos
- `/`: redirección a `/overview`

Archivo de rutas central:

- `src/features/dashboard/config/routes.ts`

## Integración con backend

Se consumen estos endpoints (base `NEXT_PUBLIC_API_URL`):

- `/kpis`
- `/trend/revenue`
- `/rankings/products`
- `/meta/order-statuses`
- `/meta/customer-states`
- `/meta/product-categories`

Cliente tipado:

- `src/features/dashboard/api/dashboard-api.ts`
- Incluye timeout y manejo de fallo de red para evitar bloqueos largos en SSR.

Cache Components para metadata:

- `getOrderStatuses`, `getCustomerStates` y `getProductCategories` usan `use cache`.
- Se aplica `cacheLife("hours")` para vida útil de caché.
- Se aplican tags con `cacheTag` por recurso de metadata.
- En esas funciones no se usa `fetch(..., { next: { revalidate } })` para evitar mezclar políticas de caché; la expiración se controla únicamente con `cacheLife` y la invalidación on-demand por tags.

Tags usadas:

- `dashboard:meta:order-statuses`
- `dashboard:meta:customer-states`
- `dashboard:meta:product-categories`

Revalidación on-demand:

- Endpoint: `POST /api/revalidate/dashboard-meta`
- Header opcional de seguridad: `x-revalidate-token` (si defines `NEXT_REVALIDATE_TOKEN`).
- Body opcional: `{ "tags": ["dashboard:meta:order-statuses"] }`
- Si no envías `tags`, revalida todas las tags de metadata.
- Internamente usa `revalidateTag(tag, "max")`.

## Filtros globales

Se aplican por query string y se envían al backend:

- `from`
- `to`
- `customer_state`
- `order_status`
- `product_category_name`
- `grain`
- `metric`
- `limit`

Los filtros de catálogo se renderizan con `select` y usan `code` como valor enviado al backend:

- Estado de orden (`order_status`)
- Estado de cliente (`customer_state`)
- Categoría de producto (`product_category_name`)

Rango inicial por defecto al entrar al dashboard:

- `from = 2016-08-31`
- `to = fecha actual`

Este rango inicial asegura que la primera carga muestre datos históricos del dataset.

Formulario implementado con `useActionState` (sin `useState` para submit de formulario):

- `src/features/dashboard/components/global-filters-form.tsx`

## Loading UX

Se usa `Suspense` con skeletons en bloques de datos:

- KPIs (overview)
- Tendencia (overview)
- Tabla de rankings

Componente reutilizable:

- `src/shared/components/skeleton.tsx`
- `src/features/dashboard/components/global-filters-skeleton.tsx`

Nota de criterio arquitectónico:

- `shared` queda reservado para piezas realmente transversales (tema, skeleton base, route error panel, hooks genéricos).
- Todo lo específico del dominio dashboard vive en `features/dashboard/*`.

Tolerancia a fallos de API por bloque:

- Los componentes de `features/overview/components` y `features/rankings/components` encapsulan su `try/catch`.
- Si un endpoint falla, se muestra estado de error en el bloque (`DataBlockError`) sin romper la ruta completa.

Manejo de error por ruta:

- Se añadió `src/app/(dashboard)/error.tsx` como error boundary del segmento.
- El panel de error es ocultable y permite `Reintentar` usando `reset()`.
- Componente reutilizable: `src/shared/components/route-error-panel.tsx`.

Debug temporal de API (inspección de payload):

- Puedes activar paneles de depuración agregando `debug_api=1` en la URL.
- Ejemplo: `/overview?debug_api=1` o `/rankings?debug_api=1`.
- Muestra URL consultada + JSON devuelto por backend o mensaje de error.

## Dark mode

- Modo por defecto: `system`
- Selección manual: claro/oscuro/sistema
- Persistencia en `localStorage`
- Script temprano en layout para evitar flash visual
- Hook `use-store` para evitar desajustes de hidratación con Zustand

## Variables de entorno

Se valida la configuración en:

- `src/shared/config/env.ts`

Variables usadas:

- `NEXT_PUBLIC_API_URL`
- `NEXT_SERVER_API_URL` (opcional; recomendado en Docker para SSR, por ejemplo `http://backend:8000/api`)
- `NEXT_PUBLIC_FRONTEND_PORT` (opcional, default `3000`)

Nota de resolución de URL:

- En server-side rendering se usa `SERVER_API_URL` para evitar llamadas a `localhost` dentro del contenedor de frontend.
- En cliente/navegador se usa `NEXT_PUBLIC_API_URL`.

## Comandos

En carpeta `frontend`:

```bash
pnpm dev
pnpm lint
pnpm build
```

## Siguiente fase sugerida

- Integrar librería de gráfico (Recharts) para reemplazar tabla de tendencia por chart dual
- Integrar TanStack Table para sorting/filtering/paginación avanzada en rankings
- Añadir estados empty/error por widget con UX final de producto
