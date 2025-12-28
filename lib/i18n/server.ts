import { cookies } from "next/headers";
import { DEFAULT_LOCALE, LOCALE_COOKIE, type Locale } from "@/lib/i18n/constants";
import { getDictionary, translate } from "@/lib/i18n/dictionaries";

export async function getLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const stored = cookieStore.get(LOCALE_COOKIE)?.value;
  if (stored === "en" || stored === "de" || stored === "es") {
    return stored;
  }
  return DEFAULT_LOCALE;
}

export async function getServerTranslations() {
  const locale = await getLocale();
  const dictionary = getDictionary(locale);
  const t = (path: string, values?: Record<string, string | number>) =>
    translate(dictionary, path, values);

  return { locale, dictionary, t };
}
