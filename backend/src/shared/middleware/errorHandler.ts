import type { Request, Response, NextFunction } from 'express'
import AppError from '../errors/AppError.js'
import { NODE_ENV } from '../utils/global-variables.js'

export type ErrorHandlerType = AppError | Error | unknown

export function errorHandler(err: ErrorHandlerType, req: Request, res: Response, next: NextFunction) {
  // If it's a SyntaxError (malformed JSON)
  if (err instanceof SyntaxError) {
    return res.status(400).json({
      status: 'error',
      statusCode: 400,
      message: 'Formato de JSON mal redactado. Verificar el JSON del cuerpo de la petición.',
      errorType: 'BadRequest',
    })
  }

  const statusCode = err instanceof AppError ? err.statusCode : 500
  const message =
    err instanceof AppError || (err instanceof Error && err.constructor === Error)
      ? (err as Error).message
      : 'Internal Server Error'

  const isDevelopment = NODE_ENV === 'development'
  const errorType = err instanceof AppError ? err.errorType : 'UnknownError'

  const details = err instanceof AppError && typeof err.details !== 'undefined' ? { details: err.details } : {}

  const stack = isDevelopment && (err instanceof AppError || err instanceof Error) ? { stack: (err as Error).stack } : {}

  res.status(statusCode).json({
    status: 'error',
    statusCode,
    message,
    errorType,
    ...details,
    ...stack,
  })
}

export default errorHandler
