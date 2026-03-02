import { Router } from 'express'
import { GetKpis } from '../../application/GetKpis.js'
import type { SalesReadRepository } from '../../domain/ports/SalesReadRepository.js'
import { SalesPrismaRepository } from '../../infrastructure/prisma/SalesPrismaRepository.js'
import { kpisHandler } from './kpis.controller.js'

export function buildRoutes(): Router {
  const router = Router()
  const repo: SalesReadRepository = new SalesPrismaRepository()
  const getKpis = new GetKpis(repo)

  router.get('/health', (_req, res) => res.json({ status: 'ok' }))
  router.get('/kpis', kpisHandler(getKpis))

  return router
}
