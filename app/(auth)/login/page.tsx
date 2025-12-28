"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isDemoLoading, setIsDemoLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();
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
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoSignIn = async () => {
    if (!demoEmail || !demoPassword) {
      setError("Demo credentials are not configured. Set NEXT_PUBLIC_DEMO_EMAIL and NEXT_PUBLIC_DEMO_PASSWORD.");
      return;
    }

    setIsDemoLoading(true);
    setError(null);

    try {
      await signInWithPassword(demoEmail, demoPassword);
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setIsDemoLoading(false);
    }
  };

  const isBusy = isLoading || isDemoLoading;

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute -top-32 right-0 h-72 w-72 rounded-full bg-sky-400/20 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-0 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
      <div className="relative z-10 grid min-h-screen lg:grid-cols-[1.1fr_0.9fr]">
        <div className="flex flex-col justify-between px-6 pb-12 pt-10 lg:px-12">
          <div className="max-w-xl animate-in fade-in duration-700">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.3em] text-muted-foreground">
              Helion Ledger
            </div>
            <h1 className="mt-6 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              Finance, at modern speed.
            </h1>
            <p className="mt-4 text-sm text-muted-foreground sm:text-base">
              Track invoices, expenses, and reports in a single, polished workspace. Built for
              clarity, built for scale.
            </p>

            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                  Live reports
                </div>
                <div className="mt-3 text-lg font-semibold text-white">Real time insights</div>
                <div className="mt-2 text-xs text-muted-foreground">
                  Always current, always precise.
                </div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                  Multi currency
                </div>
                <div className="mt-3 text-lg font-semibold text-white">Global ready</div>
                <div className="mt-2 text-xs text-muted-foreground">
                  EUR, MXN, USD with ease.
                </div>
              </div>
            </div>
          </div>

          <div className="mt-10 text-xs text-muted-foreground">
            Security-first architecture with Supabase auth and row-level security.
          </div>
        </div>

        <div className="flex items-center justify-center px-6 pb-12 pt-6 lg:px-12">
          <Card className="w-full max-w-md border-white/15 bg-black/40 animate-in fade-in duration-500">
            <CardHeader>
              <CardTitle className="text-2xl">Welcome back</CardTitle>
              <CardDescription>Sign in to continue</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={handleDemoSignIn}
                disabled={isBusy}
              >
                {isDemoLoading ? "Starting demo..." : "Continue with demo"}
              </Button>

              <div className="flex items-center gap-3">
                <span className="h-px flex-1 bg-white/10" />
                <span className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
                  or
                </span>
                <span className="h-px flex-1 bg-white/10" />
              </div>

              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
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
                  <Label htmlFor="password">Password</Label>
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
                  <div className="rounded-xl border border-rose-400/20 bg-rose-500/10 p-3 text-sm text-rose-200">
                    {error}
                  </div>
                )}
                <Button type="submit" className="w-full" disabled={isBusy}>
                  {isLoading ? "Signing in..." : "Sign in"}
                </Button>
              </form>

              <div className="text-xs text-muted-foreground">
                Demo mode uses a shared workspace. Activity may reset periodically.
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
