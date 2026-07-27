// Creates one Prisma/PostgreSQL connection
import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient({
  log: ["query", "warn", "error"],
});