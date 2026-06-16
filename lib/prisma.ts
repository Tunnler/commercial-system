import { PrismaClient } from "@/lib/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL!
})

const globalFormPrisma = global as unknown as { prisma: PrismaClient }

const prisma = globalFormPrisma.prisma || new PrismaClient({
    adapter,
})

if (process.env.NODE_ENV !== "production") globalFormPrisma.prisma = prisma;

export default prisma;