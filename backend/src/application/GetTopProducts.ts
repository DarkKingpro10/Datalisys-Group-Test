import type { SalesReadRepository } from '../domain/ports/SalesReadRepository.js'
import type { Filters, TopProduct } from '../domain/models/SalesModel.js'

export type GetTopProductsParams = {
  from: Date
  to: Date
  metric: 'gmv' | 'revenue'
  limit: number
  filters?: Filters
}

export class GetTopProducts {
  constructor(private repo: SalesReadRepository) {}

  async execute(params: GetTopProductsParams): Promise<TopProduct[]> {
    const { from, to, metric, limit, filters } = params
    const repoParams: { from: Date; to: Date; metric: 'gmv' | 'revenue'; limit: number; filters?: Filters } = { from, to, metric, limit }
    if (filters !== undefined) repoParams.filters = filters
    return this.repo.getTopProducts(repoParams)
  }
}
