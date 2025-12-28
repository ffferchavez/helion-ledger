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

export default async function ExpenseDetailPage({ params }: { params: { id: string } }) {
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
              <h2 className="text-3xl font-semibold tracking-tight">Expense Details</h2>
              <p className="text-sm text-muted-foreground">View and edit expense</p>
            </div>
            <form action={handleDelete}>
              <Button type="submit" variant="destructive">
                Delete
              </Button>
            </form>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <div className="md:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Expense Details</CardTitle>
                  <CardDescription>Edit expense information</CardDescription>
                </CardHeader>
                <CardContent>
                  <ExpenseForm initialData={expenseFormData} onSubmit={handleSubmit} />
                </CardContent>
              </Card>
            </div>

            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Amount:</span>
                    <span className="font-semibold">
                      {formatCurrency(parseFloat(expenseData.amount), expenseData.currency as any)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tax:</span>
                    <span className="font-semibold">
                      {formatCurrency(parseFloat(expenseData.taxAmount), expenseData.currency as any)}
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-white/10 pt-2">
                    <span className="font-bold">Total:</span>
                    <span className="text-xl font-bold">
                      {formatCurrency(parseFloat(expenseData.totalAmount), expenseData.currency as any)}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Date:</span>{" "}
                    <span className="font-medium">{formatDate(expenseData.date)}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Category:</span>{" "}
                    <span className="font-medium capitalize">{expenseData.category.replace("_", " ")}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Payment Method:</span>{" "}
                    <span className="font-medium capitalize">{expenseData.paymentMethod}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Country:</span>{" "}
                    <span className="font-medium">{expenseData.countryContext}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Deductible:</span>{" "}
                    <span className="font-medium">{expenseData.deductible ? "Yes" : "No"}</span>
                  </div>
                  {expenseData.receiptUrl && (
                    <div className="pt-2">
                      <Button asChild variant="outline" className="w-full">
                        <a href={expenseData.receiptUrl} target="_blank" rel="noopener noreferrer">
                          View Receipt
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
