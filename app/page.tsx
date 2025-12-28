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

export default async function DashboardPage() {
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
            <div className="mb-4 rounded-xl border border-amber-400/20 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">
              🧪 Using mock data for UI preview
            </div>
          )}
          <div className="mb-6">
            <h2 className="text-3xl font-semibold tracking-tight">Dashboard</h2>
            <p className="text-sm text-muted-foreground">Overview of your financial data</p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6 stagger-children">
            <Card>
              <CardHeader>
                <CardTitle>Revenue (This Month)</CardTitle>
                <CardDescription>Total income for current month</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(currentMonthSummary.revenue.total, "EUR")}
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  YTD: {formatCurrency(ytdSummary.revenue.total, "EUR")}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Expenses (This Month)</CardTitle>
                <CardDescription>Total expenses for current month</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(currentMonthSummary.expenses.total, "EUR")}
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  YTD: {formatCurrency(ytdSummary.expenses.total, "EUR")}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Net Result</CardTitle>
                <CardDescription>Revenue minus expenses</CardDescription>
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
                  YTD: {formatCurrency(ytdSummary.net.result, "EUR")}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Pending Invoices</CardTitle>
                <CardDescription>Invoices awaiting payment</CardDescription>
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
                <CardTitle>Germany (DE)</CardTitle>
                <CardDescription>DE operations summary</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Revenue:</span>
                    <span className="font-semibold">
                      {formatCurrency(deSummary.revenue.total, "EUR")}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Expenses:</span>
                    <span className="font-semibold">
                      {formatCurrency(deSummary.expenses.total, "EUR")}
                    </span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span>Net:</span>
                    <span className="font-semibold">
                      {formatCurrency(deSummary.net.result, "EUR")}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Mexico (MX)</CardTitle>
                <CardDescription>MX operations summary</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Revenue:</span>
                    <span className="font-semibold">
                      {formatCurrency(mxSummary.revenue.total, "MXN")}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Expenses:</span>
                    <span className="font-semibold">
                      {formatCurrency(mxSummary.expenses.total, "MXN")}
                    </span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span>Net:</span>
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
              <Button>New Invoice</Button>
            </Link>
            <Link href="/expenses/new">
              <Button variant="outline">New Expense</Button>
            </Link>
          </div>
        </main>
      </div>
    </div>
  );
}
