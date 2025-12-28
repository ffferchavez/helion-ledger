import { db } from "../index";
import { invoices, expenses } from "../schema";
import { eq, and, gte, lte, sql } from "drizzle-orm";

/**
 * Get revenue summary for a period
 */
export async function getRevenueSummary(
  organizationId: string,
  startDate: Date,
  endDate: Date,
  countryContext?: string
) {
  const conditions = [
    eq(invoices.organizationId, organizationId),
    eq(invoices.status, "paid"),
    gte(invoices.issueDate, startDate.toISOString()),
    lte(invoices.issueDate, endDate.toISOString()),
  ];

  if (countryContext) {
    conditions.push(eq(invoices.countryContext, countryContext as any));
  }

  const [result] = await db
    .select({
      totalRevenue: sql<number>`COALESCE(SUM(${invoices.totalAmount}), 0)`,
      totalTaxCollected: sql<number>`COALESCE(SUM(${invoices.taxAmount}), 0)`,
      invoiceCount: sql<number>`COUNT(*)`,
    })
    .from(invoices)
    .where(and(...conditions));

  return result;
}

/**
 * Get expense summary for a period
 */
export async function getExpenseSummary(
  organizationId: string,
  startDate: Date,
  endDate: Date,
  countryContext?: string
) {
  const conditions = [
    eq(expenses.organizationId, organizationId),
    gte(expenses.date, startDate.toISOString()),
    lte(expenses.date, endDate.toISOString()),
  ];

  if (countryContext) {
    conditions.push(eq(expenses.countryContext, countryContext as any));
  }

  const [result] = await db
    .select({
      totalExpenses: sql<number>`COALESCE(SUM(${expenses.totalAmount}), 0)`,
      totalTaxPaid: sql<number>`COALESCE(SUM(${expenses.taxAmount}), 0)`,
      totalDeductibleExpenses: sql<number>`COALESCE(SUM(CASE WHEN ${expenses.deductible} THEN ${expenses.totalAmount} ELSE 0 END), 0)`,
      expenseCount: sql<number>`COUNT(*)`,
    })
    .from(expenses)
    .where(and(...conditions));

  return result;
}

/**
 * Get combined financial summary for a period
 */
export async function getFinancialSummary(
  organizationId: string,
  startDate: Date,
  endDate: Date,
  countryContext?: string
) {
  const revenue = await getRevenueSummary(organizationId, startDate, endDate, countryContext);
  const expense = await getExpenseSummary(organizationId, startDate, endDate, countryContext);

  const totalRevenue = parseFloat(revenue.totalRevenue.toString());
  const totalExpenses = parseFloat(expense.totalExpenses.toString());
  const netResult = totalRevenue - totalExpenses;

  return {
    revenue: {
      total: totalRevenue,
      taxCollected: parseFloat(revenue.totalTaxCollected.toString()),
      count: parseInt(revenue.invoiceCount.toString(), 10),
    },
    expenses: {
      total: totalExpenses,
      taxPaid: parseFloat(expense.totalTaxPaid.toString()),
      deductible: parseFloat(expense.totalDeductibleExpenses.toString()),
      count: parseInt(expense.expenseCount.toString(), 10),
    },
    net: {
      result: netResult,
      taxNet: parseFloat(revenue.totalTaxCollected.toString()) - parseFloat(expense.totalTaxPaid.toString()),
    },
  };
}

