import { Skeleton } from "@/shared/components/skeleton";

export function RankingTableSkeleton() {
	return (
		<section className="rounded-2xl border border-border bg-surface p-4">
			<Skeleton className="h-5 w-40" />
			<div className="mt-4 space-y-2">
				{Array.from({ length: 10 }).map((_, index) => (
					<Skeleton key={index} className="h-9 w-full" />
				))}
			</div>
		</section>
	);
}