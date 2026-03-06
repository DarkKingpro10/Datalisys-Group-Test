import { describe, it, expect, vi } from 'vitest'
import { GetTopProducts } from '../GetTopProducts.js'

describe('GetTopProducts', () => {
  it('delegates a repo.getTopProducts y retorna resultados', async () => {
    const sample = [
      { product_id: 'p1', product_category_name: 'cat', gmv: 100, revenue: 80, orders: 5 },
    ]

    const repo = {
      getTopProducts: vi.fn().mockResolvedValue(sample),
    } as any

    const svc = new GetTopProducts(repo)
    const from = new Date('2020-01-01')
    const to = new Date('2020-01-31')
    const result = await svc.execute({ from, to, metric: 'revenue', limit: 10 })

    expect(result).toEqual(sample)
    expect(repo.getTopProducts).toHaveBeenCalledOnce()
    expect(repo.getTopProducts).toHaveBeenCalledWith({ from, to, metric: 'revenue', limit: 10 })
  })
})
