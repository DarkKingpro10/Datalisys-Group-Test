"use client";

import {
	ColumnDef,
	flexRender,
	getCoreRowModel,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	useReactTable,
} from "@tanstack/react-table";
import { TimeSeriesPoint } from "../../types/dashboard";
import {  formatKpiCurrency } from "../../lib/format";
import { IconSearch } from "@tabler/icons-react";
import { useState } from "react";

type Props = {
	series: TimeSeriesPoint[];
};

export default function RevenueOrdersTable({ series }: Props) {
  const [globalFilter, setGlobalFilter] = useState("");

	const columns: ColumnDef<TimeSeriesPoint>[] = [
		{ header: "Fecha", accessorKey: "date" },
		{
			header: "Revenue",
			accessorKey: "revenue",
			cell: (row) => formatKpiCurrency(Number(row.getValue() ?? 0)),
		},
		{ header: "Orders", accessorKey: "orders" },
	];

	const table = useReactTable({
		data: series,
		columns,
    state: {
      globalFilter
    },
		getCoreRowModel: getCoreRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
	});
	return (
		<section className="rounded-xl border-border bg-surface p-4 overflow-x-auto">
			{/* Search + total */}
			<header className="mb-4 flex justify-between items-center">
				<div className="flex gap-1 items-center">
					<input
						defaultValue={table.getState().globalFilter ?? ""}
						onChange={(e) => setGlobalFilter(e.target.value)}
						placeholder="Buscar..."
						className="border rounded px-3 py-1 text-sm"
					/>
					<IconSearch />
				</div>
				<span className="text-sm text-muted">
					Total registros: {series.length}
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
				<tbody className="text-left">
					{table.getRowModel().rows.map((row) => (
						<tr key={row.id} className="border-t">
							{row.getVisibleCells().map((cell) => (
								<td key={cell.id} className="px-2 py-2">
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
