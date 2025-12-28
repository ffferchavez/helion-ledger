"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Moon, Plus, Search, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useI18n, useTheme } from "@/components/providers/app-providers";
import type { Locale } from "@/lib/i18n/constants";

export function Header() {
  const router = useRouter();
  const supabase = createClient();
  const { t, locale, setLocale } = useI18n();
  const { theme, toggleTheme } = useTheme();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/70 backdrop-blur-2xl animate-in fade-in duration-500">
      <div className="flex h-[72px] w-full items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full border border-border bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.9),rgba(94,163,255,0.35)_45%,rgba(15,23,42,0.7)_70%)] shadow-[inset_0_0_10px_rgba(255,255,255,0.2),0_10px_30px_-18px_rgba(94,163,255,0.8)]" />
          <h1 className="text-lg font-semibold tracking-tight">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-foreground via-foreground/80 to-sky-400">
              Helion
            </span>{" "}
            <span className="text-foreground">Ledger</span>
          </h1>
        </div>
        <div className="hidden flex-1 items-center justify-center md:flex">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={t("header.searchPlaceholder")}
              className="pl-9 pr-16"
            />
            <span className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 rounded-md border border-border bg-muted/40 px-2 py-0.5 text-[11px] text-muted-foreground sm:inline-flex">
              {t("header.cmdKey")}
            </span>
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2">
          <Select value={locale} onValueChange={(value) => setLocale(value as Locale)}>
            <SelectTrigger className="w-[120px] sm:w-[140px]" aria-label={t("header.languageLabel")}>
              <SelectValue aria-label={t("header.languageLabel")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">{t("languages.en")}</SelectItem>
              <SelectItem value="de">{t("languages.de")}</SelectItem>
              <SelectItem value="es">{t("languages.es")}</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={t("header.themeLabel")}
            onClick={toggleTheme}
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
          <Link href="/invoices/new">
            <Button size="sm">
              <Plus className="h-4 w-4" />
              {t("header.newInvoice")}
            </Button>
          </Link>
          <Link href="/expenses/new">
            <Button variant="outline" size="sm">
              {t("header.newExpense")}
            </Button>
          </Link>
          <Button variant="ghost" size="sm" onClick={handleSignOut}>
            {t("common.signOut")}
          </Button>
        </div>
      </div>
    </header>
  );
}
