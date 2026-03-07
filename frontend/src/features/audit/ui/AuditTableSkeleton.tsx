export function AuditTableSkeleton() {
	return (
		<div className="rounded-2xl border border-border bg-surface p-4 animate-pulse">
			<div className="mb-4 h-4 w-40 rounded bg-surface-soft" />

			<div className="space-y-3">
				{Array.from({ length: 6 }).map((_, i) => (
					<div key={i} className="h-10 rounded-lg bg-surface-soft" />
				))}
			</div>
		</div>
	);
}
