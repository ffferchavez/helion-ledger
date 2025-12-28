"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Search, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function Header() {
  const router = useRouter();
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-40 border-b border-white/5 bg-black/70 backdrop-blur-2xl animate-in fade-in duration-500">
      <div className="container flex h-[72px] items-center justify-between gap-4 px-4">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full border border-white/10 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.9),rgba(94,163,255,0.35)_45%,rgba(15,23,42,0.7)_70%)] shadow-[inset_0_0_10px_rgba(255,255,255,0.2),0_10px_30px_-18px_rgba(94,163,255,0.8)]" />
          <h1 className="text-lg font-semibold tracking-tight">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-sky-300">
              Helion
            </span>{" "}
            <span className="text-white">Ledger</span>
          </h1>
        </div>
        <div className="hidden flex-1 items-center justify-center md:flex">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search invoices, expenses, clients..."
              className="pl-9 pr-16"
            />
            <span className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-[11px] text-muted-foreground sm:inline-flex">
              Cmd+K
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/invoices/new">
            <Button size="sm">
              <Plus className="h-4 w-4" />
              New invoice
            </Button>
          </Link>
          <Link href="/expenses/new">
            <Button variant="outline" size="sm">
              New expense
            </Button>
          </Link>
          <Button variant="ghost" size="sm" onClick={handleSignOut}>
            Sign out
          </Button>
        </div>
      </div>
    </header>
  );
}
