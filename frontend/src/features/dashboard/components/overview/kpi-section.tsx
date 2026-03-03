import { getKpis } from "@/features/dashboard/api/dashboard-api";
import { DataBlockError } from "@/features/dashboard/components/data-block-error";
import {
	formatCurrency,
	formatDecimal,
	formatInteger,
	formatKpiCurrency,
	formatRate,
} from "@/features/dashboard/lib/format";
import type { DashboardFilters } from "@/features/dashboard/types/dashboard";
import {
	IconBarcode,
	IconClock,
	IconMoneybag,
	IconPackage,
	IconPercentage,
	IconShoppingCart,
	IconTrendingUp,
} from "@tabler/icons-react";

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
		{
			label: "GMV",
			value: formatCurrency(data.gmv),
			icon: IconMoneybag,
			accent: "text-blue-400",
		},
		{
			label: "Revenue",
			value: formatCurrency(data.revenue),
			icon: IconTrendingUp,
			accent: "text-green-400",
		},
		{
			label: "Orders",
			value: formatInteger(data.orders),
			icon: IconShoppingCart,
			accent: "text-indigo-400",
		},
		{
			label: "AOV",
			value: formatCurrency(data.aov),
			icon: IconBarcode,
			accent: "text-purple-400",
		},
		{
			label: "IPO",
			value: formatDecimal(data.ipo),
			icon: IconPackage,
			accent: "text-orange-400",
		},
		{
			label: "Cancel Rate",
			value: formatRate(data.cancel_rate),
			icon: IconPercentage,
			accent: "text-red-400",
		},
		{
			label: "On-time Rate",
			value: formatRate(data.on_time_rate),
			icon: IconClock,
			accent: "text-emerald-400",
		},
	];

	return (
		<section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
			{cards.map((card) => {
				const Icon = card.icon;

				return (
					<article
						key={card.label}
						className="
              relative
              rounded-2xl
              border border-white/10
              bg-surface
              backdrop-blur
              p-6
              transition-all duration-200
              hover:border-white/20
              hover:bg-surface/50
							hover:scale-[1.02]
              hover:shadow-xl hover:shadow-blue-500/10
            "
					>

						{/* Icon pequeño en esquina */}
						<div className={`absolute top-4 right-4 ${card.accent}`}>
							<Icon size={18} strokeWidth={1.5} />
						</div>

						<p className="text-xs uppercase tracking-wide text-slate-400 font-medium">
							{card.label}
						</p>

						<p className="mt-3 text-xl font-semibold text-white tabular-nums">
							{card.value}
						</p>

						{(card.label === "GMV" ||
							card.label === "Revenue" ||
							card.label === "AOV") && (
							<p className="text-xs text-slate-500 mt-1">BRL</p>
						)}
					</article>
				);
			})}
		</section>
	);
}
