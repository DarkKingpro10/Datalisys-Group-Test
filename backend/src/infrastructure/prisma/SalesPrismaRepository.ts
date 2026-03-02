import { getPrisma } from './client.js'
import type { Filters, KpiResult, TimeSeriesPoint, TopProduct } from '../../domain/types.js'
import type { SalesReadRepository } from '../../ports/SalesReadRepository.js'

function buildWhere(filters?: Filters) {
  const where: any = {}
  if (!filters) return where
  if (filters.order_status && filters.order_status.length > 0) {
    where.DimOrder = { ...(where.DimOrder || {}), order_status: { in: filters.order_status } }
  }
  if (filters.product_category_name && filters.product_category_name.length > 0) {
    where.DimProduct = { ...(where.DimProduct || {}), product_category_name: { in: filters.product_category_name } }
  }
  if (filters.customer_state && filters.customer_state.length > 0) {
    where.DimCustomer = { ...(where.DimCustomer || {}), customer_state: { in: filters.customer_state } }
  }
  return where
}

export class SalesPrismaRepository implements SalesReadRepository {
  async aggregateSalesMetrics(params: { from: Date; to: Date; filters?: Filters }): Promise<KpiResult> {
    const prisma = getPrisma()
    const { from, to, filters } = params
    const whereBase = { purchase_date: { gte: from, lt: to } as any, ...buildWhere(filters) }

    const sums = await prisma.factSales.aggregate({
      where: whereBase,
      _sum: { item_price: true, payment_value_allocated: true },
    })

    // Count distinct orders using groupBy on order_id
    const ordersGroup = await prisma.factSales.groupBy({
      by: ['order_id'],
      where: whereBase,
      _count: { order_id: true },
    })

    const orders = ordersGroup.length

    const cancelledGroup = await prisma.factSales.groupBy({
      by: ['order_id'],
      where: { ...whereBase, DimOrder: { order_status: 'canceled' } },
    })

    const cancelled_orders = cancelledGroup.length

    const deliveredTotalGroup = await prisma.factSales.groupBy({
      by: ['order_id'],
      where: { ...whereBase, is_delivered: true },
    })
    const deliveredOnTimeGroup = await prisma.factSales.groupBy({
      by: ['order_id'],
      where: { ...whereBase, is_delivered: true, is_on_time: true },
    })

    const delivered_total = deliveredTotalGroup.length
    const delivered_on_time = deliveredOnTimeGroup.length

    const gmv = Number(sums._sum.item_price ?? 0)
    const revenue = Number(sums._sum.payment_value_allocated ?? 0)

    const cancel_rate = orders === 0 ? 0 : cancelled_orders / orders
    const on_time_rate = delivered_total === 0 ? 0 : delivered_on_time / delivered_total

    return {
      gmv,
      revenue,
      orders,
      aov: revenue,
      ipo: gmv,
      cancel_rate,
      on_time_rate,
    }
  }

  async getTimeSeries(params: { from: Date; to: Date; grain: 'day' | 'week'; filters?: Filters }): Promise<TimeSeriesPoint[]> {
    const prisma = getPrisma()
    const { from, to, grain, filters } = params
    const whereBase = { purchase_date: { gte: from, lt: to } as any, ...buildWhere(filters) }

    // Posible solución TODO VERLO DSP DE CLASES LUNES
    const trunc = grain === 'week' ? "date_trunc('week', purchase_date)" : "date_trunc('day', purchase_date)"
    const sql = `
      SELECT ${trunc} as period, SUM(payment_value_allocated)::double precision as revenue, COUNT(DISTINCT order_id) as orders
      FROM dwh."FactSales"
      WHERE purchase_date >= $1 AND purchase_date < $2
      GROUP BY period
      ORDER BY period asc
    `
    const res: any = await prisma.$queryRawUnsafe(sql, from.toISOString(), to.toISOString())
    return res.map((r: any) => ({ date: r.period.toISOString().slice(0, 10), revenue: Number(r.revenue || 0), orders: Number(r.orders || 0) }))
  }

  async getTopProducts(params: { from: Date; to: Date; metric: 'gmv' | 'revenue'; limit: number; filters?: Filters }): Promise<TopProduct[]> {
    const prisma = getPrisma()
    const { from, to, metric, limit, filters } = params
    const whereBase = { purchase_date: { gte: from, lt: to } as any, ...buildWhere(filters) }

    // Agrupando por product_id con prisma
    const group = await prisma.factSales.groupBy({
      by: ['product_id'],
      where: whereBase,
      _sum: { item_price: true, payment_value_allocated: true },
      _count: { order_id: true },
      orderBy: { _sum: metric === 'revenue' ? { payment_value_allocated: 'desc' } : { item_price: 'desc' } },
      take: limit,
    })

    const productIds = group.map((g) => g.product_id).filter(Boolean) as string[]
    const products = await prisma.dimProduct.findMany({ where: { product_id: { in: productIds } } })
    const prodMap = new Map(products.map((p) => [p.product_id, p.product_category_name]))

    return group.map((g) => ({
      product_id: g.product_id as string,
      product_category_name: prodMap.get(g.product_id as string) ?? null,
      gmv: Number(g._sum.item_price ?? 0),
      revenue: Number(g._sum.payment_value_allocated ?? 0),
      orders: Number(g._count.order_id ?? 0),
    }))
  }
}
