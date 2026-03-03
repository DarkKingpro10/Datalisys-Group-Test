type Props = {
	title: string;
	message?: string;
};

export function DataBlockError({ title, message }: Props) {
	return (
		<section className="rounded-2xl border border-border bg-surface p-4">
			<h3 className="text-sm font-semibold text-foreground">{title}</h3>
			<p className="mt-2 text-sm text-muted">
				{message ?? "No fue posible cargar los datos en este momento. Revisa la conexión del backend e inténtalo nuevamente."}
			</p>
		</section>
	);
}