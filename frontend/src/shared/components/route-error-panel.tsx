"use client";

import { useState } from "react";

type Props = {
	error: Error & { digest?: string };
	onRetry: () => void;
	title?: string;
};

export function RouteErrorPanel({ error, onRetry, title = "No pudimos cargar esta vista" }: Props) {
	const [hidden, setHidden] = useState(false);
	const [showDetails, setShowDetails] = useState(false);

	if (hidden) {
		return (
			<section className="rounded-2xl border border-border bg-surface p-4">
				<p className="text-sm text-muted">El aviso de error está oculto.</p>
				<div className="mt-3 flex gap-2">
					<button
						type="button"
						onClick={() => setHidden(false)}
						className="rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium"
					>
						Mostrar aviso
					</button>
					<button
						type="button"
						onClick={onRetry}
						className="rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground"
					>
						Reintentar
					</button>
				</div>
			</section>
		);
	}

	return (
		<section className="rounded-2xl border border-border bg-surface p-4">
			<h2 className="text-base font-semibold">{title}</h2>
			<p className="mt-2 text-sm text-muted">
				Ocurrió un error inesperado en esta ruta. Puedes reintentar o ocultar este panel.
			</p>

			<div className="mt-3 flex flex-wrap gap-2">
				<button
					type="button"
					onClick={onRetry}
					className="rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground"
				>
					Reintentar
				</button>
				<button
					type="button"
					onClick={() => setHidden(true)}
					className="rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium"
				>
					Ocultar aviso
				</button>
				<button
					type="button"
					onClick={() => setShowDetails((value) => !value)}
					className="rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium"
				>
					{showDetails ? "Ocultar detalles" : "Ver detalles"}
				</button>
			</div>

			{showDetails ? (
				<pre className="mt-3 overflow-auto rounded-lg border border-border bg-background p-3 text-xs text-muted">
					{error.message}
					{error.digest ? `\nDigest: ${error.digest}` : ""}
				</pre>
			) : null}
		</section>
	);
}