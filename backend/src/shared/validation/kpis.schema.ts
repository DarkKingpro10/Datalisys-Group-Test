import { z } from 'zod'

// Esquema de validación: solo valida los parámetros de consulta.
// No aplica defaults ni transforma fechas — esa lógica está en `shared/utils/date.ts`.
export const KpisQuerySchema = z.object({
  from: z.string().refine((s) => !Number.isNaN(Date.parse(s)), { message: 'Invalid date' }).optional(),
  to: z.string().refine((s) => !Number.isNaN(Date.parse(s)), { message: 'Invalid date' }).optional(),
  order_status: z.preprocess((v) => (typeof v === 'string' ? v.split(',') : v), z.array(z.string()).optional()),
  product_category_name: z.preprocess((v) => (typeof v === 'string' ? v.split(',') : v), z.array(z.string()).optional()),
  customer_state: z.preprocess((v) => (typeof v === 'string' ? v.split(',') : v), z.array(z.string()).optional()),
})

export type KpisQuery = z.infer<typeof KpisQuerySchema>
