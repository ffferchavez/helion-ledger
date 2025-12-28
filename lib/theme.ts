export const THEME_COOKIE = "hl_theme";

export const THEMES = ["light", "dark"] as const;

export type Theme = (typeof THEMES)[number];

export const DEFAULT_THEME: Theme = "dark";

export function normalizeTheme(value?: string): Theme {
  return value === "light" ? "light" : "dark";
}
