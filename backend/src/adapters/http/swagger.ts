import { Router } from 'express'
import swaggerJSDoc from 'swagger-jsdoc'
import swaggerUi from 'swagger-ui-express'

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Commercial KPI Dashboard - API',
      version: '1.0.0',
      description: 'APIs para KPIs, tendencias y rankings (consulta desde dwh.fact_sales)'
    },
    servers: [{ url: '/api' }]
  },
  // Scan controller files for JSDoc/OpenAPI annotations if present
  apis: ['./src/adapters/http/*.ts', './src/adapters/http/*.js']
}

const swaggerSpec = swaggerJSDoc(options)

export function buildSwaggerRouter(): Router {
  const router = Router()
  router.use('/', swaggerUi.serve, swaggerUi.setup(swaggerSpec))
  return router
}

export default buildSwaggerRouter
