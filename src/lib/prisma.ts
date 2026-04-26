import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "@prisma/client"
import { Pool } from "pg"

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
// Learn more: https://pris.ly/d/help/next-js-best-practices

const globalForPrisma = global as unknown as { prisma: PrismaClient }
const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  console.warn("DATABASE_URL is not set. Database operations will fail at runtime.")
}

const pool = connectionString ? new Pool({
  connectionString,
}) : null

const adapter = pool ? new PrismaPg(pool) : null

export const prisma = globalForPrisma.prisma || new PrismaClient(adapter ? { adapter } : undefined)

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma
