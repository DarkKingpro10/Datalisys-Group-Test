import { getRevenueTrend } from "@/features/dashboard/api/dashboard-api";
import { DataBlockError } from "@/features/dashboard/components/data-block-error";
import { formatCurrency, formatInteger } from "@/features/dashboard/lib/format";
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

	const latestPoints = series.slice(-14);

	return (
		<section className="rounded-2xl border border-border bg-surface p-4">
			<div className="mb-3 flex items-center justify-between">
				<h2 className="text-base font-semibold">Tendencia Revenue + Orders</h2>
				<span className="text-xs text-muted">{filters.grain === "day" ? "Diaria" : "Semanal"}</span>
			</div>
			<div className="overflow-x-auto">
				<table className="min-w-full border-separate border-spacing-y-2 text-sm">
					<thead>
						<tr className="text-left text-xs uppercase tracking-wide text-muted">
							<th className="px-2">Fecha</th>
							<th className="px-2">Revenue</th>
							<th className="px-2">Orders</th>
						</tr>
					</thead>
					<tbody>
						{latestPoints.map((point) => (
							<tr key={point.date} className="rounded-lg bg-surface-soft">
								<td className="rounded-l-lg px-2 py-2">{point.date}</td>
								<td className="px-2 py-2">{formatCurrency(point.revenue)}</td>
								<td className="rounded-r-lg px-2 py-2">{formatInteger(point.orders)}</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</section>
	);
}