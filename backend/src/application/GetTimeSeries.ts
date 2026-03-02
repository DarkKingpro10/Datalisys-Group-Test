import type { SalesReadRepository } from '../domain/ports/SalesReadRepository.js'
import type { Filters, TimeSeriesPoint } from '../domain/models/SalesModel.js'

export type GetTimeSeriesParams = {
  from: Date
  to: Date
  grain: 'day' | 'week'
  filters?: Filters
}

export class GetTimeSeries {
  constructor(private repo: SalesReadRepository) {}

  async execute(params: GetTimeSeriesParams): Promise<TimeSeriesPoint[]> {
    const { from, to, grain, filters } = params
    const repoParams: {from: Date, to: Date, grain: 'day' | 'week', filters?: Filters} = { from, to, grain }
    if(filters !== undefined) repoParams.filters = filters;
    return this.repo.getTimeSeries(repoParams)
  }
}
