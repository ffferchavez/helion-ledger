"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useI18n } from "@/components/providers/app-providers";

const navigation = [
  { key: "dashboard", href: "/dashboard" },
  { key: "invoices", href: "/invoices" },
  { key: "expenses", href: "/expenses" },
  { key: "reports", href: "/reports" },
  { key: "settings", href: "/settings" },
];

export function Sidebar() {
  const pathname = usePathname();
  const { t } = useI18n();

  return (
    <aside className="relative w-64 border-r border-sidebar-border bg-sidebar backdrop-blur-xl animate-in slide-in-from-left-4 duration-500">
      <div className="flex h-full flex-col">
        <div className="px-4 pb-4 pt-5">
          <div className="rounded-2xl border border-border bg-card/70 p-4 shadow-[0_20px_50px_-35px_rgba(94,163,255,0.4)]">
            <div className="text-[10px] uppercase tracking-[0.35em] text-muted-foreground">
              {t("sidebar.workspace")}
            </div>
            <div className="mt-3 flex items-center justify-between">
              <div>
                <div className="text-base font-semibold tracking-tight text-foreground">
                  {t("app.name")}
                </div>
                <div className="text-xs text-muted-foreground">{t("sidebar.tagline")}</div>
              </div>
              <div className="h-8 w-8 rounded-full border border-border bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.9),rgba(94,163,255,0.35)_45%,rgba(15,23,42,0.7)_70%)]" />
            </div>
          </div>
        </div>
        <div className="px-4">
          <div className="text-[11px] font-semibold uppercase tracking-[0.3em] text-muted-foreground">
            {t("sidebar.navigation")}
          </div>
        </div>
        <nav className="px-4 pb-4 pt-3 space-y-2">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.key}
              href={item.href}
                className={cn(
                  "group flex items-center gap-3 rounded-full px-4 py-2 text-sm font-semibold tracking-tight transition-all",
                  isActive
                    ? "bg-muted/60 text-foreground shadow-[0_0_0_1px_rgba(94,163,255,0.2),0_12px_30px_-20px_rgba(94,163,255,0.35)]"
                    : "text-muted-foreground hover:bg-muted/40 hover:text-foreground"
                )}
              >
                <span
                  className={cn(
                    "h-1.5 w-1.5 rounded-full transition-colors",
                    isActive
                      ? "bg-sky-400 shadow-[0_0_10px_rgba(125,211,252,0.7)]"
                      : "bg-muted-foreground/40 group-hover:bg-foreground/60"
                  )}
                />
                <span className="flex-1">{t(`nav.${item.key}`)}</span>
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto px-4 pb-5">
          <div className="rounded-2xl border border-border bg-gradient-to-r from-muted/50 to-transparent p-4 text-xs text-muted-foreground">
            {t("sidebar.tip")}
          </div>
        </div>
      </div>
    </aside>
  );
}
