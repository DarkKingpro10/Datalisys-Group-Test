"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { dashboardSidebarRoutes } from "@/features/dashboard/config/routes";

export function DashboardSidebar() {
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const queryString = searchParams.toString();

	return (
		<aside className="h-full rounded-2xl md:border md:border-border bg-surface md:p-4">
			<div className="mb-6 border-b border-border pb-4">
				<p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">Comercial</p>
				<h2 className="mt-2 text-lg font-semibold">KPI Dashboard</h2>
			</div>
			<nav className="space-y-2">
				{dashboardSidebarRoutes.map((route) => {
					const isActive = pathname === route.href;
					const href = queryString ? `${route.href}?${queryString}` : route.href;

					return (
						<Link
							key={route.key}
							href={href}
							className={`block rounded-lg px-3 py-2 text-sm font-medium transition ${
								isActive
									? "bg-primary text-primary-foreground"
									: "text-muted hover:bg-surface-soft hover:text-foreground"
							}`}
						>
							{route.label}
						</Link>
					);
				})}
			</nav>
		</aside>
	);
}