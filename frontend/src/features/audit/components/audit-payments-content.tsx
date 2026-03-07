import { getAuditPaymentsWithoutItems } from "../api/audit-api";
import { PaymentQueryParams } from "../types/PaymentAudit.type";
import AuditPaymentTable from "./audit-payment-table";

export default async function AuditPaymentsContent({
	searchParams,
}: {
	searchParams: Promise<PaymentQueryParams>;
}) {
	const params = await searchParams;
	const initialData = await getAuditPaymentsWithoutItems(params);

	return <AuditPaymentTable initialData={initialData} />;
}
