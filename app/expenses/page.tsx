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

export default async function ExpensesPage() {
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
            <div className="mb-4 rounded-xl border border-amber-400/20 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">
              🧪 Using mock data for UI preview
            </div>
          )}
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-3xl font-semibold tracking-tight">Expenses</h2>
              <p className="text-sm text-muted-foreground">Manage your expenses</p>
            </div>
            <Link href="/expenses/new">
              <Button>New Expense</Button>
            </Link>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>All Expenses</CardTitle>
              <CardDescription>Track your business expenses</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Vendor</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Country</TableHead>
                    <TableHead>Deductible</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {expenses.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center text-muted-foreground">
                        No expenses found. Create your first expense.
                      </TableCell>
                    </TableRow>
                  ) : (
                    expenses.map((expense) => (
                      <TableRow key={expense.id}>
                        <TableCell>{formatDate(expense.date)}</TableCell>
                        <TableCell className="font-medium">{expense.vendorName}</TableCell>
                        <TableCell>{expense.description || "-"}</TableCell>
                        <TableCell className="capitalize">{expense.category.replace("_", " ")}</TableCell>
                        <TableCell>
                          {formatCurrency(parseFloat(expense.totalAmount), expense.currency as any)}
                        </TableCell>
                        <TableCell>{expense.countryContext}</TableCell>
                        <TableCell>{expense.deductible ? "Yes" : "No"}</TableCell>
                        <TableCell>
                          <Link href={`/expenses/${expense.id}`}>
                            <Button variant="ghost" size="sm">
                              View
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
