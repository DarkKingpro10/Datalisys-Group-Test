import AuditPaymentsContent from "@/features/audit/components/audit-payments-content";
import { PaymentQueryParams } from "@/features/audit/types/PaymentAudit.type";
import { AuditTableSkeleton } from "@/features/audit/ui/AuditTableSkeleton";
import { Suspense } from "react";

type PageProps = {
	searchParams: Promise<PaymentQueryParams>;
};

export default function AuditPage({ searchParams }: PageProps) {
	return (
		<div className="flex flex-col gap-1">
			<section className="p-4 bg-surface rounded-xl ">
				<h1 className="text-xl font-bold">Audit Payments</h1>
				<p className="text-xs">
					Le pedí a la IA que revisará los resultados del KPI para ver si no me
					había equivocado en algún calculo y descubrió una inconsistencia en
					los datos, la cual provocaba que hubiesen ordenes sin items, dichos registros decidí por mostrarlos en esta tabla que esta parametrizada y con ordenamiento incluido.
				</p>
			</section>
			<Suspense fallback={<AuditTableSkeleton />}>
				<AuditPaymentsContent searchParams={searchParams} />
			</Suspense>
		</div>
	);
}
