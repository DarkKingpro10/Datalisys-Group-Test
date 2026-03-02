import type { Request, Response, NextFunction } from 'express'
import { KpisQuerySchema } from '../../shared/validation/kpis.schema.js'
import { normalizeDateRange } from '../../shared/utils/dateRange.js'
import { GetKpis } from '../../application/GetKpis.js'
import type { GetKpisParams } from '../../application/GetKpis.js'
import { safeParse } from '../../shared/validation/safeParse.js'

/**
 * @openapi
 * /kpis:
 *   get:
 *     summary: Obtiene los KPIs principales (GMV, Revenue, Orders, AOV, IPO, Cancel rate, On-time rate)
 *     tags:
 *       - KPIs
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
 *         name: order_status
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *         style: form
 *         explode: true
 *         description: Filtrar por estado de orden (puede repetirse)
 *       - in: query
 *         name: product_category_name
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *         style: form
 *         explode: true
 *         description: Filtrar por categoría de producto (puede repetirse)
 *       - in: query
 *         name: customer_state
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *         style: form
 *         explode: true
 *         description: Filtrar por estado del cliente (puede repetirse)
 *     responses:
 *       '200':
 *         description: KPIs calculados
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 gmv:
 *                   type: number
 *                 revenue:
 *                   type: number
 *                 orders:
 *                   type: integer
 *                 aov:
 *                   type: number
 *                 ipo:
 *                   type: number
 *                 cancel_rate:
 *                   type: number
 *                 on_time_rate:
 *                   type: number
 */
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

      const params: GetKpisParams = { from: range.from, to: range.to }
      if (Object.keys(filtersObj).length) params.filters = filtersObj
      const result = await getKpis.execute(params)
      res.json(result)
    } catch (err) {
      next(err)
    }
  }
}
