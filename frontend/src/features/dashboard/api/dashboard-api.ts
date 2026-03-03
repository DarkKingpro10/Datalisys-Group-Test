import { filtersToQuery } from "@/features/dashboard/lib/dashboard-filters";
import { cacheLife, cacheTag } from "next/cache";
import { dashboardCacheTags } from "@/features/dashboard/config/cache-tags";
import type {
	DashboardFilters,
	KpiResult,
	MetadataItem,
	TimeSeriesPoint,
	TopProduct,
} from "@/features/dashboard/types/dashboard";
import { resolveAPIURL } from "@/shared/utils/resolve-api";

type FetchOptions = {
	revalidate?: number;
	timeoutMs?: number;
};


async function fetchApi<T>(path: string, options?: FetchOptions): Promise<T> {
	const controller = new AbortController();
	const timeoutMs = options?.timeoutMs ?? 10000;
	const timeout = setTimeout(() => controller.abort(), timeoutMs);
	const baseUrl = resolveAPIURL().replace(/\/+$/, "");
	const normalizedPath = path.startsWith("/") ? path : `/${path}`;
	const url = `${baseUrl}${normalizedPath}`;

	let response: Response;

	try {
		const fetchOptions: RequestInit & { next?: { revalidate: number } } = {
			signal: controller.signal,
		};

		if (typeof options?.revalidate === "number") {
			fetchOptions.next = { revalidate: options.revalidate };
		}

		response = await fetch(url, fetchOptions);
	} catch (error) {
		clearTimeout(timeout);

		if (error instanceof Error && error.name === "AbortError") {
			throw new Error(`Timeout al consultar backend (${timeoutMs}ms) en ${path}`);
		}

		throw new Error(`No se pudo conectar con el backend en ${url} ${error}`);
	}

	clearTimeout(timeout);

	if (!response.ok) {
		throw new Error(`Error ${response.status} al consultar ${path}`);
	}

	return response.json() as Promise<T>;
}

export async function getKpis(filters: DashboardFilters): Promise<KpiResult> {
	const params = filtersToQuery(filters);
	return fetchApi<KpiResult>(`/kpis?${params.toString()}`, { revalidate: 60 });
}

export async function getRevenueTrend(filters: DashboardFilters): Promise<TimeSeriesPoint[]> {
	const params = filtersToQuery(filters);
	return fetchApi<TimeSeriesPoint[]>(`/trend/revenue?${params.toString()}`, { revalidate: 60 });
}

export async function getTopProducts(filters: DashboardFilters): Promise<TopProduct[]> {
	const params = filtersToQuery(filters);
	return fetchApi<TopProduct[]>(`/rankings/products?${params.toString()}`, { revalidate: 60 });
}

export async function getOrderStatuses(): Promise<MetadataItem[]> {
	"use cache";
	cacheLife("hours");
	cacheTag(dashboardCacheTags.metaOrderStatuses);
	return fetchApi<MetadataItem[]>("/meta/order-statuses");
}

export async function getCustomerStates(): Promise<MetadataItem[]> {
	"use cache";
	cacheLife("hours");
	cacheTag(dashboardCacheTags.metaCustomerStates);
	return fetchApi<MetadataItem[]>("/meta/customer-states");
}

export async function getProductCategories(): Promise<MetadataItem[]> {
	"use cache";
	cacheLife("hours");
	cacheTag(dashboardCacheTags.metaProductCategories);
	return fetchApi<MetadataItem[]>("/meta/product-categories");
}

export async function getFiltersMetadata() {
	const safe = async (promise: Promise<MetadataItem[]>) => {
		try {
			return await promise;
		} catch {
			return [] as MetadataItem[];
		}
	};

	const [orderStatuses, customerStates, productCategories] = await Promise.all([
		safe(getOrderStatuses()),
		safe(getCustomerStates()),
		safe(getProductCategories()),
	]);

	return {
		orderStatuses,
		customerStates,
		productCategories,
	};
}