import { db } from "../index";
import { expenses } from "../schema/expenses";
import { eq, and, gte, lte, ilike, or, desc } from "drizzle-orm";
import type { NewExpense, Expense } from "../schema/expenses";

/**
 * Get all expenses for an organization with optional filters
 */
export async function getExpensesByOrganization(
  organizationId: string,
  filters?: {
    category?: string;
    countryContext?: string;
    startDate?: Date;
    endDate?: Date;
    deductible?: boolean;
  }
) {
  const conditions = [eq(expenses.organizationId, organizationId)];

  if (filters?.category) {
    conditions.push(eq(expenses.category, filters.category as any));
  }

  if (filters?.countryContext) {
    conditions.push(eq(expenses.countryContext, filters.countryContext as any));
  }

  if (filters?.startDate) {
    conditions.push(gte(expenses.date, filters.startDate.toISOString()));
  }

  if (filters?.endDate) {
    conditions.push(lte(expenses.date, filters.endDate.toISOString()));
  }

  if (filters?.deductible !== undefined) {
    conditions.push(eq(expenses.deductible, filters.deductible));
  }

  return db
    .select()
    .from(expenses)
    .where(and(...conditions))
    .orderBy(desc(expenses.date));
}

/**
 * Get an expense by ID
 */
export async function getExpenseById(expenseId: string, organizationId: string) {
  const [expense] = await db
    .select()
    .from(expenses)
    .where(and(eq(expenses.id, expenseId), eq(expenses.organizationId, organizationId)))
    .limit(1);

  return expense || null;
}

/**
 * Create a new expense
 */
export async function createExpense(data: NewExpense) {
  const [expense] = await db.insert(expenses).values(data).returning();
  return expense;
}

/**
 * Update an expense
 */
export async function updateExpense(
  expenseId: string,
  organizationId: string,
  data: Partial<Omit<Expense, "id" | "organizationId" | "createdAt">>
) {
  const [expense] = await db
    .update(expenses)
    .set({ ...data, updatedAt: new Date() })
    .where(and(eq(expenses.id, expenseId), eq(expenses.organizationId, organizationId)))
    .returning();

  return expense || null;
}

/**
 * Delete an expense
 */
export async function deleteExpense(expenseId: string, organizationId: string) {
  await db
    .delete(expenses)
    .where(and(eq(expenses.id, expenseId), eq(expenses.organizationId, organizationId)));
}

