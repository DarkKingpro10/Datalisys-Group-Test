import { createApp } from './createApp.js'
import { connectPrisma, disconnectPrisma } from './infrastructure/prisma/client.js'
import { fileURLToPath } from 'url'

const PORT = Number(process.env.PORT || 8000)

export async function startServer() {
  await connectPrisma()
  const app = createApp()
  const server = app.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`Server listening on port ${PORT}`)
  })

  const shutdown = async () => {
    // eslint-disable-next-line no-console
    console.log('Shutting down...')
    server.close(async () => {
      await disconnectPrisma()
      // eslint-disable-next-line no-console
      console.log('Server closed')
      process.exit(0)
    })
  }

  process.on('SIGINT', shutdown)
  process.on('SIGTERM', shutdown)
}

// Ejecutar automáticamente cuando se invoca este archivo directamente en ESM
const __filename = fileURLToPath(import.meta.url)
if (process.argv[1] === __filename) {
  startServer().catch((err) => {
    // eslint-disable-next-line no-console
    console.error('Failed to start server', err)
    process.exit(1)
  })
}
