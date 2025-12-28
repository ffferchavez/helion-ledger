/**
 * Environment configuration helper
 * Makes it easy to switch between dev and prod
 */

export const env = {
  // App environment
  NODE_ENV: process.env.NODE_ENV || "development",
  isDevelopment: process.env.NODE_ENV === "development",
  isProduction: process.env.NODE_ENV === "production",

  // Supabase
  SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || "",

  // Database
  DATABASE_URL: process.env.DATABASE_URL || "",

  // App
  APP_URL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",

  // Feature flags
  USE_MOCK_DATA: process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true",
  MOCK_AUTH_USER_ID: process.env.MOCK_AUTH_USER_ID || "",
} as const;

/**
 * Validate required environment variables
 */
export function validateEnv() {
  const required = [
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  ];

  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0 && env.isProduction) {
    throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
  }

  if (missing.length > 0) {
    console.warn(`⚠️  Missing environment variables: ${missing.join(", ")}`);
    console.warn("   Some features may not work correctly");
  }
}

// Don't validate on import - let it fail gracefully at runtime
// validateEnv() can be called explicitly when needed

