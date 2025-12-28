import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { requireOrganizationId } from "@/lib/supabase/auth-helpers";
import { getFinancialSummary } from "@/db/queries/reports";
import { getInvoicesByOrganization } from "@/db/queries/invoices";
import { getCurrentYear, getCurrentMonth, getPeriodDates } from "@/lib/date";
import { formatCurrency } from "@/lib/currency";
import { COUNTRY_CONTEXT } from "@/lib/constants";
import { env } from "@/lib/env";
import { getMockFinancialSummary, getMockInvoices } from "@/lib/mock-data-helpers";
import { getServerTranslations } from "@/lib/i18n/server";

export default async function DashboardPage() {
  const { t } = await getServerTranslations();
  let currentMonthSummary: Awaited<ReturnType<typeof getFinancialSummary>>;
  let ytdSummary: Awaited<ReturnType<typeof getFinancialSummary>>;
  let deSummary: Awaited<ReturnType<typeof getFinancialSummary>>;
  let mxSummary: Awaited<ReturnType<typeof getFinancialSummary>>;
  let pendingInvoices: any[] = [];

  if (env.USE_MOCK_DATA) {
    currentMonthSummary = getMockFinancialSummary();
    ytdSummary = getMockFinancialSummary();
    deSummary = getMockFinancialSummary();
    mxSummary = getMockFinancialSummary();
    pendingInvoices = getMockInvoices().filter(
      (inv) => inv.status === "sent" || inv.status === "overdue"
    );
  } else {
    try {
      const organizationId = await requireOrganizationId();
      const year = getCurrentYear();
      const month = getCurrentMonth();
      const { start, end } = getPeriodDates(year, "monthly", month);

      // Get current month summary
      currentMonthSummary = await getFinancialSummary(organizationId, start, end);

      // Get YTD summary
      const ytdStart = new Date(year, 0, 1);
      const ytdEnd = new Date();
      ytdSummary = await getFinancialSummary(organizationId, ytdStart, ytdEnd);

      // Get DE summary for current month
      deSummary = await getFinancialSummary(organizationId, start, end, COUNTRY_CONTEXT.DE);

      // Get MX summary for current month
      mxSummary = await getFinancialSummary(organizationId, start, end, COUNTRY_CONTEXT.MX);

      // Get pending invoices
      const allInvoices = await getInvoicesByOrganization(organizationId);
      pendingInvoices = allInvoices.filter(
        (inv) => inv.status === "sent" || inv.status === "overdue"
      );
    } catch (error) {
      console.warn("Auth failed, using mock data:", error);
      currentMonthSummary = getMockFinancialSummary();
      ytdSummary = getMockFinancialSummary();
      deSummary = getMockFinancialSummary();
      mxSummary = getMockFinancialSummary();
      pendingInvoices = getMockInvoices().filter(
        (inv) => inv.status === "sent" || inv.status === "overdue"
      );
    }
  }

  return (
    <div className="flex h-screen flex-col">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-6 sm:p-8 animate-in fade-in duration-500">
          {env.USE_MOCK_DATA && (
            <div className="mb-4 rounded-xl border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-sm text-amber-900 dark:text-amber-100">
              {t("mock.banner")}
            </div>
          )}
          <div className="mb-6">
            <h2 className="text-3xl font-semibold tracking-tight">{t("dashboard.title")}</h2>
            <p className="text-sm text-muted-foreground">{t("dashboard.subtitle")}</p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6 stagger-children">
            <Card>
              <CardHeader>
                <CardTitle>{t("dashboard.revenueMonth")}</CardTitle>
                <CardDescription>{t("dashboard.revenueDesc")}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(currentMonthSummary.revenue.total, "EUR")}
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  {t("dashboard.ytd")}: {formatCurrency(ytdSummary.revenue.total, "EUR")}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>{t("dashboard.expensesMonth")}</CardTitle>
                <CardDescription>{t("dashboard.expensesDesc")}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(currentMonthSummary.expenses.total, "EUR")}
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  {t("dashboard.ytd")}: {formatCurrency(ytdSummary.expenses.total, "EUR")}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>{t("dashboard.netResult")}</CardTitle>
                <CardDescription>{t("dashboard.netDesc")}</CardDescription>
              </CardHeader>
              <CardContent>
                <div
                  className={`text-2xl font-bold ${
                    currentMonthSummary.net.result >= 0 ? "text-emerald-400" : "text-rose-400"
                  }`}
                >
                  {formatCurrency(currentMonthSummary.net.result, "EUR")}
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  {t("dashboard.ytd")}: {formatCurrency(ytdSummary.net.result, "EUR")}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>{t("dashboard.pendingInvoices")}</CardTitle>
                <CardDescription>{t("dashboard.pendingDesc")}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{pendingInvoices.length}</div>
                <div className="text-sm text-muted-foreground mt-1">
                  {formatCurrency(
                    pendingInvoices.reduce(
                      (sum, inv) => sum + parseFloat(inv.totalAmount),
                      0
                    ),
                    "EUR"
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2 mb-6 stagger-children">
            <Card>
              <CardHeader>
                <CardTitle>{t("dashboard.germanyTitle")}</CardTitle>
                <CardDescription>{t("dashboard.germanyDesc")}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>{t("dashboard.revenueLabel")}:</span>
                    <span className="font-semibold">
                      {formatCurrency(deSummary.revenue.total, "EUR")}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t("dashboard.expensesLabel")}:</span>
                    <span className="font-semibold">
                      {formatCurrency(deSummary.expenses.total, "EUR")}
                    </span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span>{t("dashboard.netLabel")}:</span>
                    <span className="font-semibold">
                      {formatCurrency(deSummary.net.result, "EUR")}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>{t("dashboard.mexicoTitle")}</CardTitle>
                <CardDescription>{t("dashboard.mexicoDesc")}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>{t("dashboard.revenueLabel")}:</span>
                    <span className="font-semibold">
                      {formatCurrency(mxSummary.revenue.total, "MXN")}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t("dashboard.expensesLabel")}:</span>
                    <span className="font-semibold">
                      {formatCurrency(mxSummary.expenses.total, "MXN")}
                    </span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span>{t("dashboard.netLabel")}:</span>
                    <span className="font-semibold">
                      {formatCurrency(mxSummary.net.result, "MXN")}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link href="/invoices/new">
              <Button>{t("header.newInvoice")}</Button>
            </Link>
            <Link href="/expenses/new">
              <Button variant="outline">{t("header.newExpense")}</Button>
            </Link>
          </div>
        </main>
      </div>
    </div>
  );
}
