import { Suspense, type ReactNode } from "react";
import { DashboardSidebar } from "@/features/dashboard/components/dashboard-sidebar";
import { ThemeToggle } from "@/shared/components/theme-toggle";

type Props = {
	children: ReactNode;
};

export default function DashboardLayout({ children }: Props) {
	return (
		<main className="min-h-screen overflow-x-clip bg-background text-foreground">
			<div className="mx-auto grid max-w-7xl gap-4 px-4 py-4 md:grid-cols-[250px_1fr] md:px-6">
				<div className="md:sticky md:top-4 md:h-[calc(100vh-2rem)]">
					<Suspense
						fallback={<div className="h-full rounded-2xl border border-border bg-surface p-4" />}
					>
						<DashboardSidebar />
					</Suspense>
				</div>

				<div className="min-w-0 space-y-4">
					<header className="flex flex-col gap-3 rounded-2xl border border-border bg-surface px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
						<div className="min-w-0">
							<p className="text-xs uppercase tracking-[0.2em] text-muted">Panel comercial</p>
							<h1 className="text-base font-semibold sm:text-lg">KPIs, tendencias y rankings</h1>
						</div>
						<ThemeToggle />
					</header>

					{children}
				</div>
			</div>
		</main>
	);
}