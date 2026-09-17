import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';
import dotenv from 'dotenv';

dotenv.config();

if (!process.env.POSTGRES_URL) {
  throw new Error('POSTGRES_URL environment variable is not set');
}

// Next.js dev (Turbopack/webpack) hot-reloads this module on every save,
// which would otherwise open a brand new connection pool each time and
// leak connections against the database's connection limit. Cache the
// client on `globalThis` across reloads in development.
const globalForDb = globalThis as unknown as {
  __postgresClient?: ReturnType<typeof postgres>;
};

export const client =
  globalForDb.__postgresClient ??
  // `prepare: false` is required for Supabase's connection pooler
  // (Supavisor), which runs in transaction mode and doesn't support
  // named prepared statements.
  postgres(process.env.POSTGRES_URL, { max: 5, prepare: false });

if (process.env.NODE_ENV !== 'production') {
  globalForDb.__postgresClient = client;
}

export const db = drizzle(client, { schema });
