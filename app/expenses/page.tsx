import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { requireOrganizationId } from "@/lib/supabase/auth-helpers";
import { getExpensesByOrganization } from "@/db/queries/expenses";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/currency";
import { formatDate } from "@/lib/date";
import { env } from "@/lib/env";
import { getMockExpenses } from "@/lib/mock-data-helpers";
import { getServerTranslations } from "@/lib/i18n/server";
import { getCountryLabelKey, getExpenseCategoryLabelKey } from "@/lib/i18n/formatters";

export default async function ExpensesPage() {
  const { t } = await getServerTranslations();
  let expenses: Awaited<ReturnType<typeof getExpensesByOrganization>>;

  if (env.USE_MOCK_DATA) {
    expenses = getMockExpenses() as any;
  } else {
    try {
      const organizationId = await requireOrganizationId();
      expenses = await getExpensesByOrganization(organizationId);
    } catch (error) {
      console.warn("Auth failed, using mock data:", error);
      expenses = getMockExpenses() as any;
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
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-3xl font-semibold tracking-tight">{t("expenses.title")}</h2>
              <p className="text-sm text-muted-foreground">{t("expenses.subtitle")}</p>
            </div>
            <Link href="/expenses/new">
              <Button>{t("expenses.newExpense")}</Button>
            </Link>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>{t("expenses.cardTitle")}</CardTitle>
              <CardDescription>{t("expenses.cardDesc")}</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("expenses.table.date")}</TableHead>
                    <TableHead>{t("expenses.table.vendor")}</TableHead>
                    <TableHead>{t("expenses.table.description")}</TableHead>
                    <TableHead>{t("expenses.table.category")}</TableHead>
                    <TableHead>{t("expenses.table.amount")}</TableHead>
                    <TableHead>{t("expenses.table.country")}</TableHead>
                    <TableHead>{t("expenses.table.deductible")}</TableHead>
                    <TableHead>{t("expenses.table.actions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {expenses.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center text-muted-foreground">
                        {t("expenses.empty")}
                      </TableCell>
                    </TableRow>
                  ) : (
                    expenses.map((expense) => (
                      <TableRow key={expense.id}>
                        <TableCell>{formatDate(expense.date)}</TableCell>
                        <TableCell className="font-medium">{expense.vendorName}</TableCell>
                        <TableCell>{expense.description || "-"}</TableCell>
                        <TableCell>
                          {t(`expenseCategories.${getExpenseCategoryLabelKey(expense.category)}`)}
                        </TableCell>
                        <TableCell>
                          {formatCurrency(parseFloat(expense.totalAmount), expense.currency as any)}
                        </TableCell>
                        <TableCell>{t(`countries.${getCountryLabelKey(expense.countryContext)}`)}</TableCell>
                        <TableCell>{expense.deductible ? t("common.yes") : t("common.no")}</TableCell>
                        <TableCell>
                          <Link href={`/expenses/${expense.id}`}>
                            <Button variant="ghost" size="sm">
                              {t("common.view")}
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
