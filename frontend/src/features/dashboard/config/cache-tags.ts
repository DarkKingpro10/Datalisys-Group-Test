export const dashboardCacheTags = {
	metaOrderStatuses: "dashboard:meta:order-statuses",
	metaCustomerStates: "dashboard:meta:customer-states",
	metaProductCategories: "dashboard:meta:product-categories",
} as const;

export const allDashboardMetaTags = [
	dashboardCacheTags.metaOrderStatuses,
	dashboardCacheTags.metaCustomerStates,
	dashboardCacheTags.metaProductCategories,
];

export type DashboardMetaTag = (typeof allDashboardMetaTags)[number];