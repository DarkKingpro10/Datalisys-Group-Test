import { Suspense } from "react";
import { getFiltersMetadata } from "@/features/dashboard/api/dashboard-api";
import { GlobalFiltersForm } from "@/features/dashboard/components/global-filters-form";
import { GlobalFiltersSkeleton } from "@/features/dashboard/components/global-filters-skeleton";
import { RankingTable } from "@/features/dashboard/components/rankings/ranking-table";
import { RankingsApiDebug } from "@/features/dashboard/components/rankings/rankings-api-debug";
import { RankingTableSkeleton } from "@/features/dashboard/components/rankings/ranking-table-skeleton";
import { parseDashboardFilters } from "@/features/dashboard/lib/dashboard-filters";

type PageProps = {
	searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function getIsDebugEnabled(params: Record<string, string | string[] | undefined>) {
	const rawValue = params.debug_api;
	const value = Array.isArray(rawValue) ? rawValue[0] : rawValue;
	return value === "1";
}

export default function RankingsPage({ searchParams }: PageProps) {
	return (
		<Suspense
			fallback={
				<div className="space-y-4">
					<GlobalFiltersSkeleton withRankingControls />
					<RankingTableSkeleton />
				</div>
			}
		>
			<RankingsRuntimeContent searchParams={searchParams} />
		</Suspense>
	);
}

async function RankingsRuntimeContent({ searchParams }: PageProps) {
	const params = await searchParams;
	const filters = parseDashboardFilters(params);
	const debugEnabled = getIsDebugEnabled(params);
	const metadata = await getFiltersMetadata();

	return (
		<div className="space-y-4">
			<GlobalFiltersForm filters={filters} metadata={metadata} showRankingControls />

			<Suspense fallback={<RankingTableSkeleton />}>
				<RankingTable filters={filters} />
			</Suspense>

			{debugEnabled ? <RankingsApiDebug filters={filters} /> : null}
		</div>
	);
}