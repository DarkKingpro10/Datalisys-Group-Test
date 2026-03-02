import type { Filters, KpiResult, TimeSeriesPoint, TopProduct } from '../models/SalesModel.js'

export interface SalesReadRepository {
  aggregateSalesMetrics(params: { from: Date; to: Date; filters?: Filters }): Promise<KpiResult>
  getTimeSeries(params: { from: Date; to: Date; grain: 'day' | 'week'; filters?: Filters }): Promise<TimeSeriesPoint[]>
  getTopProducts(params: { from: Date; to: Date; metric: 'gmv' | 'revenue'; limit: number; filters?: Filters }): Promise<TopProduct[]>
}
