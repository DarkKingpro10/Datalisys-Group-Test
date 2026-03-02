import type { Request, Response, NextFunction } from 'express'
import { KpisQuerySchema } from '../../shared/validation/kpis.schema.js'
import { normalizeDateRange } from '../../shared/utils/dateRange.js'
import { GetTopProducts } from '../../application/GetTopProducts.js'
import type { GetTopProductsParams } from '../../application/GetTopProducts.js'
import { safeParse } from '../../shared/validation/safeParse.js'

// Controller for GET /rankings/products
// KPI: Top products by GMV or Revenue
/**
 * @openapi
 * /rankings/products:
 *   get:
 *     summary: Ranking de productos por GMV o Revenue
 *     tags:
 *       - Rankings
 *     parameters:
 *       - in: query
 *         name: from
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: to
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: metric
 *         schema:
 *           type: string
 *           enum: [gmv, revenue]
 *         description: Métrica para ordenar el ranking
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: order_status
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *         style: form
 *         explode: true
 *       - in: query
 *         name: product_category_name
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *         style: form
 *         explode: true
 *       - in: query
 *         name: customer_state
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *         style: form
 *         explode: true
 *     responses:
 *       '200':
 *         description: Lista de productos ordenados por la métrica solicitada
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   product_id:
 *                     type: string
 *                   product_name:
 *                     type: string
 *                   value:
 *                     type: number
 *                   rank:
 *                     type: integer
 */
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
