import { redirect } from "next/navigation";
import { dashboardRoutes } from "@/features/dashboard/config/routes";

export default function HomePage() {
	redirect(dashboardRoutes.overview);
}
