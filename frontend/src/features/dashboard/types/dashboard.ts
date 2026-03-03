export type Grain = "day" | "week";
export type RankingMetric = "gmv" | "revenue";

export type DashboardFilters = {
	from: string;
	to: string;
	customerState?: string;
	orderStatus?: string;
	productCategoryName?: string;
	grain: Grain;
	metric: RankingMetric;
	limit: number;
};

export type MetadataItem = {
	id: string;
	code: string;
	display_name?: string | null;
};

export type KpiResult = {
	gmv: number;
	revenue: number;
	orders: number;
	aov: number;
	ipo: number;
	cancel_rate: number;
	on_time_rate: number;
};

export type TimeSeriesPoint = {
	date: string;
	revenue: number;
	orders: number;
};

export type TopProduct = {
	product_id: string;
	product_category_name?: string | null;
	gmv: number;
	revenue: number;
	orders: number;
};