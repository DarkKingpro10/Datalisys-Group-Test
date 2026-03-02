import type { Request, Response, NextFunction } from 'express'
import { KpisQuerySchema } from '../../shared/validation/kpis.schema.js'
import { normalizeDateRange } from '../../shared/utils/dateRange.js'
import { GetTimeSeries } from '../../application/GetTimeSeries.js'
import type { GetTimeSeriesParams } from '../../application/GetTimeSeries.js'
import { safeParse } from '../../shared/validation/safeParse.js'

// Controller for GET /trend/revenue
// KPI: Revenue Trend (daily or weekly) — returns [{date, revenue, orders}]
export function trendHandler(getTimeSeries: GetTimeSeries) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = safeParse(KpisQuerySchema, req.query)
      const { from, to, order_status, product_category_name, customer_state } = parsed
      const grain = (req.query.grain as string) === 'week' ? 'week' : 'day'
      const range = normalizeDateRange(from, to)
      const filtersObj = {
        ...(order_status ? { order_status: order_status as string[] } : {}),
        ...(product_category_name ? { product_category_name: product_category_name as string[] } : {}),
        ...(customer_state ? { customer_state: customer_state as string[] } : {}),
      }

      const params: GetTimeSeriesParams = { from: range.from, to: range.to, grain }
      if (Object.keys(filtersObj).length) params.filters = filtersObj

      const result = await getTimeSeries.execute(params)
      res.json(result)
    } catch (err) {
      next(err)
    }
  }
}
