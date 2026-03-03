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
    store/
      dashboard-ui.store.ts
  features/
    dashboard/
      api/
        dashboard-api.ts
      components/
        api-debug-panel.tsx
        dashboard-shell.tsx
        dashboard-sidebar.tsx
        data-block-error.tsx
        global-filters-form.tsx
        global-filters-skeleton.tsx
        overview/
          kpi-section.tsx
          kpi-section-skeleton.tsx
          trend-section.tsx
          trend-section-skeleton.tsx
          overview-api-debug.tsx
        rankings/
          ranking-table.tsx
          ranking-table-skeleton.tsx
          rankings-api-debug.tsx
      config/
        routes.ts
      lib/
        dashboard-filters.ts
        format.ts
      types/
        dashboard.ts
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

No se expone endpoint de revalidación on-demand en el frontend en esta versión; la metadata se refresca por política de `cacheLife("hours")`.

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

Comportamiento global entre rutas:

- La navegación del sidebar preserva los query params actuales, por lo que los filtros se comparten entre `/overview` y `/rankings`.
- Se añadió botón `Reiniciar filtros globales` en el formulario para volver al estado inicial (rango default + filtros extra vacíos + controles de ranking por defecto).
- El formulario de filtros se sincroniza visualmente con la URL al navegar o cambiar query params (evita desalineación entre estado visible y estado aplicado).
- Se corrigió el bloque de acciones del formulario para móvil (botones en columna con ancho completo) evitando overflow horizontal.
- Se reforzó responsive global del dashboard en móvil: header adaptable, toggle de tema sin desborde y encabezados de bloques (tendencia/rankings) apilables.
- Se corrigió y reaplicó el layout responsive del dashboard (`app/(dashboard)/layout.tsx`) con contención horizontal (`overflow-x-clip`) y `min-w-0` en el contenedor principal.
- Se corrigió el error de navegación bloqueada en Next.js envolviendo `DashboardSidebar` en `Suspense` con fallback en `app/(dashboard)/layout.tsx`.
- Se mejoró la distribución de filtros en tablet (`md/lg`) y se corrigió el toggle de expandir/ocultar filtros para evitar doble disparo de eventos.
- Se unificó el formulario de filtros en una sola grilla (sin separación por secciones) para mantener continuidad visual en tablet y evitar cortes de layout.
- Se implementó sidebar colapsable global con Zustand para móvil y desktop, con botón en header y expansión del contenido al ocultar el menú.
- Se ajustó el sidebar para UX de urgencia: toggle ícono-only a la izquierda del header, drawer overlay en móvil con backdrop y cierre, y ocultado desktop sin parpadeo.
- Se corrigió el warning de `blocking-route` envolviendo también en `Suspense` el `DashboardSidebar` del drawer móvil.
- Se añadió selector de visualización en tendencia (`Gráfico | Tabla`) con `Gráfico` por defecto y tabla disponible como vista alternativa.
- La vista `Gráfico` ahora usa Recharts en un chart combinado (Revenue + Orders) con doble eje Y para comparación directa.

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
- Utilidad de query unificada: `filtersToQuery` en `src/features/dashboard/lib/dashboard-filters.ts`.

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

- Los componentes de `features/dashboard/components/overview` y `features/dashboard/components/rankings` encapsulan su `try/catch`.
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
- Lógica local en `theme-toggle` (sin store/provider global)

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

