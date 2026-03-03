"use client";

import { useEffect } from "react";
import { RouteErrorPanel } from "@/shared/components/route-error-panel";

type Props = {
	error: Error & { digest?: string };
	reset: () => void;
};

export default function DashboardRouteError({ error, reset }: Props) {
	useEffect(() => {
		console.error(error);
	}, [error]);

	return <RouteErrorPanel error={error} onRetry={reset} title="Error en la ruta del dashboard" />;
}