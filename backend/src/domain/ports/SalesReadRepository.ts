import type {
	Filters,
	KpiResult,
	PaginatorParams,
	PaymentAudit,
	TimeSeriesPoint,
	TopProduct,
} from "../models/SalesModel.js";

export interface MetadataItem {
	id: string;
	code: string;
	display_name?: string | null;
}

export interface SalesReadRepository {
	aggregateSalesMetrics(params: {
		from: Date;
		to: Date;
		filters?: Filters;
	}): Promise<KpiResult>;
	getTimeSeries(params: {
		from: Date;
		to: Date;
		grain: "day" | "week";
		filters?: Filters;
	}): Promise<TimeSeriesPoint[]>;
	getTopProducts(params: {
		from: Date;
		to: Date;
		metric: "gmv" | "revenue";
		limit: number;
		filters?: Filters;
	}): Promise<TopProduct[]>;
	// Metadata lists for frontend filters (return full metadata items)
	listOrderStatuses(): Promise<MetadataItem[]>;
	listCustomerStates(): Promise<MetadataItem[]>;
	listProductCategories(): Promise<MetadataItem[]>;
	getAuditPaymentsWithoutItems(params: PaginatorParams): Promise<{
		data: PaymentAudit[];
		total: number;
		page: number;
		pageSize: number;
	}>;
}
