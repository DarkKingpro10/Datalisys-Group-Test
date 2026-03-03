import { Skeleton } from "@/shared/components/skeleton";

type Props = {
	withRankingControls?: boolean;
};

export function GlobalFiltersSkeleton({ withRankingControls = false }: Props) {
	const secondRowCount = withRankingControls ? 4 : 3;

	return (
		<section className="rounded-2xl border border-border bg-surface p-4">
			<div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
				{Array.from({ length: 4 }).map((_, index) => (
					<Skeleton key={index} className="h-11 w-full" />
				))}
			</div>
			<div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
				{Array.from({ length: secondRowCount }).map((_, index) => (
					<Skeleton key={index} className="h-11 w-full" />
				))}
			</div>
		</section>
	);
}