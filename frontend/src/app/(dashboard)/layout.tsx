import type { ReactNode } from "react";
import { DashboardShell } from "@/features/dashboard/components/dashboard-shell";

type Props = {
	children: ReactNode;
};

export default function DashboardLayout({ children }: Props) {
	return <DashboardShell>{children}</DashboardShell>;
}