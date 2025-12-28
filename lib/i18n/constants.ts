import { LANGUAGE } from "@/lib/constants";

export const LOCALE_COOKIE = "hl_locale";

export const LOCALES = [LANGUAGE.EN, LANGUAGE.DE, LANGUAGE.ES] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = LANGUAGE.EN;
