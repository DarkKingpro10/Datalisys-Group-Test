export const dashboardRoutes = {
	overview: "/overview",
	rankings: "/rankings",
} as const;

export type DashboardRouteKey = keyof typeof dashboardRoutes;

export const dashboardSidebarRoutes: { key: DashboardRouteKey; label: string; href: string }[] = [
	{ key: "overview", label: "Overview", href: dashboardRoutes.overview },
	{ key: "rankings", label: "Rankings", href: dashboardRoutes.rankings },
];