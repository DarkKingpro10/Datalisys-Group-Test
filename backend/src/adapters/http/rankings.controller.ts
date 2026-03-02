import type { Request, Response, NextFunction } from 'express'
import { KpisQuerySchema } from '../../shared/validation/kpis.schema.js'
import { normalizeDateRange } from '../../shared/utils/dateRange.js'
import { GetTopProducts } from '../../application/GetTopProducts.js'
import type { GetTopProductsParams } from '../../application/GetTopProducts.js'
import { safeParse } from '../../shared/validation/safeParse.js'

// Controller for GET /rankings/products
// KPI: Top products by GMV or Revenue
export function rankingsHandler(getTopProducts: GetTopProducts) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = safeParse(KpisQuerySchema, req.query)
      const { from, to, order_status, product_category_name, customer_state } = parsed
      const metricRaw = (req.query.metric as string) || 'gmv'
      if (!(metricRaw === 'gmv' || metricRaw === 'revenue')) throw new Error('Invalid metric')
      const metric = metricRaw as 'gmv' | 'revenue'
      const rawLimit = Number(req.query.limit) || 10
      const limit = Math.min(Math.max(Number.isNaN(rawLimit) ? 10 : rawLimit, 1), 100)
      const range = normalizeDateRange(from, to)
      const filtersObj = {
        ...(order_status ? { order_status: order_status as string[] } : {}),
        ...(product_category_name ? { product_category_name: product_category_name as string[] } : {}),
        ...(customer_state ? { customer_state: customer_state as string[] } : {}),
      }

      const params: GetTopProductsParams = { from: range.from, to: range.to, metric, limit }
      if (Object.keys(filtersObj).length) params.filters = filtersObj

      const result = await getTopProducts.execute(params)
      res.json(result)
    } catch (err) {
      next(err)
    }
  }
}
