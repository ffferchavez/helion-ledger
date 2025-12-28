import { cookies } from "next/headers";
import { DEFAULT_THEME, THEME_COOKIE, normalizeTheme } from "@/lib/theme";

export async function getTheme() {
  const cookieStore = await cookies();
  const stored = cookieStore.get(THEME_COOKIE)?.value;
  if (!stored) {
    return DEFAULT_THEME;
  }
  return normalizeTheme(stored);
}
