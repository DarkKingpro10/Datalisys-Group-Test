import { Router } from 'express'
import { GetKpis } from '../../application/GetKpis.js'
import { GetTimeSeries } from '../../application/GetTimeSeries.js'
import { GetTopProducts } from '../../application/GetTopProducts.js'
import type { SalesReadRepository } from '../../domain/ports/SalesReadRepository.js'
import { SalesPrismaRepository } from '../../infrastructure/prisma/SalesPrismaRepository.js'
import { kpisHandler } from './kpis.controller.js'
import { trendHandler } from './trend.controller.js'
import { rankingsHandler } from './rankings.controller.js'

export function buildRoutes(): Router {
  const router = Router()
  const repo: SalesReadRepository = new SalesPrismaRepository()
  const getKpis = new GetKpis(repo)
  const getTimeSeries = new GetTimeSeries(repo)
  const getTopProducts = new GetTopProducts(repo)

  router.get('/health', (_req, res) => res.json({ status: 'ok' }))
  router.get('/kpis', kpisHandler(getKpis))
  router.get('/trend/revenue', trendHandler(getTimeSeries))
  router.get('/rankings/products', rankingsHandler(getTopProducts))

  return router
}
