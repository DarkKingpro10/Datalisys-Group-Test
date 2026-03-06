import { describe, it, expect, vi } from 'vitest'
import { GetKpis } from '../GetKpis.js'

describe('GetKpis', () => {
  it('calcula correctamente AOV e IPO cuando hay pedidos', async () => {
    const mockAgg = {
      gmv: 100,
      revenue: 200,
      orders: 10,
      items: 20,
      cancel_rate: 0.1,
      on_time_rate: 0.9,
    }

    const repo = {
      aggregateSalesMetrics: vi.fn().mockResolvedValue(mockAgg),
    } as any

    const svc = new GetKpis(repo)
    const result = await svc.execute({ from: new Date('2020-01-01'), to: new Date('2020-01-31') })

    expect(result.gmv).toBe(100)
    expect(result.revenue).toBe(200)
    expect(result.orders).toBe(10)
    expect(result.aov).toBe(20) // 200 / 10
    expect(result.ipo).toBe(2) // 20 / 10
    expect(result.cancel_rate).toBeCloseTo(0.1)
    expect(result.on_time_rate).toBeCloseTo(0.9)
    expect(repo.aggregateSalesMetrics).toHaveBeenCalledOnce()
  })

  it('maneja correctamente cuando no hay pedidos (orders = 0)', async () => {
    const mockAgg = {
      gmv: 0,
      revenue: 0,
      orders: 0,
      items: 0,
      cancel_rate: 0,
      on_time_rate: 0,
    }

    const repo = {
      aggregateSalesMetrics: vi.fn().mockResolvedValue(mockAgg),
    } as any

    const svc = new GetKpis(repo)
    const result = await svc.execute({ from: new Date('2020-01-01'), to: new Date('2020-01-31') })

    expect(result.orders).toBe(0)
    expect(result.aov).toBe(0)
    expect(result.ipo).toBe(0)
    expect(repo.aggregateSalesMetrics).toHaveBeenCalledOnce()
  })
})
