import type { Request, Response, NextFunction } from 'express'
import { KpisQuerySchema } from '../../shared/validation/kpis.schema.js'
import { normalizeDateRange } from '../../shared/date.js'
import { GetKpis } from '../../application/GetKpis.js'
import { safeParse } from '../../shared/validation/safeParse.js'

export function kpisHandler(getKpis: GetKpis) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = safeParse(KpisQuerySchema, req.query)
      const { from, to, order_status, product_category_name, customer_state } = parsed
      const range = normalizeDateRange(from, to)
      const filtersObj = {
        ...(order_status ? { order_status: order_status as string[] } : {}),
        ...(product_category_name ? { product_category_name: product_category_name as string[] } : {}),
        ...(customer_state ? { customer_state: customer_state as string[] } : {}),
      }

      const params = { from: range.from, to: range.to, ...(Object.keys(filtersObj).length ? { filters: filtersObj } : {}) }
      const result = await getKpis.execute(params as any)
      res.json(result)
    } catch (err) {
      next(err)
    }
  }
}
