import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { ExpenseForm } from "@/components/expenses/expense-form";
import { createExpenseAction } from "../actions";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getServerTranslations } from "@/lib/i18n/server";

export default async function NewExpensePage() {
  const { t } = await getServerTranslations();
  async function handleSubmit(data: any) {
    "use server";
    const result = await createExpenseAction(data);
    if (result.success && result.data) {
      redirect(`/expenses/${result.data.id}`);
    }
    return result;
  }

  return (
    <div className="flex h-screen flex-col">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-6 sm:p-8 animate-in fade-in duration-500">
          <div className="mb-6">
            <h2 className="text-3xl font-semibold tracking-tight">{t("expenses.newExpense")}</h2>
            <p className="text-sm text-muted-foreground">{t("expenses.newSubtitle")}</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>{t("expenses.detail.cardTitle")}</CardTitle>
              <CardDescription>{t("expenses.detail.cardDesc")}</CardDescription>
            </CardHeader>
            <CardContent>
              <ExpenseForm onSubmit={handleSubmit} />
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
