import { Skeleton } from "@/shared/components/skeleton";

export function KpiSectionSkeleton() {
	return (
		<section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
			{Array.from({ length: 7 }).map((_, index) => (
				<article key={index} className="rounded-2xl border border-border bg-surface p-4">
					<Skeleton className="h-3 w-24" />
					<Skeleton className="mt-3 h-8 w-28" />
				</article>
			))}
		</section>
	);
}
