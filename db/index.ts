import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";
import { env } from "@/lib/env";

// Only create database connection if DATABASE_URL is set
// Pages will use mock data if USE_MOCK_DATA is true or if connection fails
let dbInstance: ReturnType<typeof drizzle>;

if (env.DATABASE_URL && !env.USE_MOCK_DATA) {
  const client = postgres(env.DATABASE_URL);
  dbInstance = drizzle(client, { schema });
} else {
  // Create a minimal mock db that returns empty arrays
  // This prevents crashes but queries won't work - pages should use mock data helpers instead
  const createMockQuery = () => ({
    where: () => createMockQuery(),
    orderBy: () => Promise.resolve([]),
    limit: () => Promise.resolve([]),
  });
  
  dbInstance = {
    select: () => ({
      from: () => createMockQuery(),
    }),
    insert: () => ({ values: () => ({ returning: () => Promise.resolve([]) }) }),
    update: () => ({ set: () => ({ where: () => ({ returning: () => Promise.resolve([]) }) }) }),
    delete: () => ({ where: () => Promise.resolve(undefined) }),
  } as any;
}

export const db = dbInstance;

