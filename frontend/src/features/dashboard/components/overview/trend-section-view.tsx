"use client";

import { useMemo, useState } from "react";
import {
	Area,
	CartesianGrid,
	ComposedChart,
	Legend,
	Line,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";
import { formatCurrency, formatInteger } from "@/features/dashboard/lib/format";
import type { Grain, TimeSeriesPoint } from "@/features/dashboard/types/dashboard";
import RevenueOrdersTable from "./revenue-orders-table";

type Props = {
	series: TimeSeriesPoint[];
	grain: Grain;
};

type ViewMode = "chart" | "table";

type TooltipEntry = {
	name?: string;
	value?: number;
	dataKey?: string;
	color?: string;
};

type TrendTooltipProps = {
	active?: boolean;
	label?: string;
	payload?: TooltipEntry[];
};

function TrendTooltip({ active, label, payload }: TrendTooltipProps) {
	if (!active || !payload || payload.length === 0) {
		return null;
	}

	return (
		<div className="rounded-lg border border-border bg-surface p-3 text-xs shadow-sm">
			<p className="mb-2 font-semibold text-foreground">{label}</p>
			{payload.map((entry) => {
				const dataKey = String(entry.dataKey ?? "");
				const value = typeof entry.value === "number" ? entry.value : 0;
				const formatted = dataKey === "revenue" ? formatCurrency(value) : formatInteger(value);

				return (
					<div key={`${dataKey}-${entry.name}`} className="flex items-center gap-2 text-muted">
						<span
							className="h-2 w-2 rounded-full"
							style={{ backgroundColor: entry.color ?? "var(--color-muted)" }}
						/>
						<span className="min-w-16">{entry.name}</span>
						<span className="font-medium text-foreground">{formatted}</span>
					</div>
				);
			})}
		</div>
	);
}

export function TrendSectionView({ series, grain }: Props) {
	const [viewMode, setViewMode] = useState<ViewMode>("chart");
	const chartData = useMemo(
		() =>
			series.map((point) => ({
				date: point.date,
				revenue: point.revenue,
				orders: point.orders,
			})),
		[series],
	);

	return (
		<section className="rounded-2xl border border-border bg-surface p-4">
			<article className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<h2 className="text-base font-semibold">Tendencia Revenue + Orders</h2>
					<p className="text-xs text-muted">{grain === "day" ? "Diaria" : "Semanal"}</p>
				</div>
				<div className="inline-flex rounded-lg border border-border bg-surface-soft p-1 text-sm">
					<button
						type="button"
						onClick={() => setViewMode("chart")}
						className={`rounded-md px-3 py-1.5 transition ${
							viewMode === "chart"
								? "bg-primary text-primary-foreground"
								: "text-muted hover:bg-surface"
						}`}
					>
						Gráfico
					</button>
					<button
						type="button"
						onClick={() => setViewMode("table")}
						className={`rounded-md px-3 py-1.5 transition ${
							viewMode === "table"
								? "bg-primary text-primary-foreground"
								: "text-muted hover:bg-surface"
						}`}
					>
						Tabla
					</button>
				</div>
			</article>

			{viewMode === "chart" ? (
				<div className="rounded-xl border border-border bg-background p-3">
					<div className="mb-3 grid gap-2 text-xs text-muted sm:grid-cols-2">
						<p>
							Revenue total: <span className="font-semibold text-foreground">{formatCurrency(chartData.reduce((acc, item) => acc + item.revenue, 0))}</span>
						</p>
						<p>
							Orders totales: <span className="font-semibold text-foreground">{formatInteger(chartData.reduce((acc, item) => acc + item.orders, 0))}</span>
						</p>
					</div>
					<div className="h-60 w-full sm:h-72">
						<ResponsiveContainer width="100%" height="100%">
							<ComposedChart data={chartData} margin={{ top: 12, right: 20, left: 8, bottom: 12 }}>
								<defs>
									<linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
										<stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.22" />
										<stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0.02" />
									</linearGradient>
								</defs>
								<CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" />
								<XAxis
									dataKey="date"
									tick={{ fill: "var(--color-muted)", fontSize: 11 }}
									axisLine={{ stroke: "var(--color-border)" }}
									tickLine={{ stroke: "var(--color-border)" }}
									interval={Math.max(0, Math.floor(chartData.length / 6))}
									angle={chartData.length > 10 ? -30 : 0}
									textAnchor={chartData.length > 10 ? "end" : "middle"}
									tickFormatter={(d) => {
										try {
											const dt = new Date(String(d));
											return grain === "day"
												? dt.toLocaleDateString(undefined, { month: "short", day: "numeric" })
												: dt.toLocaleDateString(undefined, { month: "short", day: "numeric" });
										} catch {
											return String(d);
										}
									}}
								/>
								<YAxis
									yAxisId="revenue"
									orientation="left"
									tick={{ fill: "var(--color-muted)", fontSize: 11 }}
									axisLine={{ stroke: "var(--color-border)" }}
									tickLine={{ stroke: "var(--color-border)" }}
									tickFormatter={(value) => formatCurrency(Number(value))}
									width={90}
								/>
								<YAxis
									yAxisId="orders"
									orientation="right"
									tick={{ fill: "var(--color-muted)", fontSize: 11 }}
									axisLine={{ stroke: "var(--color-border)" }}
									tickLine={{ stroke: "var(--color-border)" }}
									tickFormatter={(value) => formatInteger(Number(value))}
									width={70}
								/>
								<Tooltip content={<TrendTooltip />} />
								<Legend />
								<Area
									yAxisId="revenue"
									type="monotone"
									dataKey="revenue"
									name="Revenue"
									stroke="var(--color-primary)"
									fill="url(#revenueGradient)"
									strokeWidth={2}
									dot={false}
									activeDot={{ r: 3 }}
								/>
								<Line
									yAxisId="orders"
									type="monotone"
									dataKey="orders"
									name="Orders"
									stroke="var(--color-foreground)"
									strokeWidth={2}
									dot={{ r: 2 }}
									activeDot={{ r: 4 }}
									strokeOpacity={0.95}
								/>
							</ComposedChart>
						</ResponsiveContainer>
					</div>
				</div>
			) : (
				<RevenueOrdersTable series={series} />
				// <article className="overflow-x-auto">
				// 	<table className="min-w-full border-separate border-spacing-y-2 text-sm">
				// 		<thead>
				// 			<tr className="text-left text-xs uppercase tracking-wide text-muted">
				// 				<th className="px-2">Fecha</th>
				// 				<th className="px-2">Revenue</th>
				// 				<th className="px-2">Orders</th>
				// 			</tr>
				// 		</thead>
				// 		<tbody>
				// 			{series.map((point) => (
				// 				<tr key={point.date} className="rounded-lg bg-surface-soft">
				// 					<td className="rounded-l-lg px-2 py-2">{point.date}</td>
				// 					<td className="px-2 py-2">{formatCurrency(point.revenue)}</td>
				// 					<td className="rounded-r-lg px-2 py-2">{formatInteger(point.orders)}</td>
				// 				</tr>
				// 			))}
				// 		</tbody>
				// 	</table>
				// </article>
			)}
		</section>
	);
}
