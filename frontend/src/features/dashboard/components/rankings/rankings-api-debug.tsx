import { getTopProducts } from "@/features/dashboard/api/dashboard-api";
import { ApiDebugPanel } from "@/features/dashboard/components/api-debug-panel";
import { filtersToApiQuery } from "@/features/dashboard/lib/dashboard-filters";
import type { DashboardFilters, TopProduct } from "@/features/dashboard/types/dashboard";
import { envConfig } from "@/shared/config/env";

type Props = {
	filters: DashboardFilters;
};

type DebugResult<T> = {
	payload?: T;
	errorMessage?: string;
};

async function resolveRankings(filters: DashboardFilters): Promise<DebugResult<TopProduct[]>> {
	try {
		const payload = await getTopProducts(filters);
		return { payload };
	} catch (error) {
		return { errorMessage: error instanceof Error ? error.message : "Error desconocido en rankings" };
	}
}

export async function RankingsApiDebug({ filters }: Props) {
	const query = filtersToApiQuery(filters).toString();
	const url = `${envConfig.API_URL}/rankings/products?${query}`;
	const result = await resolveRankings(filters);

	return (
		<ApiDebugPanel
			title="Respuesta /rankings/products"
			url={url}
			payload={result.payload}
			errorMessage={result.errorMessage}
		/>
	);
}
