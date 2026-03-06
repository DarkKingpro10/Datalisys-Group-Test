import { it, expect, vi } from 'vitest'
import request from 'supertest'

// Mock data used by the fake repository implementation below
const mockAgg = {
  gmv: 500,
  revenue: 400,
  orders: 4,
  items: 8,
  cancel_rate: 0.0,
  on_time_rate: 1.0,
}

// Mock the Prisma repository module before importing the app so that
// the app's route construction uses our mocked methods.
vi.mock('../../infrastructure/prisma/SalesPrismaRepository.js', () => {
  return {
    SalesPrismaRepository: class {
      aggregateSalesMetrics() {
        return Promise.resolve(mockAgg)
      }
      getTimeSeries() {
        return Promise.resolve([])
      }
      getTopProducts() {
        return Promise.resolve([])
      }
      listOrderStatuses() {
        return Promise.resolve([])
      }
      listCustomerStates() {
        return Promise.resolve([])
      }
      listProductCategories() {
        return Promise.resolve([])
      }
    },
  }
})

import { createApp } from '../../createApp.js'

it('GET /api/kpis devuelve JSON con KPIs (supertest + app real)', async () => {
  const app = createApp()
  const res = await request(app).get('/api/kpis').query({ from: '2020-01-01', to: '2020-01-31' })

  expect(res.status).toBe(200)
  expect(res.body).toMatchObject({
    gmv: 500,
    revenue: 400,
    orders: 4,
    aov: 100,
    ipo: 2,
  })
})
