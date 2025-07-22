import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from "@shared/schema";
import { supabase } from "@shared/supabase";

// Get Supabase database URL from environment
const databaseUrl = process.env.SUPABASE_DATABASE_URL || process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error(
    "SUPABASE_DATABASE_URL or DATABASE_URL must be set. Did you forget to configure your Supabase database?",
  );
}

// Create postgres connection for Drizzle
export const connection = postgres(databaseUrl, {
  prepare: false,
  max: 20,
});

export const db = drizzle(connection, { schema });

// Export Supabase client for auth and real-time features
export { supabase };