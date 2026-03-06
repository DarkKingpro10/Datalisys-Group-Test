import { getPrisma } from "./client.js";
import type {
	Filters,
	KpiResult,
	PaginatorParams,
	PaymentAudit,
	PaymentQueryParams,
	TimeSeriesPoint,
	TopProduct,
} from "../../domain/models/SalesModel.js";
import type { SalesReadRepository } from "../../domain/ports/SalesReadRepository.js";
import {
	Prisma,
	type DimCustomerState,
	type DimOrderStatus,
	type DimProductCategory,
} from "../../generated/prisma/client.js";
import { buildSqlFilterFragments } from "../../shared/utils/filters.js";

/**
 * Repositorio de lectura de ventas (implementación Prisma + SQL)
 *
 * Propósito general:
 * - Proveer lecturas optimizadas desde la capa `dwh` (tabla `dwh.fact_sales`).
 * - Todas las consultas usan `dwh.fact_sales` como tabla conductora (regla del enunciado).
 * - Para métricas agregadas que requieren COUNT(DISTINCT) y date_trunc() usamos consultas SQL
 *   parametrizadas con `Prisma.sql` para obtener buena performance y seguridad.
 */
export class SalesPrismaRepository implements SalesReadRepository {
	/**
	 * Calcula las métricas principales (KPIs) en una sola consulta.
	 * KPIs devueltos:
	 * - GMV: SUM(item_price)
	 * - Revenue: SUM(payment_value_allocated)
	 * - Orders: COUNT(DISTINCT order_id)
	 * - Items: COUNT(*) (número de filas en fact_sales)
	 * - Cancel rate: cancelled_orders / orders (cancelled_orders = orders con order_status='canceled')
	 * - On-time rate: delivered_on_time / delivered_total
	 *
	 * Implementación:
	 * - Ejecuta una única consulta SQL parametrizada que agrega condicionalmente
	 *   para evitar múltiples `groupBy` que originarían varias consultas a la DB.
	 * - Usa `buildSqlFilterFragments` para aplicar filtros seguros sobre dimensiones
	 *   (`order_status`, `product_category_name`, `customer_state`).
	 * - Filtra por `f.purchase_date` (esta columna se genera desde `order_purchase_timestamp`
	 *   durante el ETL que puebla `dwh.fact_sales`).
	 */
	async aggregateSalesMetrics(params: {
		from: Date;
		to: Date;
		filters?: Filters;
	}): Promise<KpiResult> {
		const prisma = getPrisma();
		const { from, to, filters } = params;
		// Usamos una sola consulta SQL con agregaciones condicionales para
		// calcular todas las métricas en una sola llamada y evitar múltiples
		// groupBy (mejora de performance en tablas grandes).
		const filterFragments = buildSqlFilterFragments(filters);

		const sql = Prisma.sql`
      SELECT
        COALESCE(SUM(f.item_price),0) AS gmv,
        COALESCE(SUM(f.payment_value_allocated),0) AS revenue,
        COUNT(DISTINCT f.order_id) AS orders,
        COUNT(*) AS items,
        COUNT(DISTINCT CASE WHEN o.order_status = 'canceled' THEN f.order_id END) AS cancelled_orders,
        COUNT(DISTINCT CASE WHEN f.is_delivered THEN f.order_id END) AS delivered_total,
        COUNT(DISTINCT CASE WHEN f.is_delivered AND f.is_on_time THEN f.order_id END) AS delivered_on_time
      FROM dwh.fact_sales f
      LEFT JOIN dwh.dim_order o ON f.order_id = o.order_id
      LEFT JOIN dwh.dim_product p ON f.product_id = p.product_id
      LEFT JOIN dwh.dim_customer c ON f.customer_id = c.customer_id
      WHERE f.purchase_date >= ${from} AND f.purchase_date < ${to} ${filterFragments.length ? Prisma.join(filterFragments, " ") : Prisma.sql``}
    `;

		const rows: {
			gmv: string;
			revenue: string;
			orders: string;
			items: string;
			cancelled_orders: string;
			delivered_total: string;
			delivered_on_time: string;
		}[] = await prisma.$queryRaw(sql);

		const r = rows[0] ?? {
			gmv: "0",
			revenue: "0",
			orders: "0",
			items: "0",
			cancelled_orders: "0",
			delivered_total: "0",
			delivered_on_time: "0",
		};

		const gmv = Number(r.gmv);
		const revenue = Number(r.revenue);
		const orders = Number(r.orders);
		const items_count = Number(r.items);
		const cancelled_orders = Number(r.cancelled_orders);
		const delivered_total = Number(r.delivered_total);
		const delivered_on_time = Number(r.delivered_on_time);

		const cancel_rate = orders === 0 ? 0 : cancelled_orders / orders;
		const on_time_rate =
			delivered_total === 0 ? 0 : delivered_on_time / delivered_total;

		const aov = orders === 0 ? 0 : revenue / orders;
		const ipo = orders === 0 ? 0 : items_count / orders;

		return {
			gmv,
			revenue,
			orders,
			aov,
			ipo,
			items: items_count,
			cancel_rate,
			on_time_rate,
		};
	}

	/**
	 * KPI: Revenue Trend (GET /trend/revenue)
	 * Devuelve puntos temporales: date, revenue (SUM payment_value_allocated), orders (COUNT DISTINCT order_id)
	 *
	 * Implementación:
	 * - Usa `date_trunc('day'|'week', purchase_date)` en SQL para bucketizar fechas.
	 * - Usa COUNT(DISTINCT order_id) para contar órdenes únicas por bucket.
	 * - Consulta parametrizada con `Prisma.sql` + `buildSqlFilterFragments`.
	 */
	async getTimeSeries(params: {
		from: Date;
		to: Date;
		grain: "day" | "week";
		filters?: Filters;
	}): Promise<TimeSeriesPoint[]> {
		const prisma = getPrisma();
		const { from, to, grain, filters } = params;
		const dateBucket =
			grain === "week"
				? `date_trunc('week', f.purchase_date)::date`
				: `date_trunc('day', f.purchase_date)::date`;

		const filterFragments = buildSqlFilterFragments(filters);

		const sql = Prisma.sql`
      SELECT ${Prisma.raw(dateBucket)} AS date,
             COALESCE(SUM(f.payment_value_allocated),0) AS revenue,
             COUNT(DISTINCT f.order_id) AS orders
      FROM dwh.fact_sales f
      LEFT JOIN dwh.dim_order o ON f.order_id = o.order_id
      LEFT JOIN dwh.dim_product p ON f.product_id = p.product_id
      LEFT JOIN dwh.dim_customer c ON f.customer_id = c.customer_id
      WHERE f.purchase_date >= ${from} AND f.purchase_date < ${to} ${filterFragments.length ? Prisma.join(filterFragments, " ") : Prisma.sql``}
      GROUP BY date
      ORDER BY date ASC
    `;

		const rows: { date: any; revenue: string; orders: string }[] =
			await prisma.$queryRaw(sql);
		return rows.map((r) => ({
			date:
				r.date instanceof Date
					? r.date.toISOString().slice(0, 10)
					: String(r.date),
			revenue: Number(r.revenue),
			orders: Number(r.orders),
		}));
	}

	/**
	 * KPI: Top Products (GET /rankings/products)
	 * Devuelve top N productos por GMV o Revenue: product_id, product_category_name, gmv, revenue, orders
	 *
	 * Implementación:
	 * - Agrupa por producto y calcula SUM(item_price), SUM(payment_value_allocated).
	 * - Usa COUNT(DISTINCT order_id) para contar órdenes únicas por producto.
	 * - Ordena por la métrica solicitada y aplica un `LIMIT` seguro.
	 */
	async getTopProducts(params: {
		from: Date;
		to: Date;
		metric: "gmv" | "revenue";
		limit: number;
		filters?: Filters;
	}): Promise<TopProduct[]> {
		const prisma = getPrisma();
		const { from, to, metric, limit, filters } = params;
		// Defensive validation
		if (!(metric === "gmv" || metric === "revenue"))
			throw new Error("Invalid metric");
		const safeLimit = Math.min(
			Math.max(Number.isFinite(limit) ? limit : 10, 1),
			100,
		);

		const orderBy = metric === "revenue" ? "revenue" : "gmv";

		const filterFragments2 = buildSqlFilterFragments(filters);

		const sql2 = Prisma.sql`
      SELECT f.product_id,
             p.product_category_name,
             COALESCE(SUM(f.item_price),0) AS gmv,
             COALESCE(SUM(f.payment_value_allocated),0) AS revenue,
             COUNT(DISTINCT f.order_id) AS orders
      FROM dwh.fact_sales f
      LEFT JOIN dwh.dim_product p ON f.product_id = p.product_id
      LEFT JOIN dwh.dim_order o ON f.order_id = o.order_id
      LEFT JOIN dwh.dim_customer c ON f.customer_id = c.customer_id
      WHERE f.purchase_date >= ${from} AND f.purchase_date < ${to} ${filterFragments2.length ? Prisma.join(filterFragments2, " ") : Prisma.sql``}
      GROUP BY f.product_id, p.product_category_name
      ORDER BY ${Prisma.raw(orderBy)} DESC
      LIMIT ${safeLimit}
    `;

		const rows: {
			product_id: string;
			product_category_name?: string | null;
			gmv: string;
			revenue: string;
			orders: string;
		}[] = await prisma.$queryRaw(sql2);
		return rows.map((r) => ({
			product_id: r.product_id,
			product_category_name: r.product_category_name ?? null,
			gmv: Number(r.gmv),
			revenue: Number(r.revenue),
			orders: Number(r.orders),
		}));
	}

	/**
	 * Método para listar estados de orden (GET /metadata/order-statuses)
	 * @returns DimOrderStatus que corresponde al estado de las ordenes
	 */
	async listOrderStatuses(): Promise<DimOrderStatus[]> {
		const prisma = getPrisma();
		return prisma.dimOrderStatus.findMany({
			select: { id: true, code: true, display_name: true },
			orderBy: { code: "asc" },
		});
	}

	/**
	 * Método para listar estados de clientes (GET /metadata/customer-states)
	 * @returns Arreglo de DimCustomerState que refleja el estado de los clientes
	 */
	async listCustomerStates(): Promise<DimCustomerState[]> {
		const prisma = getPrisma();
		return prisma.dimCustomerState.findMany({
			select: { id: true, code: true },
			orderBy: { code: "asc" },
		});
	}

	/**
	 * Método para listar categorias de productos (GET /metadata/product-categories)
	 * @returns Arreglo que devuelve las categorias de los productos
	 */
	async listProductCategories(): Promise<DimProductCategory[]> {
		const prisma = getPrisma();
		return prisma.dimProductCategory.findMany({
			select: { id: true, code: true, display_name: true },
			orderBy: { code: "asc" },
		});
	}

	async getAuditPaymentsWithoutItems(params: PaymentQueryParams): Promise<{
		data: PaymentAudit[];
		total: number;
		page: number;
		pageSize: number;
	}> {
		const prisma = getPrisma();

		const pageSize = Math.min(params.pageSize ?? 10, 100);

		const sortBy = params.sortBy ?? "total_payments";
		const sortDirection = params.sortDirection ?? "desc";
		const page = Math.max(params.page ?? 1, 1);
		const skip = (page - 1) * pageSize;

		const where: Prisma.AuditPaymentsWithoutItemsWhereInput = {};

		const numericSearch = Number(params.search);
		const isNumeric = !Number.isNaN(numericSearch);

		if (params.search !== undefined && params.search !== null && params.search !== "") {
			const dateSearch = new Date(params.search);
			const isValidDate = !isNaN(dateSearch.getTime());
			where.OR = [
				{ order_id: { contains: params.search, mode: "insensitive" } },
				...(isValidDate
					? [
							{
								detected_at: {
									gte: dateSearch,
									lt: new Date(dateSearch.getTime() + 24 * 60 * 60 * 1000), // siguiente día
								},
							},
						]
					: []),
				...(isNumeric
					? [
							{ total_payments: numericSearch },
							{ payments_count: numericSearch },
						]
					: []),
			];
		}
		console.log(where)

		const [rows, total] = await prisma.$transaction([
			prisma.auditPaymentsWithoutItems.findMany({
				where,
				orderBy: {
					[sortBy]: sortDirection,
				},
				skip,
				take: pageSize,
			}),
			prisma.auditPaymentsWithoutItems.count({
				where,
			}),
		]);

		return {
			data: rows.map((d) => ({
				...d,
				id: d.id.toString(),
				total_payments: d.total_payments.toNumber(),
			})),
			total,
			page,
			pageSize,
		};
	}
}
