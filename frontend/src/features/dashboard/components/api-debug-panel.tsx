type Props = {
	title: string;
	url: string;
	payload?: unknown;
	errorMessage?: string;
};

export function ApiDebugPanel({ title, url, payload, errorMessage }: Props) {
	return (
		<section className="rounded-2xl border border-amber-500/40 bg-amber-500/5 p-4">
			<div className="flex items-center justify-between gap-3">
				<h3 className="text-sm font-semibold text-foreground">{title}</h3>
				<span className="rounded-md bg-amber-500/15 px-2 py-1 text-[11px] font-medium uppercase tracking-wide text-amber-300">
					Debug API
				</span>
			</div>
			<p className="mt-2 break-all text-xs text-muted">{url}</p>

			{errorMessage ? (
				<div className="mt-3 rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-xs text-red-200">
					{errorMessage}
				</div>
			) : null}

			<pre className="mt-3 overflow-auto rounded-lg border border-border bg-background p-3 text-xs text-muted">
				{JSON.stringify(payload ?? null, null, 2)}
			</pre>
		</section>
	);
}