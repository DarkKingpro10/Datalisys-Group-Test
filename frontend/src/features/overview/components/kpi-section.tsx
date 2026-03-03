import { getKpis } from "@/features/dashboard/api/dashboard-api";
import { DataBlockError } from "@/features/dashboard/components/data-block-error";
import {
	formatCurrency,
	formatDecimal,
	formatInteger,
	formatRate,
} from "@/features/dashboard/lib/format";
import type { DashboardFilters } from "@/features/dashboard/types/dashboard";

type Props = {
	filters: DashboardFilters;
};

export async function KpiSection({ filters }: Props) {
	let data;

	try {
		data = await getKpis(filters);
	} catch {
		return <DataBlockError title="No se pudieron cargar los KPIs" />;
	}

	const cards = [
		{ label: "GMV", value: formatCurrency(data.gmv) },
		{ label: "Revenue", value: formatCurrency(data.revenue) },
		{ label: "Orders", value: formatInteger(data.orders) },
		{ label: "AOV", value: formatCurrency(data.aov) },
		{ label: "IPO", value: formatDecimal(data.ipo) },
		{ label: "Cancel Rate", value: formatRate(data.cancel_rate) },
		{ label: "On-time Rate", value: formatRate(data.on_time_rate) },
	];

	return (
		<section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
			{cards.map((card) => (
				<article
					key={card.label}
					className="rounded-2xl border border-border bg-surface p-4"
				>
					<p className="text-xs font-medium uppercase tracking-wide text-muted">
						{card.label}
					</p>
					<p className="mt-2 text-xl font-semibold md:text-2xl">
						{card.value}
					</p>
				</article>
			))}
		</section>
	);
}
