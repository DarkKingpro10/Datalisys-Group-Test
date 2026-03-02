// Central access to environment variables
export const NODE_ENV = process.env.NODE_ENV || 'development'
export const DATABASE_URL = process.env.DATABASE_URL || ''
export const PORT = Number(process.env.PORT || 8000)

export default {
  NODE_ENV,
  DATABASE_URL,
  PORT,
}
