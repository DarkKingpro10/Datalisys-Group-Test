import { getTopProducts } from "@/features/dashboard/api/dashboard-api";
import { DataBlockError } from "@/features/dashboard/components/data-block-error";
import { formatCurrency, formatInteger } from "@/features/dashboard/lib/format";
import type { DashboardFilters } from "@/features/dashboard/types/dashboard";

type Props = {
	filters: DashboardFilters;
};

export async function RankingTable({ filters }: Props) {
	let products;

	try {
		products = await getTopProducts(filters);
	} catch {
		return <DataBlockError title="No se pudo cargar el ranking de productos" />;
	}

	if (products.length === 0) {
		return (
			<section className="rounded-2xl border border-border bg-surface p-4">
				<h2 className="text-base font-semibold">Top productos</h2>
				<p className="mt-2 text-sm text-muted">No hay datos para los filtros seleccionados.</p>
			</section>
		);
	}

	return (
		<section className="rounded-2xl border border-border bg-surface p-4">
			<div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
				<h2 className="text-base font-semibold">Top productos</h2>
				<span className="text-xs text-muted">Ordenado por {filters.metric.toUpperCase()}</span>
			</div>

			<div className="overflow-x-auto">
				<table className="min-w-full text-sm">
					<thead>
						<tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted">
							<th className="px-2 py-2">#</th>
							<th className="px-2 py-2">Product ID</th>
							<th className="px-2 py-2">Categoría</th>
							<th className="px-2 py-2">GMV</th>
							<th className="px-2 py-2">Revenue</th>
							<th className="px-2 py-2">Orders</th>
						</tr>
					</thead>
					<tbody>
						{products.map((product, index) => (
							<tr key={`${product.product_id}-${index}`} className="border-b border-border/60">
								<td className="px-2 py-2 text-muted">{index + 1}</td>
								<td className="px-2 py-2 font-medium">{product.product_id}</td>
								<td className="px-2 py-2 text-muted">{product.product_category_name ?? "N/A"}</td>
								<td className="px-2 py-2">{formatCurrency(product.gmv)}</td>
								<td className="px-2 py-2">{formatCurrency(product.revenue)}</td>
								<td className="px-2 py-2">{formatInteger(product.orders)}</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</section>
	);
}
