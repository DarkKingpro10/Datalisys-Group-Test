import type { DashboardFilters, Grain, RankingMetric } from "@/features/dashboard/types/dashboard";

type SearchParamsInput = Record<string, string | string[] | undefined>;
const INITIAL_DATASET_FROM = "2016-08-31";

function toDateInput(value: Date): string {
	const year = value.getUTCFullYear();
	const month = `${value.getUTCMonth() + 1}`.padStart(2, "0");
	const day = `${value.getUTCDate()}`.padStart(2, "0");
	return `${year}-${month}-${day}`;
}

function getStringParam(params: SearchParamsInput, key: string): string | undefined {
	const value = params[key];
	if (Array.isArray(value)) {
		return value[0];
	}
	return value;
}

export function getDefaultDateRange() {
	const toDate = new Date();

	return {
		from: INITIAL_DATASET_FROM,
		to: toDateInput(toDate),
	};
}

export function parseDashboardFilters(params: SearchParamsInput): DashboardFilters {
	const defaultRange = getDefaultDateRange();
	const grainParam = getStringParam(params, "grain");
	const metricParam = getStringParam(params, "metric");
	const limitRaw = Number(getStringParam(params, "limit") ?? "10");

	const grain: Grain = grainParam === "week" ? "week" : "day";
	const metric: RankingMetric = metricParam === "revenue" ? "revenue" : "gmv";
	const limit = Number.isNaN(limitRaw) ? 10 : Math.min(Math.max(limitRaw, 1), 100);

	const from = getStringParam(params, "from") ?? defaultRange.from;
	const to = getStringParam(params, "to") ?? defaultRange.to;
	const customerState = getStringParam(params, "customer_state") || undefined;
	const orderStatus = getStringParam(params, "order_status") || undefined;
	const productCategoryName = getStringParam(params, "product_category_name") || undefined;

	return {
		from,
		to,
		customerState,
		orderStatus,
		productCategoryName,
		grain,
		metric,
		limit,
	};
}

export function filtersToApiQuery(filters: DashboardFilters): URLSearchParams {
	const params = new URLSearchParams();
	params.set("from", filters.from);
	params.set("to", filters.to);
	params.set("grain", filters.grain);
	params.set("metric", filters.metric);
	params.set("limit", String(filters.limit));

	if (filters.customerState) {
		params.set("customer_state", filters.customerState);
	}

	if (filters.orderStatus) {
		params.set("order_status", filters.orderStatus);
	}

	if (filters.productCategoryName) {
		params.set("product_category_name", filters.productCategoryName);
	}

	return params;
}

export function filtersToUrlQuery(filters: DashboardFilters): URLSearchParams {
	const params = new URLSearchParams();
	params.set("from", filters.from);
	params.set("to", filters.to);
	params.set("grain", filters.grain);
	params.set("metric", filters.metric);
	params.set("limit", String(filters.limit));

	if (filters.customerState) {
		params.set("customer_state", filters.customerState);
	}

	if (filters.orderStatus) {
		params.set("order_status", filters.orderStatus);
	}

	if (filters.productCategoryName) {
		params.set("product_category_name", filters.productCategoryName);
	}

	return params;
}