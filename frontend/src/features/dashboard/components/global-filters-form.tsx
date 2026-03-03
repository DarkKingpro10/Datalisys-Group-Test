"use client";

import { useActionState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { filtersToUrlQuery } from "@/features/dashboard/lib/dashboard-filters";
import type { DashboardFilters, MetadataItem } from "@/features/dashboard/types/dashboard";

type Props = {
	filters: DashboardFilters;
	metadata?: {
		orderStatuses: MetadataItem[];
		customerStates: MetadataItem[];
		productCategories: MetadataItem[];
	};
	showRankingControls?: boolean;
};

type FormActionState = {
	nextUrl: string;
};

const initialActionState: FormActionState = {
	nextUrl: "",
};

export function GlobalFiltersForm({ filters, metadata, showRankingControls = false }: Props) {
	const pathname = usePathname();
	const router = useRouter();

	const [state, formAction, pending] = useActionState(async (_prev: FormActionState, formData: FormData) => {
		const nextFilters: DashboardFilters = {
			from: String(formData.get("from") || filters.from),
			to: String(formData.get("to") || filters.to),
			customerState: String(formData.get("customer_state") || "") || undefined,
			orderStatus: String(formData.get("order_status") || "") || undefined,
			productCategoryName: String(formData.get("product_category_name") || "") || undefined,
			grain: (String(formData.get("grain") || filters.grain) === "week" ? "week" : "day"),
			metric: (String(formData.get("metric") || filters.metric) === "revenue" ? "revenue" : "gmv"),
			limit: Number(formData.get("limit") || filters.limit),
		};

		const queryString = filtersToUrlQuery(nextFilters).toString();
		return { nextUrl: `${pathname}?${queryString}` };
	}, initialActionState);

	useEffect(() => {
		if (state.nextUrl) {
			router.push(state.nextUrl);
		}
	}, [router, state.nextUrl]);

	const orderStatuses = metadata?.orderStatuses ?? [];
	const customerStates = metadata?.customerStates ?? [];
	const productCategories = metadata?.productCategories ?? [];

	return (
		<form action={formAction} className="rounded-2xl border border-border bg-surface p-4">
			<div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
				<label className="flex flex-col gap-1 text-sm">
					<span className="text-muted">Desde</span>
					<input
						name="from"
						type="date"
						defaultValue={filters.from}
						className="rounded-lg border border-border bg-background px-3 py-2 outline-none ring-primary focus:ring-2"
					/>
				</label>

				<label className="flex flex-col gap-1 text-sm">
					<span className="text-muted">Hasta</span>
					<input
						name="to"
						type="date"
						defaultValue={filters.to}
						className="rounded-lg border border-border bg-background px-3 py-2 outline-none ring-primary focus:ring-2"
					/>
				</label>

				<label className="flex flex-col gap-1 text-sm">
					<span className="text-muted">Estado cliente</span>
					<select
						name="customer_state"
						defaultValue={filters.customerState ?? ""}
						className="rounded-lg border border-border bg-background px-3 py-2 outline-none ring-primary focus:ring-2"
					>
						<option value="">Todos</option>
						{customerStates.map((item) => (
							<option key={item.id} value={item.code}>
								{item.display_name ?? item.code}
							</option>
						))}
					</select>
				</label>

				<label className="flex flex-col gap-1 text-sm">
					<span className="text-muted">Estado orden</span>
					<select
						name="order_status"
						defaultValue={filters.orderStatus ?? ""}
						className="rounded-lg border border-border bg-background px-3 py-2 outline-none ring-primary focus:ring-2"
					>
						<option value="">Todos</option>
						{orderStatuses.map((item) => (
							<option key={item.id} value={item.code}>
								{item.display_name ?? item.code}
							</option>
						))}
					</select>
				</label>

				<label className="flex flex-col gap-1 text-sm">
					<span className="text-muted">Categoría</span>
					<select
						name="product_category_name"
						defaultValue={filters.productCategoryName ?? ""}
						className="rounded-lg border border-border bg-background px-3 py-2 outline-none ring-primary focus:ring-2"
					>
						<option value="">Todas</option>
						{productCategories.map((item) => (
							<option key={item.id} value={item.code}>
								{item.display_name ?? item.code}
							</option>
						))}
					</select>
				</label>
			</div>

			<div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
				<label className="flex flex-col gap-1 text-sm">
					<span className="text-muted">Grano</span>
					<select
						name="grain"
						defaultValue={filters.grain}
						className="rounded-lg border border-border bg-background px-3 py-2 outline-none ring-primary focus:ring-2"
					>
						<option value="day">Día</option>
						<option value="week">Semana</option>
					</select>
				</label>

				{showRankingControls ? (
					<>
						<label className="flex flex-col gap-1 text-sm">
							<span className="text-muted">Métrica ranking</span>
							<select
								name="metric"
								defaultValue={filters.metric}
								className="rounded-lg border border-border bg-background px-3 py-2 outline-none ring-primary focus:ring-2"
							>
								<option value="gmv">GMV</option>
								<option value="revenue">Revenue</option>
							</select>
						</label>

						<label className="flex flex-col gap-1 text-sm">
							<span className="text-muted">Límite</span>
							<input
								name="limit"
								type="number"
								min={1}
								max={100}
								defaultValue={filters.limit}
								className="rounded-lg border border-border bg-background px-3 py-2 outline-none ring-primary focus:ring-2"
							/>
						</label>
					</>
				) : (
					<>
						<input type="hidden" name="metric" value={filters.metric} />
						<input type="hidden" name="limit" value={filters.limit} />
					</>
				)}

				<button
					type="submit"
					className="inline-flex h-11 items-center justify-center self-end rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:opacity-60"
					disabled={pending}
				>
					{pending ? "Aplicando..." : "Aplicar filtros"}
				</button>
			</div>
		</form>
	);
}