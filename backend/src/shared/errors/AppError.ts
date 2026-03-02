import type { HttpTypesI } from '../types/http-types.js'

export class AppError extends Error {
  public statusCode: number
  public errorType: string
  public details?: unknown

  constructor(message: string, statusOrType: number | HttpTypesI = 400, details?: unknown, errorType?: string) {
    super(message)

    if (typeof statusOrType === 'object') {
      this.statusCode = statusOrType.code
      this.errorType = statusOrType.type
    } else {
      this.statusCode = statusOrType
      this.errorType = errorType || 'AppError'
    }

    this.details = details
    Object.setPrototypeOf(this, AppError.prototype)
  }
}

export default AppError
