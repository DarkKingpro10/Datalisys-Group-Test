import type { ReactNode } from "react";
import { DashboardSidebar } from "@/features/dashboard/components/dashboard-sidebar";
import { ThemeToggle } from "@/shared/components/theme-toggle";

type Props = {
	children: ReactNode;
};

export default function DashboardLayout({ children }: Props) {
	return (
		<div className="min-h-screen bg-background text-foreground">
			<div className="mx-auto grid max-w-7xl gap-4 px-4 py-4 md:grid-cols-[250px_1fr] md:px-6">
				<div className="md:sticky md:top-4 md:h-[calc(100vh-2rem)]">
					<DashboardSidebar />
				</div>

				<div className="space-y-4">
					<header className="flex items-center justify-between rounded-2xl border border-border bg-surface px-4 py-3">
						<div>
							<p className="text-xs uppercase tracking-[0.2em] text-muted">Panel comercial</p>
							<h1 className="text-lg font-semibold">KPIs, tendencias y rankings</h1>
						</div>
						<ThemeToggle />
					</header>

					{children}
				</div>
			</div>
		</div>
	);
}