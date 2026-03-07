"use client";
import {
	AuditPaymentsResponse,
	PaymentAudit,
} from "../types/PaymentAudit.type";
import {
	ColumnDef,
	flexRender,
	getCoreRowModel,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	useReactTable,
} from "@tanstack/react-table";
import { useTableSearchParams } from "tanstack-table-search-params";
import { useDebouncedCallback } from "use-debounce";
import { IconSearch } from "@tabler/icons-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { formatCurrency, formatDateTime, formatKpiCurrency } from "@/features/dashboard/lib/format";

export default function AuditPaymentTable({
	initialData,
}: {
	initialData: AuditPaymentsResponse;
}) {
	const { replace } = useRouter();

	const stateAndOnChanges = useTableSearchParams(
		{
			pathname: usePathname(),
			query: useSearchParams(),
			replace,
		},
		{
			paramNames: {
				globalFilter: () => "search",
				sorting: () => "sortBy",
				pagination: { pageIndex: "page", pageSize: "pageSize" },
			},
		},
	);

	const columns: ColumnDef<PaymentAudit>[] = [
		{ header: "Order ID", accessorKey: "order_id" },
		{
			header: "Total",
			accessorKey: "total_payments",
			cell: (row) => formatKpiCurrency(Number(row.getValue() ?? 0)),
		},
		{ header: "Count", accessorKey: "payments_count" },
		{
			header: "Fecha",
			accessorKey: "detected_at",
			cell: (row) => formatDateTime(row.getValue() as string | Date),
		},
	];

	const table = useReactTable({
		data: initialData.data,
		columns,
		enableMultiSort: false,
		isMultiSortEvent: () => false,
		getCoreRowModel: getCoreRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
    manualPagination: true,
		pageCount: Math.ceil(initialData.total / initialData.pageSize),
		...stateAndOnChanges,
	});

	const debouncedSearch = useDebouncedCallback((value: string) => {
		table.setGlobalFilter(value);
	}, 500);

	return (
		<section className="rounded-xl border-border bg-surface p-4 overflow-x-auto">
			{/* Search + total */}
			<header className="mb-4 flex justify-between items-center">
				<div className="flex gap-1 items-center">
					<input
						defaultValue={table.getState().globalFilter ?? ""}
						onChange={(e) => debouncedSearch(e.target.value)}
						placeholder="Buscar..."
						className="border rounded px-3 py-1 text-sm"
					/>
					<IconSearch />
				</div>
				<span className="text-sm text-muted">
					Total registros: {initialData.total}
				</span>
			</header>
			<table className="min-w-full border-collapse">
				<thead className="bg-surface-soft">
					{table.getHeaderGroups().map((headerGroup) => (
						<tr key={headerGroup.id}>
							{headerGroup.headers.map((header) => (
								<th
									key={header.id}
									className="text-left p-2 border-b border-border cursor-pointer select-none"
									onClick={header.column.getToggleSortingHandler()}
								>
									{flexRender(
										header.column.columnDef.header,
										header.getContext(),
									)}
									{(() => {
										switch (header.column.getIsSorted()) {
											case "asc":
												return " ⬆️";
											case "desc":
												return " ⬇️";
											default:
												return "";
										}
									})()}
								</th>
							))}
						</tr>
					))}
				</thead>
				<tbody>
					{table.getRowModel().rows.map((row) => (
						<tr key={row.id} className="border-t">
							{row.getVisibleCells().map((cell) => (
								<td key={cell.id} className="p-2">
									{flexRender(cell.column.columnDef.cell, cell.getContext())}
								</td>
							))}
						</tr>
					))}
				</tbody>
			</table>
			<div className="flex items-center justify-between gap-4 py-3">
				<button
					onClick={() => table.previousPage()}
					disabled={!table.getCanPreviousPage()}
					className="px-3 py-1 rounded border border-border bg-surface-soft disabled:opacity-50"
				>
					← Anterior
				</button>

				<span className="text-sm text-foreground">
					Página{" "}
					<strong>
						{table.getState().pagination.pageIndex + 1} de{" "}
						{table.getPageCount()}
					</strong>
				</span>

				<button
					onClick={() => table.nextPage()}
					disabled={!table.getCanNextPage()}
					className="px-3 py-1 rounded bg-primary text-primary-foreground disabled:opacity-50"
				>
					Siguiente →
				</button>

				<select
					className="p-1 border border-border rounded bg-surface-soft"
					value={table.getState().pagination.pageSize}
					onChange={(e) => table.setPageSize(Number(e.target.value))}
				>
					{[10, 20, 50, 100].map((size) => (
						<option key={size} value={size}>
							{size} / página
						</option>
					))}
				</select>
			</div>
		</section>
	);
}
