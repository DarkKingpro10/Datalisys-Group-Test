import { Suspense } from "react";
import { getFiltersMetadata } from "@/features/dashboard/api/dashboard-api";
import { GlobalFiltersForm } from "@/features/dashboard/components/global-filters-form";
import { GlobalFiltersSkeleton } from "@/features/dashboard/components/global-filters-skeleton";
import { KpiSection } from "@/features/dashboard/components/overview/kpi-section";
import { KpiSectionSkeleton } from "@/features/dashboard/components/overview/kpi-section-skeleton";
import { OverviewApiDebug } from "@/features/dashboard/components/overview/overview-api-debug";
import { TrendSection } from "@/features/dashboard/components/overview/trend-section";
import { TrendSectionSkeleton } from "@/features/dashboard/components/overview/trend-section-skeleton";
import { parseDashboardFilters } from "@/features/dashboard/lib/dashboard-filters";

type PageProps = {
	searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function getIsDebugEnabled(params: Record<string, string | string[] | undefined>) {
	const rawValue = params.debug_api;
	const value = Array.isArray(rawValue) ? rawValue[0] : rawValue;
	return value === "1";
}

export default function OverviewPage({ searchParams }: PageProps) {
	return (
		<Suspense
			fallback={
				<div className="space-y-4">
					<GlobalFiltersSkeleton />
					<KpiSectionSkeleton />
					<TrendSectionSkeleton />
				</div>
			}
		>
			<OverviewRuntimeContent searchParams={searchParams} />
		</Suspense>
	);
}

async function OverviewRuntimeContent({ searchParams }: PageProps) {
	const params = await searchParams;
	const filters = parseDashboardFilters(params);
	const debugEnabled = getIsDebugEnabled(params);
	const metadata = await getFiltersMetadata();

	return (
		<div className="space-y-4">
			<GlobalFiltersForm filters={filters} metadata={metadata} />

			<Suspense fallback={<KpiSectionSkeleton />}>
				<KpiSection filters={filters} />
			</Suspense>

			<Suspense fallback={<TrendSectionSkeleton />}>
				<TrendSection filters={filters} />
			</Suspense>

			{debugEnabled ? <OverviewApiDebug filters={filters} /> : null}
		</div>
	);
}