"use client";

import { useEffect, useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
	filtersToQuery,
	getDefaultDashboardFilters,
} from "@/features/dashboard/lib/dashboard-filters";
import type {
	DashboardFilters,
	MetadataItem,
} from "@/features/dashboard/types/dashboard";
import { IconChevronDown, IconChevronUp } from "@tabler/icons-react";
import clsx from "clsx";

type Props = {
	filters: DashboardFilters;
	metadata?: {
		orderStatuses: MetadataItem[];
		customerStates: MetadataItem[];
		productCategories: MetadataItem[];
	};
	showRankingControls?: boolean;
};

type FilterFormState = {
	from: string;
	to: string;
	customerState: string;
	orderStatus: string;
	productCategoryName: string;
	grain: string;
	metric: string;
	limit: string;
};

function toFormState(filters: DashboardFilters): FilterFormState {
	return {
		from: filters.from,
		to: filters.to,
		customerState: filters.customerState ?? "",
		orderStatus: filters.orderStatus ?? "",
		productCategoryName: filters.productCategoryName ?? "",
		grain: filters.grain,
		metric: filters.metric,
		limit: String(filters.limit),
	};
}

export function GlobalFiltersForm({
	filters,
	metadata,
	showRankingControls = false,
}: Props) {
	const pathname = usePathname();
	const router = useRouter();
	const [pending, startTransition] = useTransition();
	const [formState, setFormState] = useState<FilterFormState>(() =>
		toFormState(filters),
	);
	const [showFilters, setShowFilters] = useState<boolean>(true);

	useEffect(() => {
		setFormState(toFormState(filters));
	}, [filters]);

	const orderStatuses = metadata?.orderStatuses ?? [];
	const customerStates = metadata?.customerStates ?? [];
	const productCategories = metadata?.productCategories ?? [];

	function onSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();

		const parsedLimit = Number(formState.limit);
		const nextFilters: DashboardFilters = {
			from: formState.from || filters.from,
			to: formState.to || filters.to,
			customerState: formState.customerState || undefined,
			orderStatus: formState.orderStatus || undefined,
			productCategoryName: formState.productCategoryName || undefined,
			grain: formState.grain === "week" ? "week" : "day",
			metric: formState.metric === "revenue" ? "revenue" : "gmv",
			limit: Number.isNaN(parsedLimit)
				? 10
				: Math.min(Math.max(parsedLimit, 1), 100),
		};

		const nextUrl = `${pathname}?${filtersToQuery(nextFilters).toString()}`;
		startTransition(() => {
			router.push(nextUrl);
		});
	}

	function onResetFilters() {
		const defaultFilters = getDefaultDashboardFilters();
		setFormState(toFormState(defaultFilters));
		startTransition(() => {
			router.push(`${pathname}`);
		});
	}

	return (
		<form
			onSubmit={onSubmit}
			className="rounded-2xl border border-border bg-surface p-4 "
		>
			<button
				onClick={() => setShowFilters((value) => !value)}
				title={showFilters ? "Ocultar filtros" : "Expandir filtros"}
				aria-label={showFilters ? "Ocultar filtros" : "Expandir filtros"}
				type="button"
				className="flex w-full items-center justify-between"
			>
				<h1 className="text-lg font-semibold">Filtros globales</h1>
				<span className="text-sm text-muted hover:text-primary">
					{showFilters ? <IconChevronUp /> : <IconChevronDown />}
				</span>
			</button>

			<div
				className={clsx(
					"overflow-hidden p-0.5 transition-all",
					showFilters ? "h-auto" : "h-0",
				)}
			>
				<section className="mt-1 grid gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
					<label className="flex flex-col gap-1 text-sm">
						<span className="text-muted">Desde</span>
						<input
							name="from"
							type="date"
							value={formState.from}
							onChange={(event) =>
								setFormState((prev) => ({ ...prev, from: event.target.value }))
							}
							className="rounded-lg border border-border bg-background px-3 py-2 outline-none ring-primary focus:ring-2"
						/>
					</label>

					<label className="flex flex-col gap-1 text-sm">
						<span className="text-muted">Hasta</span>
						<input
							name="to"
							type="date"
							value={formState.to}
							onChange={(event) =>
								setFormState((prev) => ({ ...prev, to: event.target.value }))
							}
							className="rounded-lg border border-border bg-background px-3 py-2 outline-none ring-primary focus:ring-2"
						/>
					</label>

					<label className="flex flex-col gap-1 text-sm">
						<span className="text-muted">Estado cliente</span>
						<select
							name="customer_state"
							value={formState.customerState}
							onChange={(event) =>
								setFormState((prev) => ({
									...prev,
									customerState: event.target.value,
								}))
							}
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
							value={formState.orderStatus}
							onChange={(event) =>
								setFormState((prev) => ({
									...prev,
									orderStatus: event.target.value,
								}))
							}
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
							value={formState.productCategoryName}
							onChange={(event) =>
								setFormState((prev) => ({
									...prev,
									productCategoryName: event.target.value,
								}))
							}
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
					<label className="flex flex-col gap-1 text-sm">
						<span className="text-muted">Grano</span>
						<select
							name="grain"
							value={formState.grain}
							onChange={(event) =>
								setFormState((prev) => ({ ...prev, grain: event.target.value }))
							}
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
									value={formState.metric}
									onChange={(event) =>
										setFormState((prev) => ({
											...prev,
											metric: event.target.value,
										}))
									}
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
									value={formState.limit}
									onChange={(event) =>
										setFormState((prev) => ({
											...prev,
											limit: event.target.value,
										}))
									}
									className="rounded-lg border border-border bg-background px-3 py-2 outline-none ring-primary focus:ring-2"
								/>
							</label>
						</>
					) : null}
					<button
						type="button"
						className="inline-flex py-2 w-full items-center justify-center rounded-lg border border-border bg-surface-soft px-4 text-sm font-medium text-foreground transition hover:bg-surface-soft/70 disabled:opacity-60 sm:w-auto self-end hover:scale-[1.03]"
						onClick={onResetFilters}
						disabled={pending}
					>
						Reiniciar filtros
					</button>
					<button
						type="submit"
						className="inline-flex py-2 w-full items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:opacity-60 sm:w-auto self-end hover:scale-[1.03]"
						disabled={pending}
					>
						{pending ? "Aplicando..." : "Aplicar filtros"}
					</button>
				</section>
			</div>
		</form>
	);
}
