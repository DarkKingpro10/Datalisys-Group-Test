import "dotenv/config"
import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "../../generated/prisma/client.js"

let prisma: PrismaClient | null = null

export function createPrismaClient(): PrismaClient {
  if (!prisma) {
    const connectionString = process.env.DATABASE_URL || ""
    const adapter = new PrismaPg({ connectionString })
    prisma = new PrismaClient({ adapter })
  }
  return prisma
}

export async function connectPrisma() {
  const client = createPrismaClient()
  await client.$connect()
}

export async function disconnectPrisma() {
  if (prisma) {
    await prisma.$disconnect()
    prisma = null
  }
}

export function getPrisma(): PrismaClient {
  if (!prisma) throw new Error('Prisma client not initialized. Call connectPrisma first.')
  return prisma
}

