import type { Filters } from "../../domain/models/SalesModel.js";
import { Prisma } from "../../generated/prisma/client.js";

// Construye un where de Prisma para dwh.fact_sales (incluye purchase_date)
export function buildPrismaFactWhere(
	from: Date,
	to: Date,
	filters?: Filters,
): Prisma.FactSalesWhereInput {
	const where = {} as Prisma.FactSalesWhereInput
	where.purchase_date = { gte: from, lt: to } as Prisma.DateTimeFilter
	if (!filters) return where;
	if (filters.order_status && filters.order_status.length > 0) {
		where.DimOrder = { order_status: { in: filters.order_status } } as Prisma.DimOrderWhereInput
	}
	if (
		filters.product_category_name &&
		filters.product_category_name.length > 0
	) {
		where.DimProduct = { product_category_name: { in: filters.product_category_name } } as Prisma.DimProductWhereInput
	}
	if (filters.customer_state && filters.customer_state.length > 0) {
		where.DimCustomer = { customer_state: { in: filters.customer_state } } as Prisma.DimCustomerWhereInput
	}
	return where;
}

// Construye fragmentos Prisma.Sql para usar en consultas raw SQL (evita concatenación insegura)
export function buildSqlFilterFragments(filters?: Filters): Prisma.Sql[] {
	const fragments: Prisma.Sql[] = [];
	if (!filters) return fragments;
	if (filters.order_status && filters.order_status.length > 0)
		fragments.push(
			Prisma.sql`AND o.order_status = ANY(${filters.order_status})`,
		);
	if (filters.product_category_name && filters.product_category_name.length > 0)
		fragments.push(
			Prisma.sql`AND p.product_category_name = ANY(${filters.product_category_name})`,
		);
	if (filters.customer_state && filters.customer_state.length > 0)
		fragments.push(
			Prisma.sql`AND c.customer_state = ANY(${filters.customer_state})`,
		);
	return fragments;
}
