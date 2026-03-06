import { getRevenueTrend } from "@/features/dashboard/api/dashboard-api";
import { DataBlockError } from "@/features/dashboard/components/data-block-error";
import { TrendSectionView } from "@/features/dashboard/components/overview/trend-section-view";
import type { DashboardFilters } from "@/features/dashboard/types/dashboard";

type Props = {
	filters: DashboardFilters;
};

export async function TrendSection({ filters }: Props) {
	let series;

	try {
		series = await getRevenueTrend(filters);
	} catch {
		return <DataBlockError title="No se pudo cargar la tendencia" />;
	}


	return <TrendSectionView series={series} grain={filters.grain} />;
}
