import type { Request, Response, NextFunction } from 'express'
import type { GetMeta } from '../../application/GetMeta.js'

/**
 * @openapi
 * /meta/order-statuses:
 *   get:
 *     summary: Lista los posibles valores de `order_status` disponibles en el DWH
 *     tags:
 *       - Meta
 *     responses:
 *       '200':
 *         description: Lista de strings
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: string
 */
export function orderStatusesHandler(useCase: GetMeta) {
  return async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const rows = await useCase.listOrderStatuses()
      res.json(rows)
    } catch (err) {
      next(err)
    }
  }
}

/**
 * @openapi
 * /meta/customer-states:
 *   get:
 *     summary: Lista los códigos de estado de clientes (customer_state)
 *     tags:
 *       - Meta
 *     responses:
 *       '200':
 *         description: Lista de strings
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: string
 */
export function customerStatesHandler(useCase: GetMeta) {
  return async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const rows = await useCase.listCustomerStates()
      res.json(rows)
    } catch (err) {
      next(err)
    }
  }
}

/**
 * @openapi
 * /meta/product-categories:
 *   get:
 *     summary: Lista las categorías de producto disponibles
 *     tags:
 *       - Meta
 *     responses:
 *       '200':
 *         description: Lista de strings
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: string
 */
export function productCategoriesHandler(useCase: GetMeta) {
  return async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const rows = await useCase.listProductCategories()
      res.json(rows)
    } catch (err) {
      next(err)
    }
  }
}
