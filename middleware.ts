import { updateSession } from "@/lib/supabase/middleware";
import { type NextRequest, NextResponse } from "next/server";
import { env } from "@/lib/env";

export async function middleware(request: NextRequest) {
  // Skip middleware entirely in mock mode or if Supabase is not configured
  if (env.USE_MOCK_DATA || !env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
    return NextResponse.next();
  }

  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

