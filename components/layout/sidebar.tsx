"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Dashboard", href: "/" },
  { name: "Invoices", href: "/invoices" },
  { name: "Expenses", href: "/expenses" },
  { name: "Reports", href: "/reports" },
  { name: "Settings", href: "/settings" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="relative w-64 border-r border-white/5 bg-[linear-gradient(180deg,rgba(15,18,24,0.95),rgba(10,12,16,0.9))] backdrop-blur-xl animate-in slide-in-from-left-4 duration-500">
      <div className="flex h-full flex-col">
        <div className="px-4 pb-4 pt-5">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-[0_20px_50px_-35px_rgba(94,163,255,0.7)]">
            <div className="text-[10px] uppercase tracking-[0.35em] text-muted-foreground">
              Workspace
            </div>
            <div className="mt-3 flex items-center justify-between">
              <div>
                <div className="text-base font-semibold tracking-tight text-white">
                  Helion Ledger
                </div>
                <div className="text-xs text-muted-foreground">
                  Financial backoffice
                </div>
              </div>
              <div className="h-8 w-8 rounded-full border border-white/10 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.9),rgba(94,163,255,0.35)_45%,rgba(15,23,42,0.7)_70%)]" />
            </div>
          </div>
        </div>
        <div className="px-4">
          <div className="text-[11px] font-semibold uppercase tracking-[0.3em] text-muted-foreground">
            Navigation
          </div>
        </div>
        <nav className="px-4 pb-4 pt-3 space-y-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "group flex items-center gap-3 rounded-full px-4 py-2 text-sm font-semibold tracking-tight transition-all",
                  isActive
                    ? "bg-white/10 text-white shadow-[0_0_0_1px_rgba(255,255,255,0.1),0_12px_30px_-20px_rgba(94,163,255,0.8)]"
                    : "text-slate-300 hover:bg-white/5 hover:text-white"
                )}
              >
                <span
                  className={cn(
                    "h-1.5 w-1.5 rounded-full transition-colors",
                    isActive
                      ? "bg-sky-400 shadow-[0_0_10px_rgba(125,211,252,0.9)]"
                      : "bg-white/30 group-hover:bg-white/70"
                  )}
                />
                <span className="flex-1">{item.name}</span>
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto px-4 pb-5">
          <div className="rounded-2xl border border-white/10 bg-gradient-to-r from-white/5 to-transparent p-4 text-xs text-muted-foreground">
            Tip: Use the search bar to jump to invoices, expenses, and clients fast.
          </div>
        </div>
      </div>
    </aside>
  );
}
