import type { Request, Response, NextFunction } from "express";
import type { GetAuditPaymentsWithoutItems } from "../../application/GetAuditPaymentsWithoutItems.js";
import safeParse from "../../shared/validation/safeParse.js";
import { paymentQuerySchema } from "../../shared/validation/audit.schema.js";

/**
 * @openapi
 * /audit/payments-without-items:
 *   get:
 *     summary: Obtiene pagos sin items asociados (auditoría)
 *     description: Devuelve una lista de pagos registrados que no tienen items vinculados. Útil para auditorías y conciliaciones.
 *     tags:
 *       - Audit
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         required: false
 *         description: Página a devolver (paginación, empieza en 1).
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *         required: false
 *         description: Cantidad de items por página.
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [detected_at, total_payments, payments_count]
 *         required: false
 *         description: Campo por el cual ordenar los resultados.
 *       - in: query
 *         name: sortDirection
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *         required: false
 *         description: Dirección de ordenamiento.
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Texto de búsqueda para filtrar pagos (por ejemplo, `order_id` o `payment_id`).
 *     responses:
 *       "200":
 *         description: Lista de pagos sin items asociados.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                 meta:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     pageSize:
 *                       type: integer
 *                     total:
 *                       type: integer
 *       "400":
 *         description: Parámetros inválidos en la consulta.
 *       "500":
 *         description: Error interno del servidor.
 */
export function auditPaymentsHandler(getAudit: GetAuditPaymentsWithoutItems) {
	return async (req: Request, res: Response, next: NextFunction) => {
		try {
			const params = safeParse(paymentQuerySchema, req.query);

			const response = await getAudit.execute(params);
			res.json(response);
		} catch (err) {
			next(err);
		}
	};
}
