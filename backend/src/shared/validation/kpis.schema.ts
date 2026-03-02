import { z } from 'zod'

export const KpisQuerySchema = z.object({
  from: z.string().refine((s) => !Number.isNaN(Date.parse(s)), { message: 'Invalid date' }),
  to: z.string().refine((s) => !Number.isNaN(Date.parse(s)), { message: 'Invalid date' }),
  order_status: z.preprocess((v) => (typeof v === 'string' ? v.split(',') : v), z.array(z.string()).optional()),
  product_category_name: z.preprocess((v) => (typeof v === 'string' ? v.split(',') : v), z.array(z.string()).optional()),
  customer_state: z.preprocess((v) => (typeof v === 'string' ? v.split(',') : v), z.array(z.string()).optional()),
})

export type KpisQuery = z.infer<typeof KpisQuerySchema>
