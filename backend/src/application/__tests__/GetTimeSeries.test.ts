import { describe, it, expect, vi } from 'vitest'
import { GetTimeSeries } from '../GetTimeSeries.js'

describe('GetTimeSeries', () => {
  it('retorna la serie temporal tal como la entrega el repositorio', async () => {
    const sample = [
      { date: '2020-01-01', revenue: 100, orders: 2 },
      { date: '2020-01-02', revenue: 150, orders: 3 },
    ]

    const repo = {
      getTimeSeries: vi.fn().mockResolvedValue(sample),
    } as any

    const svc = new GetTimeSeries(repo)
    const result = await svc.execute({ from: new Date('2020-01-01'), to: new Date('2020-01-07'), grain: 'day' })

    expect(result).toEqual(sample)
    expect(repo.getTimeSeries).toHaveBeenCalledOnce()
    expect(repo.getTimeSeries).toHaveBeenCalledWith({ from: new Date('2020-01-01'), to: new Date('2020-01-07'), grain: 'day' })
  })
})
