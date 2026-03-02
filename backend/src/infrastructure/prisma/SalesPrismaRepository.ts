import { getPrisma } from './client.js'
import type { Filters, KpiResult, TimeSeriesPoint, TopProduct } from '../../domain/models/SalesModel.js'
import type { SalesReadRepository } from '../../domain/ports/SalesReadRepository.js'
import type { Prisma } from '../../generated/prisma/client.js'

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

    const where: Prisma.FactSalesWhereInput = {
      
    }

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
    throw new Error('Not implemented yet')
  }

  async getTopProducts(params: { from: Date; to: Date; metric: 'gmv' | 'revenue'; limit: number; filters?: Filters }): Promise<TopProduct[]> {
    throw new Error('Not implemented yet')
  }
}
