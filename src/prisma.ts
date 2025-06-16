import { PrismaClient } from "@prisma/client"

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
})

// Pre-warm the database connection
prisma.$connect().then(() => {
  console.log("Database connection pre-warmed");
}).catch(() => {
  // Silently fail
})

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma
  
// Graceful shutdown
process.on("beforeExit", async () => {
  try {
    await prisma.$disconnect();
  } catch {
    console.log("Database connection pre-warming failed")
  }
}); 