import type { SalesReadRepository } from '../domain/ports/SalesReadRepository.js'
import type { Filters, KpiResult} from '../domain/models/SalesModel.js'

export type GetKpisParams = {
  from: Date
  to: Date
  filters?: Filters
}

export class GetKpis {
  constructor(private repo: SalesReadRepository) {}

  async execute(params: GetKpisParams): Promise<KpiResult> {
    const { from, to, filters } = params
    const repoParams: { from: Date; to: Date; filters?: Filters } = { from, to }
    if (filters !== undefined) repoParams.filters = filters
    const agg = await this.repo.aggregateSalesMetrics(repoParams)
    const orders = agg.orders || 0
    const revenue = agg.revenue || 0
    const aov = orders === 0 ? 0 : revenue / orders
    const ipo = orders === 0 ? 0 : (agg.gmv || 0) / orders

    return {
      gmv: agg.gmv || 0,
      revenue,
      orders,
      aov,
      ipo,
      cancel_rate: agg.cancel_rate || 0,
      on_time_rate: agg.on_time_rate || 0,
    }
  }
}
