export type PaymentAudit = {
	id: string;
	order_id: string;
	total_payments: number;
	payments_count: number;
	detected_at: Date;
	reason?: string;
};

export type AuditPaymentsResponse = {
	data: PaymentAudit[];
	total: number;
	page: number;
	pageSize: number;
};

export type PaymentQueryParams = {
	page?: string;
	pageSize?: number;
	sortBy?: string;
	sortDirection?: string;
	search?: string;
};
