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
  app.use(cors())
  app.use(express.json())
  app.use(morgan('dev'))

  // Swagger UI (OpenAPI) disponible en /api/docs
  app.use('/api/docs', buildSwaggerRouter())

  app.use('/api', buildRoutes())

  // centralized error handler
  app.use(errorHandler)

  return app
}
