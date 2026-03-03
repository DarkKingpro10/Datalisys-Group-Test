import { getKpis, getRevenueTrend } from "@/features/dashboard/api/dashboard-api";
import { ApiDebugPanel } from "@/features/dashboard/components/api-debug-panel";
import { filtersToApiQuery } from "@/features/dashboard/lib/dashboard-filters";
import type { DashboardFilters, KpiResult, TimeSeriesPoint } from "@/features/dashboard/types/dashboard";
import { envConfig } from "@/shared/config/env";

type Props = {
	filters: DashboardFilters;
};

type DebugResult<T> = {
	payload?: T;
	errorMessage?: string;
};

async function resolveKpis(filters: DashboardFilters): Promise<DebugResult<KpiResult>> {
	try {
		const payload = await getKpis(filters);
		return { payload };
	} catch (error) {
		return { errorMessage: error instanceof Error ? error.message : "Error desconocido en KPIs" };
	}
}

async function resolveTrend(filters: DashboardFilters): Promise<DebugResult<TimeSeriesPoint[]>> {
	try {
		const payload = await getRevenueTrend(filters);
		return { payload };
	} catch (error) {
		return { errorMessage: error instanceof Error ? error.message : "Error desconocido en tendencia" };
	}
}

export async function OverviewApiDebug({ filters }: Props) {
	const query = filtersToApiQuery(filters).toString();
	const kpisUrl = `${envConfig.API_URL}/kpis?${query}`;
	const trendUrl = `${envConfig.API_URL}/trend/revenue?${query}`;

	const [kpisResult, trendResult] = await Promise.all([resolveKpis(filters), resolveTrend(filters)]);
	return (
		<div className="space-y-3">
			<ApiDebugPanel
				title="Respuesta /kpis"
				url={kpisUrl}
				payload={kpisResult.payload}
				errorMessage={kpisResult.errorMessage}
			/>
			<ApiDebugPanel
				title="Respuesta /trend/revenue"
				url={trendUrl}
				payload={trendResult.payload}
				errorMessage={trendResult.errorMessage}
			/>
		</div>
	);
}
