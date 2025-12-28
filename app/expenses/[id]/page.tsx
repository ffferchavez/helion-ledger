import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { requireOrganizationId } from "@/lib/supabase/auth-helpers";
import { getExpenseById } from "@/db/queries/expenses";
import { ExpenseForm } from "@/components/expenses/expense-form";
import { updateExpenseAction, deleteExpenseAction } from "../actions";
import { notFound, redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/currency";
import { formatDate } from "@/lib/date";
import { env } from "@/lib/env";
import { getMockExpenses } from "@/lib/mock-data-helpers";
import { getServerTranslations } from "@/lib/i18n/server";
import { getCountryLabelKey, getExpenseCategoryLabelKey, getPaymentMethodLabelKey } from "@/lib/i18n/formatters";

export default async function ExpenseDetailPage({ params }: { params: { id: string } }) {
  const { t } = await getServerTranslations();
  let expense: Awaited<ReturnType<typeof getExpenseById>> | null = null;

  if (env.USE_MOCK_DATA || !env.DATABASE_URL) {
    const mockExpenses = getMockExpenses();
    expense = (mockExpenses.find((exp) => exp.id === params.id) || null) as typeof expense;
  } else {
    try {
      const organizationId = await requireOrganizationId();
      expense = await getExpenseById(params.id, organizationId);
    } catch (error) {
      console.warn("Auth failed, using mock data:", error);
      const mockExpenses = getMockExpenses();
      expense = (mockExpenses.find((exp) => exp.id === params.id) || null) as typeof expense;
    }
  }

  if (!expense) {
    notFound();
  }

  // TypeScript doesn't narrow after notFound(), so we assert
  const expenseData = expense as NonNullable<typeof expense>;

  async function handleSubmit(data: any) {
    "use server";
    return await updateExpenseAction(params.id, data);
  }

  async function handleDelete() {
    "use server";
    await deleteExpenseAction(params.id);
    redirect("/expenses");
  }

  const expenseFormData = {
    vendorName: expenseData.vendorName,
    description: expenseData.description || "",
    amount: parseFloat(expenseData.amount),
    currency: expenseData.currency,
    taxRate: parseFloat(expenseData.taxRate),
    category: expenseData.category,
    countryContext: expenseData.countryContext,
    deductible: expenseData.deductible,
    date: expenseData.date,
    paymentMethod: expenseData.paymentMethod,
  };

  return (
    <div className="flex h-screen flex-col">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-6 sm:p-8 animate-in fade-in duration-500">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-3xl font-semibold tracking-tight">{t("expenses.detail.title")}</h2>
              <p className="text-sm text-muted-foreground">{t("expenses.detail.subtitle")}</p>
            </div>
            <form action={handleDelete}>
              <Button type="submit" variant="destructive">
                {t("common.delete")}
              </Button>
            </form>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <div className="md:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>{t("expenses.detail.title")}</CardTitle>
                  <CardDescription>{t("expenses.detail.subtitle")}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ExpenseForm initialData={expenseFormData} onSubmit={handleSubmit} />
                </CardContent>
              </Card>
            </div>

            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>{t("expenses.detail.summaryTitle")}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t("common.amount")}:</span>
                    <span className="font-semibold">
                      {formatCurrency(parseFloat(expenseData.amount), expenseData.currency as any)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t("common.tax")}:</span>
                    <span className="font-semibold">
                      {formatCurrency(parseFloat(expenseData.taxAmount), expenseData.currency as any)}
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-border pt-2">
                    <span className="font-bold">{t("common.total")}:</span>
                    <span className="text-xl font-bold">
                      {formatCurrency(parseFloat(expenseData.totalAmount), expenseData.currency as any)}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>{t("expenses.detail.infoTitle")}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">{t("common.date")}:</span>{" "}
                    <span className="font-medium">{formatDate(expenseData.date)}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">{t("expenses.table.category")}:</span>{" "}
                    <span className="font-medium">
                      {t(`expenseCategories.${getExpenseCategoryLabelKey(expenseData.category)}`)}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">{t("expenses.form.paymentMethod")}:</span>{" "}
                    <span className="font-medium">
                      {t(`paymentMethods.${getPaymentMethodLabelKey(expenseData.paymentMethod)}`)}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">{t("common.country")}:</span>{" "}
                    <span className="font-medium">{t(`countries.${getCountryLabelKey(expenseData.countryContext)}`)}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">{t("expenses.detail.deductibleLabel")}:</span>{" "}
                    <span className="font-medium">{expenseData.deductible ? t("common.yes") : t("common.no")}</span>
                  </div>
                  {expenseData.receiptUrl && (
                    <div className="pt-2">
                      <Button asChild variant="outline" className="w-full">
                        <a href={expenseData.receiptUrl} target="_blank" rel="noopener noreferrer">
                          {t("expenses.detail.viewReceipt")}
                        </a>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
