"use client";

import { Suspense, type ReactNode, useEffect, useRef } from "react";
import clsx from "clsx";
import {
	IconLayoutSidebarLeftCollapse,
	IconLayoutSidebarLeftExpand,
	IconX,
} from "@tabler/icons-react";
import { DashboardSidebar } from "@/features/dashboard/components/dashboard-sidebar";
import { ThemeToggle } from "@/shared/components/theme-toggle";
import { useDashboardUIStore } from "@/shared/store/dashboard-ui.store";

type Props = {
	children: ReactNode;
};

export function DashboardShell({ children }: Props) {
	const isSidebarOpen = useDashboardUIStore((state) => state.isSidebarOpen);
	const toggleSidebar = useDashboardUIStore((state) => state.toggleSidebar);
	const openSidebar = useDashboardUIStore((state) => state.openSidebar);
	const closeSidebar = useDashboardUIStore((state) => state.closeSidebar);
	const initialized = useRef(false);

	useEffect(() => {
		if (initialized.current) {
			return;
		}

		initialized.current = true;
		if (window.matchMedia("(min-width: 768px)").matches) {
			openSidebar();
			return;
		}

		closeSidebar();
	}, [closeSidebar, openSidebar]);

	return (
		<div className="min-h-screen overflow-x-clip bg-background text-foreground">
			<div
				className={clsx(
					"mx-auto max-w-7xl px-4 py-4 md:grid md:gap-4 md:px-6",
					isSidebarOpen
						? "md:grid-cols-[250px_minmax(0,1fr)]"
						: "md:grid-cols-[0_minmax(0,1fr)]",
				)}
			>
				<div
					className={clsx(
						"hidden overflow-hidden md:block",
						isSidebarOpen ? "pointer-events-auto" : "pointer-events-none",
					)}
					aria-hidden={!isSidebarOpen}
				>
					<div
						className={clsx(
							"md:sticky md:h-[calc(100vh-2rem)] transition-all duration-200",
							isSidebarOpen
								? "translate-x-0 opacity-100"
								: "-translate-x-2 opacity-0",
						)}
					>
						<Suspense
							fallback={
								<div className="h-full rounded-2xl border border-border bg-surface p-4" />
							}
						>
							<DashboardSidebar />
						</Suspense>
					</div>
				</div>

				{isSidebarOpen ? (
					<div
						className="fixed inset-0 z-40 bg-black/50 transition-opacity duration-200 md:hidden"
						onClick={closeSidebar}
						aria-hidden
					/>
				) : null}

				<div
					className={clsx(
						"fixed inset-y-0 left-0 z-50 w-72 p-4 transition-transform duration-200 md:hidden",
						isSidebarOpen ? "translate-x-0" : "-translate-x-full",
					)}
				>
					<div className="flex h-full flex-col rounded-2xl border border-border bg-surface p-4">
						<div className="mb-3 flex items-center justify-end">
							<button
								type="button"
								onClick={closeSidebar}
								className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-surface-soft text-foreground transition hover:bg-surface"
								aria-label="Cerrar menú"
								title="Cerrar menú"
							>
								<IconX size={16} />
							</button>
						</div>
						<div className="min-h-0 flex-1">
							<Suspense
								fallback={
									<div className="h-full rounded-2xl border border-border bg-surface p-4" />
								}
							>
								<DashboardSidebar />
							</Suspense>
						</div>
					</div>
				</div>

				<main className="min-w-0 space-y-4">
					<header className="flex items-start gap-3 rounded-2xl border border-border bg-surface px-4 py-3 flex-col lg:flex-row">
						<section className="min-w-0 flex-1 flex gap-1 flex-row">
							<button
								type="button"
								onClick={toggleSidebar}
								className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border bg-surface-soft text-foreground transition hover:bg-surface cursor-ew-resize"
								aria-label={
									isSidebarOpen ? "Ocultar sidebar" : "Mostrar sidebar"
								}
								title={isSidebarOpen ? "Ocultar sidebar" : "Mostrar sidebar"}
							>
								{isSidebarOpen ? (
									<IconLayoutSidebarLeftCollapse size={16} />
								) : (
									<IconLayoutSidebarLeftExpand size={16} />
								)}
							</button>
							<div className="">
								<p className="text-xs uppercase tracking-[0.2em] text-muted">
									Panel comercial
								</p>
								<h1 className="text-base font-semibold sm:text-lg">
									KPIs, tendencias y rankings
								</h1>
							</div>
						</section>

						<section className="m-auto lg:ml-auto shrink-0">
							<ThemeToggle />
						</section>
					</header>

					{children}
				</main>
			</div>
		</div>
	);
}
