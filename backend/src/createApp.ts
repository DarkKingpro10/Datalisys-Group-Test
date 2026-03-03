import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import { buildRoutes } from './adapters/http/routes.js'
import { buildSwaggerRouter } from './adapters/http/swagger.js'
import { errorHandler } from './shared/middleware/errorHandler.js'

export function createApp() {
  const app = express()
  app.use(helmet())
  // Permitir CORS para el frontend en desarrollo (puerto 3000).
  // Se puede sobrescribir con la variable de entorno `FRONTEND_URL`.
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000'
  const allowedOrigins = [frontendUrl, 'http://127.0.0.1:3000']
  app.use(
    cors({
      origin: allowedOrigins,
      credentials: true,
    })
  )
  app.use(express.json())
  app.use(morgan('dev'))

  // Swagger UI (OpenAPI) disponible en /api/docs
  app.use('/api/docs', buildSwaggerRouter())

  app.use('/api', buildRoutes())

  // centralized error handler
  app.use(errorHandler)

  return app
}
