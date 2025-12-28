"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Moon, Sun } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useI18n, useTheme } from "@/components/providers/app-providers";
import type { Locale } from "@/lib/i18n/constants";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();
  const { t, locale, setLocale } = useI18n();
  const { theme, toggleTheme } = useTheme();
  const demoEmail = process.env.NEXT_PUBLIC_DEMO_EMAIL || "";
  const demoPassword = process.env.NEXT_PUBLIC_DEMO_PASSWORD || "";

  const signInWithPassword = async (nextEmail: string, nextPassword: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email: nextEmail,
      password: nextPassword,
    });

    if (error) {
      setError(error.message);
      return false;
    }

    router.push("/");
    router.refresh();
    return true;
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await signInWithPassword(email, password);
    } catch (err) {
      setError(t("common.unexpectedError"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoFill = () => {
    if (!demoEmail || !demoPassword) {
      setError(t("login.demoNotConfigured"));
      return;
    }

    setError(null);
    setEmail(demoEmail);
    setPassword(demoPassword);
  };

  const isBusy = isLoading;

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute -top-32 right-0 h-72 w-72 rounded-full bg-sky-400/20 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-0 h-80 w-80 rounded-full bg-muted/40 blur-3xl" />
      <div className="absolute right-6 top-6 z-20 flex items-center gap-2">
        <Select value={locale} onValueChange={(value) => setLocale(value as Locale)}>
          <SelectTrigger className="w-[140px]" aria-label={t("header.languageLabel")}>
            <SelectValue aria-label={t("header.languageLabel")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="en">{t("languages.en")}</SelectItem>
            <SelectItem value="de">{t("languages.de")}</SelectItem>
            <SelectItem value="es">{t("languages.es")}</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="ghost" size="icon-sm" aria-label={t("header.themeLabel")} onClick={toggleTheme}>
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
      </div>
      <div className="relative z-10 grid min-h-screen lg:grid-cols-[1.1fr_0.9fr]">
        <div className="flex flex-col justify-between px-6 pb-12 pt-10 lg:px-12">
          <div className="max-w-xl animate-in fade-in duration-700">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1 text-xs uppercase tracking-[0.3em] text-muted-foreground">
              {t("app.name")}
            </div>
            <h1 className="mt-6 text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
              {t("login.heroTitle")}
            </h1>
            <p className="mt-4 text-sm text-muted-foreground sm:text-base">
              {t("login.heroSubtitle")}
            </p>

            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-border bg-card/70 p-4">
                <div className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                  {t("login.liveReportsLabel")}
                </div>
                <div className="mt-3 text-lg font-semibold text-foreground">{t("login.liveReportsTitle")}</div>
                <div className="mt-2 text-xs text-muted-foreground">{t("login.liveReportsDesc")}</div>
              </div>
              <div className="rounded-2xl border border-border bg-card/70 p-4">
                <div className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                  {t("login.multiCurrencyLabel")}
                </div>
                <div className="mt-3 text-lg font-semibold text-foreground">{t("login.multiCurrencyTitle")}</div>
                <div className="mt-2 text-xs text-muted-foreground">{t("login.multiCurrencyDesc")}</div>
              </div>
            </div>
          </div>

          <div className="mt-10 text-xs text-muted-foreground">
            {t("login.securityNote")}
          </div>
        </div>

        <div className="flex items-center justify-center px-6 pb-12 pt-6 lg:px-12">
          <Card className="w-full max-w-md border-border bg-card/80 animate-in fade-in duration-500">
            <CardHeader>
              <CardTitle className="text-2xl">{t("login.welcomeBack")}</CardTitle>
              <CardDescription>{t("login.signInContinue")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={handleDemoFill}
                disabled={isBusy}
              >
                {t("login.continueDemo")}
              </Button>

              <div className="flex items-center gap-3">
                <span className="h-px flex-1 bg-border" />
                <span className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
                  {t("login.dividerOr")}
                </span>
                <span className="h-px flex-1 bg-border" />
              </div>

              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">{t("common.email")}</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isBusy}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">{t("common.password")}</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="********"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isBusy}
                  />
                </div>
                {error && (
                  <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                    {error}
                  </div>
                )}
                <Button type="submit" className="w-full" disabled={isBusy}>
                  {isLoading ? `${t("common.signIn")}...` : t("common.signIn")}
                </Button>
              </form>

              <div className="text-xs text-muted-foreground">
                {t("login.demoNote")}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
