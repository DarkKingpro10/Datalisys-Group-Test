export const dashboardRoutes = {
	overview: "/overview",
	rankings: "/rankings",
	audit: "/audit",
} as const;

export type DashboardRouteKey = keyof typeof dashboardRoutes;

export const dashboardSidebarRoutes: {
	key: DashboardRouteKey;
	label: string;
	href: string;
	resetFilters?: boolean;
}[] = [
	{ key: "overview", label: "Overview", href: dashboardRoutes.overview },
	{ key: "rankings", label: "Rankings", href: dashboardRoutes.rankings },
	{ key: "audit", label: "Audit Payments", href: dashboardRoutes.audit, resetFilters: true },
];
