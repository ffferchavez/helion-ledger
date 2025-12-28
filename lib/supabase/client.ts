import { createBrowserClient } from "@supabase/ssr";
import { env } from "@/lib/env";

export function createClient() {
  // Return a mock client if using mock data or missing config
  if (env.USE_MOCK_DATA || !env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
    return {
      auth: {
        signInWithPassword: async () => ({ data: { user: null, session: null }, error: null }),
        signOut: async () => ({ error: null }),
        getUser: async () => ({ data: { user: null }, error: null }),
      },
    } as any;
  }

  return createBrowserClient(
    env.SUPABASE_URL,
    env.SUPABASE_ANON_KEY
  );
}

