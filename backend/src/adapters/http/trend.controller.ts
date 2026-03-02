import type { Request, Response, NextFunction } from 'express'
import { KpisQuerySchema } from '../../shared/validation/kpis.schema.js'
import { normalizeDateRange } from '../../shared/utils/dateRange.js'
import { GetTimeSeries } from '../../application/GetTimeSeries.js'
import type { GetTimeSeriesParams } from '../../application/GetTimeSeries.js'
import { safeParse } from '../../shared/validation/safeParse.js'

// Controller for GET /trend/revenue
// KPI: Revenue Trend (daily or weekly) — returns [{date, revenue, orders}]
/**
 * @openapi
 * /trend/revenue:
 *   get:
 *     summary: Serie temporal de Revenue y Orders (día o semana)
 *     tags:
 *       - Trend
 *     parameters:
 *       - in: query
 *         name: from
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha inicial (YYYY-MM-DD)
 *       - in: query
 *         name: to
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha final (YYYY-MM-DD)
 *       - in: query
 *         name: grain
 *         schema:
 *           type: string
 *           enum: [day, week]
 *         description: Granularidad del series (day|week)
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
 *         description: Serie temporal
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   date:
 *                     type: string
 *                     format: date
 *                   revenue:
 *                     type: number
 *                   orders:
 *                     type: integer
 */
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
