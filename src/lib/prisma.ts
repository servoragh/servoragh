import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export function getPrisma(): PrismaClient {
  let client = globalForPrisma.prisma;
  if (!client || !(client as any).customerAddress) {
    try {
      // Clear require cache for @prisma/client in dev to load updated schema
      Object.keys(require.cache).forEach((key) => {
        if (key.includes("@prisma") || key.includes(".prisma")) {
          delete require.cache[key];
        }
      });
    } catch {}

    const { PrismaClient: FreshPrismaClient } = require("@prisma/client");
    client = new FreshPrismaClient({
      datasources: {
        db: {
          url: process.env.DIRECT_URL || process.env.DATABASE_URL,
        },
      },
      log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    });
    globalForPrisma.prisma = client;
  }
  return client!;
}

export const prisma: PrismaClient = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    const client = getPrisma() as any;
    const val = client[prop];
    if (typeof val === "function") {
      return val.bind(client);
    }
    return val;
  },
});
