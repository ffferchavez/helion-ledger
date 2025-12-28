import { createClient } from "./server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { env } from "@/lib/env";

/**
 * Get the current authenticated user's database record
 */
export async function getCurrentUser() {
  // Return null in mock mode
  if (env.USE_MOCK_DATA || !env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
    return null;
  }

  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) {
    return null;
  }

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.authUserId, authUser.id))
    .limit(1);

  return user || null;
}

/**
 * Get the current user's organization ID
 */
export async function getCurrentOrganizationId(): Promise<string | null> {
  const user = await getCurrentUser();
  return user?.organizationId || null;
}

/**
 * Require authentication and return the current user
 * Throws an error if user is not authenticated
 */
export async function requireAuth() {
  // In mock mode, return a mock user
  if (env.USE_MOCK_DATA || !env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
    return {
      id: "mock-user-id",
      authUserId: "mock-auth-user-id",
      organizationId: "mock-org-id",
      role: "owner" as const,
      email: "mock@example.com",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Unauthorized");
  }
  return user;
}

/**
 * Require authentication and return the organization ID
 * Throws an error if user is not authenticated
 */
export async function requireOrganizationId(): Promise<string> {
  // In mock mode, return a mock org ID
  if (env.USE_MOCK_DATA || !env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
    return "mock-org-id";
  }

  const orgId = await getCurrentOrganizationId();
  if (!orgId) {
    throw new Error("Unauthorized");
  }
  return orgId;
}

