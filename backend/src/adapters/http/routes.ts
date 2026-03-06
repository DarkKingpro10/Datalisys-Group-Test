import { Router } from 'express'
import { GetKpis } from '../../application/GetKpis.js'
import { GetTimeSeries } from '../../application/GetTimeSeries.js'
import { GetTopProducts } from '../../application/GetTopProducts.js'
import type { SalesReadRepository } from '../../domain/ports/SalesReadRepository.js'
import { SalesPrismaRepository } from '../../infrastructure/prisma/SalesPrismaRepository.js'
import { kpisHandler } from './kpis.controller.js'
import { trendHandler } from './trend.controller.js'
import { rankingsHandler } from './rankings.controller.js'
import { orderStatusesHandler, customerStatesHandler, productCategoriesHandler } from './meta.controller.js'
import GetMeta from '../../application/GetMeta.js'
import { GetAuditPaymentsWithoutItems } from '../../application/GetAuditPaymentsWithoutItems.js'
import { auditPaymentsHandler } from './auditPaymentsHandler.controller.js'

export function buildRoutes(): Router {
  const router = Router()
  const repo: SalesReadRepository = new SalesPrismaRepository()
  const getKpis = new GetKpis(repo)
  const getTimeSeries = new GetTimeSeries(repo)
  const getTopProducts = new GetTopProducts(repo)
  const getMeta = new GetMeta(repo)
  const getAuditUseCase = new GetAuditPaymentsWithoutItems(repo)

  router.get('/health', (_req, res) => res.json({ status: 'ok' }))
  router.get('/kpis', kpisHandler(getKpis))
  router.get('/trend/revenue', trendHandler(getTimeSeries))
  router.get('/rankings/products', rankingsHandler(getTopProducts))
  router.get('/meta/order-statuses', orderStatusesHandler(getMeta))
  router.get('/meta/customer-states', customerStatesHandler(getMeta))
  router.get('/meta/product-categories', productCategoriesHandler(getMeta))
  router.get('/audit/payments-without-items', auditPaymentsHandler(getAuditUseCase))
  return router
}
