import { z } from 'zod'
import AppError from '../errors/AppError.js'
import HttpTypes from '../types/http-types.js'

export function safeParse<T>(schema: z.ZodSchema<T>, data: unknown): T {
  const res = schema.safeParse(data)
  if (!res.success) {
    throw new AppError('Validation failed', HttpTypes.INVALID_INPUT_FORMAT, z.treeifyError(res.error))
  }
  return res.data
}

export default safeParse
